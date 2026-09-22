const express = require("express");

const {
  createPayment,
  getPayments,
  getPaymentsBySale,
  getPaymentsByCustomer,
  getPaymentById,
  deletePayment,
  getCustomerReceivableSummary,
  getCustomerDueList,
} = require("../controllers/payment.controller");



const router = express.Router();

// Create payment
router.post("/", createPayment);

// Get all payments
router.get("/", getPayments);

// Get payments of a specific sale
router.get("/sale/:saleId", getPaymentsBySale);

// Get payments of a specific customer
router.get("/customer/:customerId", getPaymentsByCustomer);

router.get(
  "/customer/:customerId/summary",
  getCustomerReceivableSummary
);
//due payment
router.get(
  "/due",
  getCustomerDueList
);

// Get single payment
router.get("/:id", getPaymentById);

// Delete payment
router.delete("/:id", deletePayment);

module.exports = router;