const prisma = require("../prismaClient");
const { getUserIdOrFallback } = require("../services/userService");

exports.getGroceryList = async (req, res) => {
  try {
    const userId = await getUserIdOrFallback(req);
    const { from, to } = req.query;

    // Add this before the where clause
    const allItems = await prisma.mealPlanItem.findMany({
      where: { userId },
      select: { date: true, id: true }
    });
    console.log("All user plan items:", allItems.map(i => i.date));

    console.log("Grocery request - from:", from, "to:", to, "userId:", userId);

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
      include: {
        recipe: {
          include: {
            ingredients: true,
          },
        },
      },
    });

    console.log("Found plan items:", planItems.length);

    const map = {};

    for (const item of planItems) {
      if (!item.recipe || !item.recipe.ingredients) continue;
      for (const ing of item.recipe.ingredients) {
        const key = `${ing.name.toLowerCase()}-${ing.unit || ""}`;
        if (!map[key]) {
          map[key] = { name: ing.name, unit: ing.unit || null, quantity: ing.quantity || 0 };
        } else {
          if (ing.quantity) map[key].quantity += ing.quantity;
        }
      }
    }

    const result = Object.values(map);
    console.log("Grocery items:", result.length);

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate grocery list" });
  }
};