//function to create token
const {
    SESSION_SECRET,
    JWT_SECRET,
    JWT_EXPIRY,
} = process.env;

const jwt = require('jsonwebtoken');
const createtoken = (req, res, rows) => {
    const token = jwt.sign({ email: rows[0].email }, JWT_SECRET, {
        expiresIn: JWT_EXPIRY,
    });
    app.use(session({
        secret: SESSION_SECRET, 
        resave: false,
        saveUninitialized: true,
    }));
    req.session.jwtToken = token;
    return token;
}
module.exports = createtoken;