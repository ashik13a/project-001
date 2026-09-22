const express = require("express");

const {
  getProfitByTreePurchaseController,
  getProfitBySaleController,
  getBusinessSummaryController,
  getAllTreePurchaseSummariesController,
  getDashboardSummaryController,
} = require("../controllers/profit.controller");

const router = express.Router();

router.get(
  "/tree-purchase/:treePurchaseId",
  getProfitByTreePurchaseController
);

router.get(
  "/sale/:saleId",
  getProfitBySaleController
);

router.get(
  "/tree-purchases",
  getAllTreePurchaseSummariesController
);

router.get(
  "/summary",
  getBusinessSummaryController
);

//dashboard 
router.get(
  "/dashboard",
  getDashboardSummaryController
);

module.exports = router;