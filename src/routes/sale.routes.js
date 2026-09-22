const express = require("express");

const {
  createSale,
  getSales,
  getSaleById,
  updateSale,
  deleteSale,
} = require("../controllers/sale.controller");

const router = express.Router();

router.post("/", createSale);
router.get("/", getSales);
router.get("/:id", getSaleById);
router.patch("/:id", updateSale);
router.delete("/:id", deleteSale);
router.patch("/:id", updateSale);

module.exports = router;