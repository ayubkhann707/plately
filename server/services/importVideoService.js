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

module.exports = {
  extractYouTubeTranscript,
  extractVideoMetadata,
  extractRecipeWithAI,
};