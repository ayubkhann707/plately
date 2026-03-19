const express = require("express");
const router = express.Router();

const {
  getFeed,
  getPostById,
} = require("../controllers/postsController");

router.get("/feed", getFeed);
router.get("/:id", getPostById);

module.exports = router;
