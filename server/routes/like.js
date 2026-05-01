const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/requireAuth");
const { likePost, unlikePost } = require("../controllers/likeController");

router.post("/posts/:id/like", requireAuth, likePost);
router.delete("/posts/:id/like", requireAuth, unlikePost);

module.exports = router;