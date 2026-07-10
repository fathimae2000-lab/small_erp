const saleRepository = require('../repositories/saleRepository');
const Product = require('../models/Product'); 
const Customer=require('../models/Customer')

const processNewSale = async (saleData) => {
    let totalAmount = 0;

    const customer=await Customer.findById(saleData.customer)
    if(!customer) {
        throw new Error(`Customer not found!`);
    }

    for (let item of saleData.items) {
        const product = await Product.findById(item.product);

        if (!product) {
            throw new Error(`Product not found!`);
        }

        if (product.stock < item.quantity) {
            throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stock}`);
        }

        item.price = product.price;
        totalAmount += product.price * item.quantity;

        product.stock -= item.quantity;
        await product.save();
    }

    saleData.totalAmount = totalAmount;

    customer.totalSpent += totalAmount;
customer.ordersCount += 1;
await customer.save();


    return await saleRepository.createSaleRecord(saleData);
};

const getSalesReport = async () => {
    return await saleRepository.findAllSales();
};

const updateSale = async (saleId, updateData) => {
    if (!saleId) {
        throw new Error('Order ID is required');
    }

    const updatedSale = await Sale.findByIdAndUpdate(
        saleId,
        updateData,
        { new: true, runValidators: true }
    );

    return updatedSale;
};

module.exports = {
    processNewSale,
    getSalesReport,
    updateSale
};