const mongoose = require("mongoose");

const woodProductionSchema = new mongoose.Schema(
  {
    treePurchaseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TreePurchase",
      required: true,
    },

    productionDate: {
      type: Date,
      required: true,
    },

    totalLogs: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalCft: {
      type: Number,
      default: 0,
      min: 0,
    },

    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const WoodProduction = mongoose.model(
  "WoodProduction",
  woodProductionSchema
);

module.exports = WoodProduction;