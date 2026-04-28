const prisma = require("../prismaClient");
const { detectPlatform, parseMaybeNumber } = require("../services/importHelpers");
const {
  extractYouTubeTranscript,
  extractVideoMetadata,
  extractRecipeWithAI,
} = require("../services/importVideoService");
const { getUserIdOrFallback } = require("../services/userService");

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

exports.importRecipeFromVideo = async (req, res) => {
  try {
    const { videoUrl, caption, creatorId } = req.body;

    if (!videoUrl) {
      return res.status(400).json({
        error: "videoUrl is required",
      });
    }

    const finalCreatorId = await getUserIdOrFallback(req);

    const platform = detectPlatform(videoUrl);
    const metadata = await extractVideoMetadata(videoUrl);

    let autoTranscript = "";
    if (platform === "youtube") {
      autoTranscript = await extractYouTubeTranscript(videoUrl);
    }

    console.log("AUTO TRANSCRIPT LENGTH:", autoTranscript.length);

    const finalCaption = caption || metadata.description || "";

    const combinedText = [
      metadata.title ? `Title: ${metadata.title}` : "",
      metadata.description ? `Description: ${metadata.description}` : "",
      finalCaption ? `Caption: ${finalCaption}` : "",
      autoTranscript ? `Transcript: ${autoTranscript}` : "",
    ]
      .filter(Boolean)
      .join("\n\n");

    console.log("COMBINED TEXT:", combinedText);

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

    console.log("RECIPE DATA:", JSON.stringify(recipeData, null, 2));

    if (
      !recipeData ||
      !Array.isArray(recipeData.ingredients) ||
      !Array.isArray(recipeData.steps)
    ) {
      return res.status(400).json({
        error: "AI returned invalid recipe structure",
      });
    }

    const safeIngredients = (recipeData.ingredients || [])
      .filter((ingredient) => ingredient && ingredient.name)
      .map((ingredient) => ({
        name: String(ingredient.name).trim(),
        quantity: parseMaybeNumber(ingredient.quantity),
        unit: ingredient.unit ? String(ingredient.unit).trim() : null,
      }));

    const safeSteps = (recipeData.steps || [])
      .filter((step) => typeof step === "string" && step.trim() !== "")
      .map((step, index) => ({
        order: index + 1,
        text: step.trim(),
      }));

    if (safeSteps.length === 0) {
      return res.status(400).json({
        error:
          "Not enough recipe information was found automatically. Please add a short caption or description.",
      });
    }

    const imageUrl = metadata.thumbnail || getImageFromUrl(videoUrl);

    const createdPost = await prisma.post.create({
      data: {
        title: recipeData.title || metadata.title || "Imported Video Recipe",
        videoUrl,
        imageUrl,
        creatorId: finalCreatorId,
        recipe: {
          create: {
            servings: parseMaybeNumber(recipeData.servings),
            timeMinutes: parseMaybeNumber(recipeData.timeMinutes),
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

    console.log("IMPORT LOG:", {
      videoUrl,
      platform,
      imageUrl,
      usedAutoDescription: Boolean(metadata.description),
      usedAutoTranscript: Boolean(autoTranscript),
      ingredientCount: safeIngredients.length,
      stepCount: safeSteps.length,
    });

    res.json({
      success: true,
      platform,
      autoMetadataFound: Boolean(metadata.description || metadata.title),
      autoTranscriptFound: Boolean(autoTranscript),
      post: createdPost,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: err.message || "Failed to import recipe from video",
    });
  }
};