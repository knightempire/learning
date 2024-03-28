const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const moment = require('moment');

// const authMiddleware = require('./authmiddleware');
const { generateOtpMiddleware, verifyOtpMiddleware } = require('./middleWare/otpgeneration');
const generateResponse = require('./middleWare/chat');

const app = express();
const port = 3000||null;


app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


const {
    DB_HOST,
    DB_USER,
    DB_PASSWORD,
    DB_DATABASE,
    DB_WAIT_FOR_CONNECTIONS,
    DB_CONNECTION_LIMIT,
    DB_QUEUE_LIMIT,
    SESSION_SECRET,
    JWT_SECRET,
    JWT_EXPIRY,
} = process.env;

const dbConfig = {
    host: DB_HOST,
    port: 10379,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_DATABASE,
    waitForConnections: DB_WAIT_FOR_CONNECTIONS === 'true', // Convert string to boolean
    connectionLimit: parseInt(DB_CONNECTION_LIMIT, 10),
    queueLimit: parseInt(DB_QUEUE_LIMIT, 10),
};


// Create a MySQL pool
const pool = mysql.createPool(dbConfig);
let paymentValue = 0;

// Session middleware configuration
app.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
}));


//function to create token
const createtoken = (req, res, rows) => {
    const token = jwt.sign({ email: rows[0].email }, JWT_SECRET, {
        expiresIn: JWT_EXPIRY,
    });
    app.use(session({
        secret: SESSION_SECRET, 
        resave: false,
        saveUninitialized: true,
    }));

    // Store token in session and set cookie
    req.session.jwtToken = token;
    return token;
}


//function to verify token
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





// Route for generating OTP
app.post('/api/generate-otp', async (req, res) => {
    try {
        const { phoneNumber } = req.body;

        // Check if the phone number exists in the database
        const [existingUser] = await pool.execute('SELECT * FROM users WHERE phoneNumber = ?', [phoneNumber]);

        if (existingUser.length > 0) {
            return res.status(409).json({ error: 'Phone number already exists' });
        } else {
            // Proceed to generate OTP if the phone number doesn't exist
            generateOtpMiddleware(req, res);
        }
    } catch (error) {
        console.error('Error generating OTP:', error);
        res.status(500).json({ error: 'Failed to generate OTP' });
    }
});

// Route for verifying OTP
app.post('/api/verify-otp', verifyOtpMiddleware);


app.post('/api/forgotgenerate-otp', async (req, res) => {
    try {
        const { phoneNumber } = req.body;

        // Check if the phone number exists in the database
        const [existingUser] = await pool.execute('SELECT * FROM users WHERE phoneNumber = ?', [phoneNumber]);

        if (existingUser.length === 0) {
            return res.status(404).json({ error: 'Phone number not registered' });
        } else {
            // Proceed to generate OTP if the phone number exists
            generateOtpMiddleware(req, res);
        }
    } catch (error) {
        console.error('Error generating OTP:', error);
        res.status(500).json({ error: 'Failed to generate OTP' });
    }
});


