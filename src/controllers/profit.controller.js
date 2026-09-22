const {
  getProfitByTreePurchase,
  getProfitBySale,
  getBusinessSummary,
  getAllTreePurchaseSummaries,
  getDashboardSummary,
} = require("../services/profit.service");

// GET PROFIT BY TREE PURCHASE
const getProfitByTreePurchaseController = async (
  req,
  res
) => {
  try {
    const { treePurchaseId } = req.params;

    const profit =
      await getProfitByTreePurchase(treePurchaseId);

    res.status(200).json({
      success: true,
      message: "Profit calculated successfully",
      data: profit,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to calculate profit",
      error: error.message,
    });
  }
};

// GET PROFIT BY SALE
const getProfitBySaleController = async (
  req,
  res
) => {
  try {
    const { saleId } = req.params;

    const profit =
      await getProfitBySale(saleId);

    res.status(200).json({
      success: true,
      message: "Sale profit calculated successfully",
      data: profit,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to calculate sale profit",
      error: error.message,
    });
  }
};


// GET OVERALL BUSINESS SUMMARY
const getBusinessSummaryController = async (
  req,
  res
) => {
  try {
    const summary =
      await getBusinessSummary();

    res.status(200).json({
      success: true,
      message:
        "Business summary calculated successfully",
      data: summary,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message:
        "Failed to calculate business summary",
      error: error.message,
    });
  }
};

// GET ALL TREE PURCHASE FINANCIAL SUMMARIES
const getAllTreePurchaseSummariesController =
  async (req, res) => {
    try {
      const summaries =
        await getAllTreePurchaseSummaries();

      res.status(200).json({
        success: true,
        message:
          "Tree purchase financial summaries fetched successfully",
        data: summaries,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          "Failed to fetch tree purchase financial summaries",
        error: error.message,
      });
    }
  };


  // ==========================================
// GET DASHBOARD SUMMARY
// ==========================================

const getDashboardSummaryController =
  async (req, res) => {
    try {
      const summary =
        await getDashboardSummary();

      res.status(200).json({
        success: true,
        message:
          "Dashboard summary fetched successfully",
        data: summary,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          "Failed to fetch dashboard summary",
        error: error.message,
      });
    }
  };



module.exports = {
  getProfitByTreePurchaseController,
  getProfitBySaleController,
  getBusinessSummaryController,
  getAllTreePurchaseSummariesController,
  getDashboardSummaryController,
};