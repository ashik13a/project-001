const express = require("express");

const {
  createExpense,
  getExpenses,
  getExpensesByTreePurchase,
  updateExpense,
  deleteExpense,
} = require("../controllers/expense.controller");


const router = express.Router();

router.post("/", createExpense);

router.get("/", getExpenses);

router.get(
  "/tree-purchase/:treePurchaseId",
  getExpensesByTreePurchase
);

router.patch("/:id", updateExpense);

router.delete("/:id", deleteExpense);

module.exports = router;