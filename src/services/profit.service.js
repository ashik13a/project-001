const TreePurchase = require("../models/treePurchase.model");
const WoodProduction = require("../models/woodProduction.model");
const WoodLog = require("../models/woodLog.model");
const Sale = require("../models/sale.model");
const {
  getTotalExpenseByTreePurchase,
} = require("./expense.service");


// ======================================================
// GET PROFIT BY TREE PURCHASE
// ======================================================

const getProfitByTreePurchase = async (treePurchaseId) => {

  // ==================================================
  // FIND TREE PURCHASE
  // ==================================================

  const treePurchase =
    await TreePurchase.findById(treePurchaseId);

  if (!treePurchase) {
    throw new Error("Tree purchase not found");
  }


  // ==================================================
  // GET TOTAL EXPENSE
  // ==================================================

  const totalExpense =
    await getTotalExpenseByTreePurchase(
      treePurchaseId
    );


  // ==================================================
  // TOTAL COST
  // ==================================================

  const totalCost =
    treePurchase.purchasePrice +
    totalExpense;


  // ==================================================
  // FIND WOOD PRODUCTION
  // ==================================================

  const production =
    await WoodProduction.findOne({
      treePurchaseId,
    });

  if (!production) {
    throw new Error(
      "Wood production not found"
    );
  }


  // ==================================================
  // TOTAL PRODUCED CFT
  // ==================================================

  const totalProducedCft =
    production.totalCft;


  if (totalProducedCft <= 0) {
    throw new Error(
      "Total produced CFT must be greater than 0"
    );
  }


  // ==================================================
  // COST PER CFT
  // ==================================================

  const costPerCft =
    totalCost / totalProducedCft;


  // ==================================================
  // GET ALL SALES
  // ==================================================

  const sales =
    await Sale.find({
      "items.woodLogId": {
        $in: await WoodLog.find({
          woodProductionId: production._id,
        }).distinct("_id"),
      },
    });


  // ==================================================
  // CALCULATE SOLD CFT & REVENUE
  // ==================================================

  let soldCft = 0;
  let salesRevenue = 0;


  for (const sale of sales) {

    for (const item of sale.items) {

      const woodLog =
        await WoodLog.findById(
          item.woodLogId
        );

      if (!woodLog) {
        continue;
      }


      if (
        woodLog.woodProductionId.toString() !==
        production._id.toString()
      ) {
        continue;
      }


      soldCft += item.quantityCft;

      salesRevenue += item.totalPrice;
    }
  }


  // ==================================================
  // SOLD WOOD COST
  // ==================================================

  const soldWoodCost =
    soldCft * costPerCft;


  // ==================================================
  // GROSS PROFIT
  // ==================================================

  const grossProfit =
    salesRevenue - soldWoodCost;


  // ==================================================
  // REMAINING INVENTORY
  // ==================================================

  const remainingCft =
    totalProducedCft - soldCft;


  const remainingInventoryValue =
    remainingCft * costPerCft;


  // ==================================================
  // RETURN RESULT
  // ==================================================

  return {
    treePurchaseId: treePurchase._id,
    treeName: treePurchase.treeName,

    purchasePrice:
      treePurchase.purchasePrice,

    totalExpense,

    totalCost,

    totalProducedCft,

    costPerCft,

    soldCft,

    remainingCft,

    salesRevenue,

    soldWoodCost,

    grossProfit,

    remainingInventoryValue,
  };
};


// ======================================================
// GET PROFIT BY SALE
// ======================================================

const getProfitBySale = async (saleId) => {
  // ==================================================
  // FIND SALE
  // ==================================================

  const sale = await Sale.findById(saleId);

  if (!sale) {
    throw new Error("Sale not found");
  }

  // ==================================================
  // VARIABLES
  // ==================================================

  let soldCft = 0;
  let soldWoodCost = 0;

  // ==================================================
  // PROCESS SALE ITEMS
  // ==================================================

  for (const item of sale.items) {
    const woodLog = await WoodLog.findById(
      item.woodLogId
    );

    if (!woodLog) {
      continue;
    }

    // Find production
    const production =
      await WoodProduction.findById(
        woodLog.woodProductionId
      );

    if (!production) {
      continue;
    }

    // Find tree purchase
    const treePurchase =
      await TreePurchase.findById(
        production.treePurchaseId
      );

    if (!treePurchase) {
      continue;
    }

    // Get total expenses
    const totalExpense =
      await getTotalExpenseByTreePurchase(
        treePurchase._id
      );

    // Total production cost
    const totalCost =
      treePurchase.purchasePrice +
      totalExpense;

    // Cost per CFT
    const costPerCft =
      totalCost / production.totalCft;

    // Sold CFT
    soldCft += item.quantityCft;

    // Cost of sold wood
    soldWoodCost +=
      item.quantityCft * costPerCft;
  }

  // ==================================================
  // SALES REVENUE
  // ==================================================

  const salesRevenue =
    sale.totalAmount;

  // ==================================================
  // GROSS PROFIT
  // ==================================================

  const grossProfit =
    salesRevenue - soldWoodCost;

  // ==================================================
  // RETURN RESULT
  // ==================================================

  return {
    saleId: sale._id,
    customerId: sale.customerId,

    soldCft,

    salesRevenue,

    soldWoodCost,

    grossProfit,
  };
};


