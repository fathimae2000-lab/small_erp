const express = require('express');
const router = express.Router();
const {
    createCustomerController,
    getAllCustomersController,
    updateCustomerController,
    deleteCustomerController
} = require('../controllers/CustomerController');
const { protect } = require('../middlewares/userMiddleware');
const { authorizeRoles } = require('../middlewares/roleMiddleware');

router.post('/', protect, authorizeRoles('admin', 'manager'), createCustomerController);

router.get('/', protect, authorizeRoles('admin', 'manager', 'staff'), getAllCustomersController);

router.put('/:id', protect, authorizeRoles('admin', 'manager'), updateCustomerController);

router.delete('/:id', protect, authorizeRoles('admin', 'manager'), deleteCustomerController);

module.exports = router;