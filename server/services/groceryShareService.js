const prisma = require("../prismaClient");
const crypto = require("crypto");

async function createShare(userId, groceryData) {
  const token = crypto.randomBytes(16).toString("hex");
  await prisma.groceryShare.create({
    data: { userId, token, data: groceryData },
  });
  return token;
}

async function getShare(token) {
  return prisma.groceryShare.findUnique({ where: { token } });
}

module.exports = { createShare, getShare };
