const mongoose = require("mongoose");

const saleItemSchema = new mongoose.Schema(
  {
    woodLogId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WoodLog",
      required: true,
    },

    quantityCft: {
      type: Number,
      required: true,
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
  },
  {
    _id: false,
  }
);

const saleSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    saleDate: {
      type: Date,
      required: true,
    },

    items: {
      type: [saleItemSchema],
      required: true,
      validate: {
        validator: function (items) {
          return items.length > 0;
        },
        message: "Sale must contain at least one item",
      },
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    paidAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    dueAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    paymentStatus: {
      type: String,
      enum: ["unpaid", "partial", "paid"],
      default: "unpaid",
    },

    deliveryStatus: {
      type: String,
      enum: ["pending", "delivered", "cancelled"],
      default: "pending",
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

const Sale = mongoose.model("Sale", saleSchema);

module.exports = Sale;