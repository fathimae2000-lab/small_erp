const { verifyToken } = require('../utils/jwtHelper');
const asyncHandler = require('express-async-handler');
const userRepository = require('../repositories/userRepository');

const protect = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization; // keep header format, verifyToken handles .replace()

            const result = await verifyToken(token);

            if (result && result.valid) {
                const user = await userRepository.findUserById(result.userId); 
                
                if (!user) {
                    res.status(401);
                    throw new Error('Not authorized, user not found');
                }

                req.user = user; 
                return next(); 
            } else {
                res.status(401);
                throw new Error('Not authorized, token is invalid');
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