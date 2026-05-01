const { getUserIdOrFallback } = require("../services/userService");
const { getPantry, addPantryItem, removePantryItem } = require("../services/pantryService");

exports.listPantry = async (req, res) => {
  try {
    const userId = await getUserIdOrFallback(req);
    const items = await getPantry(userId);
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch pantry" });
  }
};

exports.addToPantry = async (req, res) => {
  try {
    const userId = await getUserIdOrFallback(req);
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "name required" });
    const item = await addPantryItem(userId, name);
    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add pantry item" });
  }
};

exports.removeFromPantry = async (req, res) => {
  try {
    const userId = await getUserIdOrFallback(req);
    await removePantryItem(userId, req.params.id);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(err.message === "Not found" ? 404 : 500).json({ error: err.message });
  }
};
