const Customer = require("../models/customer.model");

// ======================================================
// CREATE CUSTOMER
// ======================================================

const createCustomer = async (req, res) => {
  try {
    const {
      name,
      phone,
      address,
      notes,
    } = req.body;

    const customer = await Customer.create({
      name,
      phone,
      address,
      notes,
    });

    res.status(201).json({
      success: true,
      message: "Customer created successfully",
      data: customer,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to create customer",
      error: error.message,
    });
  }
};

// ======================================================
// GET ALL CUSTOMERS
// ======================================================

const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find({})
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Customers fetched successfully",
      data: customers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch customers",
      error: error.message,
    });
  }
};

// ======================================================
// GET CUSTOMER BY ID
// ======================================================

const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;

    const customer = await Customer.findById(id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Customer fetched successfully",
      data: customer,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to fetch customer",
      error: error.message,
    });
  }
};

// ======================================================
// UPDATE CUSTOMER
// ======================================================

const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    // Only allow these fields to be updated
    const {
      name,
      phone,
      address,
      notes,
    } = req.body;

    const customer = await Customer.findByIdAndUpdate(
      id,
      {
        name,
        phone,
        address,
        notes,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Customer updated successfully",
      data: customer,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to update customer",
      error: error.message,
    });
  }
};

// ======================================================
// DELETE CUSTOMER
// ======================================================

const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    const customer = await Customer.findByIdAndDelete(id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Customer deleted successfully",
      data: {
        deletedCustomerId: id,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to delete customer",
      error: error.message,
    });
  }
};

// ======================================================
// EXPORTS
// ======================================================

module.exports = {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
};