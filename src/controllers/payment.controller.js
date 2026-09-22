const Payment = require("../models/payment.model");
const Sale = require("../models/sale.model");
const Customer = require("../models/customer.model");

// ======================================================
// CREATE PAYMENT
// ======================================================

const createPayment = async (req, res) => {
  const session = await Sale.startSession();

  try {
    session.startTransaction();

    const {
      saleId,
      amount,
      paymentDate,
      paymentMethod,
      notes,
    } = req.body;

    // -------------------------
    // FIND SALE
    // -------------------------

    const sale = await Sale.findById(
      saleId
    ).session(session);

    if (!sale) {
      throw new Error("Sale not found");
    }

    // -------------------------
    // FIND CUSTOMER
    // -------------------------

    const customer = await Customer.findById(
      sale.customerId
    ).session(session);

    if (!customer) {
      throw new Error("Customer not found");
    }

    // -------------------------
    // PAYMENT VALIDATION
    // -------------------------

    const paymentAmount = Number(amount);

    if (
      !paymentAmount ||
      paymentAmount <= 0
    ) {
      throw new Error(
        "Payment amount must be greater than 0"
      );
    }

    if (
      paymentAmount > sale.dueAmount
    ) {
      throw new Error(
        `Payment cannot be greater than due amount. Current due: ${sale.dueAmount}`
      );
    }

    // -------------------------
    // CREATE PAYMENT
    // -------------------------

    const payment =
      await Payment.create(
        [
          {
            saleId,
            customerId: sale.customerId,
            amount: paymentAmount,
            paymentDate,
            paymentMethod,
            notes,
          },
        ],
        { session }
      );

    const createdPayment =
      payment[0];

    // -------------------------
    // UPDATE SALE
    // -------------------------

    sale.paidAmount +=
      paymentAmount;

    sale.dueAmount =
      sale.totalAmount -
      sale.paidAmount;

    if (sale.dueAmount === 0) {
      sale.paymentStatus = "paid";
    } else if (
      sale.paidAmount > 0
    ) {
      sale.paymentStatus = "partial";
    } else {
      sale.paymentStatus = "unpaid";
    }

    await sale.save({ session });

    // -------------------------
    // COMMIT
    // -------------------------

    await session.commitTransaction();

    res.status(201).json({
      success: true,
      message:
        "Payment created successfully",
      data: {
        payment: createdPayment,

        sale: {
          saleId: sale._id,
          totalAmount:
            sale.totalAmount,
          paidAmount:
            sale.paidAmount,
          dueAmount:
            sale.dueAmount,
          paymentStatus:
            sale.paymentStatus,
        },
      },
    });
  } catch (error) {
    // -------------------------
    // ROLLBACK
    // -------------------------

    await session.abortTransaction();

    res.status(400).json({
      success: false,
      message:
        "Failed to create payment",
      error: error.message,
    });
  } finally {
    await session.endSession();
  }
};

// ======================================================
// GET ALL PAYMENTS
// ======================================================

const getPayments = async (req, res) => {
  try {
    const payments = await Payment.find({})
      .populate("saleId")
      .populate("customerId")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Payments fetched successfully",
      data: payments,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch payments",
      error: error.message,
    });
  }
};


// ======================================================
// GET PAYMENTS BY SALE
// ======================================================

const getPaymentsBySale = async (req, res) => {
  try {
    const { saleId } = req.params;

    const sale = await Sale.findById(saleId);

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: "Sale not found",
      });
    }

    const payments = await Payment.find({
      saleId,
    })
      .populate("customerId")
      .sort({ paymentDate: 1 });

    res.status(200).json({
      success: true,
      message: "Sale payments fetched successfully",
      data: {
        sale: {
          saleId: sale._id,
          totalAmount: sale.totalAmount,
          paidAmount: sale.paidAmount,
          dueAmount: sale.dueAmount,
          paymentStatus: sale.paymentStatus,
        },
        payments,
      },
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch sale payments",
      error: error.message,
    });
  }
};


// ======================================================
// GET PAYMENTS BY CUSTOMER
// ======================================================

const getPaymentsByCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;

    const customer = await Customer.findById(customerId);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const payments = await Payment.find({
      customerId,
    })
      .populate("saleId")
      .sort({ paymentDate: -1 });

    res.status(200).json({
      success: true,
      message: "Customer payments fetched successfully",
      data: payments,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch customer payments",
      error: error.message,
    });
  }
};


// ======================================================
// GET SINGLE PAYMENT
// ======================================================

const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await Payment.findById(id)
      .populate("saleId")
      .populate("customerId");

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Payment fetched successfully",
      data: payment,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch payment",
      error: error.message,
    });
  }
};


// ======================================================
// DELETE PAYMENT
// ======================================================

