const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/requireAuth");
const { listPantry, addToPantry, removeFromPantry } = require("../controllers/pantryController");

router.get("/", requireAuth, listPantry);
router.post("/", requireAuth, addToPantry);
router.delete("/:id", requireAuth, removeFromPantry);

module.exports = router;