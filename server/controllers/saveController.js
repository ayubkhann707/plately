const prisma = require("../prismaClient");
const { toPostDto } = require("../dto/postDto");

exports.savePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.userId;
    const saved = await prisma.save.upsert({
      where: { userId_postId: { userId, postId } },
      update: {},
      create: { userId, postId },
    });
    res.json(saved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save post" });
  }
};

exports.getSavedPosts = async (req, res) => {
  try {
    const userId = req.user.userId;
    const saved = await prisma.save.findMany({
      where: { userId },
      include: {
        post: {
          include: {
            recipe: { include: { ingredients: true, steps: true } },
            creator: true,
            saves: { where: { userId } },
            likes: true,
          },
        },
      },
    });
    const posts = saved.filter((s) => s.post).map((s) => toPostDto(s.post, userId));
    res.json(posts);
  } catch (err) {
    console.error("GET /saved error:", err);
    res.status(500).json({ error: "Failed to get saved posts", details: err.message });
  }
};

exports.unsavePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.userId;
    await prisma.save.deleteMany({ where: { postId, userId } });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to unsave post" });
  }
};