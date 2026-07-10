// controllers/dashboardSearchController.js
//
// Global search used by the AppBar. Searches across Products, Orders,
// Customers, and Invoices in parallel and returns a combined result set.
//
// Adjust the model imports and field names below to match your actual schemas.

const Product = require("../models/Product");
const Order = require("../models/Sales");
const Customer = require("../models/Customer");

const RESULTS_PER_ENTITY = 5;

exports.searchDashboard = async (req, res) => {
  try {
    const q = (req.query.q || "").trim();

    if (q.length < 2) {
      return res.status(400).json({ message: "Query must be at least 2 characters" });
    }

    // Escape regex special characters so things like "C++" or "3.5"" don't break the query
    const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const safeQuery = escapeRegex(q);
    const regex = new RegExp(safeQuery, "i");

const [products, orders, customers] = await Promise.all([
  Product.find({
    $or: [{ name: regex }, { sku: regex }, { category: regex }],
  })
    .limit(RESULTS_PER_ENTITY)
    .select("name price sku"),
  Order.find({
    $or: [{ customerName: regex }, { status: regex }],
  })
    .limit(RESULTS_PER_ENTITY)
    .select("customerName totalAmount status createdAt"),
  Customer.find({
    $or: [{ name: regex }, { email: regex }, { phone: regex }],
  })
    .limit(RESULTS_PER_ENTITY)
    .select("name email phone"),
]);

return res.status(200).json({ products, orders, customers });

    return res.status(200).json({ products, orders, customers, invoices });
  } catch (error) {
    console.error("Dashboard search failed:", error);
    return res.status(500).json({ message: "Search failed", error: error.message });
  }
};