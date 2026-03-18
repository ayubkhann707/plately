const express = require("express");
const router = express.Router();

const requireAuth = require("../middleware/requireAuth");

router.get("/private", requireAuth, (req, res) => {
  res.json({
    message: "You are authorized",
    user: req.user,
  });
});

module.exports = router;
