const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const cookieParser = require('cookie-parser');
// const authMiddleware = require('./authmiddleware');

const dbConfig = {
    host: "localhost",
    user: "root",
    password: "",
    database: "learning",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
};

const app = express();
const port = 3000;

// Create a MySQL pool
const pool = mysql.createPool(dbConfig);

// Session middleware configuration
app.use(session({
    secret: 'learn@1234', // You should change this to a more secure key
    resave: false,
    saveUninitialized: true,
}));

// Use the cors middleware
app.use(cors());

app.use(express.json());
app.use(cookieParser());

const createtoken = (req, res, rows) => {
    const token = jwt.sign({ email: rows[0].email }, "learn@1234", {
        expiresIn: '30m', // Token expiry time
    });
    app.use(session({
        secret: 'learn@1234', // You should change this to a more secure key
        resave: false,
        saveUninitialized: true,
    }));

    // Store token in session and set cookie
    req.session.jwtToken = token;
    return token;
}

const authenticateToken = (req, res, next) => {
    try {
        // Check if Authorization header exists
        if (!req.headers.authorization) {
            return res.redirect('/index.html'); // Redirect to login page
        }

        // Retrieve token from request headers and split it
        const token = req.headers.authorization.split(' ')[1];
        console.log("Token:", token); // Print token value

        // Verify token
        jwt.verify(token, "learn@1234", (err, user) => {
            if (err) {
                console.error('Authentication error:', err.message);
                // Token is invalid or expired, send 401 Unauthorized response to client
                return res.status(401).json({ error: 'Unauthorized' });
            } else {
                req.user = user; // Set user information in request object
                next(); // Proceed to next middleware
            }
        });
    } catch (err) {
        console.error('Error in authentication middleware:', err.message);
        res.status(500).send('Internal Server Error');
    }
};

app.post('/api/register', async (req, res) => {
    const { name, username, password, role } = req.body;

    try {
        // Check if the username is already taken
        console.log("api register is connected")
        const [existingUser] = await pool.execute('SELECT * FROM users WHERE username = ?', [username]);

        if (existingUser.length > 0) {
            console.log("username already exists")
            return res.status(400).json({ error: 'Username already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Set default role if not provided
        const userRole = role || 'student';

        // Insert the new user into the database
        await pool.execute('INSERT INTO users (name, username, password, role) VALUES (?, ?, ?, ?)', [name, username, hashedPassword, userRole]);
        console.log("api registered successfully")
        res.status(201).json({ message: 'User registered successfully' });

    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        console.log("api login is connected")
        // Query the database to check if the provided username exists
        const [existingUser] = await pool.execute('SELECT * FROM users WHERE username = ?', [username]);

        if (existingUser.length === 0) {
            // If the username doesn't exist, return an error
            console.log("no user found")
            return res.status(400).json({ error: 'Invalid username ' });
        }

        // Verify the password
        const isPasswordValid = await bcrypt.compare(password, existingUser[0].password);

        if (!isPasswordValid) {
            // If the password is incorrect, return an error
            console.log("password invalid")
            return res.status(400).json({ error: 'Invalid password' });
        }

        // User is authenticated
        const token = createtoken(req, res, existingUser); // Call the createtoken function with req and res
        console.log(token)

        res.json({ isValid: true, token });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
}).on('error', (err) => {
    console.error('Server start error:', err);
});
