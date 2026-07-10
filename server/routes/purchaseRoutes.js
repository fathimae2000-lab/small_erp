const express = require('express');
const router = express.Router();
const purchaseController = require('../controllers/purchaseController');
const {protect }= require('../middlewares/userMiddleware'); 

// Standard CRUD Endpoints
router.post('/', protect, purchaseController.createPurchase);
router.get('/', protect, purchaseController.getAllPurchases);

module.exports = router;