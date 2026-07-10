const Product = require('../models/Product');

const createProduct = async (productData) => {
    return await Product.create(productData);
};

const findAllProducts = async () => {
    return await Product.find({}).populate('createdBy', 'name email'); 
};

const findProductByName = async (name) => {
    return await Product.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } }); 
};

const updateProductStock = async (productId, newStock) => {
    return await Product.findByIdAndUpdate(
        productId,
        { stock: newStock },
        { new: true } 
    );
};

const deleteProductById = async (id) => {
    return await Product.findByIdAndDelete(id);
};
const updateProductById = async (productId, updateData) => {
    return await Product.findByIdAndUpdate(
        productId,
        updateData,
        { new: true, runValidators: true }
    );
};
module.exports = {
    createProduct,
    findAllProducts,
    findProductByName,
    updateProductStock ,
    deleteProductById,
        updateProductById

};

