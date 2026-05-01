const prisma = require("../prismaClient");
const { postSchema } = require("../validation/postSchema");
const { toPostDto } = require("../dto/postDto");
const { getUserIdOrFallback } = require("../services/userService");

function getImageFromUrl(url) {
  if (!url) return null;
  const cleanUrl = String(url).trim();
  const lower = cleanUrl.toLowerCase().split("?")[0];
  if (
    lower.endsWith(".jpg") ||
    lower.endsWith(".jpeg") ||
    lower.endsWith(".png") ||
    lower.endsWith(".webp") ||
    lower.endsWith(".gif")
  ) {
    return cleanUrl;
  }
  try {
    const parsed = new URL(cleanUrl);
    let videoId = "";
    if (parsed.hostname.includes("youtu.be")) {
      videoId = parsed.pathname.slice(1).split("?")[0];
    }
    if (parsed.hostname.includes("youtube.com")) {
      videoId = parsed.searchParams.get("v") || "";
      if (!videoId && parsed.pathname.includes("/shorts/")) {
        videoId = parsed.pathname.split("/shorts/")[1]?.split("/")[0] || "";
      }
      if (!videoId && parsed.pathname.includes("/embed/")) {
        videoId = parsed.pathname.split("/embed/")[1]?.split("/")[0] || "";
      }
    }
    return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;
  } catch {
    return null;
  }
}

exports.getFeed = async (req, res) => {
  try {
    const userId = await getUserIdOrFallback(req);
    const posts = await prisma.post.findMany({
      where: { isPublic: true },
      include: {
        recipe: {
          include: {
            ingredients: true,
            steps: { orderBy: { order: "asc" } },
          },
        },
        creator: true,
        saves: { where: { userId } },
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
    const userId = await getUserIdOrFallback(req);
    const post = await prisma.post.findUnique({
      where: { id: req.params.id },
      include: {
        recipe: {
          include: {
            ingredients: true,
            steps: { orderBy: { order: "asc" } },
          },
        },
        creator: true,
        saves: { where: { userId } },
        likes: true,
      },
    });
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    res.json(toPostDto(post, userId));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch post" });
  }
};

exports.createPost = async (req, res) => {
  try {
    const result = postSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: result.error.issues
          .map((e) => `${e.path.join(".")}: ${e.message}`)
          .join(", "),
      });
    }
    const { title, videoUrl, imageUrl, servings, timeMinutes, ingredients, steps, tags } = result.data;
    const creatorId = await getUserIdOrFallback(req);
    const finalImageUrl = imageUrl || getImageFromUrl(videoUrl);
    const post = await prisma.post.create({
      data: {
        title,
        videoUrl,
        imageUrl: finalImageUrl,
        creatorId,
        tags: tags || [],
        isPublic: true,
        recipe: {
          create: {
            servings,
            timeMinutes,
            ingredients: { create: ingredients },
            steps: { create: steps.map((text, i) => ({ order: i + 1, text })) },
          },
        },
      },
      include: {
        recipe: {
          include: {
            ingredients: true,
            steps: { orderBy: { order: "asc" } },
          },
        },
        creator: true,
        likes: true,
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
    const userId = await getUserIdOrFallback(req);
    const posts = await prisma.post.findMany({
      where: { creatorId: userId },
      include: {
        recipe: {
          include: {
            ingredients: true,
            steps: { orderBy: { order: "asc" } },
          },
        },
        creator: true,
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