const express = require('express');
const router = express.Router();
const { createProductController, getAllProductsController,deleteProductController, updateProductController } = require('../controllers/ProductController');
const { protect } = require('../middlewares/userMiddleware');
const { authorizeRoles } = require('../middlewares/roleMiddleware');

router.post('/', protect, authorizeRoles('admin', 'manager'), createProductController);

router.get('/', protect, authorizeRoles('admin', 'manager', 'staff'), getAllProductsController);

router.put('/:id', protect, authorizeRoles('admin', 'manager'),updateProductController )


router.delete('/:id', protect, authorizeRoles('admin', 'manager'),deleteProductController )





module.exports = router;