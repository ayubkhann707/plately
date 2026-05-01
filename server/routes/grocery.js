const express = require("express");
const router = express.Router();
const { getGroceryList, shareGroceryList, getSharedGroceryList } = require("../controllers/groceryController");
router.get("/", getGroceryList);
router.post("/share", shareGroceryList);
router.get("/share/:token", getSharedGroceryList);
module.exports = router;
