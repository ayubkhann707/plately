const prisma = require("../prismaClient");
const { postSchema } = require("../validation/postSchema");
const { toPostDto } = require("../dto/postDto");

exports.createPost = async (req, res) => {
  try {
    const result = postSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json(result.error);
    }

    const {
      title,
      videoUrl,
      servings,
      timeMinutes,
      ingredients,
      steps,
    } = result.data;

    const creatorId = req.userId || null; // for now can be null

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
            steps: true,
          },
        },
      },
    });

    res.json(toPostDto(post));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Create post failed" });
  }
};
