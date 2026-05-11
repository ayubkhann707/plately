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

async function estimateMissingIngredientQuantities(recipe) {
  const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];

  const missingIngredients = ingredients.filter(
    (ingredient) => ingredient.quantity == null
  );

  if (missingIngredients.length === 0) {
    return ingredients;
  }

  const prompt = `
You are completing an imported recipe.

Do a small web research task:
- Search the web for recipes similar to this recipe title.
- Compare ingredient quantities from similar recipes.
- Estimate ONLY missing quantities.
- Keep existing quantities unchanged.
- Use realistic quantities for the recipe servings.
- Prefer units like g, ml, tsp, tbsp, cup, cloves, pieces.
- Do not add new ingredients.
- Return valid JSON only, without markdown code fences.

Recipe title:
${recipe.title || "Unknown Recipe"}

Servings:
${recipe.servings || "Unknown"}

Ingredients:
${JSON.stringify(ingredients, null, 2)}

Steps:
${JSON.stringify(recipe.steps || [], null, 2)}

Return ONLY this JSON:
{
  "ingredients": [
    {
      "name": "ingredient name",
      "quantity": 1,
      "unit": "unit"
    }
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
    console.error("FAILED TO PARSE ESTIMATED QUANTITIES:", rawContent);
    throw new Error("AI returned invalid quantity estimation JSON");
  }

  const estimatedIngredients = Array.isArray(parsed.ingredients)
    ? parsed.ingredients
    : [];

  const estimatedMap = new Map();

  for (const ingredient of estimatedIngredients) {
    if (!ingredient?.name) continue;

    estimatedMap.set(ingredient.name.toLowerCase().trim(), ingredient);
  }

  return ingredients.map((ingredient) => {
    if (ingredient.quantity != null) {
      return ingredient;
    }

    const estimated = estimatedMap.get(ingredient.name.toLowerCase().trim());

    if (!estimated) {
      return ingredient;
    }

    return {
      ...ingredient,
      quantity:
        typeof estimated.quantity === "number"
          ? estimated.quantity
          : ingredient.quantity,
      unit:
        typeof estimated.unit === "string" && estimated.unit.trim()
          ? estimated.unit.trim()
          : ingredient.unit,
      quantityEstimated: true,
    };
  });
}

module.exports = {
  estimateMissingIngredientQuantities,
};