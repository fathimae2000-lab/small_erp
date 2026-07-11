const Customer = require('../models/Customer');

const findAllCustomers = async () => {
    return await Customer.find();
};

const findCustomerByEmail = async (email) => {
    return await Customer.findOne({ email });
};

const createCustomer = async (customerData) => {
    return await Customer.create(customerData);
};

const updateCustomerById = async (customerId, updateData) => {
    return await Customer.findByIdAndUpdate(
        customerId,
        updateData,
        { new: true, runValidators: true }
    );
};

const deleteCustomerById = async (customerId) => {
    return await Customer.findByIdAndDelete(customerId);
};

module.exports = {
    findAllCustomers,
    findCustomerByEmail,
    createCustomer,
    updateCustomerById,
    deleteCustomerById
};