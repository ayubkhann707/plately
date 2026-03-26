const { z } = require("zod");

const ingredientSchema = z.object({
  name: z.string(),
  quantity: z.number(),
  unit: z.string(),
});

const postSchema = z.object({
  title: z.string(),
  videoUrl: z.string(),

  servings: z.number(),
  timeMinutes: z.number(),

  ingredients: z.array(ingredientSchema),

  steps: z.array(z.string()),
});

module.exports = {
  postSchema,
};
