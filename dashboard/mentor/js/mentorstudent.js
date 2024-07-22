
    let userId; // Global variable to store user ID
let c_id; // Global variable to store mentor c_id
let sortDirection = ''; // Global variable to store sorting direction
let mentorSortDirection = ''; // Global variable to store mentor sorting direction

async function decodeToken() {
    const token = localStorage.getItem('Token');
    if (!token) {
        console.error('Token not found in local storage');
        redirectToLogin();
    }

    try {
        const response = await fetch('http://localhost:3000/api/decodeToken', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token })
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Decoded token data:', data);

            userId = data.user_id; // Assigning user ID to the global variable
            console.log('User ID:', userId);
            const welcomeMessage = document.getElementById('welcome');
                welcomeMessage.textContent = `Hi, ${data.name}  !`;

            fetchMentorDashboard(userId);
        } else {
            console.error('Failed to decode token:', response.statusText);
            redirectToLogin();
        }
    } catch (error) {
        console.error('Error decoding token:', error.message);
    }
}

function redirectToLogin() {
    // Redirect to login.html
    window.location.href = '../../login.html';
}

async function fetchMentorDashboard(userId) {
    try {
        const response = await fetch('http://localhost:3000/api/mentordashboard', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ user_id: userId })
        });

        if (response.ok) {
            const mentorData = await response.json();
            console.log('Mentor dashboard data:', mentorData);
            if (mentorData.mentorExists && mentorData.mentorDetails.length > 0) {
                // If mentor exists and details are available
                c_id = mentorData.mentorDetails[0].c_id; // Assigning mentor c_id to the global variable
                console.log("c_id:", c_id);

                // Fetch list of students with the obtained c_id
                fetchStudentList(c_id);
            }
        } else {
            console.error('Failed to fetch mentor dashboard:', response.statusText);
        }
    } catch (error) {
        console.error('Error fetching mentor dashboard:', error.message);
    }
}

async function fetchStudentList(c_id) {
    try {
        const response = await fetch('http://localhost:3000/api/liststudent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ c_id: c_id }) // Sending c_id to fetch student list
        });

        if (response.ok) {
            let studentList = await response.json();
            
            // Sort the data based on the current sort direction and column
            if (sortDirection) {
                studentList = sortData(studentList, sortDirection);
            }

            // Clear existing table rows
            const tableBody = document.querySelector('#example tbody');
            tableBody.innerHTML = '';

            // Populate table with student data
            studentList.forEach(student => {
                // Format the joining date to display only the date portion
                const joiningDate = new Date(student.joining_date);
                const formattedJoiningDate = joiningDate.toLocaleDateString('en-US');

                // Set mentor name and color based on availability
                const mentorName = student.mentor_name ? student.mentor_name : 'Not assigned';
                const mentorColor = student.mentor_name ? '' : 'text-red'; // Add text-red class if mentor name is null

                // Create row and populate table
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${student.student_username}</td>
                    <td>${student.student_name}</td>
                    <td>${formattedJoiningDate}</td>
                    <td class="${mentorColor}">${mentorName}</td> <!-- Apply class based on mentor availability -->
                    <td><button class="btn btn-primary btn-sm view-btn">View</button></td>
                `;
                tableBody.appendChild(row);
            });

            // Add search functionality to the table
            const searchInput = document.getElementById('searchInput');
            searchInput.addEventListener('input', function() {
                const searchText = this.value.toLowerCase();
                const rows = tableBody.querySelectorAll('tr');
                rows.forEach(row => {
                    const studentNameColumn = row.querySelector('td:nth-child(2)'); // Select the second column (student_name)
                    const studentName = studentNameColumn.textContent.toLowerCase();

                    const mentorNameColumn = row.querySelector('td:nth-child(4)'); // Select the fourth column (mentor_name)
                    const mentorName = mentorNameColumn.textContent.toLowerCase();

                    if (studentName.includes(searchText) || mentorName.includes(searchText)) {
                        row.style.display = ''; // Show the row if the student_name or mentor_name matches the search text
                    } else {
                        row.style.display = 'none'; // Hide the row if neither student_name nor mentor_name matches the search text
                    }
                });
            });
        } else {
            console.error('Failed to fetch student list:', response.statusText);
        }
    } catch (error) {
        console.error('Error fetching student list:', error.message);
    }
}

// Function to sort data
function sortData(data, direction) {
    const sortedData = [...data];
    sortedData.sort((a, b) => {
        const valueA = a.student_name.toLowerCase();
        const valueB = b.student_name.toLowerCase();
        let comparison = 0;
        if (valueA > valueB) {
            comparison = 1;
        } else if (valueA < valueB) {
            comparison = -1;
        }
        return direction === 'asc' ? comparison : -comparison;
    });
    return sortedData;
}

// Function to toggle sort direction
function toggleSortDirection() {
    sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
}

// Function to handle column header click for sorting
function handleHeaderClick(columnIndex) {
    if (columnIndex === 3) { // Mentor column
        mentorSortDirection = mentorSortDirection === '' ? 'asc' : mentorSortDirection === 'asc' ? 'desc' : '';
        sortDirection = ''; // Reset the sort direction for other columns
        fetchStudentList(c_id);
    } else {
        mentorSortDirection = '';
        toggleSortDirection();
        fetchStudentList(c_id);
    }
}

window.onload = decodeToken;
