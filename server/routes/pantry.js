const express = require("express");
const router = express.Router();
const { listPantry, addToPantry, removeFromPantry } = require("../controllers/pantryController");

router.get("/", listPantry);
router.post("/", addToPantry);
router.delete("/:id", removeFromPantry);

module.exports = router;
