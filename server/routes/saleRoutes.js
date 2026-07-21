const express = require('express');
const router = express.Router();

const { 
    getAllSalesController, 
    createSaleController, 
    updateSaleController 
} = require('../controllers/saleController'); 

// 1. Import your auth protection middleware (adjust the path if necessary)
const { protect } = require('../middlewares/userMiddleware');

// 2. Add 'protect' as the first argument to the routes that need authentication
router.get('/', protect, getAllSalesController);
router.post('/', protect, createSaleController);
router.put('/:id', protect, updateSaleController);

module.exports = router;