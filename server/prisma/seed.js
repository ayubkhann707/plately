const bcrypt = require("bcrypt");
require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  // Clean (dev only)
  await prisma.save.deleteMany();
  await prisma.mealPlanItem.deleteMany();
  await prisma.step.deleteMany();
  await prisma.ingredient.deleteMany();
  await prisma.recipe.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("password123", 10);

  const user1 = await prisma.user.create({
    data: { email: "demo1@example.com", password: passwordHash },
  });

  const user2 = await prisma.user.create({
    data: { email: "demo2@example.com", password: passwordHash },
  });

  // Create demo-user for the savePost endpoint
  await prisma.user.create({
    data: { id: "demo-user", email: "demo@example.com", password: passwordHash },
  });

  async function createPostWithRecipe(creatorId, title, videoUrl, servings, timeMinutes, ingredients, steps) {
    return prisma.post.create({
      data: {
        title,
        videoUrl,
        creatorId,
        recipe: {
          create: {
            servings,
            timeMinutes,
            ingredients: { create: ingredients },
            steps: { create: steps.map((t, i) => ({ order: i + 1, text: t })) },
          },
        },
      },
    });
  }

  await createPostWithRecipe(
    user1.id,
    "Spicy Noodles (15 min)",
    "https://www.youtube.com/watch?v=A_o2qiaDpfQ",
    2,
    15,
    [
      { name: "noodles", quantity: 200, unit: "g" },
      { name: "chili oil", quantity: 1, unit: "tbsp" },
      { name: "eggs", quantity: 2, unit: "pcs" },
    ],
    ["Boil noodles", "Mix sauce", "Combine and serve"]
  );

  await createPostWithRecipe(
    user1.id,
    "Simple Salad",
    "https://www.youtube.com/watch?v=G_H6S-qVByM",
    1,
    10,
    [
      { name: "lettuce", quantity: 1, unit: "head" },
      { name: "tomato", quantity: 2, unit: "pcs" },
      { name: "olive oil", quantity: 1, unit: "tbsp" },
    ],
    ["Chop vegetables", "Add dressing", "Mix"]
  );

  await createPostWithRecipe(
    user2.id,
    "Pancakes",
    "https://www.youtube.com/watch?v=LWu5n_I_WvE",
    2,
    20,
    [
      { name: "flour", quantity: 200, unit: "g" },
      { name: "milk", quantity: 250, unit: "ml" },
      { name: "eggs", quantity: 2, unit: "pcs" },
    ],
    ["Mix ingredients", "Cook on pan", "Serve"]
  );

  console.log("Seed completed: 2 users, 3 posts with recipes.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });