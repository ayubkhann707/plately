const prisma = require("../prismaClient");
const { detectPlatform, parseMaybeNumber } = require("../services/importHelpers");
const {
  extractYouTubeTranscript,
  extractVideoMetadata,
  extractRecipeWithAI,
} = require("../services/importVideoService");
const { getUserIdOrFallback } = require("../services/userService");
const { validateRecipeTrust } = require("../services/recipeTrustService");

function getImageFromUrl(url) {
  if (!url) return null;

  const cleanUrl = String(url).trim();
  const lower = cleanUrl.toLowerCase().split("?")[0];

  if (
    lower.endsWith(".jpg") ||
    lower.endsWith(".jpeg") ||
    lower.endsWith(".png") ||
    lower.endsWith(".webp") ||
    lower.endsWith(".gif")
  ) {
    return cleanUrl;
  }

  try {
    const parsed = new URL(cleanUrl);
    let videoId = "";

    if (parsed.hostname.includes("youtu.be")) {
      videoId = parsed.pathname.slice(1).split("?")[0];
    }

    if (parsed.hostname.includes("youtube.com")) {
      videoId = parsed.searchParams.get("v") || "";

      if (!videoId && parsed.pathname.includes("/shorts/")) {
        videoId = parsed.pathname.split("/shorts/")[1]?.split("/")[0] || "";
      }

      if (!videoId && parsed.pathname.includes("/embed/")) {
        videoId = parsed.pathname.split("/embed/")[1]?.split("/")[0] || "";
      }
    }

    return videoId
      ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
      : null;
  } catch {
    return null;
  }
}

function sanitizeIngredients(ingredients = []) {
  return ingredients
    .filter((ingredient) => ingredient && ingredient.name)
    .map((ingredient) => ({
      name: String(ingredient.name).trim(),
      quantity: parseMaybeNumber(ingredient.quantity),
      unit: ingredient.unit ? String(ingredient.unit).trim() : null,
    }));
}

function sanitizeSteps(steps = []) {
  return steps
    .filter((step) => typeof step === "string" && step.trim() !== "")
    .map((step, index) => ({
      order: index + 1,
      text: step.trim(),
    }));
}

exports.previewRecipeFromVideo = async (req, res) => {
  try {
    const { videoUrl, caption } = req.body;

    if (!videoUrl) {
      return res.status(400).json({
        error: "videoUrl is required",
      });
    }

    const platform = detectPlatform(videoUrl);
    const metadata = await extractVideoMetadata(videoUrl);

    let autoTranscript = "";
    if (platform === "youtube") {
      autoTranscript = await extractYouTubeTranscript(videoUrl);
    }

    const finalCaption = caption || metadata.description || "";

    const combinedText = [
      metadata.title ? `Title: ${metadata.title}` : "",
      metadata.description ? `Description: ${metadata.description}` : "",
      finalCaption ? `Caption: ${finalCaption}` : "",
      autoTranscript ? `Transcript: ${autoTranscript}` : "",
    ]
      .filter(Boolean)
      .join("\n\n");

    if (!combinedText.trim()) {
      return res.status(400).json({
        error: "Could not extract enough text from the link. Add caption manually.",
      });
    }

    let recipeData = await extractRecipeWithAI(combinedText);

    if (
      recipeData &&
      Array.isArray(recipeData.ingredients) &&
      recipeData.ingredients.length === 0 &&
      (metadata.title || autoTranscript || finalCaption)
    ) {
      const fallbackText = `
Title: ${metadata.title || ""}
Description: ${metadata.description || ""}
Caption: ${finalCaption || ""}
Transcript: ${autoTranscript || ""}

This is clearly a recipe video. Extract at least the likely ingredient names if they are directly suggested by the title, description, caption, or transcript, but do not invent exact quantities.
      `.trim();

      recipeData = await extractRecipeWithAI(fallbackText);
    }

    if (
      !recipeData ||
      !Array.isArray(recipeData.ingredients) ||
      !Array.isArray(recipeData.steps)
    ) {
      return res.status(400).json({
        error: "AI returned invalid recipe structure",
      });
    }

    const safeIngredients = sanitizeIngredients(recipeData.ingredients);
    const safeSteps = sanitizeSteps(recipeData.steps);

    if (safeSteps.length === 0 && safeIngredients.length > 0) {
      safeSteps.push(
        {
          order: 1,
          text: "Prepare the ingredients listed above.",
        },
        {
          order: 2,
          text: "Follow the cooking method shown in the original video.",
        }
      );
    }

    if (safeSteps.length === 0 && safeIngredients.length === 0) {
      return res.status(400).json({
        error:
          "Not enough recipe information was found automatically. Please add a clearer caption or description.",
      });
    }

    const imageUrl = metadata.thumbnail || getImageFromUrl(videoUrl);

    const previewRecipe = {
      title: recipeData.title || metadata.title || "Imported Video Recipe",
      videoUrl,
      imageUrl,
      servings: parseMaybeNumber(recipeData.servings),
      timeMinutes: parseMaybeNumber(recipeData.timeMinutes),
      ingredients: safeIngredients,
      steps: safeSteps.map((step) => step.text),
    };

    const validation = await validateRecipeTrust(previewRecipe, combinedText, {
      autoTranscriptFound: Boolean(autoTranscript),
      autoMetadataFound: Boolean(metadata.description || metadata.title),
      platform,
    });

    res.json({
      success: true,
      platform,
      autoMetadataFound: Boolean(metadata.description || metadata.title),
      autoTranscriptFound: Boolean(autoTranscript),
      validation,
      recipe: previewRecipe,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: err.message || "Failed to preview recipe from video",
    });
  }
};

exports.saveImportedRecipe = async (req, res) => {
  try {
    const {
      title,
      videoUrl,
      imageUrl,
      servings,
      timeMinutes,
      ingredients,
      steps,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        error: "Recipe title is required",
      });
    }

    if (!videoUrl || !videoUrl.trim()) {
      return res.status(400).json({
        error: "Video URL is required",
      });
    }

    const safeIngredients = sanitizeIngredients(ingredients);
    const safeSteps = sanitizeSteps(steps);

    if (safeIngredients.length === 0) {
      return res.status(400).json({
        error: "Please add at least one ingredient",
      });
    }

    if (safeSteps.length === 0) {
      return res.status(400).json({
        error: "Please add at least one step",
      });
    }

    const finalCreatorId = await getUserIdOrFallback(req);

    const createdPost = await prisma.post.create({
      data: {
        title: title.trim(),
        videoUrl: videoUrl.trim(),
        imageUrl: imageUrl || getImageFromUrl(videoUrl),
        creatorId: finalCreatorId,
        tags: [],
        isPublic: false,
        recipe: {
          create: {
            servings: parseMaybeNumber(servings),
            timeMinutes: parseMaybeNumber(timeMinutes),
            ingredients: {
              create: safeIngredients,
            },
            steps: {
              create: safeSteps,
            },
          },
        },
      },
      include: {
        recipe: {
          include: {
            ingredients: true,
            steps: {
              orderBy: { order: "asc" },
            },
          },
        },
      },
    });

    await prisma.save.upsert({
      where: {
        userId_postId: {
          userId: finalCreatorId,
          postId: createdPost.id,
        },
      },
      update: {},
      create: {
        userId: finalCreatorId,
        postId: createdPost.id,
      },
    });

    res.json({
      success: true,
      post: createdPost,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: err.message || "Failed to save imported recipe",
    });
  }
};