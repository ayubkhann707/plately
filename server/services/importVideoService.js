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
  try {
    const {
      YoutubeTranscript,
    } = await import(
      "youtube-transcript/dist/youtube-transcript.esm.js"
    );

    const transcript =
      await YoutubeTranscript.fetchTranscript(videoUrl);

    return transcript.map((item) => item.text).join(" ");
  } catch (error) {
    console.log(
      "YoutubeTranscript library failed:",
      error.message
    );
  }

  const tempDir = await fs.mkdtemp(
    path.join(os.tmpdir(), "yt-subs-")
  );

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
      {
        maxBuffer: 20 * 1024 * 1024,
      }
    );

    const files = await fs.readdir(tempDir);

    const vttFile = files.find((file) =>
      file.endsWith(".vtt")
    );

    if (!vttFile) {
      console.log(
        "AUTO TRANSCRIPT FAILED: no subtitle file found"
      );
      return "";
    }

    const vttPath = path.join(tempDir, vttFile);

    const raw = await fs.readFile(vttPath, "utf8");

    const cleaned = raw
      .replace(/^WEBVTT.*$/gm, "")
      .replace(
        /^\d+:\d+:\d+\.\d+\s+-->\s+\d+:\d+:\d+\.\d+.*$/gm,
        ""
      )
      .replace(
        /^\d+:\d+\.\d+\s+-->\s+\d+:\d+\.\d+.*$/gm,
        ""
      )
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
      await fs.rm(tempDir, {
        recursive: true,
        force: true,
      });
    } catch {}
  }
}

async function extractVideoMetadata(videoUrl) {
  try {
    const { stdout } = await execFileAsync(
      "yt-dlp",
      ["--dump-single-json", "--skip-download", videoUrl],
      {
        maxBuffer: 10 * 1024 * 1024,
      }
    );

    const data = JSON.parse(stdout);

    return {
      title: data.title || "",
      description: data.description || "",
      uploader: data.uploader || "",
      channel: data.channel || "",
      thumbnail:
        data.thumbnail ||
        (data.thumbnails &&
        data.thumbnails.length > 0
          ? data.thumbnails[data.thumbnails.length - 1].url
          : ""),
    };
  } catch (error) {
    console.log(
      "AUTO METADATA FAILED:",
      error.message
    );

    let thumbnail = "";

    if (
      videoUrl.includes("youtube.com") ||
      videoUrl.includes("youtu.be")
    ) {
      try {
        const url = new URL(videoUrl);

        let v = "";

        if (url.hostname.includes("youtu.be")) {
          v = url.pathname.slice(1);
        } else {
          v = url.searchParams.get("v") || "";

          if (
            !v &&
            url.pathname.includes("/shorts/")
          ) {
            v =
              url.pathname
                .split("/shorts/")[1]
                ?.split("/")[0] || "";
          }
        }

        if (v) {
          thumbnail = `https://img.youtube.com/vi/${v}/hqdefault.jpg`;
        }
      } catch {}
    }

    return {
      title: "",
      description: "",
      uploader: "",
      channel: "",
      thumbnail,
    };
  }
}

function extractJsonObject(content) {
  if (!content) {
    throw new Error("AI returned empty response");
  }

  let cleaned = content
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  if (firstBrace !== -1 && lastBrace !== -1) {
    cleaned = cleaned.slice(
      firstBrace,
      lastBrace + 1
    );
  }

  return JSON.parse(cleaned);
}

async function extractRecipeWithAI(text) {
  const prompt = `
You extract structured cooking recipes from noisy social media content.

Return ONLY valid JSON in this exact format:
{
  "title": "string",
  "servings": null,
  "timeMinutes": null,
  "ingredients": [
    {
      "name": "string",
      "quantity": null,
      "unit": null
    }
  ],
  "steps": ["string"]
}

Rules:
- Return JSON only
- No markdown
- No comments
- No explanations
- Use double quotes only
- Do not use fractions like 1/2; convert to decimals
- Do not use math expressions
- If quantity missing use null
- If unit missing use null
- Use only information supported by the text
- Extract ingredient names even if quantities missing
- Convert cooking actions into ordered steps
- If recipe is clearly present do not return empty steps

Text:
${String(text || "").slice(0, 14000)}
  `.trim();

  const response =
    await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0,
      response_format: {
        type: "json_object",
      },
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

  const content =
    response.choices[0].message.content;

  try {
    return extractJsonObject(content);
  } catch (error) {
    console.log("AI RAW INVALID JSON:", content);

    throw new Error(
      "AI returned invalid recipe JSON"
    );
  }
}

module.exports = {
  extractYouTubeTranscript,
  extractVideoMetadata,
  extractRecipeWithAI,
};