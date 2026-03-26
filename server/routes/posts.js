const express = require("express");
const router = express.Router();

const {
  getFeed,
  getPostById,
} = require("../controllers/postsController");
const { createPost } = require("../controllers/postController");

router.get("/feed", getFeed);
router.get("/:id", getPostById);
router.post("/", createPost);

module.exports = router;
