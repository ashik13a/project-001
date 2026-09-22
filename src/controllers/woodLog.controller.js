const WoodLog = require("../models/woodLog.model");
const WoodProduction = require("../models/woodProduction.model");

const {
  calculateWoodLogValues,
} = require("../services/woodLog.service");

// ======================================================
// CREATE WOOD LOG
// ======================================================

const createWoodLog = async (req, res) => {
  try {
    const {
      woodProductionId,
      cft,
      girth,
      height,
      pricePerCft,
      notes,
    } = req.body;

    // --------------------------------------------------
    // CHECK PRODUCTION
    // --------------------------------------------------

    const production = await WoodProduction.findById(
      woodProductionId
    );

    if (!production) {
      return res.status(404).json({
        success: false,
        message: "Wood production not found",
      });
    }

    // --------------------------------------------------
    // CALCULATE CFT + TOTAL PRICE
    // --------------------------------------------------

    const {
      cft: finalCft,
      totalPrice,
    } = calculateWoodLogValues({
      cft,
      girth,
      height,
      pricePerCft,
    });

    // --------------------------------------------------
    // CREATE WOOD LOG
    // --------------------------------------------------

    const woodLog = await WoodLog.create({
      woodProductionId,
      girth,
      height,
      cft: finalCft,

      // Initially all CFT is available
      availableCft: finalCft,

      pricePerCft,
      totalPrice,
      notes,
    });

    // --------------------------------------------------
    // UPDATE PRODUCTION SUMMARY
    // --------------------------------------------------

    await WoodProduction.findByIdAndUpdate(
      woodProductionId,
      {
        $inc: {
          totalLogs: 1,
          totalCft: finalCft,
        },
      }
    );

    // --------------------------------------------------
    // RESPONSE
    // --------------------------------------------------

    res.status(201).json({
      success: true,
      message: "Wood log created successfully",
      data: woodLog,
    });
  } catch (error) {
    console.log("Create wood log error:", error);

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================
// GET ALL WOOD LOGS
// ======================================================

const getWoodLogs = async (req, res) => {
  try {
    const logs = await WoodLog.find({})
      .populate("woodProductionId")
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      message: "Wood logs fetched successfully",
      data: logs,
    });
  } catch (error) {
    console.log("Get wood logs error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch wood logs",
      error: error.message,
    });
  }
};

// ======================================================
// GET SINGLE WOOD LOG
// ======================================================

const getWoodLogById = async (req, res) => {
  try {
    const { id } = req.params;

    const log = await WoodLog.findById(id)
      .populate("woodProductionId");

    if (!log) {
      return res.status(404).json({
        success: false,
        message: "Wood log not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Wood log fetched successfully",
      data: log,
    });
  } catch (error) {
    console.log("Get wood log error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch wood log",
      error: error.message,
    });
  }
};

// ======================================================
// UPDATE WOOD LOG
// ======================================================

