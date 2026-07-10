const Order = require("../models/Sales");
const Product = require("../models/Product");

const getReportsDashboard = async (req, res) => {
  try {
    const { range } = req.query;

    const totalProducts = await Product.countDocuments();
    const lowStockCount = await Product.countDocuments({ stock: { $lte: 5 } });

    const salesStats = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$totalAmount" }, 
          totalOrders: { $sum: 1 }
        }
      }
    ]);

    const totalSales = salesStats[0]?.totalSales || 0;
    const totalOrders = salesStats[0]?.totalOrders || 0;

    const statusCounts = await Order.aggregate([
      {
        $group: {
          _id: "$status", 
          value: { $sum: 1 }
        }
      }
    ]);

    const ordersByStatus = statusCounts.map(item => ({
      name: item._id,
      value: item.value
    }));

    const revenueTrend = await Order.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%b", date: "$createdAt" } }, 
          revenue: { $sum: "$totalAmount" }
        }
      }
    ]);

    const revenueData = revenueTrend.map(item => ({
      month: item._id,
      revenue: item.revenue
    }));

    const topProducts = await Order.aggregate([
      { $unwind: "$items" },

      {
        $group: {
          _id: "$items.product",
          sold: { $sum: "$items.quantity" }, 
          revenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } } 
        }
      },

      {
        $lookup: {
          from: "products",       
          localField: "_id",
          foreignField: "_id",
          as: "productDetails"
        }
      },

      { $unwind: "$productDetails" },

      {
        $project: {
          _id: 1,
          sold: 1,
          revenue: 1,
          name: "$productDetails.name" 
        }
      },

      { $sort: { sold: -1 } },

      { $limit: 5 }
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalSales,
        totalOrders,
        totalProducts,
        lowStockCount
      },
      revenueData,
      ordersByStatus,
      topProducts 
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getReportsDashboard };