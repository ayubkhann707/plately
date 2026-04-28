const request = require("supertest");
const app = require("../index");

jest.mock("../prismaClient", () => ({
  mealPlanItem: {
    findFirst: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock("../services/userService", () => ({
  getUserIdOrFallback: jest.fn().mockResolvedValue("user_1"),
}));

const prisma = require("../prismaClient");

describe("POST /plan - duplicate prevention", () => {
  beforeEach(() => jest.clearAllMocks());

  test("returns 400 when recipeId or date is missing", async () => {
    const res = await request(app).post("/plan").send({});
    expect(res.statusCode).toBe(400);
  });

  test("returns 409 when same recipe already in plan for that slot", async () => {
    prisma.mealPlanItem.findFirst.mockResolvedValue({ id: "existing_1" });

    const res = await request(app).post("/plan").send({
      recipeId: "recipe_1",
      date: "2026-04-28",
      mealType: "Lunch",
    });

    expect(res.statusCode).toBe(409);
    expect(res.body.error).toMatch(/already in your plan/i);
  });

  test("creates plan item when no duplicate exists", async () => {
    prisma.mealPlanItem.findFirst.mockResolvedValue(null);
    prisma.mealPlanItem.create.mockResolvedValue({
      id: "new_item",
      recipeId: "recipe_1",
      date: "2026-04-28T00:00:00.000Z",
      mealType: "Lunch",
    });

    const res = await request(app).post("/plan").send({
      recipeId: "recipe_1",
      date: "2026-04-28",
      mealType: "Lunch",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe("new_item");
  });
});

describe("GET /plan - date filtering", () => {
  beforeEach(() => jest.clearAllMocks());

  test("returns plan items", async () => {
    prisma.mealPlanItem.findMany.mockResolvedValue([
      {
        id: "item_1",
        date: "2026-04-28T00:00:00.000Z",
        mealType: "Lunch",
        recipe: { post: { title: "Pasta" }, ingredients: [] },
      },
    ]);

    const res = await request(app).get("/plan");
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(1);
  });

  test("filters by date range", async () => {
    prisma.mealPlanItem.findMany.mockResolvedValue([]);

    const res = await request(app)
      .get("/plan")
      .query({ from: "2026-04-01", to: "2026-04-30" });

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([]);
  });

  test("handles UTC date correctly", async () => {
    prisma.mealPlanItem.findFirst.mockResolvedValue(null);
    prisma.mealPlanItem.create.mockResolvedValue({
      id: "item_utc",
      date: "2026-04-28T00:00:00.000Z",
      mealType: "Dinner",
    });

    const res = await request(app).post("/plan").send({
      recipeId: "recipe_1",
      date: "2026-04-28T23:59:00.000Z",
      mealType: "Dinner",
    });

    expect(res.statusCode).toBe(200);
  });
});