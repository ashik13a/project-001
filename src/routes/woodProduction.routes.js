const express = require("express");

const {
  createWoodProduction,
  getWoodProductions,
  getWoodProductionById,
  updateWoodProduction,
  deleteWoodProduction,
} = require("../controllers/woodProduction.controller");

const router = express.Router();

router.post("/", createWoodProduction);
router.get("/", getWoodProductions);
router.get("/:id", getWoodProductionById);
router.patch("/:id", updateWoodProduction);
router.delete("/:id", deleteWoodProduction);

module.exports = router;