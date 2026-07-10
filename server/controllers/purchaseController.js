const purchaseService = require('../services/purchaseSerivce')

        const createPurchase=    async (req, res) =>{
        try {
            // req.user._id should be injected by your auth middleware (corresponds to receivedBy)
            const purchaseData = {
                ...req.body,
                receivedBy: req.user?._id || req.body.receivedBy 
            };

            const purchase = await purchaseService.createPurchase(purchaseData);
            res.status(201).json({ success: true, purchase });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    const getAllPurchases=  async (req, res) => {
        try {
            const purchases = await purchaseService.getAllPurchases();
            res.status(200).json(purchases);
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

module.exports = { createPurchase, getAllPurchases };