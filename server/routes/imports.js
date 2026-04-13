const express = require("express");
const router = express.Router();

const { importRecipeFromVideo } = require("../controllers/importsController");

router.post("/video", importRecipeFromVideo);

module.exports = router;