const prisma = require("../prismaClient");
const OpenAI = require("openai");
const { execFile } = require("child_process");
const util = require("util");
const fs = require("fs/promises");
const path = require("path");
const os = require("os");

const execFileAsync = util.promisify(execFile);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function detectPlatform(url = "") {
  const lower = url.toLowerCase();

  if (lower.includes("youtube.com") || lower.includes("youtu.be")) {
    return "youtube";
  }

  if (lower.includes("instagram.com")) {
    return "instagram";
  }

  if (lower.includes("tiktok.com")) {
    return "tiktok";
  }

  return "unknown";
}

function parseMaybeNumber(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const num = Number(value);
  return Number.isNaN(num) ? null : num;
}

async function extractYouTubeTranscript(videoUrl) {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "yt-subs-"));
  const outputTemplate = path.join(tempDir, "subs");

  try {
    await execFileAsync(
      "yt-dlp",
      [
        "--skip-download",
        "--write-auto-subs",
        "--write-subs",
        "--sub-langs",
        "en.*,en",
        "--sub-format",
        "vtt",
        "-o",
        outputTemplate,
        videoUrl,
      ],
      { maxBuffer: 20 * 1024 * 1024 }
    );

    const files = await fs.readdir(tempDir);
    const vttFile = files.find((file) => file.endsWith(".vtt"));

    if (!vttFile) {
      console.log("AUTO TRANSCRIPT FAILED: no subtitle file found");
      return "";
    }

    const vttPath = path.join(tempDir, vttFile);
    const raw = await fs.readFile(vttPath, "utf8");

    const cleaned = raw
      .replace(/^WEBVTT.*$/gm, "")
      .replace(/^\d+:\d+:\d+\.\d+\s+-->\s+\d+:\d+:\d+\.\d+.*$/gm, "")
      .replace(/^\d+:\d+\.\d+\s+-->\s+\d+:\d+\.\d+.*$/gm, "")
      .replace(/<[^>]+>/g, "")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const seen = new Set();
    const deduped = cleaned.filter((line) => {
      if (seen.has(line)) return false;
      seen.add(line);
      return true;
    });

    return deduped.join(" ");
  } catch (error) {
    console.log("AUTO TRANSCRIPT FAILED:", error.message);
    return "";
  } finally {
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch {
      // ignore cleanup errors
    }
  }
}

async function extractVideoMetadata(videoUrl) {
  try {
    const { stdout } = await execFileAsync(
      "yt-dlp",
      ["--dump-single-json", "--skip-download", videoUrl],
      { maxBuffer: 10 * 1024 * 1024 }
    );

    const data = JSON.parse(stdout);

    return {
      title: data.title || "",
      description: data.description || "",
      uploader: data.uploader || "",
      channel: data.channel || "",
    };
  } catch (error) {
    console.log("AUTO METADATA FAILED:", error.message);

    return {
      title: "",
      description: "",
      uploader: "",
      channel: "",
    };
  }
}

async function extractRecipeWithAI(text) {
  const prompt = `
You extract structured cooking recipes from noisy social media content.

Return ONLY valid JSON in this exact format:
{
  "title": "string",
  "servings": number | null,
  "timeMinutes": number | null,
  "ingredients": [
    {
      "name": "string",
      "quantity": number | null,
      "unit": "string | null"
    }
  ],
  "steps": ["string"]
}

Rules:
- Use only information supported by the text
- If quantity is missing, use null
- If unit is missing, use null
- Extract ingredient names even if quantities are missing
- Convert cooking actions into ordered steps
- If a recipe is clearly present, do not return empty steps
- Do not include markdown
- Do not include explanations

Text:
${text}
  `.trim();

  const response = await openai.responses.create({
    model: "gpt-5.4-nano",
    input: prompt,
  });

  return JSON.parse(response.output_text);
}

exports.importRecipeFromVideo = async (req, res) => {
  try {
    const { videoUrl, caption, creatorId } = req.body;

    if (!videoUrl) {
      return res.status(400).json({
        error: "videoUrl is required",
      });
    }

    let finalCreatorId = creatorId;

    if (!finalCreatorId) {
      const firstUser = await prisma.user.findFirst();

      if (!firstUser) {
        return res.status(400).json({
          error: "No users found in database. Create a user first.",
        });
      }

      finalCreatorId = firstUser.id;
    }

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
        error: "Not enough recipe information was found automatically. Please add a short caption or description.",
      });
    }

    const createdPost = await prisma.post.create({
      data: {
        title: recipeData.title || metadata.title || "Imported Video Recipe",
        videoUrl,
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