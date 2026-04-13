const request = require("supertest");
const app = require("../index");

jest.mock("../prismaClient", () => ({
  user: {
    findFirst: jest.fn(),
  },
  post: {
    create: jest.fn(),
  },
}));

jest.mock("../services/importVideoService", () => ({
  extractYouTubeTranscript: jest.fn(),
  extractVideoMetadata: jest.fn(),
  extractRecipeWithAI: jest.fn(),
}));

const prisma = require("../prismaClient");
const {
  extractYouTubeTranscript,
  extractVideoMetadata,
  extractRecipeWithAI,
} = require("../services/importVideoService");

describe("POST /imports/video", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("returns 400 when videoUrl is missing", async () => {
    const response = await request(app)
      .post("/imports/video")
      .send({});

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toMatch(/videoUrl is required/i);
  });

  test("returns 400 when no users exist", async () => {
    prisma.user.findFirst.mockResolvedValue(null);

    const response = await request(app)
      .post("/imports/video")
      .send({ videoUrl: "https://youtube.com/watch?v=abc" });

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toMatch(/no users found/i);
  });

  test("imports recipe successfully", async () => {
    prisma.user.findFirst.mockResolvedValue({ id: "user_1" });

    extractVideoMetadata.mockResolvedValue({
      title: "Pasta Recipe",
      description: "Simple pasta with garlic and olive oil",
      uploader: "Chef",
      channel: "Chef Channel",
    });

    extractYouTubeTranscript.mockResolvedValue(
      "Boil pasta. Add olive oil, garlic, and parmesan cheese."
    );

    extractRecipeWithAI.mockResolvedValue({
      title: "Pasta Recipe",
      servings: 2,
      timeMinutes: 15,
      ingredients: [
        { name: "pasta", quantity: 200, unit: "g" },
        { name: "olive oil", quantity: 2, unit: "tbsp" },
        { name: "garlic", quantity: 2, unit: "cloves" },
      ],
      steps: ["Boil pasta.", "Add olive oil and garlic."],
    });

    prisma.post.create.mockResolvedValue({
      id: "post_1",
      title: "Pasta Recipe",
      recipe: {
        ingredients: [
          { name: "pasta", quantity: 200, unit: "g" },
          { name: "olive oil", quantity: 2, unit: "tbsp" },
          { name: "garlic", quantity: 2, unit: "cloves" },
        ],
        steps: [
          { order: 1, text: "Boil pasta." },
          { order: 2, text: "Add olive oil and garlic." },
        ],
      },
    });

    const response = await request(app)
      .post("/imports/video")
      .send({ videoUrl: "https://youtube.com/watch?v=abc" });

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.platform).toBe("youtube");
    expect(response.body.post.recipe.ingredients).toHaveLength(3);
    expect(response.body.post.recipe.steps).toHaveLength(2);
  });
});