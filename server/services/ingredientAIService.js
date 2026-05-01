const OpenAI = require("openai");

const CATEGORIES = ["Produce", "Protein", "Dairy", "Pantry", "Spices", "Other"];

/**
 * Given an array of ingredient entries, call GPT-4o-mini to:
 *  1. Normalise each name ("Cherry tomatoes, halved" → "Cherry tomatoes")
 *  2. Assign a category from: Produce, Protein, Dairy, Pantry, Spices, Other
 *
 * Returns the same array with `normalizedName` and `category` added.
 * Falls back gracefully if the API call fails.
 */
async function normalizeAndCategorize(ingredients) {
  if (!ingredients || ingredients.length === 0) return ingredients;

  if (!process.env.OPENAI_API_KEY) {
    // No API key — add defaults so the rest of the pipeline still works
    return ingredients.map((ing) => ({
      ...ing,
      normalizedName: ing.name,
      category: "Other",
    }));
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const nameList = ingredients.map((ing, i) => `${i}|${ing.name}`).join("\n");

  const systemPrompt = `You are a grocery categorization assistant.
Given a numbered list of ingredient names, return ONLY a JSON array (no markdown, no extra text).
Each element must be: { "index": <number>, "name": <clean ingredient name>, "category": <category> }
Rules:
- Clean the name: remove preparation notes (halved, minced, chopped, diced, sliced, softened, etc.)
- Keep proper nouns and variety names ("Cherry tomatoes" not just "tomatoes")
- Category must be exactly one of: ${CATEGORIES.join(", ")}
- Produce = fresh vegetables/fruit. Protein = meat/fish/eggs/beans/tofu. Dairy = milk/cheese/butter/yogurt/cream. Pantry = grains/pasta/canned goods/sauces/oils/flour/sugar. Spices = herbs/spices/seasonings. Other = everything else.`;

  try {
    const res = await client.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 1500,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: nameList },
      ],
    });

    const raw = res.choices[0]?.message?.content?.trim() || "[]";
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (_) {
      // strip markdown fences if present
      const clean = raw.replace(/```json|```/g, "").trim();
      parsed = JSON.parse(clean);
    }

    const lookup = {};
    for (const item of parsed) {
      lookup[item.index] = item;
    }

    return ingredients.map((ing, i) => ({
      ...ing,
      normalizedName: lookup[i]?.name || ing.name,
      category: CATEGORIES.includes(lookup[i]?.category) ? lookup[i].category : "Other",
    }));
  } catch (err) {
    console.error("[normalizeAndCategorize] AI call failed:", err.message);
    return ingredients.map((ing) => ({
      ...ing,
      normalizedName: ing.name,
      category: "Other",
    }));
  }
}

module.exports = { normalizeAndCategorize, CATEGORIES };
