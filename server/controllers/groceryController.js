const prisma = require("../prismaClient");

exports.getGroceryList = async (req, res) => {
  try {
    const userId = "demo-user";
    const { from, to } = req.query;

    const planItems = await prisma.mealPlanItem.findMany({
      where: {
        userId,
        date: {
          gte: from ? new Date(from) : undefined,
          lte: to ? new Date(to) : undefined,
        },
      },
      include: {
        recipe: {
          include: {
            ingredients: true,
          },
        },
      },
    });

    // 🧠 Aggregation
    const map = {};

    for (const item of planItems) {
      if (!item.recipe || !item.recipe.ingredients) continue;
      
      for (const ing of item.recipe.ingredients) {
        const key = `${ing.name.toLowerCase()}-${ing.unit || ""}`;

        if (!map[key]) {
          map[key] = {
            name: ing.name,
            unit: ing.unit || null,
            quantity: ing.quantity || 0,
          };
        } else {
          // sum only if quantity exists
          if (ing.quantity) {
            map[key].quantity += ing.quantity;
          }
        }
      }
    }

    const result = Object.values(map);

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Failed to generate grocery list",
    });
  }
};
