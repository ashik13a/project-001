const WoodProduction = require("../models/woodProduction.model");
const TreePurchase = require("../models/treePurchase.model");
const WoodLog = require("../models/woodLog.model");

// =====================================================
// CREATE WOOD PRODUCTION
// =====================================================

const createWoodProduction = async (req, res) => {
  try {
    const {
      treePurchaseId,
      productionDate,
      notes,
    } = req.body;

    // -----------------------------------------
    // VALIDATION
    // -----------------------------------------

    if (!treePurchaseId) {
      return res.status(400).json({
        success: false,
        message: "Tree purchase is required",
      });
    }

    if (!productionDate) {
      return res.status(400).json({
        success: false,
        message: "Production date is required",
      });
    }

    // -----------------------------------------
    // CHECK TREE PURCHASE
    // -----------------------------------------

    const treePurchase = await TreePurchase.findById(
      treePurchaseId
    );

    if (!treePurchase) {
      return res.status(404).json({
        success: false,
        message: "Tree purchase not found",
      });
    }

    // -----------------------------------------
    // CREATE PRODUCTION
    // -----------------------------------------
    // Initially:
    // totalLogs = 0
    // totalCft = 0
    //
    // These values will be updated automatically
    // when WoodLogs are added.

    const production = await WoodProduction.create({
      treePurchaseId,
      productionDate,
      totalLogs: 0,
      totalCft: 0,
      notes,
    });

    // -----------------------------------------
    // RESPONSE
    // -----------------------------------------

    res.status(201).json({
      success: true,
      message: "Wood production created successfully",
      data: production,
    });
  } catch (error) {
    console.log(
      "Create production error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to create wood production",
      error: error.message,
    });
  }
};

// =====================================================
// GET ALL WOOD PRODUCTIONS
// =====================================================

const getWoodProductions = async (req, res) => {
  try {
    const productions = await WoodProduction.find({})
      .populate(
        "treePurchaseId",
        "treeName sellerName sellerPhone location quantity purchasePrice purchaseDate"
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Wood productions fetched successfully",
      data: productions,
    });
  } catch (error) {
    console.log(
      "Get productions error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch wood productions",
      error: error.message,
    });
  }
};

// =====================================================
// GET SINGLE WOOD PRODUCTION
// =====================================================

const getWoodProductionById = async (req, res) => {
  try {
    const { id } = req.params;

    const production = await WoodProduction.findById(
      id
    ).populate("treePurchaseId");

    if (!production) {
      return res.status(404).json({
        success: false,
        message: "Wood production not found",
      });
    }

    // Get all logs belonging to this production
    const logs = await WoodLog.find({
      woodProductionId: id,
    }).sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      message: "Wood production fetched successfully",
      data: {
        production,
        logs,
      },
    });
  } catch (error) {
    console.log(
      "Get production by ID error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch wood production",
      error: error.message,
    });
  }
};

// =====================================================
// UPDATE WOOD PRODUCTION
// =====================================================

const updateWoodProduction = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      treePurchaseId,
      productionDate,
      notes,
    } = req.body;

    // -----------------------------------------
    // FIND PRODUCTION
    // -----------------------------------------

    const production =
      await WoodProduction.findById(id);

    if (!production) {
      return res.status(404).json({
        success: false,
        message: "Wood production not found",
      });
    }

    // -----------------------------------------
    // UPDATE TREE PURCHASE
    // -----------------------------------------

    if (treePurchaseId !== undefined) {
      const treePurchase =
        await TreePurchase.findById(
          treePurchaseId
        );

      if (!treePurchase) {
        return res.status(404).json({
          success: false,
          message: "Tree purchase not found",
        });
      }

      production.treePurchaseId =
        treePurchaseId;
    }

    // -----------------------------------------
    // UPDATE PRODUCTION DATE
    // -----------------------------------------

    if (productionDate !== undefined) {
      production.productionDate =
        productionDate;
    }

    // -----------------------------------------
    // UPDATE NOTES
    // -----------------------------------------

    if (notes !== undefined) {
      production.notes = notes;
    }

    // -----------------------------------------
    // SAVE
    // -----------------------------------------

    await production.save();

    res.status(200).json({
      success: true,
      message: "Wood production updated successfully",
      data: production,
    });
  } catch (error) {
    console.log(
      "Update production error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to update wood production",
      error: error.message,
    });
  }
};

// =====================================================
// DELETE WOOD PRODUCTION
// =====================================================

const deleteWoodProduction = async (req, res) => {
  try {
    const { id } = req.params;

    console.log(
      "Delete production ID:",
      id
    );

    // -----------------------------------------
    // FIND PRODUCTION
    // -----------------------------------------

    const production =
      await WoodProduction.findById(id);

    if (!production) {
      return res.status(404).json({
        success: false,
        message: "Wood production not found",
      });
    }

    // -----------------------------------------
    // CHECK ASSOCIATED WOOD LOGS
    // -----------------------------------------

    const logs = await WoodLog.find({
      woodProductionId: id,
    });

    if (logs.length > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete production because wood logs are associated with it",
      });
    }

    // -----------------------------------------
    // DELETE PRODUCTION
    // -----------------------------------------

    await WoodProduction.findByIdAndDelete(
      id
    );

    // -----------------------------------------
    // RESPONSE
    // -----------------------------------------

    res.status(200).json({
      success: true,
      message: "Wood production deleted successfully",
    });
  } catch (error) {
    console.log(
      "Delete production error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to delete wood production",
      error: error.message,
    });
  }
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  createWoodProduction,
  getWoodProductions,
  getWoodProductionById,
  updateWoodProduction,
  deleteWoodProduction,
};