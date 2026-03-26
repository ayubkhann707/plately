const prisma = require("../prismaClient");
const { toPostDto } = require("../dto/postDto");

exports.getFeed = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 10;
    const offset = Number(req.query.offset) || 0;

    const posts = await prisma.post.findMany({
      take: limit,
      skip: offset,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        recipe: {
          include: {
            ingredients: true,
            steps: true,
          },
        },
      },
    });

    res.json(posts.map(toPostDto));

  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Server error",
    });
  }
};

exports.getPostById = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        recipe: {
          include: {
            ingredients: true,
            steps: {
              orderBy: { order: "asc" },
            },
          },
        },
      },
    });

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    res.json(toPostDto(post));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
