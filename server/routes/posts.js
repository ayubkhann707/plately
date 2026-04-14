const express = require("express");
const router = express.Router();

const {
  getFeed,
  getPostById,
  createPost,
} = require("../controllers/postsController");

router.get("/feed", getFeed);
router.get("/:id", getPostById);
router.post("/", createPost);

module.exports = router;