//Route for register
app.post('/api/register', async (req, res) => {
    const { name, username, password, phoneNumber, role } = req.body;

    try {
       

        // Check if the username is already taken
        const [existingUser] = await pool.execute('SELECT * FROM users WHERE username = ?', [username]);

        if (existingUser.length > 0) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Set default role if not provided
        const userRole = role || 'student';

        // Insert the new user into the database
        const [result] = await pool.execute('INSERT INTO users (name, username, password, phoneNumber, role) VALUES (?, ?, ?, ?, ?)', [name, username, hashedPassword, phoneNumber, userRole]);
        
        // Check if insertion was successful
        if (result.affectedRows === 1) {
            return res.status(201).json({ message: 'User registered successfully' });
        } else {
            throw new Error('Failed to register user');
        }
    } catch (error) {
        console.error('Error during registration:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});




//Route for login
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



//Route for chat
app.post('/message', async (req, res) => {
    const userInput = req.body.message;

    // Generate response using middleware
    const response = await generateResponse(userInput);
    res.json({ botResponse: response });
});


// Route for updating user data (username or password)
<<<<<<< HEAD
app.put('/api/users/:phoneNumber',  async (req, res) => {
=======
app.put('/api/users/:phoneNumber', async (req, res) => {
>>>>>>> parent of c1644f8 (authtokenverification)
    const { phoneNumber } = req.params;
    const { option, newData } = req.body;

    try {
        // Check if the option is valid
        if (option !== 'username' && option !== 'password') {
            return res.status(422).json({ error: 'Invalid option' });
        }

        // Create a connection pool
        const pool = await mysql.createPool(dbConfig);
        const connection = await pool.getConnection();

        if (option === 'username') {
            // Check if the new username is already taken
            const [existingUser] = await connection.query('SELECT * FROM users WHERE username = ?', [newData]);
            if (existingUser.length > 0) {
                return res.status(400).json({ error: 'Username already exists' });
            }

            // Update username
            const [result] = await connection.query('UPDATE users SET username = ? WHERE phoneNumber = ?', [newData, phoneNumber]);
            res.json({ message: 'Username updated successfully' });
        } else if (option === 'password') {
            // Update password
            const hashedPassword = await bcrypt.hash(newData, 10);
            const [result] = await connection.query('UPDATE users SET password = ? WHERE phoneNumber = ?', [hashedPassword, phoneNumber]);
            res.json({ message: 'Password updated successfully' });
        }

        connection.release();
    } catch (error) {
        console.error('Error updating user data:', error);
        res.status(500).json({ error: 'Failed to update user data' });
    }
});


//testing video


//making payment gpay
<<<<<<< HEAD
app.post('/api/paymentmake',  (req, res) => {
=======
app.post('/api/paymentmake', (req, res) => {
>>>>>>> parent of c1644f8 (authtokenverification)
    paymentValue = 1; // Set the payment value to 1
    console.log('Payment value set to 1');

    // Reset the payment value to 0 after 5 seconds
    setTimeout(() => {
        paymentValue = 0; // Reset the payment value to 0
        console.log('Payment value reset to 0 after 6 seconds');
    }, 6000);

    res.sendStatus(200);
});

//payment call
<<<<<<< HEAD
app.get('/api/paymentcall',  (req, res) => {
=======
app.get('/api/paymentcall', (req, res) => {
>>>>>>> parent of c1644f8 (authtokenverification)
    res.json({ value: paymentValue });
});


//payment 
app.post('/api/payment', async (req, res) => {
    const { user_id, amount, course_name } = req.body;

    try {
        // Get connection from the pool
        const connection = await pool.getConnection();

        // Query to select c_id from the course table based on the course name
        const selectCourseIdQuery = 'SELECT c_id FROM course WHERE course_name = ?';

        // Execute the query to get the c_id
        const [rows] = await connection.execute(selectCourseIdQuery, [course_name]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Course not found' });
        }

        const c_id = rows[0].c_id;

        // Format payment date properly
        const payment_date = new Date().toISOString().slice(0, 19).replace('T', ' '); // Get payment date in UTC format
        const payment_status = 'completed';

        // Insert payment details into the payment table
        const sql = 'INSERT INTO payment (user_id, amount, payment_date, payment_status, c_id) VALUES (?, ?, ?, ?, ?)';
        const [paymentResult] = await connection.execute(sql, [user_id, amount, payment_date, payment_status, c_id]);
        const p_id = paymentResult.insertId; // Get the inserted payment_id

        // Check if the student record already exists based on s_id
        const checkStudentSql = 'SELECT * FROM student WHERE s_id = ?';
        const [existingStudentRows] = await connection.execute(checkStudentSql, [user_id]);

        if (existingStudentRows.length === 0) {
            // Insert into the student table
            const joining_date = new Date().toISOString().slice(0, 10);
            const studentSql = 'INSERT INTO student (s_id, c_id, p_id, joining_date) VALUES (?, ?, ?, ?)';
            await connection.execute(studentSql, [user_id, c_id, p_id, joining_date]);
            console.log('New student record inserted successfully');
        } else {
            // Update the existing student record with new c_id, p_id, and joining_date
            const updateStudentSql = 'UPDATE student SET c_id = ?, p_id = ?, joining_date = ? WHERE s_id = ?';
            await connection.execute(updateStudentSql, [c_id, p_id, new Date().toISOString().slice(0, 10), user_id]);
            console.log('Existing student record updated successfully');
        }

        console.log('Payment details inserted successfully');
        res.status(200).json({ message: 'Payment details inserted successfully' });

        // Release the connection
        connection.release();
    } catch (error) {
        console.error('Error in payment route:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
}).on('error', (err) => {
    console.error('Server start error:', err);
});
