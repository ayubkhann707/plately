const prisma = require("../prismaClient");
const { getUserIdOrFallback } = require("../services/userService");

exports.likePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = await getUserIdOrFallback(req);
    await prisma.like.create({ data: { userId, postId } });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to like post" });
  }
};

exports.unlikePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = await getUserIdOrFallback(req);
    await prisma.like.deleteMany({ where: { postId, userId } });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to unlike post" });
  }
};