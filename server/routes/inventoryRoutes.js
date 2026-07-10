const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');

router.get('/dashboard', inventoryController.getInventoryStatus);

router.put('/adjust-stock', inventoryController.adjustStock);

module.exports = router;