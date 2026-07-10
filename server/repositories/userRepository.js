const User = require('../models/User');

const createUser = async (userData) => {
    return await User.create(userData);
};

const findUserByEmail = async (email) => {
    return await User.findOne({ email });
};

const findUserById = async (id) => {
    return await User.findById(id).select('-password'); 
};
const findAllUsers = async () => {
    return await User.find({}).select('-password'); 
};
module.exports = { createUser, findUserByEmail, findUserById, findAllUsers };