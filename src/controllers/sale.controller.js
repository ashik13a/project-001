const Sale = require("../models/sale.model");
const Customer = require("../models/customer.model");
const WoodLog = require("../models/woodLog.model");
const Payment = require("../models/payment.model");

// ======================================================
// CREATE SALE
// ======================================================

const createSale = async (req, res) => {
  const session = await Sale.startSession();

  try {
    session.startTransaction();

    const {
      customerId,
      saleDate,
      items,
      paidAmount = 0,
      deliveryStatus,
      notes,
    } = req.body;

    // -------------------------
    // CUSTOMER CHECK
    // -------------------------

    const customer = await Customer.findById(
      customerId
    ).session(session);

    if (!customer) {
      throw new Error("Customer not found");
    }

    // -------------------------
    // ITEMS CHECK
    // -------------------------

    if (!Array.isArray(items) || items.length === 0) {
      throw new Error(
        "Sale must contain at least one item"
      );
    }

    // ======================================================
    // GROUP REQUESTED CFT BY WOOD LOG
    // ======================================================

    const requestedByLog = {};

    for (const item of items) {
      const {
        woodLogId,
        quantityCft,
        pricePerCft,
      } = item;

      if (!woodLogId) {
        throw new Error("Wood log is required");
      }

      if (
        quantityCft === undefined ||
        Number(quantityCft) <= 0
      ) {
        throw new Error(
          "Quantity CFT must be greater than 0"
        );
      }

      if (
        pricePerCft === undefined ||
        Number(pricePerCft) < 0
      ) {
        throw new Error(
          "Price per CFT must be provided and cannot be negative"
        );
      }

      const quantity = Number(quantityCft);

      if (!requestedByLog[woodLogId]) {
        requestedByLog[woodLogId] = 0;
      }

      requestedByLog[woodLogId] += quantity;
    }

    // ======================================================
    // CHECK TOTAL REQUESTED CFT AGAINST INVENTORY
    // ======================================================

    for (const woodLogId of Object.keys(requestedByLog)) {
      const woodLog = await WoodLog.findById(
        woodLogId
      ).session(session);

      if (!woodLog) {
        throw new Error(
          `Wood log not found: ${woodLogId}`
        );
      }

      if (woodLog.availableCft === undefined) {
        throw new Error(
          "Inventory is not initialized for this wood log"
        );
      }

      const requestedCft =
        requestedByLog[woodLogId];

      const availableCft =
        Number(woodLog.availableCft);

      if (requestedCft > availableCft) {
        throw new Error(
          `Not enough CFT available for wood log ${woodLogId}. Available: ${availableCft.toFixed(
            2
          )}, Requested: ${requestedCft.toFixed(2)}`
        );
      }
    }

    // ======================================================
    // PREPARE SALE ITEMS
    // ======================================================

    const saleItems = [];
    let totalAmount = 0;

    for (const item of items) {
      const {
        woodLogId,
        quantityCft,
        pricePerCft,
      } = item;

      const requestedCft =
        Number(quantityCft);

      const finalPricePerCft =
        Number(pricePerCft);

      const itemTotal =
        requestedCft * finalPricePerCft;

      saleItems.push({
        woodLogId,
        quantityCft: requestedCft,
        pricePerCft: finalPricePerCft,
        totalPrice: itemTotal,
      });

      totalAmount += itemTotal;
    }

    // ======================================================
    // PAYMENT CHECK
    // ======================================================

    const finalPaidAmount =
      Number(paidAmount);

    if (finalPaidAmount < 0) {
      throw new Error(
        "Paid amount cannot be negative"
      );
    }

    if (finalPaidAmount > totalAmount) {
      throw new Error(
        "Paid amount cannot be greater than total amount"
      );
    }

    const dueAmount =
      totalAmount - finalPaidAmount;

    let paymentStatus = "unpaid";

    if (finalPaidAmount === 0) {
      paymentStatus = "unpaid";
    } else if (finalPaidAmount < totalAmount) {
      paymentStatus = "partial";
    } else {
      paymentStatus = "paid";
    }

    // ======================================================
    // CREATE SALE
    // ======================================================

    const sale = new Sale({
      customerId,
      saleDate,
      items: saleItems,
      totalAmount,
      paidAmount: finalPaidAmount,
      dueAmount,
      paymentStatus,
      deliveryStatus:
        deliveryStatus || "pending",
      notes,
    });

    await sale.save({ session });

    // ======================================================
    // UPDATE INVENTORY
    // ======================================================

    for (const woodLogId of Object.keys(
      requestedByLog
    )) {
      const woodLog =
        await WoodLog.findById(
          woodLogId
        ).session(session);

      const requestedCft =
        requestedByLog[woodLogId];

      const newAvailableCft =
        Number(woodLog.availableCft) -
        requestedCft;

      if (newAvailableCft < 0) {
        throw new Error(
          `Available CFT cannot be negative for wood log ${woodLogId}`
        );
      }

      woodLog.availableCft =
        newAvailableCft;

      if (newAvailableCft === 0) {
        woodLog.status = "sold";
      } else {
        woodLog.status = "available";
      }

      await woodLog.save({ session });
    }

    // ======================================================
    // CREATE INITIAL PAYMENT
    // ======================================================

    if (finalPaidAmount > 0) {
      await Payment.create(
        [
          {
            saleId: sale._id,
            customerId: sale.customerId,
            amount: finalPaidAmount,
            paymentDate: saleDate,
            paymentMethod: "cash",
            notes: "Initial payment",
          },
        ],
        { session }
      );
    }

    // ======================================================
    // COMMIT
    // ======================================================

    await session.commitTransaction();

    res.status(201).json({
      success: true,
      message: "Sale created successfully",
      data: sale,
    });
  } catch (error) {
    await session.abortTransaction();

    res.status(400).json({
      success: false,
      message: "Failed to create sale",
      error: error.message,
    });
  } finally {
    await session.endSession();
  }
};

