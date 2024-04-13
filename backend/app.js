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

const XLSX = require('xlsx');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); 

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

const authenticateToken = async (req, res, next) => {
    try {
        // Check if Authorization header exists
        if (!req.headers.authorization) {
            return res.status(401).json({ error: 'Unauthorized' }); // Return 401 Unauthorized status
        }

        // Retrieve token from request headers and split it
        const token = req.headers.authorization.split(' ')[1];
        console.log("Token:", token); // Print token value

        // Verify token
        jwt.verify(token, "learn@1234", async (err, decodedToken) => {
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

//Route for login
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        console.log('api login requested');
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


//decoding the token
app.post('/api/decodeToken', async (req, res) => {
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
            const [rows] = await connection.execute('SELECT user_id,name,phoneNumber,username FROM users WHERE username = ?', [username]);

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
app.post('/api/generate-otp', async (req, res) => {
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


app.post('/api/forgotgenerate-otp', async (req, res) => {
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


//Route for register
app.post('/api/register', async (req, res) => {
    const { name, username, password, phoneNumber, role } = req.body;

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
        console.log('api login requested');
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
    console.log('api chat bot requested');
    const userInput = req.body.message;

    // Generate response using middleware
    const response = await generateResponse(userInput);
    res.json({ botResponse: response });
});


// Route for updating user data (username or password)
app.put('/api/users/:phoneNumber', async (req, res) => {
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


//payment 
app.post('/api/payment', async (req, res) => {
    const { user_id, amount, course_name } = req.body;

    try {
        console.log('api payment requested');
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



// Route for checking student
app.post('/api/checkstudent', async (req, res) => {
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
app.post('/api/studentcourse', async (req, res) => {
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
app.get('/api/courselist', async (req, res) => {
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
app.post('/api/uploadvideo', async (req, res) => {
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
app.post('/api/lecture', async (req, res) => {
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
app.post('/api/quiz', async (req, res) => {
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
app.post('/api/uploadquiz', async (req, res) => {
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
app.post('/api/quizinfo', async (req, res) => {
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
app.post('/api/uploadquizinfo', async (req, res) => {
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
app.post('/api/quizinfoes/upload', upload.single('excelFile'), async (req, res) => {
    try {
        // Ensure that a file was uploaded
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


// Route for quiz performance
app.post('/api/performance', async (req, res) => {
    const { s_id, q_id, mark } = req.body;

    try {
        console.log('API quiz info upload requested');

        // Check if a record already exists for the given s_id and q_id
        const [existingRecord] = await pool.execute('SELECT * FROM performance WHERE s_id = ? AND q_id = ?', [s_id, q_id]);

        if (existingRecord.length === 0) {
            // If no record exists, insert a new one with count set to 1
            await pool.execute('INSERT INTO performance (s_id, q_id, mark, count, best_score) VALUES (?, ?, ?, 1, ?)', [s_id, q_id, mark, mark]);

        } else {
            // If a record exists, update the count by incrementing it
            const currentCount = existingRecord[0].count;
            let bestScore = existingRecord[0].best_score;
            
            // Check if the current mark is greater than the existing best score
            if (mark > bestScore) {
                bestScore = mark;
                await pool.execute('UPDATE performance SET count = ?, mark = ?, best_score = ? WHERE s_id = ? AND q_id = ?', [currentCount + 1, mark, bestScore, s_id, q_id]);
            } else {
                // If mark is not greater than the existing best score, only update count and mark
                await pool.execute('UPDATE performance SET count = ?, mark = ? WHERE s_id = ? AND q_id = ?', [currentCount + 1, mark, s_id, q_id]);
            }
        }
        
        // Return success message
        res.status(200).json({ message: 'Quiz information uploaded successfully' });
    } catch (error) {
        console.error('Error uploading quiz information:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// Route for viewing that performance
app.post('/api/viewperform', async (req, res) => {
    const { s_id, q_id } = req.body;

    try {
        console.log('API view performance requested');

        if (s_id) {
            let query;
            if (q_id) {
                query = `SELECT * FROM performance WHERE s_id = ${s_id} AND q_id = ${q_id}`;
            } else {
                query = `SELECT * FROM performance WHERE s_id = ${s_id}`;
            }

            const [performanceData] = await pool.execute(query);
            res.status(200).json({ performance: performanceData });
        } else {
            // If s_id is not provided, return an error message
            res.status(400).json({ error: 's_id parameter is required' });
        }
    } catch (error) {
        console.error('Error fetching performance data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


//list of university
app.get('/api/universities', async (req, res) => {
    try {
        // Read universities JSON file
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
app.post('/api/studentprofile', async (req, res) => {
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
app.post('/api/checkstudentprofile', async (req, res) => {
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



app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
}).on('error', (err) => {
    console.error('Server start error:', err);
});
