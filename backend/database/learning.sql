-- Create the database
CREATE DATABASE learning;

-- Switch to the newly created database
USE learning;

-- Create the users table
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    username VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL
);

-- Add the password column to the users table
ALTER TABLE users
ADD COLUMN password VARCHAR(255) ;


CREATE TABLE course (
    c_id INT PRIMARY KEY,
    c_duration VARCHAR(100),
    c_no_certificate INT,
    c_description TEXT
);


