const Sale = require("../models/sale.model");
const Expense = require("../models/expense.model");
const TreePurchase = require("../models/treePurchase.model");
const WoodProduction = require("../models/woodProduction.model");
const WoodLog = require("../models/woodLog.model");
const Payment = require("../models/payment.model");


const {
  getTotalExpenseByTreePurchase,
} = require("./expense.service");

// ==========================================
// GET SALES REPORT
// ==========================================

const getSalesReport = async ({
  startDate,
  endDate,
}) => {
  const filter = {};

  if (startDate || endDate) {
    filter.saleDate = {};

    if (startDate) {
      filter.saleDate.$gte =
        new Date(`${startDate}T00:00:00.000Z`);
    }

    if (endDate) {
      filter.saleDate.$lte =
        new Date(`${endDate}T23:59:59.999Z`);
    }
  }

  const sales = await Sale.find(filter)
    .populate("customerId")
    .populate("items.woodLogId")
    .sort({ saleDate: -1 });

  let totalSales = 0;
  let totalPaid = 0;
  let totalDue = 0;
  let totalSoldCft = 0;

  for (const sale of sales) {
    totalSales += sale.totalAmount;
    totalPaid += sale.paidAmount;
    totalDue += sale.dueAmount;

    for (const item of sale.items) {
      totalSoldCft += item.quantityCft;
    }
  }

  return {
    startDate: startDate || null,
    endDate: endDate || null,

    totalOrders: sales.length,

    totalSales,
    totalPaid,
    totalDue,
    totalSoldCft,

    sales,
  };
};

// ==========================================
// GET EXPENSE REPORT
// ==========================================

const getExpenseReport = async ({
  startDate,
  endDate,
}) => {
  const filter = {};

  if (startDate || endDate) {
    filter.date = {};

    if (startDate) {
      filter.date.$gte =
        new Date(`${startDate}T00:00:00.000Z`);
    }

    if (endDate) {
      filter.date.$lte =
        new Date(`${endDate}T23:59:59.999Z`);
    }
  }

  const expenses = await Expense.find(filter)
    .populate("treePurchaseId")
    .sort({ date: -1 });

  let totalExpense = 0;

  const expenseByType = {
    cutting: 0,
    transport: 0,
    loading: 0,
    unloading: 0,
    labor: 0,
    sawmill: 0,
    other: 0,
  };

  for (const expense of expenses) {
    totalExpense += expense.amount;

    if (
      expenseByType[expense.type] !== undefined
    ) {
      expenseByType[expense.type] +=
        expense.amount;
    }
  }

  return {
    startDate: startDate || null,
    endDate: endDate || null,

    totalExpense,

    expenseByType,

    totalExpenses: expenses.length,

    expenses,
  };
};

// ==========================================
// GET INVENTORY REPORT
// ==========================================

const getInventoryReport = async () => {
  const treePurchases =
    await TreePurchase.find({});

  const productions =
    await WoodProduction.find({});

  const logs = await WoodLog.find({
    availableCft: { $gt: 0 },
  }).populate({
    path: "woodProductionId",
    populate: {
      path: "treePurchaseId",
    },
  });

  // -------------------------
  // TOTAL PRODUCED CFT
  // -------------------------

  let totalProducedCft = 0;

  for (const production of productions) {
    totalProducedCft += production.totalCft;
  }

  // -------------------------
  // TOTAL AVAILABLE CFT
  // -------------------------

  let totalAvailableCft = 0;

  for (const log of logs) {
    totalAvailableCft += log.availableCft;
  }

  // -------------------------
  // TOTAL SOLD CFT
  // -------------------------

  const totalSoldCft =
    totalProducedCft - totalAvailableCft;

  // -------------------------
  // TOTAL BUSINESS COST
  // -------------------------

  let totalBusinessCost = 0;

  for (const treePurchase of treePurchases) {
    const expense =
      await getTotalExpenseByTreePurchase(
        treePurchase._id
      );

    totalBusinessCost +=
      treePurchase.purchasePrice + expense;
  }

  // -------------------------
  // COST PER CFT
  // -------------------------

  const costPerCft =
    totalProducedCft > 0
      ? totalBusinessCost / totalProducedCft
      : 0;

  // -------------------------
  // INVENTORY VALUE
  // -------------------------

  const inventoryValue =
    totalAvailableCft * costPerCft;

  return {
    totalProducedCft,
    totalSoldCft,
    totalAvailableCft,

    totalLogs: logs.length,

    totalBusinessCost,
    costPerCft,

    inventoryValue,

    logs,
  };
};


