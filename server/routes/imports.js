const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/requireAuth");

const {
  previewRecipeFromVideo,
  saveImportedRecipe,
  estimateMissingQuantities,
  findSimilarRecipes,
  importRecipeFromSource,
} = require("../controllers/importsController");

router.post("/video/preview", requireAuth, previewRecipeFromVideo);
router.post("/video/save", requireAuth, saveImportedRecipe);
router.post("/video/estimate-quantities", requireAuth, estimateMissingQuantities);
router.post("/video/find-similar-recipes", requireAuth, findSimilarRecipes);
router.post("/video/import-from-source", requireAuth, importRecipeFromSource);

module.exports = router;