const express = require("express");

const {
  createTreePurchase,
  getTreePurchases,
  getTreePurchaseById,
  updateTreePurchase,
  deleteTreePurchase,
  getTreePurchaseCost,
} = require("../controllers/treePurchase.controller");

const router = express.Router();

router.post("/", createTreePurchase);

router.get("/", getTreePurchases);

router.get("/:id/cost", getTreePurchaseCost);

router.get("/:id", getTreePurchaseById);

router.patch("/:id", updateTreePurchase);

router.delete("/:id", deleteTreePurchase);

module.exports = router;