const deletePayment = async (req, res) => {
  const session = await Sale.startSession();

  try {
    session.startTransaction();

    const { id } = req.params;

    // -------------------------
    // FIND PAYMENT
    // -------------------------

    const payment = await Payment.findById(
      id
    ).session(session);

    if (!payment) {
      throw new Error("Payment not found");
    }

    // -------------------------
    // FIND SALE
    // -------------------------

    const sale = await Sale.findById(
      payment.saleId
    ).session(session);

    if (!sale) {
      throw new Error(
        "Related sale not found"
      );
    }

    // -------------------------
    // UPDATE SALE
    // -------------------------

    sale.paidAmount -= payment.amount;

    sale.dueAmount =
      sale.totalAmount -
      sale.paidAmount;

    if (sale.paidAmount === 0) {
      sale.paymentStatus = "unpaid";
    } else if (
      sale.paidAmount <
      sale.totalAmount
    ) {
      sale.paymentStatus = "partial";
    } else {
      sale.paymentStatus = "paid";
    }

    await sale.save({ session });

    // -------------------------
    // DELETE PAYMENT
    // -------------------------

    await Payment.findByIdAndDelete(
      id,
      { session }
    );

    // -------------------------
    // COMMIT
    // -------------------------

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message:
        "Payment deleted successfully",
      data: {
        deletedPaymentId: id,

        sale: {
          saleId: sale._id,
          totalAmount:
            sale.totalAmount,
          paidAmount:
            sale.paidAmount,
          dueAmount:
            sale.dueAmount,
          paymentStatus:
            sale.paymentStatus,
        },
      },
    });
  } catch (error) {
    // -------------------------
    // ROLLBACK
    // -------------------------

    await session.abortTransaction();

    res.status(400).json({
      success: false,
      message:
        "Failed to delete payment",
      error: error.message,
    });
  } finally {
    await session.endSession();
  }
};


// ==========================================
// GET CUSTOMER DUE LIST
// ==========================================

const getCustomerDueList = async (req, res) => {
  try {
    const customers = await Customer.find({})
      .sort({ createdAt: -1 });

    const dueCustomers = [];

    for (const customer of customers) {
      const sales = await Sale.find({
        customerId: customer._id,
      });

      let totalSales = 0;
      let totalPaid = 0;
      let totalDue = 0;

      for (const sale of sales) {
        totalSales += sale.totalAmount;
        totalPaid += sale.paidAmount;
        totalDue += sale.dueAmount;
      }

      // শুধু যাদের due আছে
      if (totalDue > 0) {
        dueCustomers.push({
          customer: {
            customerId: customer._id,
            name: customer.name,
            phone: customer.phone,
            address: customer.address,
          },

          totalOrders: sales.length,

          totalSales,
          totalPaid,
          totalDue,
        });
      }
    }

    // যাদের বেশি due তাদের আগে
    dueCustomers.sort(
      (a, b) => b.totalDue - a.totalDue
    );

    res.status(200).json({
      success: true,
      message:
        "Customer due list fetched successfully",
      data: {
        totalCustomersWithDue:
          dueCustomers.length,

        totalDueAmount: dueCustomers.reduce(
          (sum, customer) =>
            sum + customer.totalDue,
          0
        ),

        customers: dueCustomers,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        "Failed to fetch customer due list",
      error: error.message,
    });
  }
};


// GET CUSTOMER RECEIVABLE SUMMARY
const getCustomerReceivableSummary = async (req, res) => {
  try {
    const { customerId } = req.params;

    const customer = await Customer.findById(customerId);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const sales = await Sale.find({
      customerId,
    }).sort({
      saleDate: -1,
    });

    let totalSales = 0;
    let totalPaid = 0;
    let totalDue = 0;

    for (const sale of sales) {
      totalSales += sale.totalAmount;
      totalPaid += sale.paidAmount;
      totalDue += sale.dueAmount;
    }

    let paymentStatus = "unpaid";

    if (totalDue === 0 && totalSales > 0) {
      paymentStatus = "paid";
    } else if (totalPaid > 0 && totalDue > 0) {
      paymentStatus = "partial";
    }

    res.status(200).json({
      success: true,
      message:
        "Customer receivable summary fetched successfully",
      data: {
        customer: {
          customerId: customer._id,
          name: customer.name,
          phone: customer.phone,
        },

        totalSales,
        totalPaid,
        totalDue,
        paymentStatus,

        totalOrders: sales.length,

        sales,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        "Failed to fetch customer receivable summary",
      error: error.message,
    });
  }
};


// ======================================================
// EXPORTS
// ======================================================

module.exports = {
  createPayment,
  getPayments,
  getPaymentsBySale,
  getPaymentsByCustomer,
  getPaymentById,
  deletePayment,
  getCustomerReceivableSummary,
  getCustomerDueList,
};