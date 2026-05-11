const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function extractJsonFromAIResponse(rawContent) {
  const cleaned = String(rawContent || "")
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1) {
    throw new Error("AI response does not contain JSON");
  }

  return cleaned.slice(firstBrace, lastBrace + 1);
}

async function findSimilarRecipesOnline({
  title,
  description,
  caption,
  videoUrl,
  platform,
}) {
  const prompt = `
You are helping recover a recipe from a video that does not contain enough information.

Search the web for recipes that are MOST SIMILAR to this recipe video.

Use:
- video title
- description
- caption
- recipe clues
- cuisine type
- ingredients mentioned
- cooking style

Return 3-5 high quality recipe links.

Video title:
${title || "Unknown"}

Video description:
${description || "None"}

Caption:
${caption || "None"}

Video URL:
${videoUrl || "None"}

Platform:
${platform || "Unknown"}

Return ONLY valid JSON:

{
  "recipes": [
    {
      "title": "Recipe title",
      "url": "https://example.com/recipe",
      "source": "Website name",
      "snippet": "Short explanation why this recipe matches"
    }
  ]
}
`;

  const response = await openai.responses.create({
    model: "gpt-4o-mini",
    tools: [{ type: "web_search" }],
    input: prompt,
    temperature: 0.3,
  });

  const rawContent = response.output_text || "";

  let parsed;

  try {
    const jsonText = extractJsonFromAIResponse(rawContent);
    parsed = JSON.parse(jsonText);
  } catch (err) {
    console.error("FAILED TO PARSE SIMILAR RECIPES:", rawContent);
    throw new Error("AI returned invalid similar recipes JSON");
  }

  return Array.isArray(parsed.recipes) ? parsed.recipes : [];
}

async function importRecipeFromSourceUrl(url) {
  const prompt = `
Open this recipe page and extract the recipe information.

Recipe URL:
${url}

Extract:
- recipe title
- servings
- cooking time
- ingredients
- cooking steps
- image URL if available

Return ONLY valid JSON.

{
  "title": "Recipe title",
  "imageUrl": "https://example.com/image.jpg",
  "servings": 4,
  "timeMinutes": 30,
  "ingredients": [
    {
      "name": "ingredient name",
      "quantity": 1,
      "unit": "cup"
    }
  ],
  "steps": [
    "Step 1",
    "Step 2"
  ]
}
`;

  const response = await openai.responses.create({
    model: "gpt-4o-mini",
    tools: [{ type: "web_search" }],
    input: prompt,
    temperature: 0.2,
  });

  const rawContent = response.output_text || "";

  let parsed;

  try {
    const jsonText = extractJsonFromAIResponse(rawContent);
    parsed = JSON.parse(jsonText);
  } catch (err) {
    console.error("FAILED TO PARSE IMPORTED RECIPE:", rawContent);
    throw new Error("AI returned invalid imported recipe JSON");
  }

  return {
    title: parsed.title || "Imported Recipe",
    imageUrl: parsed.imageUrl || null,
    servings:
      typeof parsed.servings === "number" ? parsed.servings : null,
    timeMinutes:
      typeof parsed.timeMinutes === "number"
        ? parsed.timeMinutes
        : null,
    ingredients: Array.isArray(parsed.ingredients)
      ? parsed.ingredients
      : [],
    steps: Array.isArray(parsed.steps) ? parsed.steps : [],
  };
}

module.exports = {
  findSimilarRecipesOnline,
  importRecipeFromSourceUrl,
};