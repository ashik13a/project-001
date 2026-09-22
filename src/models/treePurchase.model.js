const mongoose = require("mongoose");

const treePurchaseSchema = new mongoose.Schema(
  {
    treeName: {
      type: String,
      required: true,
      trim: true,
    },

    sellerName: {
      type: String,
      required: true,
      trim: true,
    },

    sellerPhone: {
      type: String,
      required: true,
      trim: true,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    purchasePrice: {
      type: Number,
      required: true,
      min: 0,
    },

    purchaseDate: {
      type: Date,
      required: true,
    },

    images: {
      type: [String],
      default: [],
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

const TreePurchase = mongoose.model(
  "TreePurchase",
  treePurchaseSchema
);

module.exports = TreePurchase;