const updateWoodLog = async (req, res) => {
  try {
    const { id } = req.params;

    // --------------------------------------------------
    // FIND EXISTING LOG
    // --------------------------------------------------

    const existingLog = await WoodLog.findById(id);

    if (!existingLog) {
      return res.status(404).json({
        success: false,
        message: "Wood log not found",
      });
    }

    // --------------------------------------------------
    // EXISTING AVAILABLE CFT
    // --------------------------------------------------

    const existingAvailableCft =
      existingLog.availableCft !== undefined
        ? existingLog.availableCft
        : existingLog.cft;

    // How much CFT has already been sold
    const soldCft =
      existingLog.cft - existingAvailableCft;

    // --------------------------------------------------
    // CHECK WHETHER MEASUREMENT IS CHANGING
    // --------------------------------------------------

    const changingMeasurement =
      req.body.cft !== undefined ||
      req.body.girth !== undefined ||
      req.body.height !== undefined;

    // If some CFT has already been sold,
    // don't allow changing the original CFT.
    if (
      soldCft > 0 &&
      changingMeasurement
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot change CFT or measurement of a wood log after it has been sold",
      });
    }

    // --------------------------------------------------
    // REQUEST DATA
    // --------------------------------------------------

    const {
      cft,
      girth,
      height,
      pricePerCft,
      status,
      notes,
    } = req.body;

    // --------------------------------------------------
    // DEFAULT VALUES
    // --------------------------------------------------

    let finalCft = existingLog.cft;
    let finalGirth = existingLog.girth;
    let finalHeight = existingLog.height;

    // ==================================================
    // OPTION 1: DIRECT CFT
    // ==================================================

    if (cft !== undefined) {
      finalCft = Number(cft);

      if (
        !Number.isFinite(finalCft) ||
        finalCft <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: "CFT must be greater than 0",
        });
      }

      // Direct CFT means no girth/height
      finalGirth = undefined;
      finalHeight = undefined;
    }

    // ==================================================
    // OPTION 2: GIRTH + HEIGHT
    // ==================================================

    else if (
      girth !== undefined ||
      height !== undefined
    ) {
      const newGirth =
        girth !== undefined
          ? Number(girth)
          : existingLog.girth;

      const newHeight =
        height !== undefined
          ? Number(height)
          : existingLog.height;

      if (
        newGirth === undefined ||
        newHeight === undefined
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Both girth and height are required",
        });
      }

      if (
        !Number.isFinite(newGirth) ||
        !Number.isFinite(newHeight) ||
        newGirth <= 0 ||
        newHeight <= 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Girth and height must be greater than 0",
        });
      }

      // FINAL CFT FORMULA
      // (Girth × Girth × Height) / 2304

      finalCft =
        (newGirth * newGirth * newHeight) /
        2304;

      finalGirth = newGirth;
      finalHeight = newHeight;
    }

    // ==================================================
    // PRICE
    // ==================================================

    const finalPricePerCft =
      pricePerCft !== undefined
        ? Number(pricePerCft)
        : existingLog.pricePerCft;

    if (
      !Number.isFinite(finalPricePerCft) ||
      finalPricePerCft < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Price per CFT cannot be negative",
      });
    }

    // --------------------------------------------------
    // TOTAL PRICE
    // --------------------------------------------------

    const totalPrice =
      finalCft * finalPricePerCft;

    // ==================================================
    // CFT DIFFERENCE
    // ==================================================

    const cftDifference =
      finalCft - existingLog.cft;

    // ==================================================
    // PREPARE UPDATE
    // ==================================================

    const updateData = {
      cft: finalCft,
      pricePerCft: finalPricePerCft,
      totalPrice,
    };

    // Update notes if supplied
    if (notes !== undefined) {
      updateData.notes = notes;
    }

    // Update status if supplied
    if (status !== undefined) {
      updateData.status = status;
    }

    // --------------------------------------------------
    // DIRECT CFT MODE
    // Remove old girth and height
    // --------------------------------------------------

    const updateQuery = {
      $set: updateData,
    };

    if (cft !== undefined) {
      updateQuery.$unset = {
        girth: "",
        height: "",
      };
    }

    // --------------------------------------------------
    // GIRTH + HEIGHT MODE
    // --------------------------------------------------

    else if (
      girth !== undefined ||
      height !== undefined
    ) {
      updateData.girth = finalGirth;
      updateData.height = finalHeight;
    }

    // ==================================================
    // AVAILABLE CFT
    // ==================================================

    let finalAvailableCft;

    if (
      existingLog.availableCft !== undefined
    ) {
      finalAvailableCft =
        existingLog.availableCft +
        cftDifference;
    } else {
      finalAvailableCft = finalCft;
    }

    // Available CFT cannot be negative
    if (finalAvailableCft < 0) {
      return res.status(400).json({
        success: false,
        message:
          "Available CFT cannot be negative",
      });
    }

    updateData.availableCft =
      finalAvailableCft;

    // ==================================================
    // AUTO STATUS
    // ==================================================

    if (finalAvailableCft === 0) {
      updateData.status = "sold";
    } else if (
      status === undefined &&
      existingLog.status === "sold"
    ) {
      updateData.status = "available";
    }

    // ==================================================
    // UPDATE WOOD LOG
    // ==================================================

    const updatedLog =
      await WoodLog.findByIdAndUpdate(
        id,
        updateQuery,
        {
          new: true,
          runValidators: true,
        }
      );

    // ==================================================
    // UPDATE PRODUCTION TOTAL CFT
    // ==================================================

    if (cftDifference !== 0) {
      await WoodProduction.findByIdAndUpdate(
        existingLog.woodProductionId,
        {
          $inc: {
            totalCft: cftDifference,
          },
        }
      );
    }

    // ==================================================
    // RESPONSE
    // ==================================================

    res.status(200).json({
      success: true,
      message: "Wood log updated successfully",
      data: updatedLog,
    });
  } catch (error) {
    console.log("Update wood log error:", error);

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================
// DELETE WOOD LOG
// ======================================================

const deleteWoodLog = async (req, res) => {
  try {
    const { id } = req.params;

    // --------------------------------------------------
    // FIND EXISTING LOG
    // --------------------------------------------------

    const existingLog =
      await WoodLog.findById(id);

    if (!existingLog) {
      return res.status(404).json({
        success: false,
        message: "Wood log not found",
      });
    }

    // --------------------------------------------------
    // CHECK AVAILABLE CFT
    // --------------------------------------------------

    const availableCft =
      existingLog.availableCft !== undefined
        ? existingLog.availableCft
        : existingLog.cft;

    // If any CFT has been sold,
    // don't allow deleting the log.
    if (
      availableCft !== existingLog.cft
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete a partially sold wood log",
      });
    }

    // --------------------------------------------------
    // DELETE WOOD LOG
    // --------------------------------------------------

    await WoodLog.findByIdAndDelete(id);

    // --------------------------------------------------
    // UPDATE PRODUCTION SUMMARY
    // --------------------------------------------------

    await WoodProduction.findByIdAndUpdate(
      existingLog.woodProductionId,
      {
        $inc: {
          totalLogs: -1,
          totalCft: -existingLog.cft,
        },
      }
    );

    // --------------------------------------------------
    // RESPONSE
    // --------------------------------------------------

    res.status(200).json({
      success: true,
      message: "Wood log deleted successfully",
      data: {
        deletedLogId: id,
        deletedCft: existingLog.cft,
      },
    });
  } catch (error) {
    console.log("Delete wood log error:", error);

    res.status(500).json({
      success: false,
      message:
        "Failed to delete wood log",
      error: error.message,
    });
  }
};

// ======================================================
// GET AVAILABLE INVENTORY
// ======================================================

const getAvailableInventory = async (req, res) => {
  try {
    const logs = await WoodLog.find({
      availableCft: { $gt: 0 },
    })
      .populate({
        path: "woodProductionId",
        populate: {
          path: "treePurchaseId",
        },
      })
      .sort({
        createdAt: 1,
      });

    let totalAvailableCft = 0;

    for (const log of logs) {
      totalAvailableCft +=
        log.availableCft;
    }

    res.status(200).json({
      success: true,
      message:
        "Available inventory fetched successfully",

      data: {
        totalAvailableCft,
        totalLogs: logs.length,
        logs,
      },
    });
  } catch (error) {
    console.log(
      "Get available inventory error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to fetch available inventory",
      error: error.message,
    });
  }
};

// ======================================================
// EXPORTS
// ======================================================

module.exports = {
  createWoodLog,
  getWoodLogs,
  getWoodLogById,
  updateWoodLog,
  deleteWoodLog,
  getAvailableInventory,
};