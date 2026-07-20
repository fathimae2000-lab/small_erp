const userRepository = require('../repositories/userRepository');
const { hashPassword } = require('../utils/PasswordHelper'); 
const { createToken } = require('../utils/jwtHelper');
const bcrypt = require('bcryptjs');

const registerUser = async ({ name, email, password, role }) => {
    const existingUser = await userRepository.findUserByEmail(email);
    if (existingUser) {
        res.status(400); 
        throw new Error('User already exists with this email');
    }

    const hashedPassword = hashPassword(password);


    

    return await userRepository.createUser({
        name,
        email,
        password: hashedPassword,
        role
    });
};



const loginUser = async ({ email, password }) => {
    const user = await userRepository.findUserByEmail(email);
    if (!user) {
        throw new Error('Invalid email or password');
    }

    const isPasswordMatch = bcrypt.compareSync(password, user.password);
    if (!isPasswordMatch) {
        throw new Error('Invalid email or password');
    }

    return {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: createToken(user._id)
    };
};

const getAllUsers = async () => {
    const users = await userRepository.findAllUsers();
    
    if (!users || users.length === 0) {
        throw new Error('No users found');
    }
    
    return users;
};

module.exports = { registerUser, loginUser ,getAllUsers};