// GET OVERALL BUSINESS SUMMARY
const getBusinessSummary = async () => {
  const treePurchases = await TreePurchase.find({});

  const productions = await WoodProduction.find({});

  const sales = await Sale.find({});

  // -------------------------
  // TOTAL TREE PURCHASE COST
  // -------------------------

  let totalPurchasePrice = 0;
  let totalExpense = 0;

  for (const treePurchase of treePurchases) {
    totalPurchasePrice += treePurchase.purchasePrice;

    const expense =
      await getTotalExpenseByTreePurchase(
        treePurchase._id
      );

    totalExpense += expense;
  }

  const totalBusinessCost =
    totalPurchasePrice + totalExpense;

  // -------------------------
  // PRODUCTION
  // -------------------------

  let totalProducedCft = 0;

  for (const production of productions) {
    totalProducedCft += production.totalCft;
  }

  // -------------------------
  // SALES
  // -------------------------

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

  // -------------------------
  // COST PER CFT
  // -------------------------

  let costPerCft = 0;

  if (totalProducedCft > 0) {
    costPerCft =
      totalBusinessCost / totalProducedCft;
  }

  // -------------------------
  // SOLD WOOD COST
  // -------------------------

  const soldWoodCost =
    totalSoldCft * costPerCft;

  // -------------------------
  // GROSS PROFIT
  // -------------------------

  const grossProfit =
    totalSales - soldWoodCost;

  // -------------------------
  // REMAINING INVENTORY
  // -------------------------

  const availableCft =
    totalProducedCft - totalSoldCft;

  const inventoryValue =
    availableCft * costPerCft;

  return {
    totalPurchasePrice,
    totalExpense,
    totalBusinessCost,

    totalProducedCft,
    totalSoldCft,
    availableCft,

    costPerCft,

    totalSales,
    totalPaid,
    totalDue,

    soldWoodCost,
    grossProfit,

    inventoryValue,
  };
};


// GET ALL TREE PURCHASE FINANCIAL SUMMARIES
const getAllTreePurchaseSummaries = async () => {
  const treePurchases = await TreePurchase.find({})
    .sort({ purchaseDate: -1 });

  const summaries = [];

  for (const treePurchase of treePurchases) {
    const totalExpense =
      await getTotalExpenseByTreePurchase(
        treePurchase._id
      );

    const totalCost =
      treePurchase.purchasePrice +
      totalExpense;

    const production =
      await WoodProduction.findOne({
        treePurchaseId: treePurchase._id,
      });

    if (!production) {
      summaries.push({
        treePurchaseId: treePurchase._id,
        treeName: treePurchase.treeName,
        purchasePrice: treePurchase.purchasePrice,
        totalExpense,
        totalCost,
        totalProducedCft: 0,
        soldCft: 0,
        remainingCft: 0,
        salesRevenue: 0,
        soldWoodCost: 0,
        grossProfit: 0,
        remainingInventoryValue: 0,
      });

      continue;
    }

    const woodLogIds =
      await WoodLog.find({
        woodProductionId: production._id,
      }).distinct("_id");

    const sales = await Sale.find({
      "items.woodLogId": {
        $in: woodLogIds,
      },
    });

    let soldCft = 0;
    let salesRevenue = 0;

    for (const sale of sales) {
      for (const item of sale.items) {
        if (
          woodLogIds.some(
            (id) =>
              id.toString() ===
              item.woodLogId.toString()
          )
        ) {
          soldCft += item.quantityCft;
          salesRevenue += item.totalPrice;
        }
      }
    }

    const totalProducedCft =
      production.totalCft;

    const costPerCft =
      totalProducedCft > 0
        ? totalCost / totalProducedCft
        : 0;

    const soldWoodCost =
      soldCft * costPerCft;

    const grossProfit =
      salesRevenue - soldWoodCost;

    const remainingCft =
      totalProducedCft - soldCft;

    const remainingInventoryValue =
      remainingCft * costPerCft;

    summaries.push({
      treePurchaseId: treePurchase._id,
      treeName: treePurchase.treeName,
      sellerName: treePurchase.sellerName,
      location: treePurchase.location,

      purchasePrice:
        treePurchase.purchasePrice,

      totalExpense,

      totalCost,

      totalProducedCft,

      soldCft,

      remainingCft,

      costPerCft,

      salesRevenue,

      soldWoodCost,

      grossProfit,

      remainingInventoryValue,
    });
  }

  return summaries;
};


