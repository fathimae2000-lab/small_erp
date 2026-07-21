const Order = require("../models/Sales");
const Product = require("../models/Product");

const getDashboardData = async (req, res) => {
  try {
    const { range = "monthly" } = req.query;

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

    // --- Build salesTrend based on range ---
    let salesTrend = [];

    if (range === "yearly") {
      // Fixed window: 2025–2030
      const startYear = 2025;
      const endYear = 2030;

      const yearly = await Order.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(startYear, 0, 1),
              $lt: new Date(endYear + 1, 0, 1)
            }
          }
        },
        {
          $group: {
            _id: { $year: "$createdAt" },
            value: { $sum: "$totalAmount" }
          }
        },
        { $sort: { "_id": 1 } }
      ]);

      salesTrend = Array.from({ length: endYear - startYear + 1 }, (_, i) => {
        const year = startYear + i;
        const found = yearly.find(y => y._id === year);
        return { month: `${year}`, value: found ? found.value : 0 };
      });

    } else {
      // Monthly view: group by month for the current year
      const startOfYear = new Date(new Date().getFullYear(), 0, 1);

      const monthly = await Order.aggregate([
        { $match: { createdAt: { $gte: startOfYear } } },
        {
          $group: {
            _id: { $month: "$createdAt" },
            value: { $sum: "$totalAmount" }
          }
        },
        { $sort: { "_id": 1 } }
      ]);

      const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
      salesTrend = monthNames.map((name, idx) => {
        const found = monthly.find(m => m._id === idx + 1);
        return { date: name, value: found ? found.value : 0 };
      });
    }

    const rawLowStock = await Product.find({ stock: { $lte: 10 } }).limit(5);
    const lowStockProducts = rawLowStock.map(p => ({
      name: p.name,
      left: p.stock,
      level: p.stock <= 3 ? "danger" : "warning"
    }));

    const rawRecentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .populate('customer', 'name');

    const recentOrders = rawRecentOrders.map(o => ({
      id: `#${o._id.toString().slice(-4)}`,
      name: o.customer?.name || "Walk-in Customer",
      initials: (o.customer?.name || "WC").split(" ").map(n => n[0]).join("").toUpperCase(),
      amount: `$${o.totalAmount}`
    }));

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