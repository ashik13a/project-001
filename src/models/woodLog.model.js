const mongoose = require("mongoose");

const woodLogSchema = new mongoose.Schema(
  {
    woodProductionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WoodProduction",
      required: true,
    },

    // Tree circumference / girth in inches
    girth: {
      type: Number,
      min: 0,
    },

    // Log height/length in feet
    height: {
      type: Number,
      min: 0,
    },

    // Final calculated or directly provided CFT
    cft: {
      type: Number,
      min: 0,
    },
    availableCft: {
      type: Number,
      min: 0,
    },

    pricePerCft: {
      type: Number,
      required: true,
      min: 0,
    },

    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: ["available", "sold", "reserved"],
      default: "available",
    },

    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true },
);

const WoodLog = mongoose.model("WoodLog", woodLogSchema);

module.exports = WoodLog;
