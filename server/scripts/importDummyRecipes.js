const prisma = require("../prismaClient");

function normalizeMealType(mealType) {
  if (!mealType) return [];

  if (Array.isArray(mealType)) {
    return mealType.map(String);
  }

  return [String(mealType)];
}

function parseIngredients(ingredients) {
  return ingredients.map((item) => ({
    name: item,
    quantity: null,
    unit: "",
  }));
}

async function main() {
  const user = await prisma.user.findFirst();

  if (!user) {
    throw new Error("No user found. Register/login in the app first.");
  }

  const response = await fetch("https://dummyjson.com/recipes?limit=50");

  if (!response.ok) {
    throw new Error("Failed to fetch recipes from DummyJSON");
  }

  const data = await response.json();

  for (const recipe of data.recipes) {
    const exists = await prisma.post.findFirst({
      where: {
        title: recipe.name,
      },
    });

    if (exists) {
      console.log(`Skipped: ${recipe.name}`);
      continue;
    }

    await prisma.post.create({
      data: {
        title: recipe.name,
        videoUrl: "",
        imageUrl: recipe.image || null,
        creatorId: user.id,
        tags: [
          ...(recipe.tags || []),
          recipe.cuisine,
          ...normalizeMealType(recipe.mealType),
        ].filter(Boolean),
        recipe: {
          create: {
            servings: recipe.servings || null,
            timeMinutes: recipe.prepTimeMinutes + recipe.cookTimeMinutes || null,
            ingredients: {
              create: parseIngredients(recipe.ingredients),
            },
            steps: {
              create: recipe.instructions.map((step, index) => ({
                order: index + 1,
                text: step,
              })),
            },
          },
        },
      },
    });

    console.log(`Imported: ${recipe.name}`);
  }

  console.log("Done! Recipes imported successfully.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });