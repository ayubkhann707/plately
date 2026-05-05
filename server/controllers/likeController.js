const prisma = require("../prismaClient");

exports.likePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.userId;

    await prisma.like.upsert({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
      update: {},
      create: {
        userId,
        postId,
      },
    });

    const likeCount = await prisma.like.count({
      where: { postId },
    });

    res.json({ ok: true, isLiked: true, likeCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to like post" });
  }
};

exports.unlikePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.userId;

    await prisma.like.deleteMany({
      where: { postId, userId },
    });

    const likeCount = await prisma.like.count({
      where: { postId },
    });

    res.json({ ok: true, isLiked: false, likeCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to unlike post" });
  }
};