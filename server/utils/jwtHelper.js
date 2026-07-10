require('dotenv').config({path: '../config/config.env'});
const jwt = require('jsonwebtoken')
const secret = process.env.JWT_SECRET
const createToken = (userId) => {
    const token = jwt.sign({ userId: userId }, secret, { expiresIn: '1h' });
    return token
}

const verifyToken = (token) => {
    return new Promise((resolve, reject) => {

        const formattedToken = token.replace('Bearer ', '')

        jwt.verify(formattedToken, secret, (err, decoded) => {

            if (err) {
                return reject({ valid: false, error: err })
            } else {
                resolve({ valid: true, userId: decoded.userId })
            }

        })
    })
}

module.exports = {
    createToken,
    verifyToken
}