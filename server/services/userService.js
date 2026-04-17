const prisma = require("../prismaClient");
const bcrypt = require("bcrypt");

/**
 * Gets the userId from req.userId, or falls back to the first user in the DB.
 * If no users exist, it creates a default test user.
 */
async function getUserIdOrFallback(req) {
  if (req && req.userId) {
    return req.userId;
  }

  let firstUser = await prisma.user.findFirst();

  if (!firstUser) {
    const hashedPassword = await bcrypt.hash("password123", 10);
    firstUser = await prisma.user.create({
      data: {
        email: "test@example.com",
        password: hashedPassword,
      },
    });
  }

  return firstUser.id;
}

module.exports = {
  getUserIdOrFallback,
};
