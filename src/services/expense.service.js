const Expense = require("../models/expense.model");

const getTotalExpenseByTreePurchase = async (treePurchaseId) => {
  const result = await Expense.aggregate([
    {
      $match: {
        treePurchaseId: new Expense.base.Types.ObjectId(treePurchaseId),
      },
    },
    {
      $group: {
        _id: null,
        totalExpense: {
          $sum: "$amount",
        },
      },
    },
  ]);

  return result.length > 0 ? result[0].totalExpense : 0;
};

module.exports = {
  getTotalExpenseByTreePurchase,
};