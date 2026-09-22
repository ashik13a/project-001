const express = require("express");

const {
  getSalesReportController,
  getExpenseReportController,
  getInventoryReportController,
  getProfitReportController,
  getPaymentReportController,
} = require("../controllers/report.controller");

const router = express.Router();

// ==========================================
// SALES REPORT
// ==========================================

router.get(
  "/sales",
  getSalesReportController
);

// ==========================================
// EXPENSE REPORT
// ==========================================

router.get(
  "/expenses",
  getExpenseReportController
);

// ==========================================
// INVENTORY REPORT
// ==========================================

router.get(
  "/inventory",
  getInventoryReportController
);


//profit report
router.get(
  "/profit",
  getProfitReportController
);


//payment report
router.get(
  "/payments",
  getPaymentReportController
);

module.exports = router;