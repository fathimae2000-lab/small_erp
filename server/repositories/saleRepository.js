const Sale = require('../models/Sales');

const createSaleRecord = async (saleData) => {
    return await Sale.create(saleData);
};

const findAllSales = async () => {
    return await Sale.find({})
        .populate('customer', 'name email phone')
        .populate('items.product', 'name price') 
        .populate('soldBy', 'name email');    
};

module.exports = {
    createSaleRecord,
    findAllSales
};