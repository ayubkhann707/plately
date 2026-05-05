const prisma = require("../prismaClient");
const { getUserIdOrFallback } = require("../services/userService");
const { toBase, toDisplay } = require("../services/unitConversionService");
const { getPantry, isCoveredByPantry } = require("../services/pantryService");
const { createShare, getShare } = require("../services/groceryShareService");

const CATEGORY_ORDER = [
  "Produce",
  "Meat & Seafood",
  "Dairy & Eggs",
  "Bakery",
  "Grains & Pasta",
  "Canned & Jarred",
  "Condiments & Sauces",
  "Spices & Herbs",
  "Baking",
  "Oils & Vinegars",
  "Frozen",
  "Snacks",
  "Beverages",
  "Other",
];

const CATEGORY_KEYWORDS = {
  Produce: ["tomato","onion","garlic","potato","carrot","pepper","lettuce","spinach","apple","banana","lemon","lime","broccoli","cucumber","zucchini","mushroom","avocado"],
  "Meat & Seafood": ["chicken","beef","pork","salmon","tuna","shrimp","fish","meat"],
  "Dairy & Eggs": ["milk","cheese","butter","yogurt","cream","egg"],
  Bakery: ["bread","bun","bagel","tortilla","pita","naan"],
  "Grains & Pasta": ["rice","pasta","noodle","quinoa","oats"],
  "Canned & Jarred": ["canned","beans","lentils","tomato paste"],
  "Condiments & Sauces": ["sauce","ketchup","mustard","mayo","pesto"],
  "Spices & Herbs": ["salt","pepper","cumin","paprika","oregano"],
  Baking: ["flour","sugar","baking powder","vanilla"],
  "Oils & Vinegars": ["oil","olive oil","vinegar"],
  Frozen: ["frozen"],
  Snacks: ["chips","nuts","cookies"],
  Beverages: ["water","juice","coffee","tea"],
  Other: [],
};

function normalizeIngredientName(name) {
  return String(name || "").toLowerCase().replace(/\s+/g, " ").trim();
}

function categorizeIngredient(name) {
  const normalized = normalizeIngredientName(name);

  for (const category of CATEGORY_ORDER) {
    const keywords = CATEGORY_KEYWORDS[category] || [];
    for (const keyword of keywords) {
      if (normalized.includes(keyword)) return category;
    }
  }

  return "Other";
}

function sortItems(items) {
  return items.sort((a, b) => {
    const ca = CATEGORY_ORDER.indexOf(a.category);
    const cb = CATEGORY_ORDER.indexOf(b.category);
    if (ca !== cb) return ca - cb;
    return a.name.localeCompare(b.name);
  });
}

function round(val) {
  return Math.round(Number(val || 0));
}

exports.getGroceryList = async (req, res) => {
  try {
    const userId = await getUserIdOrFallback(req);
    const { from, to, planItemIds } = req.query;

    const selectedIds = planItemIds
      ? String(planItemIds).split(",").filter(Boolean)
      : [];

    const planItems = await prisma.mealPlanItem.findMany({
      where: {
        userId,
        ...(selectedIds.length
          ? { id: { in: selectedIds } }
          : from || to
          ? {
              date: {
                gte: from ? new Date(from) : undefined,
                lte: to ? new Date(`${to}T23:59:59.999Z`) : undefined,
              },
            }
          : {}),
      },
      include: {
        recipe: {
          include: {
            post: true,
            ingredients: true,
          },
        },
      },
    });

    const pantry = await getPantry(userId);

    const combinedMap = {};
    const byRecipe = [];

    for (const item of planItems) {
      if (!item.recipe?.ingredients) continue;

      const recipeItems = [];

      for (const ing of item.recipe.ingredients) {
        const { quantity: baseQty, unit: baseUnit } = toBase(ing.quantity, ing.unit);

        const name = ing.name.trim();
        const category = categorizeIngredient(name);
        const key = `${name.toLowerCase()}-${baseUnit || ""}`;

        if (!combinedMap[key]) {
          combinedMap[key] = {
            name,
            quantity: baseQty || 0,
            unit: baseUnit,
            category,
          };
        } else {
          combinedMap[key].quantity += baseQty || 0;
        }

        const display = toDisplay(baseQty || 0, baseUnit);

        recipeItems.push({
          name,
          quantity: ing.quantity || 0, // исходное
          unit: ing.unit || null,
          convertedQuantity: round(display.quantity), // округленное
          convertedUnit: display.unit || null,
          category,
          inPantry: isCoveredByPantry(name, pantry),
        });
      }

      byRecipe.push({
        planItemId: item.id,
        recipeId: item.recipe.id,
        recipeTitle: item.recipe.post?.title || "Recipe",
        recipeImageUrl: item.recipe.post?.imageUrl || null,
        items: sortItems(recipeItems),
      });
    }

    const byCategory = Object.values(combinedMap).map((item) => {
      const display = toDisplay(item.quantity, item.unit);

      return {
        name: item.name,
        quantity: round(display.quantity),
        unit: display.unit || null,
        category: item.category,
        inPantry: isCoveredByPantry(item.name, pantry),
      };
    });

    res.json({
      byCategory: sortItems(byCategory),
      byRecipe,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate grocery list" });
  }
};

exports.shareGroceryList = async (req, res) => {
  try {
    const userId = await getUserIdOrFallback(req);
    const { byCategory, byRecipe, checkedItems } = req.body;

    const token = await createShare(userId, {
      byCategory,
      byRecipe,
      checkedItems: checkedItems || [],
      createdAt: new Date().toISOString(),
    });

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

    res.json(share.data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch shared list" });
  }
};