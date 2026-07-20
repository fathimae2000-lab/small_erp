const asyncHandler = require('express-async-handler');
const invoiceService = require('../services/invoiceService');

// @desc    Get all bills / sales
// @route   GET /api/sales
// @access  Protected (Admin / Manager / Staff)
const getAllSalesController = asyncHandler(async (req, res) => {
    const sales = await invoiceService.getSalesReport(); 

    res.status(200).json(sales);
});

// @desc    Create a new bill / sale
// @route   POST /api/sales
// @access  Protected (Admin / Manager / Staff)
const createSaleController = asyncHandler(async (req, res) => {
    // Safety check to ensure req.user exists and has an _id
    if (!req.user || !req.user._id) {
        res.status(401);
        throw new Error('Not authorized, user token is missing or invalid');
    }

    const saleData = {
        ...req.body
    };

    // Pass req.user._id as the second argument to the service
    const newInvoice = await invoiceService.processNewSale(saleData, req.user._id);

    res.status(201).json({
        success: true,
        message: 'Invoice generated successfully',
        invoice: newInvoice
    });
});

// @desc    Update a bill / sale
// @route   PUT /api/sales/:id
// @access  Protected (Admin / Manager / Staff)
const updateSaleController = asyncHandler(async (req, res) => {
    const saleId = req.params.id;

    const updatedInvoice = await invoiceService.updateSale(saleId, req.body);

    if (!updatedInvoice) {
        res.status(404);
        throw new Error('Order not found');
    }

    res.status(200).json({
        success: true,
        message: 'Order updated successfully',
        invoice: updatedInvoice
    });
});

module.exports = {
    getAllSalesController,
    createSaleController,
    updateSaleController
};