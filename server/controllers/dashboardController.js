const Order = require("../models/Sales"); 
const Product = require("../models/Product"); 

const getDashboardData = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const lowStockCount = await Product.countDocuments({ stock: { $lte: 5 } });

    const orderStats = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
          totalOrders: { $sum: 1 }
        }
      }
    ]);

    const totalRevenue = orderStats[0]?.totalRevenue || 0;
    const totalOrders = orderStats[0]?.totalOrders || 0;

    const salesTrend = [
      { day: "Mon", value: 1200 },
      { day: "Tue", value: 1900 },
      { day: "Wed", value: 1500 },
      { day: "Thu", value: 2200 },
      { day: "Fri", value: 1800 },
      { day: "Sat", value: 2600 },
      { day: "Sun", value: 2100 },
    ];

    // 3. LOW STOCK PRODUCTS LIST
    const rawLowStock = await Product.find({ stock: { $lte: 10 } }).limit(5);
    const lowStockProducts = rawLowStock.map(p => ({
      name: p.name,
      left: p.stock,
      level: p.stock <= 3 ? "danger" : "warning"
    }));

    // 4. RECENT ORDERS LIST
    const rawRecentOrders = await Order.find().sort({ createdAt: -1 }).limit(3);
    const recentOrders = rawRecentOrders.map(o => ({
      id: `#${o._id.toString().slice(-4)}`,
      name: o.customerName || "Walk-in Customer",
      initials: (o.customerName || "WC").split(" ").map(n => n[0]).join("").toUpperCase(),
      amount: `$${o.totalAmount}`
    }));

    // 5. RECENT PRODUCTS LIST
    const rawRecentProducts = await Product.find().sort({ createdAt: -1 }).limit(3);
    const recentProducts = rawRecentProducts.map(p => ({
      name: p.name,
      amount: `$${p.price}`
    }));

    res.status(200).json({
      stats: { totalRevenue, totalOrders, totalProducts, lowStockCount },
      salesTrend,
      lowStockProducts,
      recentOrders,
      recentProducts
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboardData };