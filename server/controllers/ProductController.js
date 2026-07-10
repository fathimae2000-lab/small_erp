const asyncHandler = require('express-async-handler');
const productService = require('../services/ProductService');

// @desc    Create a new product
// @route   POST /api/products
// @access  Protected (Admin / Manager)
const createProductController = asyncHandler(async (req, res) => {
    const productData = {
        ...req.body,
        createdBy: req.user._id 
    };

    const newProduct = await productService.addProduct(productData);
    
    res.status(201).json({
        success: true,
        message: 'Product added to inventory successfully',
        product: newProduct
    });
});

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getAllProductsController = asyncHandler(async (req, res) => {
    const products = await productService.getAllProducts();
    
    res.status(200).json({
        success: true,
        count: products.length,
        data :products
    });
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Protected (Admin / Manager)
const deleteProductController = asyncHandler(async (req, res) => {
    const productId = req.params.id;

    // This assumes your ProductService has a deleteProduct method
    const deletedProduct = await productService.deleteProduct(productId);

    if (!deletedProduct) {
        res.status(404);
        throw new Error('Product not found');
    }
    
    res.status(200).json({
        success: true,
        message: 'Product deleted successfully',
        product: deletedProduct
    });
});


const updateProductStock = async (productId, newStock) => {
    return await Product.findByIdAndUpdate(
        productId,
        { stock: newStock },
        { new: true }
    );
};

// @desc    Update a product's details
// @route   PUT /api/products/:id
// @access  Protected (Admin / Manager)
const updateProductController = asyncHandler(async (req, res) => {
    const productId = req.params.id;

    const updatedProduct = await productService.updateProduct(productId, req.body);

    if (!updatedProduct) {
        res.status(404);
        throw new Error('Product not found');
    }

    res.status(200).json({
        success: true,
        message: 'Product updated successfully',
        product: updatedProduct
    });
});

module.exports = {
    createProductController,
    getAllProductsController,
    deleteProductController,
    updateProductStock ,
    updateProductController

};