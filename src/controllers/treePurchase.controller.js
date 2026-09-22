const TreePurchase = require("../models/treePurchase.model");
const {
  getTotalExpenseByTreePurchase,
} = require("../services/expense.service");

const createTreePurchase = async (req, res) => {
  try {
    const treePurchase = await TreePurchase.create(req.body);

    res.status(201).json({
      success: true,
      message: "Tree purchase created successfully",
      data: treePurchase,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create tree purchase",
      error: error.message,
    });
  }
};

const getTreePurchases = async (req, res) => {
  try {
    const treePurchases = await TreePurchase.find().sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      message: "Tree purchases fetched successfully",
      data: treePurchases,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch tree purchases",
      error: error.message,
    });
  }
};

const getTreePurchaseById = async (req, res) => {
  try {
    const { id } = req.params;

    const treePurchase = await TreePurchase.findById(id);

    if (!treePurchase) {
      return res.status(404).json({
        success: false,
        message: "Tree purchase not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Tree purchase fetched successfully",
      data: treePurchase,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch tree purchase",
      error: error.message,
    });
  }
};


const updateTreePurchase = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedTreePurchase = await TreePurchase.findByIdAndUpdate(
      id,
      { $set: req.body },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedTreePurchase) {
      return res.status(404).json({
        success: false,
        message: "Tree purchase not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Tree purchase updated successfully",
      data: updatedTreePurchase,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update tree purchase",
      error: error.message,
    });
  }
};


const deleteTreePurchase = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedTreePurchase =
      await TreePurchase.findByIdAndDelete(id);

    if (!deletedTreePurchase) {
      return res.status(404).json({
        success: false,
        message: "Tree purchase not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Tree purchase deleted successfully",
      data: deletedTreePurchase,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete tree purchase",
      error: error.message,
    });
  }
};


const getTreePurchaseCost = async (req, res) => {
  try {
    const { id } = req.params;

    const treePurchase = await TreePurchase.findById(id);

    if (!treePurchase) {
      return res.status(404).json({
        success: false,
        message: "Tree purchase not found",
      });
    }

    const totalExpense =
      await getTotalExpenseByTreePurchase(id);

    const totalCost =
      treePurchase.purchasePrice + totalExpense;

    res.status(200).json({
      success: true,
      message: "Tree purchase cost calculated successfully",
      data: {
        treePurchaseId: treePurchase._id,
        treeName: treePurchase.treeName,
        purchasePrice: treePurchase.purchasePrice,
        totalExpense,
        totalCost,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to calculate tree purchase cost",
      error: error.message,
    });
  }
};

module.exports = {
  createTreePurchase,
  getTreePurchases,
  getTreePurchaseById,
  updateTreePurchase,
  deleteTreePurchase,
  getTreePurchaseCost,
};