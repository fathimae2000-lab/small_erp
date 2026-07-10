const { verifyToken } = require('../utils/jwtHelper');
const asyncHandler = require('express-async-handler');
const userRepository = require('../repositories/userRepository');

const protect = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const decoded = await verifyToken(token);

            if (decoded && decoded.valid) {
               
                const userId = decoded.userId || decoded.id; 
                const user = await userRepository.findUserById(userId); 
                
                if (!user) {
                    res.status(401);
                    throw new Error('Not authorized, user not found');
                }

                req.user = user; 
                return next(); 
            }
            
        } catch (error) {
            res.status(401);
            throw new Error(`Not authorized, token failed: ${error.message}`);
        }
    }

    if (!token) {
        res.status(401);
        throw new Error('Not authorized, no token');
    }
});

module.exports = { protect };