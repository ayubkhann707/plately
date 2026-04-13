process.env.OPENAI_API_KEY = "fake-key";
const request = require("supertest");
const app = require("../index");
const prisma = require("../prismaClient");

describe("Save + Library Flow", () => {
  let postId;

  beforeAll(async () => {
    // Get a post ID from the feed
    const res = await request(app).get("/posts/feed");
    if (res.body && res.body.length > 0) {
      postId = res.body[0].id;
    }
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test("should save a post", async () => {
    if (!postId) {
      console.warn("No post ID found in feed, skipping test.");
      return;
    }
    // Clean up first if it was saved
    await request(app).delete(`/posts/${postId}/save`);

    const res1 = await request(app).post(`/posts/${postId}/save`);
    expect(res1.statusCode).toBe(200);
    // Based on saveController.js, it returns the saved object
    expect(res1.body.postId).toBe(postId);
  });

  test("should return saved posts", async () => {
    if (!postId) return;
    
    // Ensure it's saved
    await request(app).post(`/posts/${postId}/save`);

    const res = await request(app).get("/saved");
    expect(res.statusCode).toBe(200);

    const found = res.body.find((p) => p.id === postId);
    expect(found).toBeDefined();
  });

  test("should unsave a post", async () => {
    if (!postId) return;

    const res = await request(app).delete(`/posts/${postId}/save`);
    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);

    const checkRes = await request(app).get("/saved");
    const found = checkRes.body.find((p) => p.id === postId);
    expect(found).toBeUndefined();
  });

  test("should handle invalid postId on save", async () => {
    const res = await request(app).post("/posts/invalid-id/save");
    // Depending on DB constraints, it might be 500 or 404.
    // Controller returns 500 on catch block
    expect(res.statusCode).toBe(500);
  });
});
