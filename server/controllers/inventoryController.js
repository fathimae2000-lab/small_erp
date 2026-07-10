const productService = require('../services/ProductService');

const getInventoryStatus = async (req, res) => {
    try {
        const dashboardData = await productService.getInventoryDashboard();
        res.status(200).json({
            success: true,
            ...dashboardData
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};


const adjustStock = async (req, res) => {
    try {
        const { productId, newStock } = req.body;

        const updatedProduct = await productService.adjustProductStock(productId, Number(newStock));

        res.status(200).json({
            success: true,
            message: "Stock adjusted successfully",
            product: updatedProduct
        });
    } catch (error) {
        res.status(400).json({ 
            success: false, 
            message: error.message 
        });
    }
};

module.exports = {
    getInventoryStatus,
    adjustStock 
};

