const asyncHandler = require('express-async-handler');
const invoiceService = require('../services/invoiceService');

// @desc    Get all bills / sales
// @route   GET /api/sales
// @access  Protected (Admin / Manager / Staff)
const getAllSalesController = asyncHandler(async (req, res) => {
    // CORRECTED: Call the actual service function name
    const sales = await invoiceService.getSalesReport(); 

    res.status(200).json(sales);
});

// @desc    Create a new bill / sale
// @route   POST /api/sales
// @access  Protected (Admin / Manager / Staff)
const createSaleController = asyncHandler(async (req, res) => {
    const saleData = {
        ...req.body,
        soldBy: req.user._id 
    };

    const newInvoice = await invoiceService.processNewSale(saleData);

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