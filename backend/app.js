const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const moment = require('moment');
const fs = require('fs').promises;
const csv = require('csv-parser');
const XLSX = require('xlsx');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const multer = require('multer');
const fetch = require('node-fetch');

// Define storage configuration
const storage = multer.memoryStorage();

// Initialize multer with storage configuration
const upload = multer({
    storage: storage, // Use memory storage
    limits: {
        fileSize: 10 * 1024 * 1024 // Set file size limit to 10MB
    }
});
// Now you can use the upload middleware in your routes

// const authMiddleware = require('./authmiddleware');
const { generateOtpMiddleware, verifyOtpMiddleware } = require('./middleWare/otpgeneration');
const generateResponse = require('./middleWare/chat');


const app = express();
const port = 3000 || null;


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
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
} = process.env;

const dbConfig = {
    host: DB_HOST,
    // port: 10379,
    port: 19516,
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

(async() => {
    try {
        // Attempt to get a connection from the pool
        const connection = await pool.getConnection();

        // If connection successful, log a success message
        console.log('Database connected successfully');

        // Release the connection back to the pool
        connection.release();
    } catch (error) {
        // Log an error message if connection fails
        console.error('Error connecting to the database:', error);
        process.exit(1); // Terminate the application process
    }
})();


app.use(passport.initialize());
app.use(passport.session());

passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:3000/auth/google/callback'
}, (accessToken, refreshToken, profile, done) => {
    // You can handle the user's profile here (e.g., save to database)
    return done(null, profile);
}));

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});


app.get('/proxy/google/oauth', async(req, res) => {
    try {
        const response = await fetch('https://accounts.google.com/o/oauth2/v2/auth?response_type=code&redirect_uri=https%3A%2F%2Feduwel.onrender.com%2Flogin.html&client_id=290997095546-oec6je9hb7sl1cj0injd3stjmi12tprs.apps.googleusercontent.com');
        const data = await response.text();
        res.send(data);
    } catch (error) {
        console.error('Error proxying Google OAuth request:', error);
        res.status(500).send('Internal Server Error');
    }
});


app.get('/auth/google',
    passport.authenticate('google', {
        scope: ['profile', 'email', 'openid', 'https://www.googleapis.com/auth/user.birthday.read', 'https://www.googleapis.com/auth/user.phonenumbers.read']
    }));


// Google OAuth callback route

app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: 'http://10.12.68.177:5500/login.html' }),
    async(req, res) => {
        try {
            // Extract user's email from the Google OAuth response
            const email = req.user.emails[0].value;
            const givenName = req.user.name.givenName; // Access given name

            console.log(email, givenName)

            // Check if the user already exists in the database
            const [existingUser] = await pool.query('SELECT * FROM users WHERE username = ?', [email]);

            if (!existingUser.length) {
                // If the user doesn't exist, register the user
                const username = email;
                const hashedPassword = await bcrypt.hash(email, 10); // Assuming email as default password for Google users
                const role = 'student'; // Default role for new users

                await pool.execute('INSERT INTO users (name, username, password, role) VALUES (?, ?, ?, ?)', [givenName, username, hashedPassword, role]);

                // Retrieve the newly created user
                const [newUser] = await pool.query('SELECT * FROM users WHERE username = ?', [email]);

                // Proceed with login using the provided username (email) and password (also email)
                const loginResponse = await loginUser({ username: email, password: email }); // Assuming loginUser function is implemented

                if (loginResponse.isValid) {
                    // Create token for the newly registered user
                    const token = createtoken(req, res, newUser);

                    // Send all necessary data including the token as a response to the login.html page
                    const responseData = {
                        isValid: true,
                        responseNumber: loginResponse.responseNumber,
                        token: token,
                        // Add any additional data you want to send
                    };

                    // Redirect the user to the login.html page with the response data as query parameters
                    const redirectUrl = `./login.html?${new URLSearchParams(responseData).toString()}`;
                    res.redirect(redirectUrl);
                } else {
                    // If login is unsuccessful, return an error
                    res.status(400).json({ error: 'Login failed' });
                }
            } else {
                // Proceed with login using the provided username (email) and password (also email)
                const loginResponse = await loginUser({ username: email, password: email }); // Assuming loginUser function is implemented

                if (loginResponse.isValid) {
                    // Create token for the existing user
                    const token = createtoken(req, res, existingUser);

                    // Send all necessary data including the token as a response to the login.html page
                    const responseData = {
                        isValid: true,
                        responseNumber: loginResponse.responseNumber,
                        token: token,
                        // Add any additional data you want to send
                    };

                    // Redirect the user to the login.html page with the response data as query parameters
                    const redirectUrl = `http://10.12.68.177:5500/login.html?${new URLSearchParams(responseData).toString()}`;
                    res.redirect(redirectUrl);
                } else {
                    // If login is unsuccessful, return an error
                    res.status(400).json({ error: 'Login failed' });
                }
            }
        } catch (error) {
            console.error('Error during OAuth callback:', error);
            res.status(500).send('Internal Server Error');
        }
    });



// Function to handle user login
async function loginUser(credentials) {
    try {
        // Extract username and password from credentials
        const { username, password } = credentials;

        // Query the database to check if the provided username exists
        const [existingUser] = await pool.execute('SELECT * FROM users WHERE username = ?', [username]);

        if (existingUser.length === 0) {
            // If the username doesn't exist, return an error
            console.log("no user found");
            return { isValid: false, error: 'Invalid username' };
        }

        // Verify the password
        const isPasswordValid = await bcrypt.compare(password, existingUser[0].password);

        if (!isPasswordValid) {
            // If the password is incorrect, return an error
            console.log("password invalid");
            return { isValid: false, error: 'Invalid password' };
        }

        // Get the role from the existingUser object
        const role = existingUser[0].role;

        // Determine the role-specific response number
        let responseNumber;
        if (role === 'student') {
            // Check if the user is also in the student table
            const [studentResult] = await pool.execute('SELECT s_id FROM student WHERE s_id = ?', [existingUser[0].user_id]);
            responseNumber = studentResult.length > 0 ? 2 : 1; // If user is in student table, set responseNumber to 2, else 1
        } else if (role === 'mentor') {
            // Query the mentors table to get mentor details based on user_id
            const [mentorResult] = await pool.execute('SELECT position FROM mentors WHERE m_id = ?', [existingUser[0].user_id]);

            if (mentorResult.length === 0) {
                // If mentor data is not found, return an error
                console.log("Mentor data not found");
                return { isValid: false, error: 'Mentor data not found' };
            }

            const mentorPosition = mentorResult[0].position;

            if (mentorPosition === 'handling') {
                responseNumber = 4; // Response number for handling mentor
            } else if (mentorPosition === 'head') {
                responseNumber = 3; // Response number for head mentor
            } else {
                // If the mentor position is neither 'handling' nor 'head', return an error
                console.log("Invalid mentor position");
                return { isValid: false, error: 'Invalid mentor position' };
            }
        }

        // Log the responseNumber
        console.log("responseNumber:", responseNumber);

        // User is authenticated
        return { isValid: true, responseNumber };

    } catch (error) {
        console.error('Error during login:', error);
        return { isValid: false, error: 'Internal Server Error' };
    }
}