// ==========================================
// GET PROFIT REPORT
// ==========================================

const getProfitReport = async ({
  startDate,
  endDate,
}) => {
  const filter = {};

  // -------------------------
  // DATE FILTER
  // -------------------------

  if (startDate || endDate) {
    filter.saleDate = {};

    if (startDate) {
      filter.saleDate.$gte =
        new Date(`${startDate}T00:00:00.000Z`);
    }

    if (endDate) {
      filter.saleDate.$lte =
        new Date(`${endDate}T23:59:59.999Z`);
    }
  }

  // -------------------------
  // GET SALES
  // -------------------------

  const sales = await Sale.find(filter);

  let totalSales = 0;
  let totalSoldCft = 0;
  let soldWoodCost = 0;

  // -------------------------
  // CALCULATE PROFIT
  // -------------------------

  for (const sale of sales) {
    totalSales += sale.totalAmount;

    for (const item of sale.items) {
      const woodLog =
        await WoodLog.findById(
          item.woodLogId
        );

      if (!woodLog) {
        continue;
      }

      const production =
        await WoodProduction.findById(
          woodLog.woodProductionId
        );

      if (!production) {
        continue;
      }

      const treePurchase =
        await TreePurchase.findById(
          production.treePurchaseId
        );

      if (!treePurchase) {
        continue;
      }

      const totalExpense =
        await getTotalExpenseByTreePurchase(
          treePurchase._id
        );

      const totalCost =
        treePurchase.purchasePrice +
        totalExpense;

      const costPerCft =
        production.totalCft > 0
          ? totalCost /
            production.totalCft
          : 0;

      totalSoldCft +=
        item.quantityCft;

      soldWoodCost +=
        item.quantityCft *
        costPerCft;
    }
  }

  // -------------------------
  // GROSS PROFIT
  // -------------------------

  const grossProfit =
    totalSales - soldWoodCost;

  return {
    startDate: startDate || null,
    endDate: endDate || null,

    totalOrders: sales.length,

    totalSales,
    totalSoldCft,

    soldWoodCost,

    grossProfit,

    sales,
  };
};



// ==========================================
// GET PAYMENT REPORT
// ==========================================

const getPaymentReport = async ({
  startDate,
  endDate,
}) => {
  const filter = {};

  // -------------------------
  // DATE FILTER
  // -------------------------

  if (startDate || endDate) {
    filter.paymentDate = {};

    if (startDate) {
      filter.paymentDate.$gte =
        new Date(`${startDate}T00:00:00.000Z`);
    }

    if (endDate) {
      filter.paymentDate.$lte =
        new Date(`${endDate}T23:59:59.999Z`);
    }
  }

  // -------------------------
  // GET PAYMENTS
  // -------------------------

  const payments = await Payment.find(filter)
    .populate("customerId")
    .populate("saleId")
    .sort({
      paymentDate: -1,
    });

  let totalReceived = 0;

  const paymentByMethod = {
    cash: 0,
    bank: 0,
    bkash: 0,
    nagad: 0,
    rocket: 0,
    other: 0,
  };

  // -------------------------
  // CALCULATE
  // -------------------------

  for (const payment of payments) {
    totalReceived += payment.amount;

    if (
      paymentByMethod[payment.paymentMethod] !==
      undefined
    ) {
      paymentByMethod[payment.paymentMethod] +=
        payment.amount;
    }
  }

  return {
    startDate: startDate || null,
    endDate: endDate || null,

    totalPayments: payments.length,

    totalReceived,

    paymentByMethod,

    payments,
  };
};

module.exports = {
  getSalesReport,
  getExpenseReport,
  getInventoryReport,
  getProfitReport,
  getPaymentReport,
};