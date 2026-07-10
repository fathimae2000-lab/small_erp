const userService = require('../services/userService');
const asyncHandler = require('express-async-handler');

const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body;

    const user = await userService.registerUser({
        name,
        email,
        password,
        role,
    });

    res.status(201).json({
        message: 'User registered successfully',
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        }
    });
});



const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const userData = await userService.loginUser({ email, password });

    res.status(200).json({
        message: 'Login successful',
        user: userData
    });
});


const getUserProfile = asyncHandler(async (req, res) => {
    if (req.user) {
        res.status(200).json({
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});


const getAllUsersController = asyncHandler(async (req, res) => {
    const users = await userService.getAllUsers();
    
    res.status(200).json({
        success: true,
        count: users.length,
        users
    });
});



module.exports = { 
    registerUser, 
    loginUser,
    getUserProfile,
    getAllUsersController
};
