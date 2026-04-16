const express = require("express");
const router = express.Router();

const { getGroceryList } = require("../controllers/groceryController");

router.get("/", getGroceryList);

module.exports = router;
