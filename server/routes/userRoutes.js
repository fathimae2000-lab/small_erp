const express = require('express');
const router = express.Router();
const { registerUser,loginUser,getUserProfile,getAllUsersController } = require('../controllers/userController');
const { protect } = require('../middlewares/userMiddleware');
const { authorizeRoles } = require('../middlewares/roleMiddleware');

router.post('/register', registerUser);

router.post('/login', loginUser); 

router.get('/profile', protect, getUserProfile);


router.get('/all-users', protect, authorizeRoles('admin', 'manager'), getAllUsersController);
module.exports = router;