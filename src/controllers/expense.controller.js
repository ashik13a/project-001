const Expense = require("../models/expense.model");
const TreePurchase = require("../models/treePurchase.model");

const createExpense = async (req, res) => {
  try {
    const {
      treePurchaseId,
      type,
      amount,
      description,
      date,
    } = req.body;

    // Check whether tree purchase exists
    const treePurchase = await TreePurchase.findById(treePurchaseId);

    if (!treePurchase) {
      return res.status(404).json({
        success: false,
        message: "Tree purchase not found",
      });
    }

    const expense = await Expense.create({
      treePurchaseId,
      type,
      amount,
      description,
      date,
    });

    res.status(201).json({
      success: true,
      message: "Expense created successfully",
      data: expense,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create expense",
      error: error.message,
    });
  }
};


const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find()
      .populate("treePurchaseId")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Expenses fetched successfully",
      data: expenses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch expenses",
      error: error.message,
    });
  }
};


const getExpensesByTreePurchase = async (req, res) => {
  try {
    const { treePurchaseId } = req.params;

    const expenses = await Expense.find({
      treePurchaseId,
    }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      message: "Tree purchase expenses fetched successfully",
      data: expenses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch tree purchase expenses",
      error: error.message,
    });
  }
};


const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedExpense = await Expense.findByIdAndUpdate(
      id,
      { $set: req.body },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedExpense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Expense updated successfully",
      data: updatedExpense,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update expense",
      error: error.message,
    });
  }
};


const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedExpense = await Expense.findByIdAndDelete(id);

    if (!deletedExpense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Expense deleted successfully",
      data: deletedExpense,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete expense",
      error: error.message,
    });
  }
};

module.exports = {
  createExpense,
  getExpenses,
  getExpensesByTreePurchase,
  updateExpense,
  deleteExpense,
};