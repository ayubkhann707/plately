const prisma = require("../prismaClient");
const { toPostDto } = require("../dto/postDto");

function getImageFromUrl(url) {
  if (!url) return null;
  const cleanUrl = String(url).trim();
  const lower = cleanUrl.toLowerCase().split("?")[0];
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.endsWith(".png") || lower.endsWith(".webp") || lower.endsWith(".gif")) {
    return cleanUrl;
  }
  try {
    const parsed = new URL(cleanUrl);
    let videoId = "";
    if (parsed.hostname.includes("youtu.be")) videoId = parsed.pathname.slice(1).split("?")[0];
    if (parsed.hostname.includes("youtube.com")) {
      videoId = parsed.searchParams.get("v") || "";
      if (!videoId && parsed.pathname.includes("/shorts/")) videoId = parsed.pathname.split("/shorts/")[1]?.split("/")[0] || "";
      if (!videoId && parsed.pathname.includes("/embed/")) videoId = parsed.pathname.split("/embed/")[1]?.split("/")[0] || "";
    }
    return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;
  } catch { return null; }
}

const creatorSelect = { select: { id: true, email: true, nickname: true, avatarUrl: true } };

exports.getFeed = async (req, res) => {
  try {
    const userId = req.user?.userId ?? null;
    const posts = await prisma.post.findMany({
      where: { isPublic: true },
      include: {
        recipe: { include: { ingredients: true, steps: { orderBy: { order: "asc" } } } },
        creator: creatorSelect,
        saves: userId ? { where: { userId } } : false,
        likes: true,
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(posts.map((post) => toPostDto(post, userId)));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch feed" });
  }
};

exports.getPostById = async (req, res) => {
  try {
    const userId = req.user?.userId ?? null;
    const post = await prisma.post.findUnique({
      where: { id: req.params.id },
      include: {
        recipe: { include: { ingredients: true, steps: { orderBy: { order: "asc" } } } },
        creator: creatorSelect,
        saves: userId ? { where: { userId } } : false,
        likes: true,
      },
    });
    if (!post) return res.status(404).json({ error: "Post not found" });
    res.json(toPostDto(post, userId));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch post" });
  }
};

exports.createPost = async (req, res) => {
  try {
    const creatorId = req.user.userId;
    const { title, videoUrl, imageUrl, servings, timeMinutes, ingredients, steps, tags } = req.body;
    if (!title || !videoUrl) return res.status(400).json({ error: "Title and videoUrl are required" });
    const finalImageUrl = imageUrl || getImageFromUrl(videoUrl);
    const post = await prisma.post.create({
      data: {
        title, videoUrl, imageUrl: finalImageUrl, creatorId, tags: tags || [], isPublic: true,
        recipe: {
          create: {
            servings: servings || null, timeMinutes: timeMinutes || null,
            ingredients: { create: ingredients || [] },
            steps: { create: (steps || []).map((text, i) => ({ order: i + 1, text })) },
          },
        },
      },
      include: {
        recipe: { include: { ingredients: true, steps: { orderBy: { order: "asc" } } } },
        creator: creatorSelect, likes: true,
      },
    });
    res.status(201).json(toPostDto(post, creatorId));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Create post failed" });
  }
};

exports.getMyPosts = async (req, res) => {
  try {
    const userId = req.user.userId;
    const posts = await prisma.post.findMany({
      where: { creatorId: userId, isPublic: true },
      include: {
        recipe: { include: { ingredients: true, steps: { orderBy: { order: "asc" } } } },
        creator: creatorSelect,
        saves: { where: { userId } },
        likes: true,
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(posts.map((post) => toPostDto(post, userId)));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch your posts" });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const userId = req.user.userId;
    const postId = req.params.id;
    const post = await prisma.post.findUnique({ where: { id: postId }, include: { recipe: true } });
    if (!post) return res.status(404).json({ error: "Post not found" });
    if (post.creatorId !== userId) return res.status(403).json({ error: "You can delete only your own posts" });
    await prisma.$transaction(async (tx) => {
      await tx.save.deleteMany({ where: { postId } });
      await tx.like.deleteMany({ where: { postId } });
      if (post.recipe) {
        await tx.mealPlanItem.deleteMany({ where: { recipeId: post.recipe.id } });
        await tx.ingredient.deleteMany({ where: { recipeId: post.recipe.id } });
        await tx.step.deleteMany({ where: { recipeId: post.recipe.id } });
        await tx.recipe.delete({ where: { id: post.recipe.id } });
      }
      await tx.post.delete({ where: { id: postId } });
    });
    return res.status(204).send();
  } catch (err) {
    console.error("Delete post error:", err);
    res.status(500).json({ error: "Failed to delete post" });
  }
};