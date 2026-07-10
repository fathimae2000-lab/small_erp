const Purchase = require('../models/Purchase');

  const create=  async (purchaseData, session = null) => {
        const purchase = new Purchase(purchaseData);
        return await purchase.save({ session });
    }

    const findAll=  async () => {
        return await Purchase.find()
            .populate('items.product', 'name price')
            .populate('receivedBy', 'name email')
            .sort({ createdAt: -1 });
    }

    const findById=  async (id) => {
        return await Purchase.findById(id)
            .populate('items.product', 'name price')
            .populate('receivedBy', 'name email');
    }


module.exports = { create, findAll, findById };