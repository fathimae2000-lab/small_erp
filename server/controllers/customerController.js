const asyncHandler = require('express-async-handler');
const customerService = require('../services/CustomerService');

// @desc    Create a new customer
// @route   POST /api/customers
// @access  Protected
const createCustomerController = asyncHandler(async (req, res) => {
    const newCustomer = await customerService.addCustomer(req.body);

    res.status(201).json({
        success: true,
        message: 'Customer added successfully',
        customer: newCustomer
    });
});

// @desc    Get all customers
// @route   GET /api/customers
// @access  Protected
const getAllCustomersController = asyncHandler(async (req, res) => {
    const customers = await customerService.getAllCustomers();

    res.status(200).json({
        success: true,
        count: customers.length,
        data: customers
    });
});

// @desc    Update a customer's details
// @route   PUT /api/customers/:id
// @access  Protected
const updateCustomerController = asyncHandler(async (req, res) => {
    const customerId = req.params.id;

    const updatedCustomer = await customerService.updateCustomer(customerId, req.body);

    if (!updatedCustomer) {
        res.status(404);
        throw new Error('Customer not found');
    }

    res.status(200).json({
        success: true,
        message: 'Customer updated successfully',
        customer: updatedCustomer
    });
});

// @desc    Delete a customer
// @route   DELETE /api/customers/:id
// @access  Protected
const deleteCustomerController = asyncHandler(async (req, res) => {
    const customerId = req.params.id;

    const deletedCustomer = await customerService.deleteCustomer(customerId);

    if (!deletedCustomer) {
        res.status(404);
        throw new Error('Customer not found');
    }

    res.status(200).json({
        success: true,
        message: 'Customer deleted successfully',
        customer: deletedCustomer
    });
});

module.exports = {
    createCustomerController,
    getAllCustomersController,
    updateCustomerController,
    deleteCustomerController
};