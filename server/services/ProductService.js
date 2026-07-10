const productRepository = require('../repositories/ProductRepository');

const addProduct = async (productData) => {
    const productExists = await productRepository.findProductByName(productData.name);
    if (productExists) {
        throw new Error('Product with this name already exists');
    }

    return await productRepository.createProduct(productData);
};

const getAllProducts = async () => {
    return await productRepository.findAllProducts();
};

// --- NEW INVENTORY MODULE METHODS ---

const getInventoryDashboard = async () => {
    const products = await productRepository.findAllProducts();

    const totalUniqueItems = products.length;
    const totalStockValue = products.reduce((sum, prod) => sum + ((prod.stock || 0) * (prod.price || 0)), 0);
    
    const lowStockAlerts = products.filter(prod => (prod.stock || 0) < 10);

    return {
        summary: {
            totalUniqueItems,
            totalStockValue,
            lowStockCount: lowStockAlerts.length
        },
        inventory: products,
        lowStock: lowStockAlerts
    };


};



const adjustProductStock = async (productId, newStock) => {
    if (!productId) {
        throw new Error('Product ID is required');
    }
    if (newStock < 0) {
        throw new Error('Stock cannot be negative');
    }

    const updatedProduct = await productRepository.updateProductStock(productId, newStock);
    
    if (!updatedProduct) {
        throw new Error('Product not found');
    }

    return updatedProduct;
};

module.exports = {
    addProduct,
    getAllProducts,
    getInventoryDashboard,
    adjustProductStock 
};

