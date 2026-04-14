const prisma = require("../prismaClient");
const { postSchema } = require("../validation/postSchema");
const { toPostDto } = require("../dto/postDto");

exports.getFeed = async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      include: {
        recipe: {
          include: {
            ingredients: true,
            steps: {
              orderBy: { order: "asc" },
            },
          },
        },
        creator: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(posts.map(toPostDto));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch feed" });
  }
};

exports.getPostById = async (req, res) => {
  try {
    const post = await prisma.post.findUnique({
      where: { id: req.params.id },
      include: {
        recipe: {
          include: {
            ingredients: true,
            steps: {
              orderBy: { order: "asc" },
            },
          },
        },
        creator: true,
      },
    });

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    res.json(toPostDto(post));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch post" });
  }
};

exports.createPost = async (req, res) => {
  try {
    const result = postSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json(result.error);
    }

    const { title, videoUrl, servings, timeMinutes, ingredients, steps } = result.data;

    let creatorId = req.userId;

    if (!creatorId) {
      const firstUser = await prisma.user.findFirst();
      if (!firstUser) {
        return res.status(400).json({
          error: "No users found in database. Create a user first.",
        });
      }
      creatorId = firstUser.id;
    }

    const post = await prisma.post.create({
      data: {
        title,
        videoUrl,
        creatorId,
        recipe: {
          create: {
            servings,
            timeMinutes,
            ingredients: {
              create: ingredients,
            },
            steps: {
              create: steps.map((text, i) => ({
                order: i + 1,
                text,
              })),
            },
          },
        },
      },
      include: {
        recipe: {
          include: {
            ingredients: true,
            steps: {
              orderBy: { order: "asc" },
            },
          },
        },
        creator: true,
      },
    });

    res.status(201).json(toPostDto(post));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Create post failed" });
  }
};