//function to create token
const createtoken = (req, res, rows) => {
    // Assuming rows contain user data with a username field
    const username = rows[0].username;

    // Sign the token with the username instead of email
    const token = jwt.sign({ username: username }, JWT_SECRET, {


        expiresIn: JWT_EXPIRY,
    });

    // Assuming you are using Express and want to store the token in the session
    req.session.jwtToken = token;

    // Return the token
    return token;
};



// Route for login
app.post('/api/login', async(req, res) => {
    const { username, password } = req.body;

    try {
        console.log('api login requested');
        console.log(username)

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

        // Get the role from the existingUser object
        const role = existingUser[0].role;



        // Determine the role-specific response number
        let responseNumber;
        if (role === 'student') {
            // Check if the user is also in the student table
            const [studentResult] = await pool.execute('SELECT s_id FROM student WHERE s_id = ?', [existingUser[0].user_id]);
            responseNumber = studentResult.length > 0 ? 2 : 1; // If user is in student table, set responseNumber to 2, else 1
        } else if (role === 'mentor') {
            // Query the mentors table to get mentor details based on user_id
            const [mentorResult] = await pool.execute('SELECT position FROM mentors WHERE m_id = ?', [existingUser[0].user_id]);

            if (mentorResult.length === 0) {
                // If mentor data is not found, return an error
                console.log("Mentor data not found");
                return res.status(400).json({ error: 'Mentor data not found' });
            }

            const mentorPosition = mentorResult[0].position;

            if (mentorPosition === 'handling') {
                responseNumber = 4; // Response number for handling mentor
            } else if (mentorPosition === 'head') {
                responseNumber = 3; // Response number for head mentor
            } else {
                // If the mentor position is neither 'handling' nor 'head', return an error
                console.log("Invalid mentor position");
                return res.status(400).json({ error: 'Invalid mentor position' });
            }
        }


        // Log the responseNumber
        console.log("responseNumber:", responseNumber);

        // User is authenticated
        const token = createtoken(req, res, existingUser); // Call the createtoken function with req and res
        console.log("token:", token);

        res.json({ isValid: true, responseNumber, token });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// Route for register
app.post('/api/register', async(req, res) => {
    console.log('Received data for registration:', req.body);
    const { name, username, password, role } = req.body;

    try {
        console.log('api register requested');

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
        const [result] = await pool.execute('INSERT INTO users (name, username, password, role) VALUES (?, ?,  ?, ?)', [name, username, hashedPassword, userRole]);

        // Check if insertion was successful
        if (result.affectedRows === 1) {
            // Redirect to login after successful registration
            return res.redirect('/api/login', { username, password });
        } else {
            throw new Error('Failed to register user');
        }
    } catch (error) {
        console.error('Error during registration:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});


//function to verify token
// Middleware to authenticate token and retrieve user data
// async function getUserDataByUsername(username) {
//     try {
//         // Query the database to find the user by username
//         const user = await User.findOne({ username });

//         // If user is found, return user data
//         if (user) {
//             return {
//                 id: user.id,
//                 username: user.username,
//                 email: user.email,
//                 // Add other user data properties as needed
//             };
//         } else {
//             return null; // Return null if user is not found
//         }
//     } catch (error) {
//         console.error('Error fetching user data:', error.message);
//         throw error; // Throw error for handling in the calling code
//     }
// }

const authenticateToken = async(req, res, next) => {
    try {
        // Check if Authorization header exists
        if (!req.headers.authorization) {
            return res.status(401).json({ error: 'Unauthorized' }); // Return 401 Unauthorized status
        }

        // Retrieve token from request headers and split it
        const token = req.headers.authorization.split(' ')[1];
        console.log("Token:", token); // Print token value

        // Verify token
        jwt.verify(token, "learn@1234", async(err, decodedToken) => {
            if (err) {
                console.error('Authentication error:', err.message);
                // Token is invalid or expired, send 401 Unauthorized response to client
                return res.status(401).json({ error: 'Unauthorized' });
            } else {
                console.log('Decoded Token:', decodedToken); // Print decoded token data

                // Decode the token to get the username
                const username = decodedToken.username;
                console.log(username)

                // Retrieve user data from the database based on the username
                const userData = await getUserDataByUsername(username);

                if (!userData) {
                    // User not found in the database, send 401 Unauthorized response
                    console.error('User not found');
                    return res.status(401).json({ error: 'Unauthorized' });
                }

                // Set user information in request object
                req.user = userData;
                next(); // Proceed to next middleware
            }
        });
    } catch (err) {
        console.error('Error in authentication middleware:', err.message);
        res.status(500).send('Internal Server Error');
    }
};




//decoding the token
app.post('/api/decodeToken', async(req, res) => {
    console.log('api decode requested');
    try {
        // Extract the token from the request body
        const { token } = req.body;

        console.log(token)

        // Verify and decode the token
        const decodedToken = jwt.verify(token, JWT_SECRET);
        // console.log(decodedToken)

        // Extract username from decoded token
        const { username } = decodedToken;

        // Get a connection from the pool
        const connection = await pool.getConnection();

        try {
            // Query the database to retrieve user data based on username
            const [rows] = await connection.execute('SELECT user_id,name,username FROM users WHERE username = ?', [username]);

            // Check if user exists in the database
            if (rows.length === 0) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Get the user data from the query results
            const userData = rows[0];
            console.log('decoded token');

            // Send user data back to the client
            res.status(200).json(userData);
        } catch (error) {
            console.error('Error querying database:', error.message);
            res.status(500).json({ error: 'Internal server error' });
        } finally {
            // Release the connection back to the pool
            connection.release();
        }
    } catch (error) {
        // Handle any errors, such as token validation failure
        console.error('Error decoding token:', error.message);
        res.status(400).json({ error: 'Failed to decode token' });
    }
});



// Route for generating OTP
app.post('/api/generate-otp', async(req, res) => {
    try {
        console.log('api generate otp requested');
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
        res.status(500).json({ error: 'Error in OTP' });
    }
});

// Route for verifying OTP
app.post('/api/verify-otp', verifyOtpMiddleware);


app.post('/api/forgotgenerate-otp', async(req, res) => {
    try {
        console.log('api forgot otp requested');
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
        res.status(500).json({ error: 'Phone number not registered' });
    }
});




//Route for mentor
app.post('/api/registermentor', async(req, res) => {
    const { name, username, course_name, role } = req.body;
    const defaultPassword = 'mentor'; // Define the default password for mentors

    try {
        console.log('API registermentor requested');

        // Check if the username is already taken
        const [existingUser] = await pool.execute('SELECT * FROM users WHERE username = ?', [username]);

        if (existingUser.length > 0) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        // Set default role as mentor if not provided
        const userRole = role || 'mentor';

        // Hash the default password
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);

        // Insert the new user (mentor) into the users table
        const [userInsertResult] = await pool.execute('INSERT INTO users (name, username, password,  role) VALUES (?, ?, ?,  ?)', [name, username, hashedPassword, userRole]);

        // Check if insertion was successful
        if (userInsertResult.affectedRows === 1) {
            const userId = userInsertResult.insertId; // Get the user ID

            // Get the course ID from the course table using the course name
            const [courseResult] = await pool.execute('SELECT c_id FROM course WHERE course_name = ?', [course_name]);

            if (courseResult.length === 0) {
                throw new Error('Course not found');
            }

            const courseId = courseResult[0].c_id;

            // Insert user ID into mentors table with additional information
            const [mentorInsertResult] = await pool.execute('INSERT INTO mentors (c_id, m_id) VALUES (?, ?)', [courseId, userId]);

            if (mentorInsertResult.affectedRows !== 1) {
                throw new Error('Failed to insert into mentors table');
            }

            return res.status(201).json({ message: 'Mentor registered successfully' });
        } else {
            throw new Error('Failed to register mentor');
        }
    } catch (error) {
        console.error('Error during mentor registration:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});










//Route for chat
app.post('/message', async(req, res) => {
    console.log('api chat bot requested');
    const userInput = req.body.message;

    // Generate response using middleware
    const response = await generateResponse(userInput);
    res.json({ botResponse: response });
});


// Route for updating user data (username or password)
app.put('/api/users/:phoneNumber', async(req, res) => {
    const { phoneNumber } = req.params;
    const { option, newData } = req.body;

    try {
        console.log('api users update requested');
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
app.post('/api/paymentmake', (req, res) => {
    console.log('api gpay paymentmake requested');
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
app.get('/api/paymentcall', (req, res) => {
    // console.log('api gpay paymentcall requested');
    res.json({ value: paymentValue });
});




// Route for processing payment
app.post('/api/payment', async(req, res) => {
    const { user_id, amount, course_name, payment_date } = req.body;

    try {
        console.log('API payment requested');

        // Get the c_id from the course table based on the provided course_name
        const [courseData] = await pool.execute('SELECT c_id FROM course WHERE course_name = ?', [course_name]);

        if (courseData.length === 0) {
            // If the course doesn't exist, return an error
            console.log("Course not found")
            return res.status(404).json({ error: 'Course not found' });
        }

        const c_id = courseData[0].c_id;

        // Set payment status to completed
        const payment_status = 'completed';

        // Insert payment details into the payment table
        const [paymentResult] = await pool.execute('INSERT INTO payment (user_id, amount, payment_date, payment_status, c_id) VALUES (?, ?, ?, ?, ?)', [user_id, amount, payment_date, payment_status, c_id]);

        if (paymentResult.affectedRows === 1) {
            // If insertion was successful, get the auto-generated p_id
            const p_id = paymentResult.insertId;

            // Get the current date for joining_date
            const joining_date = new Date().toISOString().slice(0, 10); // Keep only date

            // Insert student details into the student table
            const [studentResult] = await pool.execute('INSERT INTO student (s_id, c_id, p_id, joining_date) VALUES (?, ?, ?, ?)', [user_id, c_id, p_id, joining_date]);

            if (studentResult.affectedRows === 1) {
                // If insertion was successful, return a success message
                return res.status(201).json({ message: 'Payment and student registration successful' });
            } else {
                // If insertion failed, return an error
                throw new Error('Failed to register student');
            }
        } else {
            // If payment insertion failed, return an error
            throw new Error('Failed to process payment');
        }
    } catch (error) {
        console.error('Error during payment processing:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



// Route for retrieving payment data using POST method
app.post('/api/viewpayment', async(req, res) => {
    const { user_id } = req.body; // Assuming user_id is passed in the request body

    try {
        console.log('API viewpayment requested');

        // Query the database to retrieve payment data for the provided user ID
        const [paymentData] = await pool.execute(`
            SELECT * FROM payment WHERE user_id = ?
        `, [user_id]);

        // Check if any payment data is found for the provided user ID
        if (paymentData.length === 0) {
            // If no payment data is found, return an error
            console.log("No payment data found for the provided user ID")
            return res.status(404).json({ error: 'No payment data found for the provided user ID' });
        }

        // Iterate over each payment data to get the course name for each c_id
        for (const payment of paymentData) {
            const { c_id } = payment;
            const [courseNameData] = await pool.execute(`
                SELECT course_name FROM course WHERE c_id = ?
            `, [c_id]);
            // Assuming each payment has a corresponding course ID (c_id) and course name is retrieved
            payment.course_name = courseNameData[0].course_name;
        }

        // Payment data found, return it
        res.status(200).json({ data: paymentData });
    } catch (error) {
        console.error('Error retrieving payment data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// Route for checking student
app.post('/api/checkstudent', async(req, res) => {
    const { s_id } = req.body;

    try {
        console.log('api checkstudent requested');
        // Query the database to check if the provided student ID exists
        const [existingStudent] = await pool.execute('SELECT * FROM student WHERE s_id = ?', [s_id]);

        if (existingStudent.length === 0) {
            // If the student ID doesn't exist, return an error
            console.log("Student not found")
            return res.status(404).json({ error: 'Student not found' });
        }

        // Student is found, return student data
        res.status(200).json({ data: existingStudent[0] });
    } catch (error) {
        console.error('Error during student check:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});




// Route for retrieving course data by c_id for a student
app.post('/api/studentcourse', async(req, res) => {
    const { c_id } = req.body;

    try {
        console.log('API studentcourse requested');
        // Query the database to retrieve all data from the course table for the provided c_id
        const [courseData] = await pool.execute('SELECT * FROM course WHERE c_id = ?', [c_id]);

        if (courseData.length === 0) {
            // If no course data found for the provided c_id, return an error
            console.log("Course data not found")
            return res.status(404).json({ error: 'Course data not found' });
        }

        // Return the course data
        res.status(200).json({ data: courseData });
    } catch (error) {
        console.error('Error retrieving course data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



//courses
app.get('/api/courselist', async(req, res) => {
    try {

        const [rows] = await pool.query('SELECT c_id, course_name FROM course');
        if (!Array.isArray(rows)) {
            throw new Error('Data returned from query is not an array');
        }

        console.log("API courselist requested")
        res.json(rows);
    } catch (error) {
        console.error('Error fetching:', error);
        res.status(500).json({ error: 'An error occurred while fetching' });
    }
});


//upload video
app.post('/api/uploadvideo', async(req, res) => {
    const { title, video_url, c_id } = req.body;

    try {
        console.log('API uploadvideo requested');

        // Insert the new lecture into the database
        const [result] = await pool.execute('INSERT INTO lecture (title, video_url, c_id) VALUES (?, ?, ?)', [title, video_url, c_id]);

        // Check if insertion was successful
        if (result.affectedRows === 1) {
            return res.status(201).json({ message: 'Video uploaded successfully' });
        } else {
            throw new Error('Failed to upload video');
        }
    } catch (error) {
        console.error('Error during video upload:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});


// Route for retrieving lecture data
app.post('/api/lecture', async(req, res) => {
    const { s_id } = req.body; // Assuming s_id is passed in the request body

    try {
        console.log('API lecture requested');

        // Query the database to retrieve course ID (c_id) and course name for the provided student ID (s_id)
        const [studentData] = await pool.execute('SELECT c_id FROM student WHERE s_id = ?', [s_id]);

        // Check if any course ID is found for the provided student ID
        if (studentData.length === 0) {
            // If no course ID is found, return an error
            console.log("No course found for the provided student ID")
            return res.status(404).json({ error: 'No course found for the provided student ID' });
        }

        // Extract the course ID (c_id) from the retrieved student data
        const { c_id } = studentData[0];

        // Query the database to retrieve lecture data and course name based on the obtained course ID
        const [lectureData] = await pool.execute(`
            SELECT lecture.*, course.course_name 
            FROM lecture 
            JOIN course ON lecture.c_id = course.c_id 
            WHERE lecture.c_id = ?
        `, [c_id]);

        // Check if any lecture data is found for the obtained course ID
        if (lectureData.length === 0) {
            // If no lecture data is found, return an error
            console.log("No lectures found for the provided course ID")
            return res.status(404).json({ error: 'No lectures found for the provided course ID' });
        }

        // Lecture data found, return it
        res.status(200).json({ data: lectureData });
    } catch (error) {
        console.error('Error retrieving lecture data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



// Route for retrieving quiz data
app.post('/api/quiz', async(req, res) => {
    const { c_id } = req.body; // Assuming c_id is passed in the request body

    try {
        console.log('API quiz requested');
        // Query the database to retrieve quiz data based on the provided course ID
        const [quizData] = await pool.execute(` SELECT q.*, l.title   FROM quiz q  JOIN lecture l ON q.lecture_id = l.lecture_id WHERE q.c_id = ?; `, [c_id]);


        // Check if any quiz data is found for the provided course ID
        if (quizData.length === 0) {
            // If no quiz data is found, return an error
            console.log("No quizzes found for the provided course ID")
            return res.status(404).json({ error: 'No quizzes found for the provided course ID' });
        }

        // Quiz data found, return it
        res.status(200).json({ data: quizData });
    } catch (error) {
        console.error('Error retrieving quiz data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// Route for adding new quiz
app.post('/api/uploadquiz', async(req, res) => {
    const { c_id, lecture_id, no_of_questions, total_marks } = req.body;

    try {
        console.log('API quiz upload requested');
        // Insert the quiz data into the database
        await pool.execute('INSERT INTO quiz (c_id, lecture_id, no_of_questions, total_marks) VALUES (?, ?, ?, ?)', [c_id, lecture_id, no_of_questions, total_marks]);

        // Return success message
        res.status(200).json({ message: 'Quiz data uploaded successfully' });
    } catch (error) {
        console.error('Error uploading quiz data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// POST endpoint to retrieve all quiz information based on q_id in the request body
app.post('/api/quizinfo', async(req, res) => {
    const { q_id } = req.body;

    try {
        console.log('API quizinfo requested for quiz ID:', q_id);

        // Query the database to get all quiz information based on q_id
        const [quizInfoRows] = await pool.execute('SELECT * FROM quiz_info WHERE q_id = ?', [q_id]);

        // Check if any quiz information exists
        if (quizInfoRows.length === 0) {
            return res.status(404).json({ error: 'No quiz information found for the provided quiz ID' });
        }

        // Return the array of quiz information
        res.status(200).json({ quizInfo: quizInfoRows });
    } catch (error) {
        console.error('Error fetching quiz information:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// Route for adding quiz information
app.post('/api/uploadquizinfo', async(req, res) => {
    const { q_id, question, a, b, c, d, answer } = req.body;

    try {
        console.log('API quiz info upload requested');
        // Insert the quiz information into the database
        await pool.execute('INSERT INTO quiz_info (q_id, question, a, b, c, d, answer) VALUES (?, ?, ?, ?, ?, ?, ?)', [q_id, question, a, b, c, d, answer]);

        // Return success message
        res.status(200).json({ message: 'Quiz information uploaded successfully' });
    } catch (error) {
        console.error('Error uploading quiz information:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// Route for uploading quiz information from an Excel file
app.post('/api/quizinfoes/upload', upload.single('excelFile'), async(req, res) => {
    try {
        // Ensure that a file was uploaded
        console.log('api quiz excel upload');
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Read the uploaded Excel file
        const workbook = XLSX.read(req.file.buffer);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const excelData = XLSX.utils.sheet_to_json(sheet);

        // Ensure that the Excel data is not empty
        if (excelData.length === 0) {
            return res.status(400).json({ message: 'Empty file or incorrect format' });
        }

        // Prepare the data for insertion into the database
        const values = excelData.map(row => [
            req.body.q_id, // Use q_id from the request body
            row.question,
            row.a,
            row.b,
            row.c,
            row.d,
            row.answer
        ]);

        // Prepare the SQL query
        const query = `INSERT INTO quiz_info (q_id, question, a, b, c, d, answer) VALUES ?`;

        // Get a connection from the pool
        const connection = await pool.getConnection();

        // Execute the insert query
        await connection.query(query, [values]);

        // Release the connection back to the pool
        connection.release();

        console.log('Quiz information inserted successfully');
        res.json({ message: 'Quiz information inserted successfully' });
    } catch (error) {
        console.error('Error inserting quiz information:', error);
        res.status(500).json({ message: 'Error inserting quiz information into database' });
    }
});


//list of university
app.get('/api/universities', async(req, res) => {
    try {
        // Read universities JSON file
        console.log('API university requested');
        const universitiesData = await fs.readFile('../assets/universities.json', 'utf8');
        const universities = JSON.parse(universitiesData);

        // Send universities data as JSON response
        res.json(universities);
    } catch (error) {
        // Handle errors
        console.error('Error reading universities data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Route for storing profile data
app.post('/api/studentprofile', async(req, res) => {
    const { s_id, name, email, phone, pincode, District, State, DOB, age, skills, grade_point_average, education_level, university } = req.body;

    try {
        console.log('API profile requested');

        // Check if profile data already exists for the provided s_id
        const [existingProfile] = await pool.execute('SELECT * FROM student_profile WHERE s_id = ?', [s_id]);
        if (existingProfile.length > 0) {
            // Profile data already exists, return a message indicating duplicate entry
            console.log('Profile data already exists for the provided s_id');
            return res.status(409).json({ error: 'Profile data already exists for the provided s_id' });
        }

        // Store profile data in the database
        const [result] = await pool.execute(`
            INSERT INTO student_profile (s_id, name, email, phone, pincode, district, state, DOB, age, skills, grade_point_average, education_level, university) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [s_id, name, email, phone, pincode, District, State, DOB, age, JSON.stringify(skills), grade_point_average, education_level, university]);

        if (result.affectedRows === 1) {
            // Profile data stored successfully
            console.log('Profile data stored successfully');
            res.status(200).json({ message: 'Profile data stored successfully' });
        } else {
            // Error storing profile data
            console.log('Error storing profile data');
            res.status(500).json({ error: 'Error storing profile data' });
        }
    } catch (error) {
        // Internal Server Error
        console.error('Error storing profile data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});




// Route for checking student profile
app.post('/api/checkstudentprofile', async(req, res) => {
    const { s_id } = req.body;

    try {
        console.log('API check student profile requested');

        if (s_id) {
            const query = `SELECT * FROM student_profile WHERE s_id = ${s_id}`;
            const [studentProfileData] = await pool.execute(query);

            if (studentProfileData.length > 0) {
                res.status(200).json({ studentProfile: studentProfileData[0] });
            } else {
                res.status(404).json({ error: 'Student profile not found' });
            }
        } else {
            // If s_id is not provided, return an error message
            res.status(400).json({ error: 's_id parameter is required' });
        }
    } catch (error) {
        console.error('Error fetching student profile data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



// Route for fetching mentor dashboard based on user_id
app.post('/api/mentordashboard', async(req, res) => {
    try {
        console.log('API mentor dashboard requested');
        const { user_id } = req.body;

        // Query the database to check if the user_id exists in the mentors table as m_id
        const [mentor] = await pool.execute(`
            SELECT * FROM mentors WHERE m_id = ?;
        `, [user_id]);

        // If mentor exists, return success response with mentor details
        if (mentor.length > 0) {
            res.json({ mentorExists: true, mentorDetails: mentor });
        } else {
            res.json({ mentorExists: false });
        }
    } catch (error) {
        console.error('Error fetching mentor dashboard:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// Route for fetching student details based on c_id
app.post('/api/liststudent', async(req, res) => {
    try {
        console.log('API student list requested');
        const { c_id } = req.body; // Extract c_id from request body

        // Query the database to fetch student details based on c_id
        const [studentDetails] = await pool.execute(`
        SELECT 
        student.*, 
        mentors.name AS mentor_name,
        student_profile.m_id, 
        users.name AS student_name, 
        users.username AS student_username
    FROM 
        student
    LEFT JOIN 
        student_profile ON student.s_id = student_profile.s_id
    LEFT JOIN 
        users ON student.s_id = users.user_id
    LEFT JOIN 
        users AS mentors ON student_profile.m_id = mentors.user_id
    WHERE 
        student.c_id = ?; 
    
        `, [c_id]);

        // Send the student details as a JSON response
        res.json(studentDetails);
    } catch (error) {
        console.error('Error fetching student details:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



// Route for fetching mentors details based on c_id
app.post('/api/listmentor', async(req, res) => {
    try {
        console.log('API mentor list requested');
        const { c_id } = req.body; // Extract c_id from request body

        // Query the database to fetch mentors details based on c_id
        const [mentorDetails] = await pool.execute(`
            SELECT mentors.*, users.name, users.username
            FROM mentors
            INNER JOIN users ON mentors.m_id = users.user_id
            WHERE mentors.c_id = ?
        `, [c_id]);

        // Send the mentor details as a JSON response
        res.json(mentorDetails);
    } catch (error) {
        console.error('Error fetching mentor details:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



// Route for fetching student details without a mentor
app.post('/api/studentwithoutmentor', async(req, res) => {
    try {
        console.log('API student withou mentor requested');
        const { c_id } = req.body; // Extract c_id from request body

        // Query the database to fetch student details based on c_id where m_id is null or empty
        const [studentsWithoutMentor] = await pool.execute(`
            SELECT 
                student.*, 
                mentors.name AS mentor_name,
                student_profile.m_id, 
                users.name AS student_name, 
                users.username AS student_username
            FROM 
                student
            LEFT JOIN 
                student_profile ON student.s_id = student_profile.s_id
            LEFT JOIN 
                users ON student.s_id = users.user_id
            LEFT JOIN 
                users AS mentors ON student_profile.m_id = mentors.user_id
            WHERE 
                student.c_id = ? AND (student_profile.m_id IS NULL OR student_profile.m_id = '');
        `, [c_id]);

        // Send the student details as a JSON response
        res.json(studentsWithoutMentor);
    } catch (error) {
        console.error('Error fetching student profiles without mentor:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});




// Route for updating mentor assignment for a student
app.post('/api/assignmentor', async(req, res) => {
    const { s_id, m_id } = req.body;

    try {
        console.log('API mentor assignment requested');

        // Check if both s_id and m_id are provided
        if (!s_id || !m_id) {
            return res.status(400).json({ error: 'Both s_id and m_id are required' });
        }

        // Get connection from the pool
        const connection = await pool.getConnection();

        // Update the student's mentor ID in the database
        const updateStudentQuery = 'UPDATE student_profile SET m_id = ? WHERE s_id = ?';
        const studentUpdateResult = await connection.execute(updateStudentQuery, [m_id, s_id]);

        if (studentUpdateResult[0].affectedRows === 0) {
            connection.release();
            return res.status(404).json({ error: 'Student ID not found' });
        }

        // Update the mentor's number of assigned students
        const updateMentorQuery = 'UPDATE mentors SET no_of_students = no_of_students + 1 WHERE m_id = ?';
        await connection.execute(updateMentorQuery, [m_id]);

        // Successfully updated the mentor assignment for the student
        connection.release();
        return res.status(200).json({ message: 'Mentor assigned successfully' });
    } catch (error) {
        console.error('Error assigning mentor:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});



// Function to update student's mentor ID in the database
// async function updateStudentMentor(s_id, m_id) {
//     return new Promise((resolve, reject) => {
//         pool.query('UPDATE student_profile SET m_id = ? WHERE s_id = ?', [m_id, s_id], (error, results) => {
//             if (error) {
//                 console.error('Error updating mentor for student:', error);
//                 return reject(error);
//             }
//             resolve();
//         });
//     });
// }



// Route for retrieving lecture data using POST method
app.post('/api/getlecture', async(req, res) => {
    const { c_id } = req.body; // Assuming c_id is passed in the request body

    try {
        console.log('API getlecture requested');

        // Query the database to retrieve lecture data for the provided course ID (c_id)
        const [lectureData] = await pool.execute(`
            SELECT * FROM lecture WHERE c_id = ?
        `, [c_id]);

        // Check if any lecture data is found for the provided course ID
        if (lectureData.length === 0) {
            // If no lecture data is found, return an error
            console.log("No lectures found for the provided course ID")
            return res.status(404).json({ error: 'No lectures found for the provided course ID' });
        }

        // Lecture data found, return it
        res.status(200).json({ data: lectureData });
    } catch (error) {
        console.error('Error retrieving lecture data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



// Route for inserting chat messages
app.post('/api/chat', async(req, res) => {
    const { s_id, msg, c_id } = req.body;

    try {
        console.log('API chat requested');

        // Read the abusive words from the JSON file asynchronously
        const abuseData = await fs.readFile('../assets/en.json');
        const abusiveWords = JSON.parse(abuseData);

        if (!Array.isArray(abusiveWords)) {
            throw new Error('Abusive words data is not an array');
        }

        // Check if the provided student ID exists
        const [existingStudent] = await pool.execute('SELECT * FROM student WHERE s_id = ?', [s_id]);

        if (existingStudent.length === 0) {
            // If the student ID doesn't exist, return an error
            console.log("Student not found");
            return res.status(404).json({ error: 'Student not found' });
        }

        // Check if the message contains abusive language
        const containsAbusiveWord = abusiveWords.some(word => {
            const matchWord = word.match.toLowerCase();
            const regex = new RegExp('\\b' + matchWord + '\\b', 'i'); // Case-insensitive match for whole word
            const isAbusive = regex.test(msg.toLowerCase());
            return isAbusive;
        });

        if (containsAbusiveWord) {
            // If the message contains abusive language, return an error
            console.log("Abusive language detected");
            return res.status(400).json({ error: 'Message contains abusive language' });
        }

        // Insert the message into the chat table
        await pool.execute('INSERT INTO chat (s_id, msg, c_id) VALUES (?, ?, ?)', [s_id, msg, c_id]);

        // Message inserted successfully
        console.log('Message inserted successfully');
        res.status(200).json({ message: 'Message inserted successfully' });
    } catch (error) {
        console.error('Error during chat message insertion:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});





// Route for performance, quiz mark
app.post('/api/performance', async(req, res) => {
    const { s_id, q_id, mark } = req.body;

    try {
        console.log('API performance requested');

        // Update or insert performance data
        const [result] = await pool.execute('UPDATE performance SET mark = JSON_ARRAY_APPEND(COALESCE(mark, \'[]\'), \'$\', CAST(? AS JSON)) WHERE s_id = ? AND q_id = ?', [mark, s_id, q_id]);

        if (result.affectedRows === 0) {
            // If no rows were updated, insert a new row
            await pool.execute('INSERT INTO performance (s_id, q_id, mark) VALUES (?, ?, JSON_ARRAY(?))', [s_id, q_id, mark]);
        }

        // Performance data updated/inserted successfully
        console.log('Performance data updated/inserted successfully');
        res.status(200).json({ message: 'Performance data updated/inserted successfully' });
    } catch (error) {
        console.error('Error during performance data update/insert:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



// Route for viewing performance data by student ID and optional quiz ID
app.post('/api/viewperformance', async(req, res) => {
    const { s_id, q_id } = req.body;

    try {
        console.log('API performance data requested for student ID:', s_id);

        // Construct the SQL query based on the provided parameters
        let query = 'SELECT * FROM performance WHERE s_id = ?';
        const queryParams = [s_id];

        if (q_id) {
            query += ' AND q_id = ?';
            queryParams.push(q_id);
        }

        // Retrieve performance data for the given student ID and optional quiz ID
        const [performanceData] = await pool.execute(query, queryParams);

        // Check if performance data is found
        if (performanceData.length === 0) {
            console.log('Performance data not found for student ID:', s_id);
            return res.status(200).json({ message: 'No performance data found' });
        }

        // Initialize an object to store statistics for each quiz
        const statsByQuiz = {};

        // Loop through each performance data
        performanceData.forEach(row => {
            const { q_id, mark } = row;
            const marks = JSON.parse(mark);

            // Calculate statistics for each quiz
            const maxMark = Math.max(...marks);
            const minMark = Math.min(...marks);
            const avgMark = marks.reduce((acc, mark) => acc + mark, 0) / marks.length;
            const markCount = marks.length;

            // Store statistics in the statsByQuiz object
            statsByQuiz[q_id] = {
                maxMark,
                minMark,
                avgMark,
                markCount
            };
        });

        // Return performance data along with statistics for each quiz
        console.log('Performance data retrieved successfully for student ID:', s_id);
        res.status(200).json({ performance: performanceData, stats2: statsByQuiz });
    } catch (error) {
        console.error('Error retrieving performance data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// Route for viewing chat messages along with user names
app.post('/api/viewchat', async(req, res) => {
    const { c_id } = req.body;

    try {
        // Check if c_id is provided
        if (!c_id) {
            // If c_id is missing, return an error
            console.log("c_id is missing");
            return res.status(400).json({ error: 'c_id is required' });
        }

        // Retrieve chat messages for a specific c_id
        const query = `SELECT chat.s_id, chat.msg, users.name 
                       FROM chat 
                       JOIN users ON chat.s_id = users.user_id
                       WHERE chat.c_id = ?`;

        // Execute the query
        const [chatData] = await pool.execute(query, [c_id]);

        // Check if chat messages are found
        if (chatData.length === 0) {
            console.log('No chat messages found');
            return res.status(404).json({ error: 'No chat messages found' });
        }

        // Return chat messages along with user names
        console.log('Chat messages retrieved successfully');
        res.status(200).json({ chat: chatData });
    } catch (error) {
        console.error('Error retrieving chat messages:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// Route for creating discussion data using POST method
app.post('/api/discussion', async(req, res) => {
    const { s_id, c_id, lecture_id, question } = req.body; // Assuming s_id, c_id, lecture_id, and question are passed in the request body

    try {
        console.log('API discussion requested');

        // Insert discussion data into the database
        const [result] = await pool.execute(`
            INSERT INTO discussion (s_id, c_id, lecture_id, question) VALUES (?, ?, ?, ?)
        `, [s_id, c_id, lecture_id, question]);

        // Check if the discussion data was inserted successfully
        if (result.affectedRows !== 1) {
            console.log("Failed to create discussion");
            return res.status(500).json({ error: 'Failed to create discussion' });
        }

        // Discussion data inserted successfully
        res.status(201).json({ message: 'Discussion created successfully' });
    } catch (error) {
        console.error('Error creating discussion:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// Route for viewing discussions
app.post('/api/viewdiscussion', async(req, res) => {
    const { c_id } = req.body;
    try {
        console.log('API view discussion requested');

        // Extract c_id from request body


        // Check if c_id is provided
        if (!c_id) {
            console.error('c_id is required');
            return res.status(400).json({ error: 'c_id is required' });
        }

        // Retrieve discussion data from the database based on the provided c_id
        const [discussionData] = await pool.execute(
            'SELECT * FROM discussion WHERE c_id = ?', [c_id]
        );

        // Check if discussions were found
        if (discussionData.length === 0) {
            console.error('No discussions found for the provided c_id:', c_id);
            return res.status(404).json({ error: 'No discussions found for the provided c_id' });
        }


        return res.status(200).json({ discussions: discussionData });
    } catch (error) {
        console.error('Error fetching discussions:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});




// Route for fetching discussions based on mentor ID
app.post('/api/showdiscussion', async(req, res) => {
    const { m_id } = req.body;

    try {
        console.log('API showdiscussion requested');

        // Check if mentor ID is provided
        if (!m_id) {
            return res.status(400).json({ error: 'Mentor ID is required' });
        }

        // Retrieve the course ID associated with the mentor
        const [mentorResult] = await pool.execute(
            'SELECT c_id FROM mentors WHERE m_id = ?', [m_id]
        );

        // Check if mentor exists
        if (mentorResult.length === 0) {
            return res.status(404).json({ error: 'Mentor not found' });
        }

        const { c_id } = mentorResult[0];

        // Retrieve discussions based on the course ID
        const [discussionResult] = await pool.execute(
            'SELECT * FROM discussion WHERE c_id = ?', [c_id]
        );

        // Return the retrieved discussions
        return res.status(200).json({ discussions: discussionResult });
    } catch (error) {
        console.error('Error fetching discussions:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});



// Route for updating discussion likes
app.post('/api/discussionlike', async(req, res) => {
    const { s_id, discussion_id } = req.body;

    try {
        console.log('API discussion like requested');

        // Check if s_id and discussion_id are provided
        if (!s_id || !discussion_id) {
            return res.status(400).json({ error: 'Both s_id and discussion_id are required' });
        }

        // Get connection from the pool
        const connection = await pool.getConnection();

        // Check if the user has already liked the discussion
        const [likedByResult] = await connection.execute(
            'SELECT liked_by FROM discussion WHERE discussion_id = ?', [discussion_id]
        );

        const likedBy = likedByResult[0].liked_by;

        if (likedBy && likedBy.includes(s_id)) {
            // If the user has already liked the discussion, remove their like
            const updatedLikedBy = likedBy.filter(id => id !== s_id);
            const updateDiscussionQuery = `
                UPDATE discussion
                SET likes = likes - 1,
                    liked_by = ?
                WHERE discussion_id = ?
            `;
            await connection.execute(updateDiscussionQuery, [JSON.stringify(updatedLikedBy), discussion_id]);

            // Successfully updated the discussion likes
            connection.release();
            return res.status(200).json({ message: 'Discussion disliked', liked: false, discussion_id });
        } else {
            // If the user has not liked the discussion, add their like
            const updateDiscussionQuery = `
                UPDATE discussion
                SET likes = likes + 1,
                    liked_by = JSON_ARRAY_APPEND(IFNULL(liked_by, JSON_ARRAY()), '$', ?)
                WHERE discussion_id = ?
            `;
            await connection.execute(updateDiscussionQuery, [s_id, discussion_id]);

            // Successfully updated the discussion likes
            connection.release();
            return res.status(200).json({ message: 'Discussion liked', liked: true, discussion_id });
        }
    } catch (error) {
        console.error('Error liking/disliking discussion:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});




// Route for creating answer data using POST method
app.post('/api/answer', async(req, res) => {
    const { discussion_id, m_id, answer } = req.body; // Assuming discussion_id, m_id, and answer are passed in the request body

    try {
        console.log('API answer requested');

        // Insert answer data into the database
        const [result] = await pool.execute(`
            INSERT INTO answer (discussion_id, m_id, answer) VALUES (?, ?, ?)
        `, [discussion_id, m_id, answer]);

        // Check if the answer data was inserted successfully
        if (result.affectedRows !== 1) {
            console.log("Failed to create answer");
            return res.status(500).json({ error: 'Failed to create answer' });
        }

        // Answer data inserted successfully
        res.status(201).json({ message: 'Answer created successfully' });
    } catch (error) {
        console.error('Error creating answer:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



// Route for updating answer likes
app.post('/api/answerlike', async(req, res) => {
    const { s_id, answer_id } = req.body;

    try {
        console.log('API answer like requested');

        // Check if s_id and answer_id are provided
        if (!s_id || !answer_id) {
            return res.status(400).json({ error: 'Both s_id and answer_id are required' });
        }

        // Get connection from the pool
        const connection = await pool.getConnection();

        // Check if the user has already liked the answer
        const [likedByResult] = await connection.execute(
            'SELECT liked_by FROM answer WHERE answer_id = ?', [answer_id]
        );

        const likedBy = likedByResult[0].liked_by;

        if (likedBy && likedBy.includes(s_id)) {
            // If the user has already liked the answer, remove their like
            const updatedLikedBy = likedBy.filter(id => id !== s_id);
            const updateAnswerQuery = `
                UPDATE answer
                SET likes = likes - 1,
                    liked_by = ?
                WHERE answer_id = ?
            `;
            await connection.execute(updateAnswerQuery, [JSON.stringify(updatedLikedBy), answer_id]);

            // Successfully updated the answer likes
            connection.release();
            return res.status(200).json({ message: 'Answer disliked', liked: false, answer_id });
        } else {
            // If the user has not liked the answer, add their like
            const updateAnswerQuery = `
                UPDATE answer
                SET likes = likes + 1,
                    liked_by = JSON_ARRAY_APPEND(IFNULL(liked_by, JSON_ARRAY()), '$', ?)
                WHERE answer_id = ?
            `;
            await connection.execute(updateAnswerQuery, [s_id, answer_id]);

            // Successfully updated the answer likes
            connection.release();
            return res.status(200).json({ message: 'Answer liked', liked: true, answer_id });
        }
    } catch (error) {
        console.error('Error liking/disliking answer:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});




app.post('/api/viewsubdiscussion', async(req, res) => {
    const { discussion_id } = req.body;

    try {
        console.log('API view subdiscussion requested');

        // Check if discussion_id is provided
        if (!discussion_id) {
            return res.status(400).json({ error: 'discussion_id is required' });
        }

        // Retrieve subdiscussion data from the database based on the provided discussion_id
        const [subdiscussionData] = await pool.execute(
            `SELECT sd.*, u.name AS user_name, u.role AS user_role
            FROM subdiscussion sd 
            JOIN users u ON sd.user_id = u.user_id
            WHERE sd.discussion_id = ?`, [discussion_id]
        );

        // Check if subdiscussions were found
        if (subdiscussionData.length === 0) {
            return res.status(404).json({ error: 'No subdiscussions found for the provided discussion_id' });
        }

        // Return the retrieved subdiscussions with user names and roles
        return res.status(200).json({ subdiscussions: subdiscussionData });
    } catch (error) {
        console.error('Error fetching subdiscussions:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});


//route to insert the subdiscussion
app.post('/api/subdiscussion', async(req, res) => {
    const { discussion_id, user_id, subdiscussion_text } = req.body;

    try {
        console.log('API subdiscussion requested');

        // Check if all required fields are provided
        if (!discussion_id || !user_id || !subdiscussion_text) {
            return res.status(400).json({ error: 'discussion_id, user_id, and subdiscussion_text are required' });
        }

        // Get connection from the pool
        const connection = await pool.getConnection();

        // Insert the subdiscussion into the Subdiscussion table
        const [insertResult] = await connection.execute(
            'INSERT INTO subdiscussion (discussion_id, user_id, subdiscussion_text) VALUES (?, ?, ?)', [discussion_id, user_id, subdiscussion_text]
        );

        connection.release();

        // Check if the subdiscussion data was inserted successfully
        if (insertResult.affectedRows !== 1) {
            console.log("Failed to create subdiscussion");
            return res.status(500).json({ error: 'Failed to create subdiscussion' });
        }

        return res.status(200).json({ message: 'Subdiscussion inserted successfully', subdiscussion_id: insertResult.insertId });
    } catch (error) {
        console.error('Error inserting subdiscussion:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});



// Route for updating subdiscussion likes
app.post('/api/subdiscussionlike', async(req, res) => {
    const { s_id, subdiscussion_id } = req.body;

    try {
        console.log('API subdiscussion like requested');

        // Check if s_id and subdiscussion_id are provided
        if (!s_id || !subdiscussion_id) {
            return res.status(400).json({ error: 'Both s_id and subdiscussion_id are required' });
        }

        // Get connection from the pool
        const connection = await pool.getConnection();

        // Check if the user has already liked the subdiscussion
        const [likedByResult] = await connection.execute(
            'SELECT liked_by FROM subdiscussion WHERE subdiscussion_id = ?', [subdiscussion_id]
        );

        const likedBy = likedByResult[0].liked_by;

        if (likedBy && likedBy.includes(s_id)) {
            // If the user has already liked the subdiscussion, remove their like
            const updatedLikedBy = likedBy.filter(id => id !== s_id);
            const updateSubdiscussionQuery = `
                UPDATE subdiscussion
                SET likes = likes - 1,
                    liked_by = ?
                WHERE subdiscussion_id = ?
            `;
            await connection.execute(updateSubdiscussionQuery, [JSON.stringify(updatedLikedBy), subdiscussion_id]);
        } else {
            // If the user has not liked the subdiscussion, add their like
            const updateSubdiscussionQuery = `
                UPDATE subdiscussion
                SET likes = likes + 1,
                    liked_by = JSON_ARRAY_APPEND(IFNULL(liked_by, JSON_ARRAY()), '$', ?)
                WHERE subdiscussion_id = ?
            `;
            await connection.execute(updateSubdiscussionQuery, [s_id, subdiscussion_id]);
        }

        // Successfully updated the subdiscussion likes
        connection.release();
        return res.status(200).json({ message: 'Subdiscussion liked successfully' });
    } catch (error) {
        console.error('Error liking subdiscussion:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});


// Route for viewing lectures without quizzes
app.post('/api/viewnoquizlecture', async(req, res) => {
    // Extract c_id from request body
    const { c_id } = req.body;

    try {
        console.log('API viewnoquizlecture requested');

        // Select lectures without quizzes for the given c_id
        const [lectures] = await pool.execute(
            `SELECT * FROM lecture 
            WHERE c_id = ? 
            AND lecture_id NOT IN (
                SELECT DISTINCT lecture_id FROM quiz WHERE c_id = ?
            )
            `, [c_id, c_id]
        );

        // Send the data of lectures without quizzes
        return res.status(200).json({ lectures });
    } catch (error) {
        console.error('Error viewing lectures without quizzes:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});



app.post('/api/uploadquizinfos', upload.single('file'), async(req, res) => {
    try {
        console.log("API upload quiz requested");

        // Print received data
        console.log("Received data:", req.body);
        console.log("Received file:", req.file);

        const { c_id, lecture_id } = req.body;

        if (!c_id || !lecture_id || !req.file) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Log file details
        console.log("Files are");
        console.log("File details:", req.file);
        console.log("Is working");

        // Read the file based on its type (Excel or CSV)
        let excelData = [];
        console.log("Data of Excel");
        if (req.file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
            console.log("Excel");
            const workbook = XLSX.read(req.file.buffer);
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            excelData = XLSX.utils.sheet_to_json(sheet);
        } else if (req.file.mimetype === 'text/csv') {
            const fileContent = await fs.readFile(req.file.path, 'utf-8');
            excelData = await readCSV(fileContent); // Implement readCSV function
        } else {
            console.log("wrong format")
            return res.status(400).json({ error: 'Unsupported file format' });
        }

        // Log the number of questions
        console.log("Number of questions:", excelData.length);

        // Prepare the values array for insertion into quiz table
        const quizValues = [
            [c_id, lecture_id, excelData.length, excelData.length]
        ];

        // Insert data into quiz table
        const quizQuery = `INSERT INTO quiz (c_id, lecture_id, no_of_questions, total_mark) VALUES ?`;
        const quizConnection = await pool.getConnection();
        const [quizResult] = await quizConnection.query(quizQuery, [quizValues]);
        const insertedQId = quizResult.insertId; // Get the generated q_id from the inserted row
        quizConnection.release();

        // Prepare the values array for insertion into quiz_info table
        const quizInfoValues = excelData.map(row => [insertedQId, row.question, row.a, row.b, row.c, row.d, row.answer]);

        // Insert data into quiz_info table
        const quizInfoQuery = `INSERT INTO quiz_info (q_id, question, a, b, c, d, answer) VALUES ?`;
        const quizInfoConnection = await pool.getConnection();
        await quizInfoConnection.query(quizInfoQuery, [quizInfoValues]);
        quizInfoConnection.release();

        console.log('Quiz data inserted successfully');
        res.json({ message: 'Quiz data inserted successfully' });
    } catch (error) {
        console.error('Error inserting quiz data:', error);
        res.status(500).json({ error: 'An error occurred while inserting quiz data' });
    }
});



// Function to read CSV file
function readCSV(fileContent) {
    return new Promise((resolve, reject) => {
        const results = [];
        // Parse the CSV data
        csv({ skipLines: 1 })
            .on('data', (data) => results.push(data))
            .on('end', () => resolve(results))
            .on('error', (error) => reject(error))
            .write(fileContent);
    });
}






app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
}).on('error', (err) => {
    console.error('Server start error:', err);
});