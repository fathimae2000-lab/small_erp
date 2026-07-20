const jwt = require('jsonwebtoken');

// Fallback or explicit check to make sure secret isn't undefined
const secret = process.env.JWT_SECRET;
if (!secret) {
    throw new Error('FATAL ERROR: JWT_SECRET is not defined in environment variables.');
}

const createToken = (userId) => {
    return jwt.sign({ userId: userId }, secret, { expiresIn: '1h' });
};

const verifyToken = (token) => {
    return new Promise((resolve, reject) => {
        const formattedToken = token.replace('Bearer ', '');

        jwt.verify(formattedToken, secret, (err, decoded) => {
            if (err) {
                return reject({ valid: false, error: err });
            } else {
                resolve({ valid: true, userId: decoded.userId });
            }
        });
    });
};

module.exports = {
    createToken,
    verifyToken
};