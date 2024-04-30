-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 30, 2024 at 02:56 PM
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
-- Table structure for table `answer`
--

CREATE TABLE `answer` (
  `answer_id` int(11) NOT NULL,
  `discussion_id` int(11) DEFAULT NULL,
  `m_id` int(11) DEFAULT NULL,
  `answer` text DEFAULT NULL,
  `likes` int(11) DEFAULT 0,
  `liked_by` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`liked_by`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `chat`
--

CREATE TABLE `chat` (
  `chat_id` int(11) NOT NULL,
  `s_id` int(11) DEFAULT NULL,
  `msg` text DEFAULT NULL,
  `c_id` int(11) NOT NULL
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

--
-- Dumping data for table `course`
--

INSERT INTO `course` (`c_id`, `c_duration`, `c_no_certificate`, `c_description`, `m_id`, `course_name`) VALUES
(1, NULL, NULL, NULL, NULL, 'HTML'),
(2, NULL, NULL, NULL, NULL, 'DBMS'),
(3, NULL, NULL, NULL, NULL, 'ML'),
(4, NULL, NULL, NULL, NULL, 'AWS');

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
-- Table structure for table `discussion`
--

CREATE TABLE `discussion` (
  `discussion_id` int(11) NOT NULL,
  `s_id` int(11) DEFAULT NULL,
  `c_id` int(11) DEFAULT NULL,
  `lecture_id` int(11) DEFAULT NULL,
  `question` text DEFAULT NULL,
  `likes` int(11) DEFAULT 0,
  `liked_by` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`liked_by`))
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
  `video_url` varchar(255) NOT NULL,
  `c_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `lecture`
--

INSERT INTO `lecture` (`lecture_id`, `title`, `video_url`, `c_id`) VALUES
(1, 'Introduction', 'https://www.youtube.com/embed/khKoJUpcXUE?si=1NTid86netkk3FhV', 2),
(2, 'Types of Databases and Architecture', 'https://www.youtube.com/embed/OdG6fhcO6rU?si=GdoT8EBP2nAXZFN7', 2),
(3, 'Designing Databases', 'https://www.youtube.com/embed/caxAA6ssLok?si=CWLKlWw1kabd-PWE', 2),
(4, 'E - R Modeling', 'https://www.youtube.com/embed/-ZbsUiAf-uc?si=2lswyAv0qTFZfl2Z', 2),
(5, 'Types of Attributes in E-R Model', 'https://www.youtube.com/embed/eHm7M3d3dQk?si=imoypvsWj9q8sEfS', 2),
(6, 'Relational Model Introduction', 'https://www.youtube.com/embed/_P1bKokswCk?si=kOipGlroqLTHqLic', 2),
(7, 'Functional dependency', 'https://www.youtube.com/embed/7F9oQGIMwN8?si=Dat1udbL4xEw2DeL', 2),
(8, 'Finding Keys Using Functional Dependencies', 'https://www.youtube.com/embed/lwrmiizoZ68?si=jV_4__fLE1GooHex', 2),
(9, 'Normalization: Introduction, 1NF, 2NF', 'https://www.youtube.com/embed/iqGR9uXkfWI?si=kmomtep9bZwpGgSN', 2),
(10, 'Normalization | 3NF, BCNF', 'https://www.youtube.com/embed/oFKWf8k72gA?si=4yct476oWeNH--Ei', 2),
(11, 'Introduction To AWS', 'https://www.youtube.com/embed/n6RWhajimZg?si=MXA5NOIyFSY9ZX-Q', 4),
(12, 'Virtual Private Cloud (VPC)', 'https://www.youtube.com/embed/P8g7Z4NYk3Q?si=nTJaB_w88uJlwCgX', 4),
(13, 'Security Groups and NACL', 'https://www.youtube.com/embed/TtlKFgfN3PU?si=2FEwfTWClnTJa5g1', 4),
(14, 'Route 53', 'https://www.youtube.com/embed/6BoTfTtNsGU?si=D4sScMdMRXi_PwGC', 4),
(15, 'AWS S3', 'https://www.youtube.com/embed/6BoTfTtNsGU?si=D4sScMdMRXi_PwGC', 4),
(16, 'AWS CLI', 'https://www.youtube.com/embed/TiDSwf8gydk?si=rbiLGFHQGve3FHL3', 4),
(17, 'Cloud Formation Template', 'https://www.youtube.com/embed/ov4WmWgQgsA?si=XZw9-10maMtsep5J', 4),
(18, 'Cloud Watch', 'https://www.youtube.com/embed/u4XngwbY-O0?si=32obtYgzDJQrtuVJ', 4),
(19, 'AWS Lambda Introduction', 'https://www.youtube.com/embed/5fTtmeCpSRw?si=pI_Mn2HWzqbd5S5v', 4),
(20, 'AWS Cloud Front', 'https://www.youtube.com/embed/yhieOhvHz6Q?si=8HcWgMtpRkAVzsjm', 4),
(21, 'Introduction to HTML', 'https://www.youtube.com/embed/salY_Sm6mv4?si=Qdkrji00wbrR8Rnw', 1),
(22, 'HTML Forms', 'https://www.youtube.com/embed/YwbIeMlxZAU?si=7hhfskXvSyiROEAL', 1),
(23, 'CSS Flexbox - Introduction and Basics', 'https://www.youtube.com/embed/GCmoZTIysuE?si=SOqX4w2sI-LduoUI', 1),
(24, 'Advanced HTML Elements', 'https://www.youtube.com/embed/1rbo_HHt5nw?si=iLo6pvx07QOToBFI', 1),
(25, 'Stop HTML,CSS,JS Learn this & Become FRONTEND Developer', 'https://www.youtube.com/embed/K-kWkyUVqhg?si=TdKB_7GhD5gs7jJT', 1),
(26, 'Advanced CSS Gradients | Linear, Radial | Detailed Video With Examples', 'https://www.youtube.com/embed/MLdSeJr1R_g?si=qQUc7riiGRCC-WTo', 1),
(27, 'Responsive Navigation Bar with HTML CSS and Javascript | Responsive Menu', 'https://www.youtube.com/embed/XZsuI5wyRzs?si=BvGC8TpcKHd4fQ14', 1),
(28, 'Social media buttons with amazing animation on hover using html & css', 'https://www.youtube.com/embed/fDm0WJ_66d0?si=5DclVWTq53S8STFk', 1),
(29, 'CSS Skewed Border | Creative Box Border Hover Effects | Html CSS', 'https://www.youtube.com/embed/-1U62fdmCk4?si=BUFaCeoohFWuAmAe', 1),
(30, 'CSS Glowing Icon with Text Typing Animation Effects | CSS Neon Glow Effect Animation', 'https://www.youtube.com/embed/Dw1ucY0TOrY?si=-yzb6vUBNmX4Mzlc', 1);

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
  `mark` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `quiz`
--

CREATE TABLE `quiz` (
  `q_id` int(11) NOT NULL,
  `c_id` int(11) NOT NULL,
  `lecture_id` int(11) NOT NULL,
  `no_of_questions` int(11) DEFAULT NULL,
  `total_mark` decimal(5,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `quiz`
--

INSERT INTO `quiz` (`q_id`, `c_id`, `lecture_id`, `no_of_questions`, `total_mark`) VALUES
(1, 2, 2, 8, 8.00),
(2, 2, 3, 5, 5.00),
(3, 2, 5, 8, 8.00),
(4, 2, 6, 5, 5.00),
(5, 2, 8, 8, 8.00),
(6, 2, 10, 8, 8.00),
(8, 4, 11, 7, 7.00),
(9, 4, 13, 6, 6.00),
(10, 4, 16, 8, 8.00),
(11, 4, 18, 8, 8.00),
(12, 4, 20, 8, 8.00),
(14, 1, 21, 10, 10.00),
(15, 1, 22, 10, 10.00),
(16, 1, 23, 9, 9.00),
(17, 1, 24, 9, 9.00),
(18, 1, 25, 10, 10.00),
(19, 1, 26, 10, 10.00);

-- --------------------------------------------------------

--
-- Table structure for table `quiz_info`
--

CREATE TABLE `quiz_info` (
  `q_id` int(11) DEFAULT NULL,
  `question` text DEFAULT NULL,
  `a` varchar(255) DEFAULT NULL,
  `b` varchar(255) DEFAULT NULL,
  `c` varchar(255) DEFAULT NULL,
  `d` varchar(255) DEFAULT NULL,
  `answer` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `quiz_info`
--

INSERT INTO `quiz_info` (`q_id`, `question`, `a`, `b`, `c`, `d`, `answer`) VALUES
(1, 'What is a \'tuple\'?', 'An attribute attached to a record.', 'A row or record in a database table.', 'Another name for the key linking different tables in a database.', 'Another name for a table in an RDBMS.', 'A row or record in a database table.'),
(1, 'Redundancy is minimized with a computer based database approach.', 'True', 'False', NULL, NULL, 'True'),
(1, 'A Row in a database can also be called a domain.', 'True', 'False', NULL, NULL, 'False'),
(1, 'Which of the following is component of DBMS Software?', 'Hardware', 'Software', 'Data', 'All of the above', 'All of the above'),
(1, 'What is the basic client/server architecture, one has to deal with?', 'Large number of PCs', 'Web servers', 'Database Servers', 'All of the above', 'All of the above'),
(1, 'How many types of DBMS architectures are there?', '1', '2', '3', '4', '3'),
(1, 'What is TRUE about 1-tier architecture?', 'It is directly not available to the user', 'Changes are not done on the database', 'No handy tool is provided for the end user', 'It is not used for the development of local application', 'No handy tool is provided for the end user'),
(1, 'Basic client-server model is similar to', '2-tier architecture', '3-tier architecture', '4-tier architecture', '5-tier architecture', '2-tier architecture'),
(2, 'A disadvantage of a distributed database management system (DDBMS) is that:', 'There are lack of standards', 'It is slower in terms of data access', 'Adding new sites affects other sites\' operations', 'It is processor dependent', 'There are lack of standards'),
(2, 'A distributed database is composed of several parts known as:', 'Sections', 'Fragments', 'Partitions', 'Parts', 'Fragments'),
(2, '______ is the delay imposed by the amount of time required for a data packet to make around trip from point A to point B.', 'Data distribution', 'Replica transparency', 'Network Latency', 'Network Partitioning', 'Network Latency'),
(2, 'A distributed database management system (DDBMS) governs the storage and processing of logically related data over interconnected computer systems.', 'True', 'False', NULL, NULL, 'True'),
(2, 'One of the advantages of a distributed database management system (DDBMS) is security.', 'True', 'False', NULL, NULL, 'False'),
(3, 'ER aims to:', 'Facilitate database programming', 'Facilitate database organization', 'Facilitate database design', 'Facilitate database website', 'Facilitate database design'),
(3, 'The Conceptual data model is the set of concepts that:', 'Describe the structure of a database and the associated insert and update transactions', 'Describe the structure of a database and the associated retrieval and update transactions', 'Describe the structure of a database and the associated retrieval transactions', 'None of the above', 'Describe the structure of a database and the associated retrieval and update transactions'),
(3, 'A high-level conceptual model is dependent on the DBMS and HW platform used to implement the database. True or false?', 'True', 'False', NULL, NULL, 'False'),
(3, 'An Entity is', 'An instance of an Entity type that is uniquely identifiable', 'An instance of a DBA type that is uniquely identifiable', 'An instance of a type that is uniquely identifiable', 'None of the above', 'An instance of an Entity type that is uniquely identifiable'),
(3, 'Weak entity type:', 'An entity that is not existence-dependent on some other entity type', 'An Entity that characterizes a DBMS', 'An instance that is existence-dependent on some other entity type', 'None of the above', 'An instance that is existence-dependent on some other entity type'),
(3, 'Strong entity type:', 'An entity that is not existence-dependent on some other entity type', 'An Entity that characterizes a DBMS', 'An instance that is existence-dependent on some other entity type', 'All of the above', 'An entity that is not existence-dependent on some other entity type'),
(3, 'An Attribute is a property of an entity or a relationship type. True or false?', 'True', 'False', NULL, NULL, 'True'),
(3, 'An Attribute:', 'A set of values that might be assigned to an attribute.', 'Is a property of an entity or a relationship type', 'A set of numbers and values', 'None of the above', 'Is a property of an entity or a relationship type'),
(4, 'What is the primary key in a relational model?', 'Unique identifier for a table', 'Non-unique identifier for a table', 'Combination of attributes in a table', 'Indexed attribute in a table', 'Unique identifier for a table'),
(4, 'Which of the following best describes a foreign key?', 'A key that uniquely identifies each record in a table', 'A key that establishes a link between two tables', 'A key that is used for sorting records in a table', 'A key that cannot contain NULL values', 'A key that establishes a link between two tables'),
(4, 'What is normalization in the context of the relational model?', 'Adding redundancy to improve data retrieval', 'Removing redundancy to reduce data anomalies', 'Combining multiple tables into one to simplify queries', 'Adding additional columns to store calculated values', 'Removing redundancy to reduce data anomalies'),
(4, 'Which of the following is an example of a relational database management system (RDBMS)?', 'MongoDB', 'SQLite', 'Redis', 'Cassandra', 'SQLite'),
(4, 'In a relational database, what is the purpose of a join operation?', 'To add new records to a table', 'To update existing records in a table', 'To combine related information from multiple tables', 'To delete records from a table', 'To combine related information from multiple tables'),
(5, 'What is a functional dependency in a relational database?', 'A relationship between two attributes such that one attribute uniquely determines the value of another attribute.', 'A measure of the strength of association between two attributes in a database.', 'A constraint that ensures each tuple in a relation is unique.', 'A type of indexing technique used to optimize query performance.', 'A relationship between two attributes such that one attribute uniquely determines the value of another attribute.'),
(5, 'In a functional dependency A → B, what does A represent?', 'The dependent attribute.', 'The determinant attribute.', 'Both A and B.', 'None of the above.', 'The determinant attribute.'),
(5, 'What is a superkey in the context of functional dependencies?', 'A key that is minimal but not necessarily unique.', 'A set of attributes that uniquely determines all other attributes in a relation.', 'An attribute that is functionally dependent on another attribute.', 'A key that is unique but not necessarily minimal.', 'A set of attributes that uniquely determines all other attributes in a relation.'),
(5, 'Which of the following statements about candidate keys is true?', 'Candidate keys are determined solely by functional dependencies.', 'A candidate key is always a superkey.', 'There can be only one candidate key in a relation.', 'A candidate key uniquely identifies a tuple in a relation.', 'A candidate key is always a superkey.'),
(5, 'How can we determine the candidate keys of a relation using functional dependencies?', 'By identifying the minimal superkeys and checking if they uniquely identify the tuples.', 'By checking for transitive dependencies.', 'By using normalization techniques.', 'By performing a join operation on the relation.', 'By identifying the minimal superkeys and checking if they uniquely identify the tuples.'),
(5, 'What is closure of attributes with respect to a set of functional dependencies?', 'The process of determining all attributes functionally dependent on a given set of attributes.', 'The process of checking if two relations can be joined using a common attribute.', 'A technique for optimizing query performance.', 'A type of indexing technique used in databases.', 'The process of determining all attributes functionally dependent on a given set of attributes.'),
(5, 'Which normal form ensures that every non-prime attribute is fully functionally dependent on the primary key?', 'First Normal Form (1NF)', 'Second Normal Form (2NF)', 'Third Normal Form (3NF)', 'Boyce-Codd Normal Form (BCNF)', 'Third Normal Form (3NF)'),
(5, 'What is the purpose of normalizing a database?', 'To eliminate redundancy and minimize data anomalies.', 'To speed up database queries.', 'To increase the storage capacity of the database.', 'To add redundancy for fault tolerance.', 'To eliminate redundancy and minimize data anomalies.'),
(6, 'What is the primary objective of normalization in databases?', 'Reducing storage space', 'Enhancing data security', 'Eliminating data redundancy and inconsistency', 'Improving query performance', 'Eliminating data redundancy and inconsistency'),
(6, 'Which of the following is a requirement for a table to be in 1NF?', 'Data redundancy', 'Composite primary key', 'Atomic values in each column', 'Partial dependencies', 'Atomic values in each column'),
(6, 'Which normal form eliminates partial dependencies?', '1NF', '2NF', '3NF', 'BCNF', '2NF'),
(6, 'What is the primary focus of 3NF?', 'Eliminating data redundancy', 'Eliminating partial dependencies', 'Eliminating transitive dependencies', 'All of the above', 'Eliminating transitive dependencies'),
(6, 'In BCNF, what must be true about every determinant?', 'It must be a candidate key', 'It must be a non-prime attribute', 'It must be a composite key', 'It must be a foreign key', 'It must be a candidate key'),
(6, 'Which normal form is the most basic?', '1NF', '2NF', '3NF', 'BCNF', '1NF'),
(6, 'Which normal form deals with transitive dependencies?', '1NF', '2NF', '3NF', 'BCNF', '3NF'),
(6, 'What does 2NF eliminate?', 'Data redundancy', 'Partial dependencies', 'Composite keys', 'Foreign keys', 'Partial dependencies'),
(8, 'What does AWS stand for?', 'Amazon Web Services', 'Advanced Web Solutions', 'Application Web Services', 'Automated Web Servers', 'Amazon Web Services'),
(8, 'Which of the following is NOT a key benefit of using AWS?', 'Cost-effectiveness', 'Scalability', 'Complexity', 'Flexibility', 'Complexity'),
(8, 'Which AWS service is commonly used for deploying and managing virtual servers in the cloud?', 'Amazon S3', 'Amazon EC2', 'Amazon RDS', 'Amazon Lambda', 'Amazon EC2'),
(8, 'What is the AWS service used for storing and retrieving any amount of data from anywhere on the web?', 'Amazon EC2', 'Amazon S3', 'Amazon RDS', 'Amazon DynamoDB', 'Amazon S3'),
(8, 'Which AWS service is a fully managed database service that supports multiple database engines like MySQL, PostgreSQL, and Oracle?', 'Amazon EC2', 'Amazon S3', 'Amazon RDS', 'Amazon DynamoDB', 'Amazon RDS'),
(8, 'Which AWS service allows users to run code without provisioning or managing servers, and it automatically scales based on demand?', 'Amazon EC2', 'Amazon S3', 'Amazon RDS', 'Amazon Lambda', 'Amazon Lambda'),
(8, 'What is the primary advantage of using cloud computing services like AWS?', 'Increased hardware management', 'Decreased scalability', 'Reduced infrastructure costs', 'Limited geographic availability', 'Reduced infrastructure costs'),
(9, 'What is the primary purpose of a Virtual Private Cloud (VPC) in AWS?', 'To provide a dedicated physical network for each AWS account', 'To allow secure communication between AWS services and resources', 'To enable connections between on-premises networks and AWS cloud resources', 'To isolate and control network resources within a virtual network environment', 'To isolate and control network resources within a virtual network environment'),
(9, 'Which of the following is NOT a valid component of an AWS VPC?', 'Subnet', 'Internet Gateway', 'Route Table', 'VPN Tunnel', 'VPN Tunnel'),
(9, 'What is the purpose of a Security Group in AWS?', 'To define access control rules for EC2 instances at the instance level', 'To provide encryption for data stored in S3 buckets', 'To manage user authentication and authorization for AWS services', 'To configure network ACLs', 'To define access control rules for EC2 instances at the instance level'),
(9, 'Which of the following is true regarding Security Groups in AWS?', 'Security Groups are applied directly to EC2 instances.', 'Security Groups can span multiple AWS regions.', 'Security Groups can be configured with deny rules for inbound traffic.', 'Security Groups operate at the subnet level.', 'Security Groups are applied directly to EC2 instances.'),
(9, 'Which of the following is NOT a valid component of an AWS VPC?', 'Subnet', 'Internet Gateway', 'Route Table', 'VPN Tunnel', 'VPN Tunnel'),
(9, 'What is the purpose of a Security Group in AWS?', 'To define access control rules for EC2 instances at the instance level', 'To provide encryption for data stored in S3 buckets', 'To manage user authentication and authorization for AWS services', 'To configure network ACLs', 'To define access control rules for EC2 instances at the instance level'),
(10, 'What is the AWS CLI used for?', 'Deploying physical servers in AWS data centers', 'Managing AWS resources from the command line', 'Creating graphical user interfaces for AWS services', 'Configuring network firewalls in AWS VPCs', 'Managing AWS resources from the command line'),
(10, 'Which AWS CLI command is used to list all S3 buckets in an AWS account?', 'aws s3 create-bucket', 'aws s3 delete-bucket', 'aws s3 ls', 'aws s3 cp', 'aws s3 ls'),
(10, 'How can you upload a file to an S3 bucket using the AWS CLI?', 'aws s3 put-object', 'aws s3 copy', 'aws s3 upload', 'aws s3 sync', 'aws s3 put-object'),
(10, 'What is the maximum size of a single object that can be uploaded to Amazon S3?', '1 GB', '5 GB', '10 GB', '5 TB', '5 TB'),
(10, 'Which AWS CLI command is used to create a new hosted zone in Route 53?', 'aws route53 create-hosted-zone', 'aws route53 delete-hosted-zone', 'aws route53 list-hosted-zones', 'aws route53 change-resource-record-sets', 'aws route53 create-hosted-zone'),
(10, 'What is the primary purpose of Amazon S3?', 'To deploy and manage virtual servers', 'To provide scalable compute capacity', 'To store and retrieve data objects', 'To manage domain name system (DNS) records', 'To store and retrieve data objects'),
(10, 'How can you copy files from one S3 bucket to another using the AWS CLI?', 'aws s3 mv', 'aws s3 sync', 'aws s3 cp', 'aws s3 ls', 'aws s3 cp'),
(10, 'What does Route 53 refer to in AWS?', 'A content delivery network (CDN) service', 'A database service for real-time analytics', 'A managed domain name system (DNS) web service', 'A file storage service for archiving data', 'A managed domain name system (DNS) web service'),
(11, 'What is AWS CloudWatch primarily used for?', 'Monitoring and logging AWS resources and applications', 'Provisioning and managing cloud infrastructure', 'Storing and retrieving data objects in the cloud', 'Managing domain name system (DNS) records', 'Monitoring and logging AWS resources and applications'),
(11, 'Which AWS service provides automated actions based on predefined metrics or thresholds?', 'Amazon EC2', 'Amazon S3', 'AWS CloudWatch', 'AWS Lambda', 'AWS CloudWatch'),
(11, 'What type of information can AWS CloudWatch collect and track?', 'Performance metrics', 'Security logs', 'Database queries', 'File storage usage', 'Performance metrics'),
(11, 'Which of the following is NOT a component of AWS CloudWatch?', 'Alarms', 'Events', 'Dashboards', 'Templates', 'Templates'),
(11, 'What is the main purpose of AWS CloudFormation?', 'Monitoring AWS resources and applications', 'Storing and retrieving data objects in the cloud', 'Provisioning and managing AWS infrastructure as code', 'Managing domain name system (DNS) records', 'Provisioning and managing AWS infrastructure as code'),
(11, 'Which file format is commonly used for defining AWS CloudFormation templates?', 'YAML', 'JSON', 'XML', 'CSV', 'JSON'),
(11, 'What is the benefit of using AWS CloudFormation templates?', 'They provide real-time monitoring of AWS resources', 'They allow for the creation of customized virtual servers', 'They enable the automated provisioning and management of AWS resources', 'They facilitate data transfer between different AWS regions', 'They enable the automated provisioning and management of AWS resources'),
(11, 'How can AWS CloudFormation templates be executed?', 'Through the AWS Management Console only', 'Via the AWS CLI and SDKs', 'By writing custom scripts in Python', 'Through third-party cloud management platforms', 'Via the AWS CLI and SDKs'),
(12, 'What is AWS Lambda primarily used for?', 'Managing relational databases', 'Running serverless applications', 'Storing and retrieving data objects', 'Managing domain name system (DNS) records', 'Running serverless applications'),
(12, 'Which of the following statements best describes AWS Lambda?', 'It is a fully managed relational database service.', 'It is a serverless compute service that runs code in response to events.', 'It is a content delivery network (CDN) service for web applications.', 'It is a file storage service for archiving data.', 'It is a serverless compute service that runs code in response to events.'),
(12, 'What programming languages are supported by AWS Lambda?', 'Only Python', 'Only Java', 'Python, Java, Node.js, and more', 'Only Node.js', 'Python, Java, Node.js, and more'),
(12, 'How is AWS Lambda pricing calculated?', 'Based on the number of Lambda functions deployed', 'Based on the number of times a Lambda function is invoked and the duration of its execution', 'Based on the amount of data transferred through Lambda functions', 'Based on the number of AWS regions where Lambda functions are deployed', 'Based on the number of times a Lambda function is invoked and the duration of its execution'),
(12, 'What is AWS CloudFront primarily used for?', 'Managing relational databases', 'Running serverless applications', 'Content delivery and acceleration for web applications', 'Managing domain name system (DNS) records', 'Content delivery and acceleration for web applications'),
(12, 'Which of the following best describes AWS CloudFront?', 'It is a fully managed relational database service.', 'It is a serverless compute service that runs code in response to events.', 'It is a content delivery network (CDN) service for web applications.', 'It is a file storage service for archiving data.', 'It is a content delivery network (CDN) service for web applications.'),
(12, 'What is the benefit of using AWS CloudFront?', 'Improved database performance', 'Enhanced serverless application deployment', 'Reduced latency and improved content delivery speed', 'Simplified DNS management', 'Reduced latency and improved content delivery speed'),
(12, 'How does AWS CloudFront accelerate content delivery?', 'By caching content at AWS data centers located around the world', 'By compressing data before delivery to end users', 'By optimizing database queries for faster response times', 'By encrypting data in transit to improve security', 'By caching content at AWS data centers located around the world'),
(14, 'What does HTML stand for?', 'Hyper Text Markup Language', 'High Tech Markup Language', 'Hyperlinks and Text Markup Language', 'Home Tool Markup Language', 'Hyper Text Markup Language'),
(14, 'Which tag is used to define a hyperlink in HTML?', '<link>', '<href>', '<a>', '<hyperlink>', '<a>'),
(14, 'What is the correct HTML for creating a hyperlink?', '<a>http://www.example.com</a>', '<a href=\"http://www.example.com\">Click here</a>', '<a url=\"http://www.example.com\">Click here</a>', '<a link=\"http://www.example.com\">Click here</a>', '<a href=\"http://www.example.com\">Click here</a>'),
(14, 'Which tag is used to define an unordered list in HTML?', '<ol>', '<list>', '<ul>', '<unorderedlist>', '<ul>'),
(14, 'What is the correct HTML for adding a background color to a webpage?', '<body style=\"background-color:yellow;\">', '<body bg=\"yellow\">', '<body background=\"yellow\">', '<background color=\"yellow\">', '<body style=\"background-color:yellow;\">'),
(14, 'Which HTML tag is used to define the structure of a table?', '<table>', '<tab>', '<tr>', '<td>', '<table>'),
(14, 'What is the correct HTML for creating a checkbox?', '<input type=\"check\">', '<input type=\"checkbox\">', '<check>', '<checkbox>', '<input type=\"checkbox\">'),
(14, 'Which tag is used to define a section or division in an HTML document?', '<div>', '<section>', '<division>', '<sep>', '<div>'),
(14, 'What is the correct HTML for inserting an image?', '<img src=\"image.jpg\" alt=\"MyImage\">', '<image src=\"image.jpg\" alt=\"MyImage\">', '<img=\"image.jpg\" alt=\"MyImage\">', '<insert image=\"image.jpg\" alt=\"MyImage\">', '<img src=\"image.jpg\" alt=\"MyImage\">'),
(14, 'Which tag is used to define a paragraph in HTML?', '<p>', '<para>', '<paragraph>', '<ph>', '<p>'),
(15, 'What HTML element is used to define a section of navigation links?', '<nav>', '<section>', '<div>', '<header>', '<nav>'),
(15, 'Which HTML element is used to group a set of related form elements together?', '<fieldset>', '<group>', '<formset>', '<formgroup>', '<fieldset>'),
(15, 'What is the purpose of the <details> element in HTML?', 'To define a list of details', 'To define a section that can be toggled to show or hide content', 'To define a section of navigation links', 'To define a section of metadata for the document', 'To define a section that can be toggled to show or hide content'),
(15, 'How can you embed a video in an HTML document?', 'Using the <video> element', 'Using the <media> element', 'Using the <embed> element', 'Using the <movie> element', 'Using the <video> element'),
(15, 'Which HTML element is used to display computer code?', '<code>', '<pre>', '<var>', '<samp>', '<code>'),
(15, 'What is the purpose of the <canvas> element in HTML?', 'To display graphics', 'To define a client-side image map', 'To embed external content', 'To create animations', 'To display graphics'),
(15, 'How can you create a table with alternating row colors using only HTML?', 'By using the <table> element and applying CSS for alternate rows', 'By using the <tr> element and applying CSS for alternate rows', 'By using the <tbody> element and applying CSS for alternate rows', 'By using the <col> element and applying CSS for alternate rows', 'By using the <table> element and applying CSS for alternate rows'),
(15, 'What is the purpose of the <progress> element in HTML?', 'To display the progress of a task', 'To define a client-side image map', 'To create a group of related form elements', 'To display computer code', 'To display the progress of a task'),
(15, 'How can you add a background image to a webpage using CSS?', 'Using the background-image property', 'Using the background-color property', 'Using the image property', 'Using the background property', 'Using the background-image property'),
(15, 'Which HTML element is used to define a client-side image map?', '<map>', '<image>', '<area>', '<imagemap>', '<map>'),
(17, 'Which HTML element is used to embed interactive, programmable objects like games or video players into web pages?', '<applet>', '<object>', '<embed>', '<iframe>', '<object>'),
(17, 'What is the purpose of the <details> element in HTML?', 'To define a list of details', 'To define a section that can be toggled to show or hide content', 'To define a section of navigation links', 'To define a section of metadata for the document', 'To define a section that can be toggled to show or hide content'),
(17, 'Which HTML element is used to define navigation links?', '<nav>', '<links>', '<navigation>', '<navbar>', '<nav>'),
(17, 'What is the purpose of the <figcaption> element in HTML?', 'To define a caption for a <figure> element', 'To define a caption for an image', 'To define a caption for a table', 'To define a caption for a video', 'To define a caption for a <figure> element'),
(17, 'Which HTML element is used to define a container for an external application or interactive content?', '<object>', '<applet>', '<embed>', '<iframe>', '<object>'),
(17, 'What is the purpose of the <main> element in HTML?', 'To define the main content of a document', 'To define the header of a document', 'To define the footer of a document', 'To define a sidebar in a document', 'To define the main content of a document'),
(17, 'What is the purpose of the <mark> element in HTML?', 'To highlight text', 'To define a section of text that is a keyboard shortcut', 'To define a section of text that is user input', 'To define a section of text that is a variable', 'To highlight text'),
(17, 'Which HTML element is used to define a container for content that should be visually presented as a separate section of the page?', '<section>', '<div>', '<article>', '<aside>', '<section>'),
(17, 'What is the purpose of the <menu> element in HTML?', 'To define a list/menu of commands', 'To define a list/menu of navigation links', 'To define a list/menu of options', 'To define a list/menu of settings', 'To define a list/menu of commands'),
(18, 'What is the correct syntax for creating a linear gradient in CSS?', 'background: linear-gradient(to right, red, blue);', 'background: linear-gradient(red, blue);', 'linear-gradient: red, blue;', 'background: gradient-linear(red, blue);', 'background: linear-gradient(to right, red, blue);'),
(18, 'Which property is used to specify the direction of a linear gradient?', 'gradient-direction', 'gradient-angle', 'background-direction', 'background-angle', 'background-direction'),
(18, 'Which of the following values can be used with the radial-gradient() function to create a circle?', 'circle', 'ellipse', 'radial', 'circular', 'circle'),
(18, 'How can you create a radial gradient that starts from the center and ends at the edges of the element?', 'background: radial-gradient(ellipse at center, red, blue);', 'background: radial-gradient(circle at center, red, blue);', 'background: radial-gradient(circle, red, blue);', 'background: radial-gradient(ellipse, red, blue);', 'background: radial-gradient(circle at center, red, blue);'),
(18, 'What is the correct syntax for specifying the size of a radial gradient?', 'radial-gradient(size, color1, color2);', 'radial-gradient(color1, color2, size);', 'radial-gradient(color1, size, color2);', 'radial-gradient(color1, color2);', 'radial-gradient(color1, size, color2);'),
(18, 'Which of the following CSS properties is used to control the shape of a radial gradient?', 'background-size', 'gradient-shape', 'radial-shape', 'gradient-size', 'background-size'),
(18, 'In a radial gradient, what does the closest-side value do?', 'Starts the gradient from the center and ends at the closest side of the element', 'Starts the gradient from the farthest side and ends at the closest side of the element', 'Starts the gradient from the closest side and ends at the farthest side of the element', 'Starts the gradient from the farthest side and ends at the farthest side of the element', 'Starts the gradient from the center and ends at the closest side of the element'),
(18, 'How can you create a repeating linear gradient that goes from left to right?', 'background: repeating-linear-gradient(to right, red, blue);', 'background: repeating-linear-gradient(red, blue);', 'background: repeating-gradient-linear(to right, red, blue);', 'background: linear-gradient(repeat, red, blue);', 'background: repeating-linear-gradient(to right, red, blue);'),
(18, 'Which of the following is true about gradients in CSS?', 'Gradients can only have two colors', 'Gradients can have multiple colors', 'Gradients can only be linear', 'Gradients can only be radial', 'Gradients can have multiple colors'),
(18, 'How can you specify the starting and ending points of a linear gradient in CSS?', 'By using the from and to keywords', 'By using the start and end keywords', 'By using percentage values', 'By using the angle keyword', 'By using the from and to keywords'),
(19, 'Which of the following is not a valid HTML5 semantic element?', '<section>', '<div>', '<article>', '<nav>', '<div>'),
(19, 'How can you include an external CSS file in an HTML document?', '<link rel=\"stylesheet\" href=\"styles.css\">', '<style src=\"styles.css\">', '<css src=\"styles.css\">', '<stylesheet>styles.css</stylesheet>', '<link rel=\"stylesheet\" href=\"styles.css\">'),
(19, 'What is the purpose of the box-sizing property in CSS?', 'It sets the size of the text box in a form.', 'It defines how the total width and height of an element are calculated.', 'It specifies the spacing between the borders of an element', 'It determines the layout of child elements within a container', 'It defines how the total width and height of an element are calculated'),
(19, 'Which CSS property is used to create a shadow effect around an element\'s box?', 'box-shadow', 'text-shadow', 'shadow-effect', 'border-shadow', 'box-shadow'),
(19, 'How can you make an element\'s text italicized in CSS?', 'font-style: italic;', 'text-decoration: italic;', 'font-weight: italic;', 'text-style: italic;', 'font-style: italic;'),
(19, 'What does the display: inline-block; property do in CSS?', 'It displays an element as an inline-level block container', 'It displays an element as an inline-level block box', 'It hides an element from the display', 'It makes an element float to the left or right of its container.', 'It displays an element as an inline-level block box'),
(19, 'How can you center an element horizontally in CSS?', 'text-align: center;', 'align: center;', 'margin: auto;', 'horizontal-align: center;', 'margin: auto;'),
(19, 'What is the purpose of the <meta> tag in HTML?', 'To create a new section in the document.', 'To define metadata about the document, such as authorship or keywords.', 'To include an image in the document', 'To specify the character encoding of the document.', 'To define metadata about the document, such as authorship or keywords.'),
(19, 'How can you create a horizontal navigation bar in HTML and CSS?', 'Using an unordered list (<ul>) with list items (<li>) styled as inline-block elements', 'Using a series of div elements styled with display: inline;', 'Using a table with table rows and cells', 'Using a series of anchor elements (<a>) styled as inline elements.', 'Using an unordered list (<ul>) with list items (<li>) styled as inline-block elements'),
(19, 'Which CSS property is used to change the color of text?', 'text-color', 'color', 'font-color', 'text-style', 'color');

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
  `m_id` int(11) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `pincode` varchar(10) DEFAULT NULL,
  `district` varchar(255) DEFAULT NULL,
  `state` varchar(255) DEFAULT NULL,
  `DOB` date DEFAULT NULL,
  `age` int(11) DEFAULT NULL,
  `skills` varchar(255) DEFAULT NULL,
  `grade_point_average` decimal(5,2) DEFAULT NULL,
  `education_level` varchar(50) DEFAULT NULL,
  `university` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `subdiscussion`
--

CREATE TABLE `subdiscussion` (
  `subdiscussion_id` int(11) NOT NULL,
  `discussion_id` int(11) DEFAULT NULL,
  `subdiscussion_text` text DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `likes` int(11) DEFAULT 0,
  `liked_by` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`liked_by`))
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
-- Indexes for table `answer`
--
ALTER TABLE `answer`
  ADD PRIMARY KEY (`answer_id`),
  ADD KEY `m_id` (`m_id`),
  ADD KEY `answer_ibfk_1` (`discussion_id`);

--
-- Indexes for table `chat`
--
ALTER TABLE `chat`
  ADD PRIMARY KEY (`chat_id`),
  ADD KEY `s_id` (`s_id`),
  ADD KEY `fk_chat_course` (`c_id`);

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
-- Indexes for table `discussion`
--
ALTER TABLE `discussion`
  ADD PRIMARY KEY (`discussion_id`),
  ADD KEY `lecture_id` (`lecture_id`),
  ADD KEY `s_id` (`s_id`),
  ADD KEY `c_id` (`c_id`);

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
  ADD PRIMARY KEY (`q_id`),
  ADD KEY `fk_quiz_course` (`c_id`),
  ADD KEY `fk_quiz_lecture` (`lecture_id`);

--
-- Indexes for table `quiz_info`
--
ALTER TABLE `quiz_info`
  ADD KEY `q_id` (`q_id`);

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
-- Indexes for table `subdiscussion`
--
ALTER TABLE `subdiscussion`
  ADD PRIMARY KEY (`subdiscussion_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `subdiscussion_ibfk_1` (`discussion_id`);

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
-- AUTO_INCREMENT for table `answer`
--
ALTER TABLE `answer`
  MODIFY `answer_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `chat`
--
ALTER TABLE `chat`
  MODIFY `chat_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `department`
--
ALTER TABLE `department`
  MODIFY `d_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `discussion`
--
ALTER TABLE `discussion`
  MODIFY `discussion_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `inquiry`
--
ALTER TABLE `inquiry`
  MODIFY `inquiry_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `lecture`
--
ALTER TABLE `lecture`
  MODIFY `lecture_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT for table `payment`
--
ALTER TABLE `payment`
  MODIFY `payment_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `quiz`
--
ALTER TABLE `quiz`
  MODIFY `q_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `salary`
--
ALTER TABLE `salary`
  MODIFY `salary_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `subdiscussion`
--
ALTER TABLE `subdiscussion`
  MODIFY `subdiscussion_id` int(11) NOT NULL AUTO_INCREMENT;

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
-- Constraints for table `answer`
--
ALTER TABLE `answer`
  ADD CONSTRAINT `answer_ibfk_1` FOREIGN KEY (`discussion_id`) REFERENCES `discussion` (`discussion_id`),
  ADD CONSTRAINT `answer_ibfk_2` FOREIGN KEY (`m_id`) REFERENCES `mentors` (`m_id`);

--
-- Constraints for table `chat`
--
ALTER TABLE `chat`
  ADD CONSTRAINT `chat_ibfk_1` FOREIGN KEY (`s_id`) REFERENCES `student` (`s_id`),
  ADD CONSTRAINT `fk_chat_course` FOREIGN KEY (`c_id`) REFERENCES `course` (`c_id`);

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
-- Constraints for table `discussion`
--
ALTER TABLE `discussion`
  ADD CONSTRAINT `discussion_ibfk_1` FOREIGN KEY (`lecture_id`) REFERENCES `lecture` (`lecture_id`),
  ADD CONSTRAINT `discussion_ibfk_2` FOREIGN KEY (`s_id`) REFERENCES `student` (`s_id`),
  ADD CONSTRAINT `discussion_ibfk_3` FOREIGN KEY (`c_id`) REFERENCES `course` (`c_id`);

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
  ADD CONSTRAINT `quiz_info_ibfk_1` FOREIGN KEY (`q_id`) REFERENCES `quiz` (`q_id`);

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

--
-- Constraints for table `subdiscussion`
--
ALTER TABLE `subdiscussion`
  ADD CONSTRAINT `subdiscussion_ibfk_1` FOREIGN KEY (`discussion_id`) REFERENCES `discussion` (`discussion_id`),
  ADD CONSTRAINT `subdiscussion_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
