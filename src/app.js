const express = require("express");
const cors = require("cors");

const treePurchaseRoutes = require("./routes/treePurchase.routes");
const expenseRoutes = require("./routes/expense.routes");
const woodProductionRoutes = require("./routes/woodProduction.routes");
const woodLogRoutes = require("./routes/woodLog.routes");
const customerRoutes = require("./routes/customer.routes");
const saleRoutes = require("./routes/sale.routes");
const paymentRoutes = require("./routes/payment.routes");
const profitRoutes = require("./routes/profit.routes");
const reportRoutes = require("./routes/report.routes");
const uploadRoutes = require("./routes/upload.routes");
const authRoutes = require("./routes/auth.routes");

const authMiddleware = require("./middlewares/auth.middleware");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Timber Business API is running...");
});

// 🔓 Public
app.use("/api/auth", authRoutes);

// 🔐 Protected routes
app.use("/api/tree-purchases", authMiddleware, treePurchaseRoutes);
app.use("/api/expenses", authMiddleware, expenseRoutes);
app.use("/api/wood-productions", authMiddleware, woodProductionRoutes);
app.use("/api/wood-logs", authMiddleware, woodLogRoutes);
app.use("/api/customers", authMiddleware, customerRoutes);
app.use("/api/sales", authMiddleware, saleRoutes);
app.use("/api/payments", authMiddleware, paymentRoutes);
app.use("/api/profits", authMiddleware, profitRoutes);
app.use("/api/reports", authMiddleware, reportRoutes);
app.use("/api/uploads", authMiddleware, uploadRoutes);

module.exports = app;