const {
  getSalesReport,
  getExpenseReport,
  getInventoryReport,
  getProfitReport,
  getPaymentReport,
} = require("../services/report.service");
// ==========================================
// GET SALES REPORT
// ==========================================

const getSalesReportController = async (
  req,
  res
) => {
  try {
    const {
      startDate,
      endDate,
    } = req.query;

    const report =
      await getSalesReport({
        startDate,
        endDate,
      });

    res.status(200).json({
      success: true,
      message:
        "Sales report fetched successfully",
      data: report,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        "Failed to fetch sales report",
      error: error.message,
    });
  }
};

// ==========================================
// GET EXPENSE REPORT
// ==========================================

const getExpenseReportController = async (
  req,
  res
) => {
  try {
    const {
      startDate,
      endDate,
    } = req.query;

    const report =
      await getExpenseReport({
        startDate,
        endDate,
      });

    res.status(200).json({
      success: true,
      message:
        "Expense report fetched successfully",
      data: report,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        "Failed to fetch expense report",
      error: error.message,
    });
  }
};

// ==========================================
// GET INVENTORY REPORT
// ==========================================

const getInventoryReportController = async (
  req,
  res
) => {
  try {
    const report =
      await getInventoryReport();

    res.status(200).json({
      success: true,
      message:
        "Inventory report fetched successfully",
      data: report,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        "Failed to fetch inventory report",
      error: error.message,
    });
  }
};

// ==========================================
// GET PROFIT REPORT
// ==========================================

const getProfitReportController = async (
  req,
  res
) => {
  try {
    const {
      startDate,
      endDate,
    } = req.query;

    const report =
      await getProfitReport({
        startDate,
        endDate,
      });

    res.status(200).json({
      success: true,
      message:
        "Profit report fetched successfully",
      data: report,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        "Failed to fetch profit report",
      error: error.message,
    });
  }
};


// ==========================================
// GET PAYMENT REPORT
// ==========================================

const getPaymentReportController = async (
  req,
  res
) => {
  try {
    const {
      startDate,
      endDate,
    } = req.query;

    const report =
      await getPaymentReport({
        startDate,
        endDate,
      });

    res.status(200).json({
      success: true,
      message:
        "Payment report fetched successfully",
      data: report,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        "Failed to fetch payment report",
      error: error.message,
    });
  }
};

module.exports = {
  getSalesReportController,
  getExpenseReportController,
  getInventoryReportController,
  getProfitReportController,
  getPaymentReportController,
};