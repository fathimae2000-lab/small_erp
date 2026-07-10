const express = require('express');
const router = express.Router();

// 1. Import your controller functions correctly
const { 
    getAllSalesController, 
    createSaleController, 
    updateSaleController 
} = require('../controllers/saleController'); // Double check this file path matches your folder structure!

// 2. Define endpoints relative to your base path (/api/sales)
// Use a clean slash '/' to mean exactly "/api/sales"
router.get('/', getAllSalesController);
router.post('/', createSaleController);

// Use '/:id' to mean exactly "/api/sales/:id"
router.put('/:id', updateSaleController);

// 3. Make sure to export the router instance!
module.exports = router;