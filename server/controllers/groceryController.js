const prisma = require("../prismaClient");

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
  Produce: [
    "tomato",
    "onion",
    "garlic",
    "potato",
    "carrot",
    "pepper",
    "lettuce",
    "spinach",
    "apple",
    "banana",
    "lemon",
    "lime",
    "broccoli",
    "cucumber",
    "zucchini",
    "mushroom",
    "avocado",
  ],
  "Meat & Seafood": [
    "chicken",
    "beef",
    "pork",
    "salmon",
    "tuna",
    "shrimp",
    "fish",
    "meat",
  ],
  "Dairy & Eggs": ["milk", "cheese", "butter", "yogurt", "cream", "egg"],
  Bakery: ["bread", "bun", "bagel", "tortilla", "pita", "naan"],
  "Grains & Pasta": ["rice", "pasta", "noodle", "quinoa", "oats"],
  "Canned & Jarred": ["canned", "beans", "lentils", "tomato paste"],
  "Condiments & Sauces": ["sauce", "ketchup", "mustard", "mayo", "pesto"],
  "Spices & Herbs": ["salt", "pepper", "cumin", "paprika", "oregano"],
  Baking: ["flour", "sugar", "baking powder", "vanilla"],
  "Oils & Vinegars": ["oil", "olive oil", "vinegar"],
  Frozen: ["frozen"],
  Snacks: ["chips", "nuts", "cookies"],
  Beverages: ["water", "juice", "coffee", "tea"],
  Other: [],
};

function normalizeIngredientName(name) {
  return String(name || "")
    .toLowerCase()
    .replace(/,.*$/, "")
    .replace(/\bbreasts\b/g, "breast")
    .replace(/\bpieces\b/g, "piece")
    .replace(/\bpcs\b/g, "piece")
    .replace(/\s+/g, " ")
    .trim();
}

function displayIngredientName(name) {
  return normalizeIngredientName(name)
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
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
  const num = Number(val || 0);

  if (num >=4.5) return Math.round(num);
  if (num >= 1) return Math.round(num * 10) / 10;

  return Math.round(num * 100) / 100;
}

function formatAmount(quantity, unit) {
  if (quantity == null) return "";
  return `${round(quantity)}${unit ? ` ${unit}` : ""}`;
}

function getScaleFactor(planItem) {
  const baseServings = Number(planItem.recipe?.servings || 1);
  const plannedServings = Number(planItem.plannedServings || baseServings);

  if (!baseServings || baseServings <= 0) return 1;

  return Math.max(0.1, plannedServings / baseServings);
}

exports.getGroceryList = async (req, res) => {
  try {
    const userId = req.user.userId;
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
    const byRecipeMap = {};

    for (const item of planItems) {
      if (!item.recipe?.ingredients) continue;

      const scaleFactor = getScaleFactor(item);
      const recipeKey = String(item.recipe.id);

      if (!byRecipeMap[recipeKey]) {
        byRecipeMap[recipeKey] = {
          planItemIds: [],
          recipeId: item.recipe.id,
          recipeTitle: item.recipe.post?.title || "Recipe",
          recipeImageUrl: item.recipe.post?.imageUrl || null,
          servingsMultiplier: 0,
          plannedServings: 0,
          itemsMap: {},
        };
      }

      const recipeGroup = byRecipeMap[recipeKey];

      recipeGroup.planItemIds.push(item.id);
      recipeGroup.servingsMultiplier += scaleFactor;
      recipeGroup.plannedServings += Number(
        item.plannedServings || item.recipe.servings || 1
      );

      for (const ing of item.recipe.ingredients) {
        const scaledQuantity = Number(ing.quantity || 0) * scaleFactor;
        const { quantity: baseQty, unit: baseUnit } = toBase(
          scaledQuantity,
          ing.unit
        );

        const name = ing.name.trim();
        const normalizedName = normalizeIngredientName(name);
        const category = categorizeIngredient(normalizedName);

        const combinedKey = `${normalizedName}-${baseUnit || ""}`;

        if (!combinedMap[combinedKey]) {
          combinedMap[combinedKey] = {
            name: displayIngredientName(name),
            quantity: baseQty || 0,
            unit: baseUnit,
            category,
          };
        } else {
          combinedMap[combinedKey].quantity += baseQty || 0;
        }

        const display = toDisplay(baseQty || 0, baseUnit);

        const recipeItemKey = `${normalizedName}-${ing.unit || ""}-${
          display.unit || ""
        }`;

        if (!recipeGroup.itemsMap[recipeItemKey]) {
          recipeGroup.itemsMap[recipeItemKey] = {
            name,
            quantity: 0,
            unit: ing.unit || null,
            convertedQuantity: 0,
            convertedUnit: display.unit || null,
            category,
            inPantry: isCoveredByPantry(name, pantry),
          };
        }

        recipeGroup.itemsMap[recipeItemKey].quantity += scaledQuantity;
        recipeGroup.itemsMap[recipeItemKey].convertedQuantity +=
          display.quantity || 0;
      }
    }

    const byRecipe = Object.values(byRecipeMap).map((recipe) => ({
      planItemIds: recipe.planItemIds,
      planItemId: recipe.planItemIds[0],
      recipeId: recipe.recipeId,
      recipeTitle: recipe.recipeTitle,
      recipeImageUrl: recipe.recipeImageUrl,
      servingsMultiplier: round(recipe.servingsMultiplier),
      plannedServings: round(recipe.plannedServings),
      items: sortItems(
        Object.values(recipe.itemsMap).map((item) => ({
          ...item,
          quantity: round(item.quantity),
          convertedQuantity: round(item.convertedQuantity),
          displayQuantity: `${formatAmount(item.quantity, item.unit)}${
            item.convertedUnit && item.convertedUnit !== item.unit
              ? ` (${formatAmount(item.convertedQuantity, item.convertedUnit)})`
              : ""
          }`,
        }))
      ),
    }));

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
    const userId = req.user.userId;
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