// ======================================================
// GET ALL SALES
// ======================================================

const getSales = async (req, res) => {
  try {
    const sales = await Sale.find({})
      .populate("customerId")
      .populate("items.woodLogId")
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      success: true,
      message: "Sales fetched successfully",
      data: sales,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch sales",
      error: error.message,
    });
  }
};

// ======================================================
// GET SINGLE SALE
// ======================================================

const getSaleById = async (req, res) => {
  try {
    const { id } = req.params;

    const sale = await Sale.findById(id)
      .populate("customerId")
      .populate("items.woodLogId");

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: "Sale not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Sale fetched successfully",
      data: sale,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch sale",
      error: error.message,
    });
  }
};

// ======================================================
// UPDATE SALE
// ======================================================

const updateSale = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      deliveryStatus,
      notes,
    } = req.body;

    const sale =
      await Sale.findById(id);

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: "Sale not found",
      });
    }

    // Only delivery status and notes
    // are allowed to update

    if (deliveryStatus !== undefined) {
      sale.deliveryStatus =
        deliveryStatus;
    }

    if (notes !== undefined) {
      sale.notes = notes;
    }

    await sale.save();

    res.status(200).json({
      success: true,
      message: "Sale updated successfully",
      data: sale,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to update sale",
      error: error.message,
    });
  }
};

// ======================================================
// DELETE SALE
// ======================================================

const deleteSale = async (req, res) => {
  const session = await Sale.startSession();

  try {
    session.startTransaction();

    const { id } = req.params;

    // -------------------------
    // FIND SALE
    // -------------------------

    const sale =
      await Sale.findById(id)
        .session(session);

    if (!sale) {
      throw new Error("Sale not found");
    }

    // -------------------------
    // RESTORE INVENTORY
    // -------------------------

    // Group restored CFT by log
    const restoredByLog = {};

    for (const item of sale.items) {
      const woodLogId =
        item.woodLogId.toString();

      if (!restoredByLog[woodLogId]) {
        restoredByLog[woodLogId] = 0;
      }

      restoredByLog[woodLogId] +=
        Number(item.quantityCft);
    }

    for (const woodLogId of Object.keys(
      restoredByLog
    )) {
      const woodLog =
        await WoodLog.findById(
          woodLogId
        ).session(session);

      if (!woodLog) {
        throw new Error(
          `Wood log not found: ${woodLogId}`
        );
      }

      woodLog.availableCft +=
        restoredByLog[woodLogId];

      if (woodLog.availableCft > 0) {
        woodLog.status = "available";
      }

      await woodLog.save({ session });
    }

    // -------------------------
    // DELETE RELATED PAYMENTS
    // -------------------------

    await Payment.deleteMany(
      {
        saleId: sale._id,
      },
      { session }
    );

    // -------------------------
    // DELETE SALE
    // -------------------------

    await Sale.findByIdAndDelete(
      id,
      { session }
    );

    // -------------------------
    // COMMIT
    // -------------------------

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: "Sale deleted successfully",
      data: {
        deletedSaleId: id,
      },
    });
  } catch (error) {
    await session.abortTransaction();

    res.status(400).json({
      success: false,
      message: "Failed to delete sale",
      error: error.message,
    });
  } finally {
    await session.endSession();
  }
};

// ======================================================
// EXPORTS
// ======================================================

module.exports = {
  createSale,
  getSales,
  getSaleById,
  updateSale,
  deleteSale,
};