const customerRepository = require('../repositories/CustomerRepository');

const addCustomer = async (customerData) => {
    const customerExists = await customerRepository.findCustomerByEmail(customerData.email);
    if (customerExists) {
        throw new Error('Customer with this email already exists');
    }

    return await customerRepository.createCustomer(customerData);
};

const getAllCustomers = async () => {
    return await customerRepository.findAllCustomers();
};

const updateCustomer = async (customerId, updateData) => {
    if (!customerId) {
        throw new Error('Customer ID is required');
    }

    const updatedCustomer = await customerRepository.updateCustomerById(customerId, updateData);

    if (!updatedCustomer) {
        throw new Error('Customer not found');
    }

    return updatedCustomer;
};

const deleteCustomer = async (customerId) => {
    if (!customerId) {
        throw new Error('Customer ID is required');
    }

    const deletedCustomer = await customerRepository.deleteCustomerById(customerId);

    if (!deletedCustomer) {
        throw new Error('Customer not found');
    }

    return deletedCustomer;
};

module.exports = {
    addCustomer,
    getAllCustomers,
    updateCustomer,
    deleteCustomer
};