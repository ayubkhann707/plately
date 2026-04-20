const prisma = require("../prismaClient");
const { toPostDto } = require("../dto/postDto");
const { getUserIdOrFallback } = require("../services/userService");

exports.savePost = async (req, res) => {
  try {
    const postId = req.params.id;

    const userId = await getUserIdOrFallback(req);

    const saved = await prisma.save.create({
      data: {
        userId,
        postId,
      },
    });

    res.json(saved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save post" });
  }
};

exports.getSavedPosts = async (req, res) => {
  try {
    console.log("GET /saved hit");

    const userId = await getUserIdOrFallback(req);
    console.log("userId =", userId);

    const saved = await prisma.save.findMany({
      where: { userId },
      include: {
        post: {
          include: {
            recipe: {
              include: {
                ingredients: true,
                steps: true,
              },
            },
          },
        },
      },
    });

    console.log("saved count =", saved.length);

    const posts = saved
      .filter((s) => s.post)
      .map((s) => toPostDto(s.post));

    res.json(posts);
  } catch (err) {
    console.error("GET /saved error:", err);
    res.status(500).json({
      error: "Failed to get saved posts",
      details: err.message,
    });
  }
};

exports.unsavePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = await getUserIdOrFallback(req);

    await prisma.save.deleteMany({
      where: {
        postId,
        userId,
      },
    });

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to unsave post" });
  }
};
