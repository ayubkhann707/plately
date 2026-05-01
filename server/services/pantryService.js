const prisma = require("../prismaClient");

async function getPantry(userId) {
  return prisma.pantryItem.findMany({ where: { userId }, orderBy: { name: "asc" } });
}

async function addPantryItem(userId, name) {
  return prisma.pantryItem.create({ data: { userId, name: name.trim().toLowerCase() } });
}

async function removePantryItem(userId, id) {
  const item = await prisma.pantryItem.findUnique({ where: { id } });
  if (!item || item.userId !== userId) throw new Error("Not found");
  return prisma.pantryItem.delete({ where: { id } });
}

/**
 * Given a grocery ingredient name, check if it's covered by the pantry.
 * Uses simple substring matching (e.g. "garlic cloves" matches pantry "garlic").
 */
function isCoveredByPantry(ingredientName, pantryItems) {
  const norm = ingredientName.toLowerCase();
  return pantryItems.some((p) => {
    const pName = p.name.toLowerCase();
    return norm.includes(pName) || pName.includes(norm);
  });
}

module.exports = { getPantry, addPantryItem, removePantryItem, isCoveredByPantry };
