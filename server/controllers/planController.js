const prisma = require("../prismaClient");

exports.addToPlan = async (req, res) => {
  try {
    const userId = "demo-user";
    const { recipeId, date } = req.body;

    if (!recipeId || !date) {
      return res.status(400).json({
        error: "recipeId and date are required",
      });
    }

    const item = await prisma.mealPlanItem.create({
      data: {
        userId,
        recipeId,
        date: new Date(date),
      },
    });

    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Failed to add to plan",
    });
  }
};

exports.getPlan = async (req, res) => {
  try {
    const userId = "demo-user";

    const { from, to } = req.query;

    const items = await prisma.mealPlanItem.findMany({
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
            post: true,
          },
        },
      },
      orderBy: {
        date: "asc",
      },
    });

    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Failed to fetch plan",
    });
  }
};

exports.deleteFromPlan = async (req, res) => {
  try {
    const userId = "demo-user";
    const { id } = req.params;

    const existing = await prisma.mealPlanItem.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({
        error: "Plan item not found",
      });
    }

    // Optional safety: ensure user owns it
    if (existing.userId !== userId) {
      return res.status(403).json({
        error: "Not authorized",
      });
    }

    await prisma.mealPlanItem.delete({
      where: { id },
    });

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Failed to delete plan item",
    });
  }
};
