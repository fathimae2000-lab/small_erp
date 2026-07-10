const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401);
            throw new Error('Not authorized, no user found');
        }

        if (!allowedRoles.includes(req.user.role)) {
            res.status(403); 
            throw new Error(`Role (${req.user.role}) is not allowed to access this resource`);
        }

       next();
    };
};

module.exports = { authorizeRoles };