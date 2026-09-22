const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    treePurchaseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TreePurchase",
      required: true,
    },

    type: {
      type: String,
      enum: [
        "cutting",
        "transport",
        "loading",
        "unloading",
        "labor",
        "sawmill",
        "other",
      ],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    description: {
      type: String,
      trim: true,
    },

    date: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Expense = mongoose.model("Expense", expenseSchema);

module.exports = Expense;