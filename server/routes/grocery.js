const express = require("express");
const router = express.Router();

const requireAuth = require("../middleware/requireAuth");

const {
  getGroceryList,
  shareGroceryList,
  getSharedGroceryList,
} = require("../controllers/groceryController");

router.get("/", requireAuth, getGroceryList);
router.post("/share", requireAuth, shareGroceryList);

router.get("/share/:token", getSharedGroceryList);

module.exports = router;