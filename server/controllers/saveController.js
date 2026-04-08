const prisma = require("../prismaClient");
const { toPostDto } = require("../dto/postDto");

exports.savePost = async (req, res) => {
  try {
    const postId = req.params.id;

    // For now fake user
    const userId = "demo-user";

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
    const userId = "demo-user";

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

    const posts = saved.map((s) => toPostDto(s.post));

    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: "Failed to get saved posts" });
  }
};

exports.unsavePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = "demo-user";

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
