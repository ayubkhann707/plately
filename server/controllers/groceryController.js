const prisma = require("../prismaClient");
const { getUserIdOrFallback } = require("../services/userService");
const { toBase, toDisplay } = require("../services/unitConversionService");
const { normalizeAndCategorize } = require("../services/ingredientAIService");
const { getPantry, isCoveredByPantry } = require("../services/pantryService");
const { createShare, getShare } = require("../services/groceryShareService");

exports.getGroceryList = async (req, res) => {
  try {
    const userId = await getUserIdOrFallback(req);
    const { from, to, ai } = req.query;
    const skipAI = ai === "false";

    const planItems = await prisma.mealPlanItem.findMany({
      where: {
        userId,
        ...(from || to ? {
          date: {
            gte: from ? new Date(from) : undefined,
            lte: to ? new Date(`${to}T23:59:59.999Z`) : undefined,
          },
        } : {}),
      },
      include: { recipe: { include: { ingredients: true } } },
    });

    const map = {};
    for (const item of planItems) {
      if (!item.recipe?.ingredients) continue;
      const recipeServings = item.recipe.servings || 1;
      const plannedServings = item.plannedServings || recipeServings;
      const scaleFactor = plannedServings / recipeServings;

      for (const ing of item.recipe.ingredients) {
        const scaledQty = ing.quantity != null ? ing.quantity * scaleFactor : null;
        const { quantity: baseQty, unit: baseUnit } = toBase(scaledQty, ing.unit);
        const key = `${ing.name.toLowerCase().trim()}-${baseUnit || ""}`;
        if (!map[key]) {
          map[key] = { rawName: ing.name, quantity: baseQty || 0, unit: baseUnit };
        } else {
          if (baseQty != null) map[key].quantity += baseQty;
        }
      }
    }

    let aggregated = Object.values(map);

    const enriched = skipAI
      ? aggregated.map((i) => ({ ...i, normalizedName: i.rawName, category: "Other" }))
      : await normalizeAndCategorize(
          aggregated.map((i) => ({ name: i.rawName, quantity: i.quantity, unit: i.unit }))
        ).then((results) =>
          results.map((r, idx) => ({ ...aggregated[idx], normalizedName: r.normalizedName, category: r.category }))
        );

    const mergedMap = {};
    for (const item of enriched) {
      const key = `${item.normalizedName.toLowerCase()}-${item.unit || ""}`;
      if (!mergedMap[key]) mergedMap[key] = { ...item };
      else mergedMap[key].quantity += item.quantity;
    }

    const pantry = await getPantry(userId);
    const result = Object.values(mergedMap).map((item) => {
      const { quantity, unit } = toDisplay(item.quantity, item.unit);
      return {
        name: item.normalizedName,
        quantity: quantity || 0,
        unit: unit || null,
        category: item.category,
        inPantry: isCoveredByPantry(item.normalizedName, pantry),
      };
    });

    const CATEGORY_ORDER = ["Produce", "Protein", "Dairy", "Pantry", "Spices", "Other"];
    result.sort((a, b) => {
      const ca = CATEGORY_ORDER.indexOf(a.category);
      const cb = CATEGORY_ORDER.indexOf(b.category);
      if (ca !== cb) return ca - cb;
      return a.name.localeCompare(b.name);
    });

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate grocery list" });
  }
};

exports.shareGroceryList = async (req, res) => {
  try {
    const userId = await getUserIdOrFallback(req);
    const { items } = req.body;
    if (!Array.isArray(items)) return res.status(400).json({ error: "items array required" });
    const token = await createShare(userId, items);
    const baseUrl = process.env.CORS_ORIGIN || "http://localhost:5173";
    res.json({ token, url: `${baseUrl}/grocery/share/${token}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create share" });
  }
};

exports.getSharedGroceryList = async (req, res) => {
  try {
    const { token } = req.params;
    const share = await getShare(token);
    if (!share) return res.status(404).json({ error: "Not found" });
    res.json({ items: share.data, createdAt: share.createdAt });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch shared list" });
  }
};
