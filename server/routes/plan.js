const express = require("express");
const router = express.Router();

const { addToPlan, getPlan, deleteFromPlan } = require("../controllers/planController");

router.post("/", addToPlan);
router.get("/", getPlan);
router.delete("/:id", deleteFromPlan);

module.exports = router;
