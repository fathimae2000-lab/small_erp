const Order = require("../models/Sales");
const Product = require("../models/Product");
const Customer = require("../models/Customer");

// Helper: parse & validate date range from query params, default to last 30 days
const getDateRange = (req) => {
  const { startDate, endDate } = req.query;

  const end = endDate ? new Date(endDate) : new Date();
  end.setHours(23, 59, 59, 999);

  const start = startDate
    ? new Date(startDate)
    : new Date(new Date().setDate(end.getDate() - 30));
  start.setHours(0, 0, 0, 0);

  return { start, end };
};

// Helper: previous period of equal length, for growth comparison
const getPreviousRange = (start, end) => {
  const durationMs = end.getTime() - start.getTime();
  const prevEnd = new Date(start.getTime() - 1);
  const prevStart = new Date(prevEnd.getTime() - durationMs);
  return { prevStart, prevEnd };
};

const pctChange = (current, previous) => {
  if (!previous) return current > 0 ? 100 : 0;
  return Number((((current - previous) / previous) * 100).toFixed(1));
};

// @desc    Full reports summary: revenue trend, breakdowns, comparisons
// @route   GET /api/reports/summary?startDate=&endDate=
const getReportsSummary = async (req, res) => {
  try {
    const { start, end } = getDateRange(req);
    const { prevStart, prevEnd } = getPreviousRange(start, end);

    const dateMatch = { createdAt: { $gte: start, $lte: end } };
    const prevDateMatch = { createdAt: { $gte: prevStart, $lte: prevEnd } };

    const [currentAgg] = await Order.aggregate([
      { $match: dateMatch },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
          totalOrders: { $sum: 1 },
        },
      },
    ]);

    const [prevAgg] = await Order.aggregate([
      { $match: prevDateMatch },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
          totalOrders: { $sum: 1 },
        },
      },
    ]);

    const totalRevenue = currentAgg?.totalRevenue || 0;
    const totalOrders = currentAgg?.totalOrders || 0;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const prevRevenue = prevAgg?.totalRevenue || 0;
    const prevOrders = prevAgg?.totalOrders || 0;

    const trendRaw = await Order.aggregate([
      { $match: dateMatch },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          },
          value: { $sum: "$totalAmount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ]);

    const revenueTrend = trendRaw.map((d) => ({
      date: `${d._id.year}-${String(d._id.month).padStart(2, "0")}-${String(
        d._id.day
      ).padStart(2, "0")}`,
      value: d.value,
    }));

    const paymentBreakdownRaw = await Order.aggregate([
      { $match: dateMatch },
      {
        $group: {
          _id: "$paymentMode",
          value: { $sum: "$totalAmount" },
          count: { $sum: 1 },
        },
      },
    ]);

    const paymentBreakdown = paymentBreakdownRaw.map((p) => ({
      name: p._id || "Unknown",
      value: p.value,
      orders: p.count,
    }));

    const topProductsRaw = await Order.aggregate([
      { $match: dateMatch },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          unitsSold: { $sum: "$items.quantity" },
          revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
    ]);

    const topProducts = topProductsRaw.map((p) => ({
      name: p.product?.name || "Deleted product",
      sales: p.unitsSold,
      revenue: p.revenue,
    }));

    const topCustomersRaw = await Order.aggregate([
      { $match: dateMatch },
      {
        $group: {
          _id: "$customer",
          totalSpent: { $sum: "$totalAmount" },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "customers",
          localField: "_id",
          foreignField: "_id",
          as: "customer",
        },
      },
      { $unwind: { path: "$customer", preserveNullAndEmptyArrays: true } },
    ]);

    const topCustomers = topCustomersRaw.map((c) => ({
      name: c.customer?.name || "Deleted customer",
      totalSpent: c.totalSpent,
      orders: c.orderCount,
    }));

    const customerIdsInPeriod = await Order.distinct("customer", dateMatch);
    const customersInPeriod = await Customer.find({
      _id: { $in: customerIdsInPeriod },
    }).select("ordersCount");

    const newCustomers = customersInPeriod.filter((c) => c.ordersCount <= 1).length;
    const returningCustomers = customersInPeriod.length - newCustomers;

    const lowStockProducts = await Product.find({ stock: { $lte: 10 } })
      .select("name stock price")
      .sort({ stock: 1 })
      .limit(10);

    const [stockValuationAgg] = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalValue: { $sum: { $multiply: ["$price", "$stock"] } },
          totalUnits: { $sum: "$stock" },
        },
      },
    ]);

    res.status(200).json({
      range: { start, end },
      stats: {
        totalRevenue,
        totalOrders,
        avgOrderValue: Number(avgOrderValue.toFixed(2)),
        revenueGrowth: pctChange(totalRevenue, prevRevenue),
        ordersGrowth: pctChange(totalOrders, prevOrders),
      },
      revenueTrend,
      paymentBreakdown,
      topProducts,
      topCustomers,
      customerMix: { newCustomers, returningCustomers },
      lowStockProducts: lowStockProducts.map((p) => ({
        name: p.name,
        stock: p.stock,
        value: Number((p.price * p.stock).toFixed(2)),
      })),
      stockValuation: {
        totalValue: stockValuationAgg?.totalValue || 0,
        totalUnits: stockValuationAgg?.totalUnits || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Paginated, filterable order list for the Reports table
// @route   GET /api/reports/orders?startDate=&endDate=&paymentMode=&page=&limit=
const getOrdersReport = async (req, res) => {
  try {
    const { start, end } = getDateRange(req);
    const { paymentMode, page = 1, limit = 20 } = req.query;

    const match = { createdAt: { $gte: start, $lte: end } };
    if (paymentMode) match.paymentMode = paymentMode;

    const skip = (Number(page) - 1) * Number(limit);

    const [orders, total] = await Promise.all([
      Order.find(match)
        .populate("customer", "name phone")
        .populate("soldBy", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Order.countDocuments(match),
    ]);

    const formatted = orders.map((o) => ({
      id: `#${o._id.toString().slice(-6)}`,
      customer: o.customer?.name || "Walk-in Customer",
      phone: o.customer?.phone || "",
      soldBy: o.soldBy?.name || "-",
      itemCount: o.items.length,
      amount: o.totalAmount,
      paymentMode: o.paymentMode,
      date: o.createdAt,
    }));

    res.status(200).json({
      orders: formatted,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getReportsSummary, getOrdersReport };