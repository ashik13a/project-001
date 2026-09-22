const express = require("express");

const {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
} = require("../controllers/customer.controller");

const router = express.Router();

router.post("/", createCustomer);

router.get("/", getCustomers);

router.get("/:id", getCustomerById);

router.patch("/:id", updateCustomer);

router.delete("/:id", deleteCustomer);

module.exports = router;