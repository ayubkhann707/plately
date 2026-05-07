const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function cleanJsonResponse(text) {
  return String(text || "")
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();
}

async function validateRecipeTrust(recipeData, sourceText, metadata = {}) {
  const localWarnings = [];

  const ingredients = Array.isArray(recipeData.ingredients)
    ? recipeData.ingredients
    : [];

  const steps = Array.isArray(recipeData.steps) ? recipeData.steps : [];

  if (!metadata.autoTranscriptFound) {
    localWarnings.push("Transcript was not found. Import may be less reliable.");
  }

  if (ingredients.length === 0) {
    localWarnings.push("No ingredients were extracted.");
  }

  if (steps.length < 3) {
    localWarnings.push("Recipe has very few steps. Some instructions may be missing.");
  }

  const prompt = `
You are validating an AI-generated recipe imported from a YouTube video.

The user wants to know whether this recipe is complete enough to cook and shop for.

Do NOT rewrite the recipe.
Do NOT invent exact quantities.
Compare this recipe with common recipes of the same type and detect likely missing ingredients or missing cooking steps.

Return ONLY valid JSON:
{
  "confidenceAdjustment": number,
  "possibleMissingIngredients": [
    {
      "name": "string",
      "likelihood": "low" | "medium" | "high",
      "reason": "string"
    }
  ],
  "missingStepWarnings": ["string"],
  "warnings": ["string"],
  "summary": "string"
}

Rules:
- confidenceAdjustment must be between -0.35 and 0.15
- Use negative adjustment if the recipe has duplicated ingredients, unclear steps, or likely missing essential ingredients
- Only mark missing ingredients as high likelihood if the recipe probably cannot work without them
- Do not include optional toppings/garnishes as high likelihood
- Be conservative
- If the recipe looks mostly complete, use a small positive or neutral adjustment
- If there are duplicate ingredients or confusing quantities, add a warning

Imported recipe:
${JSON.stringify(recipeData, null, 2)}

Original video/source text:
${String(sourceText || "").slice(0, 12000)}
  `.trim();

  let aiResult = {
    confidenceAdjustment: 0,
    possibleMissingIngredients: [],
    missingStepWarnings: [],
    warnings: [],
    summary: "AI validation was not available.",
  };

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0,
      messages: [{ role: "user", content: prompt }],
    });

    const content = response.choices[0].message.content;
    aiResult = JSON.parse(cleanJsonResponse(content));
  } catch (err) {
    console.log("AI validation failed:", err.message);
  }

  let confidenceScore = 1;

  if (!metadata.autoTranscriptFound) confidenceScore -= 0.2;
  if (!metadata.autoMetadataFound) confidenceScore -= 0.1;

  if (ingredients.length === 0) confidenceScore -= 0.4;
  else if (ingredients.length < 4) confidenceScore -= 0.2;
  else if (ingredients.length < 7) confidenceScore -= 0.1;

  if (steps.length === 0) confidenceScore -= 0.4;
  else if (steps.length < 3) confidenceScore -= 0.25;
  else if (steps.length < 6) confidenceScore -= 0.1;

  const possibleMissingIngredients = Array.isArray(
    aiResult.possibleMissingIngredients
  )
    ? aiResult.possibleMissingIngredients
    : [];

  const highMissingIngredients = possibleMissingIngredients.filter(
    (item) => item.likelihood === "high"
  ).length;

  const mediumMissingIngredients = possibleMissingIngredients.filter(
    (item) => item.likelihood === "medium"
  ).length;

  const aiWarnings = Array.isArray(aiResult.warnings)
    ? aiResult.warnings
    : [];

  const missingStepWarnings = Array.isArray(aiResult.missingStepWarnings)
    ? aiResult.missingStepWarnings
    : [];

  confidenceScore -= highMissingIngredients * 0.15;
  confidenceScore -= mediumMissingIngredients * 0.07;
  confidenceScore -= aiWarnings.length * 0.04;
  confidenceScore -= missingStepWarnings.length * 0.05;

  confidenceScore += Number(aiResult.confidenceAdjustment || 0);

  confidenceScore = Math.max(
    0,
    Math.min(1, Number(confidenceScore.toFixed(2)))
  );

  return {
    confidenceScore,
    level:
      confidenceScore >= 0.8
        ? "high"
        : confidenceScore >= 0.55
        ? "medium"
        : "low",
    warnings: [...localWarnings, ...aiWarnings, ...missingStepWarnings],
    possibleMissingIngredients,
    summary: aiResult.summary || "Recipe validation completed.",
  };
}

module.exports = {
  validateRecipeTrust,
};