// ==========================================
// GET DASHBOARD SUMMARY
// ==========================================

const getDashboardSummary = async () => {
  const TreePurchase = require("../models/treePurchase.model");
  const WoodProduction = require("../models/woodProduction.model");
  const WoodLog = require("../models/woodLog.model");
  const Sale = require("../models/sale.model");
  const Customer = require("../models/customer.model");
  const Payment = require("../models/payment.model");

  const [
    treePurchases,
    productions,
    logs,
    sales,
    customers,
    payments,
  ] = await Promise.all([
    TreePurchase.find({}),
    WoodProduction.find({}),
    WoodLog.find({}),
    Sale.find({}),
    Customer.find({}),
    Payment.find({}),
  ]);

  // -------------------------
  // PURCHASE
  // -------------------------

  let totalPurchasePrice = 0;

  for (const purchase of treePurchases) {
    totalPurchasePrice += purchase.purchasePrice;
  }

  // -------------------------
  // EXPENSE
  // -------------------------

  let totalExpense = 0;

  for (const purchase of treePurchases) {
    totalExpense +=
      await getTotalExpenseByTreePurchase(
        purchase._id
      );
  }

  const totalBusinessCost =
    totalPurchasePrice + totalExpense;

  // -------------------------
  // PRODUCTION
  // -------------------------

  let totalProducedCft = 0;

  for (const production of productions) {
    totalProducedCft += production.totalCft;
  }

  // -------------------------
  // INVENTORY
  // -------------------------

  let availableCft = 0;

  for (const log of logs) {
    if (
      log.availableCft !== undefined
    ) {
      availableCft += log.availableCft;
    }
  }

  const totalSoldCft =
    totalProducedCft - availableCft;

  const costPerCft =
    totalProducedCft > 0
      ? totalBusinessCost /
        totalProducedCft
      : 0;

  const inventoryValue =
    availableCft * costPerCft;

  // -------------------------
  // SALES
  // -------------------------

  let totalSales = 0;
  let totalPaid = 0;
  let totalDue = 0;

  for (const sale of sales) {
    totalSales += sale.totalAmount;
    totalPaid += sale.paidAmount;
    totalDue += sale.dueAmount;
  }

  // -------------------------
  // SOLD WOOD COST
  // -------------------------

  let soldWoodCost = 0;

  for (const sale of sales) {
    for (const item of sale.items) {
      const woodLog =
        await WoodLog.findById(
          item.woodLogId
        );

      if (!woodLog) continue;

      const production =
        await WoodProduction.findById(
          woodLog.woodProductionId
        );

      if (!production) continue;

      const treePurchase =
        await TreePurchase.findById(
          production.treePurchaseId
        );

      if (!treePurchase) continue;

      const expense =
        await getTotalExpenseByTreePurchase(
          treePurchase._id
        );

      const treeCost =
        treePurchase.purchasePrice +
        expense;

      const logCostPerCft =
        production.totalCft > 0
          ? treeCost /
            production.totalCft
          : 0;

      soldWoodCost +=
        item.quantityCft *
        logCostPerCft;
    }
  }

  const grossProfit =
    totalSales - soldWoodCost;

  // -------------------------
  // CUSTOMERS
  // -------------------------

  let customersWithDue = 0;

  for (const customer of customers) {
    const customerSales =
      await Sale.find({
        customerId: customer._id,
        dueAmount: { $gt: 0 },
      });

    if (customerSales.length > 0) {
      customersWithDue++;
    }
  }

  // -------------------------
  // RESULT
  // -------------------------

  return {
    purchases: {
      totalTreePurchases:
        treePurchases.length,

      totalPurchasePrice,
      totalExpense,
      totalBusinessCost,
    },

    inventory: {
      totalProductions:
        productions.length,

      totalLogs: logs.length,

      totalProducedCft,
      totalSoldCft,
      availableCft,

      costPerCft,
      inventoryValue,
    },

    sales: {
      totalOrders: sales.length,

      totalSales,
      totalPaid,
      totalDue,

      soldWoodCost,
      grossProfit,
    },

    customers: {
      totalCustomers:
        customers.length,

      customersWithDue,
    },

    payments: {
      totalPayments:
        payments.length,

      totalReceived: totalPaid,
    },
  };
};



module.exports = {
  getProfitByTreePurchase,
  getProfitBySale,
  getBusinessSummary,
  getAllTreePurchaseSummaries,
  getDashboardSummary,
};