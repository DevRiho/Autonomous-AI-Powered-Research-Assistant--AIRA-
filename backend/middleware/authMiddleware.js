const jwt = require('jsonwebtoken');
const { User } = require('../services/database');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'aira_super_secret_key_123');

            // Find user but don't include password
            req.user = await User.findById(decoded.id).select('-password');
            next();
        } catch (error) {
            console.error('Not authorized, token failed');
            res.status(401).json({ error: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ error: 'Not authorized, no token' });
    }
};

module.exports = { protect };
