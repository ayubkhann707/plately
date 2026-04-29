const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/requireAuth");

const {
  previewRecipeFromVideo,
  saveImportedRecipe,
} = require("../controllers/importsController");

router.post("/video/preview", requireAuth, previewRecipeFromVideo);
router.post("/video/save", requireAuth, saveImportedRecipe);

module.exports = router;