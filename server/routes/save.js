const express = require("express");
const router = express.Router();
const { savePost, getSavedPosts, unsavePost } = require("../controllers/saveController");

router.post("/posts/:id/save", savePost);
router.get("/saved", getSavedPosts);
router.delete("/posts/:id/save", unsavePost);

module.exports = router;
