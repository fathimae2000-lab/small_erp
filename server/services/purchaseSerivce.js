const purchaseRepo = require('../repositories/PurchaseRepository');
const Product = require('../models/Product'); 

const createPurchase = async (purchaseData) => {
    try {
        // 1. Add a fallback to an empty array so it doesn't crash
        const items = purchaseData.items || [];

        if (items.length === 0) {
            throw new Error("Purchase order must contain at least one item.");
        }

        // 2. Safely compute the total
        const totalAmount = items.reduce((acc, item) => {
            return acc + (item.purchasePrice * item.quantity);
        }, 0);
            
        purchaseData.totalAmount = totalAmount;

        // 3. Save the purchase invoice records directly (No session)
        const newPurchase = await purchaseRepo.create(purchaseData);

        // 4. Increment inventory stock count for each item row purchased
        for (const item of purchaseData.items) {
            await Product.findByIdAndUpdate(
                item.product,
                { $inc: { stock: item.quantity } }, // Increments stock count
                { new: true } // Removed session option
            );
        }
            
        // Return populated record
        return await purchaseRepo.findById(newPurchase._id);
    } catch (error) {
        throw error;
    }
};

const getAllPurchases = async () => {
    return await purchaseRepo.findAll();
};

// FIXED: Removed the stray global session/transaction initialization completely!
module.exports = { createPurchase, getAllPurchases };