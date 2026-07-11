const express = require('express');
const router = express.Router();

const { 
    getAllSalesController, 
    createSaleController, 
    updateSaleController 
} = require('../controllers/saleController'); 


router.get('/', getAllSalesController);
router.post('/', createSaleController);

router.put('/:id', updateSaleController);

module.exports = router;