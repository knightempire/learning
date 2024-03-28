const jwt = require('jsonwebtoken');

const {
    JWT_SECRET,
} = process.env;

const authenticateToken = (req, res, next) => {
    try {
        if (!req.headers.authorization) {
            return res.redirect('/index.html'); 
        }
        const token = req.headers.authorization.split(' ')[1];

        jwt.verify(token,JWT_SECRET, (err, decoded) => {
            if (err) {
                console.error('Authentication error:', err.message);
                return res.status(401).json({ error: 'Unauthorized' });
            } else {
                const email = decoded.email;
                req.body.email = email;

                next();
            }
        });
    } catch (err) {
        console.error('Error in authentication middleware:', err.message);
        res.status(500).send('Internal Server Error');
    }
};

module.exports = authenticateToken;
