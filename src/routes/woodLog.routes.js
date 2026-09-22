const express = require("express");

const {
  createWoodLog,
  getWoodLogs,
  getWoodLogById,
  updateWoodLog,
  deleteWoodLog,
  getAvailableInventory,
} = require("../controllers/woodLog.controller");

const router = express.Router();

router.post("/", createWoodLog);

router.get("/", getWoodLogs);

router.get(
  "/inventory",
  getAvailableInventory
);

router.get("/:id", getWoodLogById);

router.patch("/:id", updateWoodLog);

router.delete("/:id", deleteWoodLog);

module.exports = router;