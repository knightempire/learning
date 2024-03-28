-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 28, 2024 at 08:28 AM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `learning`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin`
--

CREATE TABLE `admin` (
  `a_id` int(11) NOT NULL,
  `position` varchar(50) NOT NULL,
  `salary_id` int(11) DEFAULT NULL,
  `d_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `admin_profile`
--

CREATE TABLE `admin_profile` (
  `a_id` int(11) NOT NULL,
  `first_name` varchar(255) NOT NULL,
  `last_name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `pincode` varchar(20) DEFAULT NULL,
  `district` varchar(255) DEFAULT NULL,
  `state` varchar(255) DEFAULT NULL,
  `DOB` date DEFAULT NULL,
  `age` int(3) DEFAULT NULL,
  `salary_id` int(11) DEFAULT NULL,
  `d_id` int(11) DEFAULT NULL,
  `experience` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `course`
--

CREATE TABLE `course` (
  `c_id` int(11) NOT NULL,
  `c_duration` varchar(100) DEFAULT NULL,
  `c_no_certificate` int(11) DEFAULT NULL,
  `c_description` text DEFAULT NULL,
  `m_id` int(11) DEFAULT NULL,
  `course_name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `course_mentor`
--

CREATE TABLE `course_mentor` (
  `m_id` int(11) NOT NULL,
  `no_of_mentor` int(11) DEFAULT 0,
  `c_id` int(11) NOT NULL,
  `no_of_student_courses` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `department`
--

CREATE TABLE `department` (
  `d_id` int(11) NOT NULL,
  `department_name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `inquiry`
--

CREATE TABLE `inquiry` (
  `inquiry_id` int(11) NOT NULL,
  `i_name` varchar(255) NOT NULL,
  `i_email` varchar(255) NOT NULL,
  `i_question` text NOT NULL,
  `answer` text DEFAULT NULL,
  `a_id` int(11) NOT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'Pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `lecture`
--

CREATE TABLE `lecture` (
  `lecture_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `video_url` varchar(255) NOT NULL,
  `c_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `mentors`
--

CREATE TABLE `mentors` (
  `m_id` int(11) NOT NULL,
  `c_id` int(11) NOT NULL,
  `no_of_students` int(11) DEFAULT 0,
  `position` varchar(50) NOT NULL DEFAULT 'handling',
  `salary_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `mentor_profile`
--

CREATE TABLE `mentor_profile` (
  `m_id` int(11) NOT NULL,
  `first_name` varchar(255) NOT NULL,
  `last_name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `pincode` varchar(20) DEFAULT NULL,
  `district` varchar(255) DEFAULT NULL,
  `state` varchar(255) DEFAULT NULL,
  `DOB` date DEFAULT NULL,
  `date_of_joining` date DEFAULT NULL,
  `experience` int(3) DEFAULT NULL,
  `skills` text DEFAULT NULL,
  `area_of_expertise` text DEFAULT NULL,
  `education` text DEFAULT NULL,
  `salary_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `mentor_student_course`
--

CREATE TABLE `mentor_student_course` (
  `m_id` int(11) NOT NULL,
  `s_id` int(11) NOT NULL,
  `c_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payment`
--

CREATE TABLE `payment` (
  `payment_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `payment_status` varchar(50) NOT NULL DEFAULT 'Pending',
  `c_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `performance`
--

CREATE TABLE `performance` (
  `s_id` int(11) NOT NULL,
  `q_id` int(11) NOT NULL,
  `mark` decimal(5,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `quiz`
--

CREATE TABLE `quiz` (
  `quiz_id` int(11) NOT NULL,
  `c_id` int(11) NOT NULL,
  `lecture_id` int(11) NOT NULL,
  `question` text DEFAULT NULL,
  `answer` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `quiz_info`
--

CREATE TABLE `quiz_info` (
  `q_id` int(11) NOT NULL,
  `c_id` int(11) NOT NULL,
  `total_marks` decimal(5,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `salary`
--

CREATE TABLE `salary` (
  `salary_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `role` enum('mentor','admin') NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `salary_date` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `student`
--

CREATE TABLE `student` (
  `s_id` int(11) NOT NULL,
  `c_id` int(11) NOT NULL,
  `p_id` int(11) NOT NULL,
  `current_course` int(11) DEFAULT NULL,
  `joining_date` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `student_completed_courses`
--

CREATE TABLE `student_completed_courses` (
  `s_id` int(11) DEFAULT NULL,
  `course_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `student_profile`
--

CREATE TABLE `student_profile` (
  `s_id` int(11) NOT NULL,
  `first_name` varchar(255) NOT NULL,
  `last_name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `pincode` varchar(20) DEFAULT NULL,
  `district` varchar(255) DEFAULT NULL,
  `state` varchar(255) DEFAULT NULL,
  `DOB` date DEFAULT NULL,
  `age` int(3) DEFAULT NULL,
  `skills` text DEFAULT NULL,
  `area_of_interest` text DEFAULT NULL,
  `education` text DEFAULT NULL,
  `m_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `username` varchar(100) NOT NULL,
  `password` varchar(255) DEFAULT NULL,
  `phoneNumber` varchar(20) NOT NULL,
  `role` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `name`, `username`, `password`, `phoneNumber`, `role`) VALUES
(1, 'abi', 'abi', '$2a$10$S5akFXSFPyJrS1U/m7EOh.QuLsIL5d6JVpgnso6WVAzQBPNFoY04.', '9499964935', 'student'),
(2, 'sathish', 'sathish', '$2a$10$TexL53T32JeEUoxHmfifVO9mVr.FeeuWHUepNt68Yc41AWshvELny', '8838659473', 'student');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`a_id`),
  ADD KEY `salary_id` (`salary_id`),
  ADD KEY `d_id` (`d_id`);

--
-- Indexes for table `admin_profile`
--
ALTER TABLE `admin_profile`
  ADD PRIMARY KEY (`a_id`),
  ADD KEY `salary_id` (`salary_id`),
  ADD KEY `d_id` (`d_id`);

--
-- Indexes for table `course`
--
ALTER TABLE `course`
  ADD PRIMARY KEY (`c_id`),
  ADD KEY `fk_course_mentor` (`m_id`);

--
-- Indexes for table `course_mentor`
--
ALTER TABLE `course_mentor`
  ADD PRIMARY KEY (`m_id`,`c_id`),
  ADD KEY `c_id` (`c_id`);

--
-- Indexes for table `department`
--
ALTER TABLE `department`
  ADD PRIMARY KEY (`d_id`);

--
-- Indexes for table `inquiry`
--
ALTER TABLE `inquiry`
  ADD PRIMARY KEY (`inquiry_id`),
  ADD KEY `fk_inquiry_admin` (`a_id`);

--
-- Indexes for table `lecture`
--
ALTER TABLE `lecture`
  ADD PRIMARY KEY (`lecture_id`),
  ADD KEY `fk_lecture_course` (`c_id`);

--
-- Indexes for table `mentors`
--
ALTER TABLE `mentors`
  ADD PRIMARY KEY (`m_id`),
  ADD KEY `c_id` (`c_id`),
  ADD KEY `salary_id` (`salary_id`);

--
-- Indexes for table `mentor_profile`
--
ALTER TABLE `mentor_profile`
  ADD PRIMARY KEY (`m_id`),
  ADD KEY `salary_id` (`salary_id`);

--
-- Indexes for table `mentor_student_course`
--
ALTER TABLE `mentor_student_course`
  ADD KEY `m_id` (`m_id`),
  ADD KEY `s_id` (`s_id`),
  ADD KEY `c_id` (`c_id`);

--
-- Indexes for table `payment`
--
ALTER TABLE `payment`
  ADD PRIMARY KEY (`payment_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `fk_payment_course` (`c_id`);

--
-- Indexes for table `performance`
--
ALTER TABLE `performance`
  ADD KEY `s_id` (`s_id`),
  ADD KEY `q_id` (`q_id`);

--
-- Indexes for table `quiz`
--
ALTER TABLE `quiz`
  ADD PRIMARY KEY (`quiz_id`),
  ADD KEY `fk_quiz_course` (`c_id`),
  ADD KEY `fk_quiz_lecture` (`lecture_id`);

--
-- Indexes for table `quiz_info`
--
ALTER TABLE `quiz_info`
  ADD PRIMARY KEY (`q_id`,`c_id`),
  ADD KEY `c_id` (`c_id`);

--
-- Indexes for table `salary`
--
ALTER TABLE `salary`
  ADD PRIMARY KEY (`salary_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `student`
--
ALTER TABLE `student`
  ADD PRIMARY KEY (`s_id`),
  ADD KEY `fk_student_course` (`c_id`),
  ADD KEY `fk_student_payment` (`p_id`);

--
-- Indexes for table `student_completed_courses`
--
ALTER TABLE `student_completed_courses`
  ADD KEY `s_id` (`s_id`),
  ADD KEY `course_id` (`course_id`);

--
-- Indexes for table `student_profile`
--
ALTER TABLE `student_profile`
  ADD PRIMARY KEY (`s_id`),
  ADD KEY `m_id` (`m_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `username_2` (`username`),
  ADD UNIQUE KEY `username_3` (`username`),
  ADD UNIQUE KEY `phoneNumber` (`phoneNumber`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `department`
--
ALTER TABLE `department`
  MODIFY `d_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `inquiry`
--
ALTER TABLE `inquiry`
  MODIFY `inquiry_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `lecture`
--
ALTER TABLE `lecture`
  MODIFY `lecture_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payment`
--
ALTER TABLE `payment`
  MODIFY `payment_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `quiz`
--
ALTER TABLE `quiz`
  MODIFY `quiz_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `salary`
--
ALTER TABLE `salary`
  MODIFY `salary_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `admin`
--
ALTER TABLE `admin`
  ADD CONSTRAINT `admin_ibfk_1` FOREIGN KEY (`a_id`) REFERENCES `users` (`user_id`),
  ADD CONSTRAINT `admin_ibfk_2` FOREIGN KEY (`salary_id`) REFERENCES `salary` (`salary_id`),
  ADD CONSTRAINT `admin_ibfk_3` FOREIGN KEY (`d_id`) REFERENCES `department` (`d_id`);

--
-- Constraints for table `admin_profile`
--
ALTER TABLE `admin_profile`
  ADD CONSTRAINT `admin_profile_ibfk_1` FOREIGN KEY (`a_id`) REFERENCES `admin` (`a_id`),
  ADD CONSTRAINT `admin_profile_ibfk_2` FOREIGN KEY (`salary_id`) REFERENCES `salary` (`salary_id`),
  ADD CONSTRAINT `admin_profile_ibfk_3` FOREIGN KEY (`d_id`) REFERENCES `department` (`d_id`);

--
-- Constraints for table `course`
--
ALTER TABLE `course`
  ADD CONSTRAINT `fk_course_mentor` FOREIGN KEY (`m_id`) REFERENCES `course_mentor` (`m_id`);

--
-- Constraints for table `course_mentor`
--
ALTER TABLE `course_mentor`
  ADD CONSTRAINT `course_mentor_ibfk_1` FOREIGN KEY (`m_id`) REFERENCES `mentors` (`m_id`),
  ADD CONSTRAINT `course_mentor_ibfk_2` FOREIGN KEY (`c_id`) REFERENCES `course` (`c_id`);

--
-- Constraints for table `inquiry`
--
ALTER TABLE `inquiry`
  ADD CONSTRAINT `fk_inquiry_admin` FOREIGN KEY (`a_id`) REFERENCES `admin` (`a_id`);

--
-- Constraints for table `lecture`
--
ALTER TABLE `lecture`
  ADD CONSTRAINT `fk_lecture_course` FOREIGN KEY (`c_id`) REFERENCES `course` (`c_id`);

--
-- Constraints for table `mentors`
--
ALTER TABLE `mentors`
  ADD CONSTRAINT `mentors_ibfk_1` FOREIGN KEY (`m_id`) REFERENCES `users` (`user_id`),
  ADD CONSTRAINT `mentors_ibfk_2` FOREIGN KEY (`c_id`) REFERENCES `course` (`c_id`),
  ADD CONSTRAINT `mentors_ibfk_3` FOREIGN KEY (`salary_id`) REFERENCES `salary` (`salary_id`);

--
-- Constraints for table `mentor_profile`
--
ALTER TABLE `mentor_profile`
  ADD CONSTRAINT `mentor_profile_ibfk_1` FOREIGN KEY (`m_id`) REFERENCES `mentors` (`m_id`),
  ADD CONSTRAINT `mentor_profile_ibfk_2` FOREIGN KEY (`salary_id`) REFERENCES `salary` (`salary_id`);

--
-- Constraints for table `mentor_student_course`
--
ALTER TABLE `mentor_student_course`
  ADD CONSTRAINT `mentor_student_course_ibfk_1` FOREIGN KEY (`m_id`) REFERENCES `mentors` (`m_id`),
  ADD CONSTRAINT `mentor_student_course_ibfk_2` FOREIGN KEY (`s_id`) REFERENCES `student` (`s_id`),
  ADD CONSTRAINT `mentor_student_course_ibfk_3` FOREIGN KEY (`c_id`) REFERENCES `course` (`c_id`);

--
-- Constraints for table `payment`
--
ALTER TABLE `payment`
  ADD CONSTRAINT `fk_payment_course` FOREIGN KEY (`c_id`) REFERENCES `course` (`c_id`),
  ADD CONSTRAINT `payment_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `performance`
--
ALTER TABLE `performance`
  ADD CONSTRAINT `performance_ibfk_1` FOREIGN KEY (`s_id`) REFERENCES `student` (`s_id`),
  ADD CONSTRAINT `performance_ibfk_2` FOREIGN KEY (`q_id`) REFERENCES `quiz_info` (`q_id`);

--
-- Constraints for table `quiz`
--
ALTER TABLE `quiz`
  ADD CONSTRAINT `fk_quiz_course` FOREIGN KEY (`c_id`) REFERENCES `course` (`c_id`),
  ADD CONSTRAINT `fk_quiz_lecture` FOREIGN KEY (`lecture_id`) REFERENCES `lecture` (`lecture_id`);

--
-- Constraints for table `quiz_info`
--
ALTER TABLE `quiz_info`
  ADD CONSTRAINT `quiz_info_ibfk_1` FOREIGN KEY (`q_id`) REFERENCES `quiz` (`quiz_id`),
  ADD CONSTRAINT `quiz_info_ibfk_2` FOREIGN KEY (`c_id`) REFERENCES `course` (`c_id`);

--
-- Constraints for table `salary`
--
ALTER TABLE `salary`
  ADD CONSTRAINT `salary_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `student`
--
ALTER TABLE `student`
  ADD CONSTRAINT `fk_student_course` FOREIGN KEY (`c_id`) REFERENCES `course` (`c_id`),
  ADD CONSTRAINT `fk_student_payment` FOREIGN KEY (`p_id`) REFERENCES `payment` (`payment_id`),
  ADD CONSTRAINT `fk_student_user` FOREIGN KEY (`s_id`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `student_completed_courses`
--
ALTER TABLE `student_completed_courses`
  ADD CONSTRAINT `student_completed_courses_ibfk_1` FOREIGN KEY (`s_id`) REFERENCES `student_profile` (`s_id`),
  ADD CONSTRAINT `student_completed_courses_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `course` (`c_id`);

--
-- Constraints for table `student_profile`
--
ALTER TABLE `student_profile`
  ADD CONSTRAINT `student_profile_ibfk_1` FOREIGN KEY (`s_id`) REFERENCES `student` (`s_id`),
  ADD CONSTRAINT `student_profile_ibfk_2` FOREIGN KEY (`m_id`) REFERENCES `mentors` (`m_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
