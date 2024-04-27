
    let userId; // Global variable to store user ID
    let c_id; // Global variable to store mentor c_id

    async function decodeToken() {
        const token = localStorage.getItem('Token');
        if (!token) {
            console.error('Token not found in local storage');
            redirectToLogin();
        }

        try {
            const response = await fetch('https://learning-u7aw.onrender.com/api/decodeToken', {
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
            const response = await fetch('https://learning-u7aw.onrender.com/api/mentordashboard', {
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
                    fetchMentorListDropdown(c_id);
                    fetchStudentsWithoutMentor(c_id);
                }
            } else {
                console.error('Failed to fetch mentor dashboard:', response.statusText);
            }
        } catch (error) {
            console.error('Error fetching mentor dashboard:', error.message);
        }
    }
    
    async function fetchStudentsWithoutMentor(c_id) {
    try {
        // Fetch data from the API
        const response = await fetch('https://learning-u7aw.onrender.com/api/studentwithoutmentor', {
            method: 'POST', // Use POST method
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ c_id }) // Send the c_id in the request body
        });

        if (response.ok) {
            const studentsWithoutMentor = await response.json();
            console.log('Students without mentor:', studentsWithoutMentor);
            
            // Get a reference to the table body
            const tableBody = document.querySelector('#example tbody');
            
            // Clear the table body first
            tableBody.innerHTML = '';

            if (studentsWithoutMentor.length === 0) {
                // If no students are without mentors, display a message
                const row = document.createElement('tr');
                row.innerHTML = `<td colspan="4" style="text-align: center;">All students are already assigned with mentors</td>`;

                tableBody.appendChild(row);
            } else {
                let counter = 1; // Initialize a counter variable for generating unique IDs
                // Populate the table with the fetched data
                studentsWithoutMentor.forEach(student => {
                    const row = document.createElement('tr');
                    const mentorDropdownCell = document.createElement('td');
                    const dropdown = document.createElement('select');
                    dropdown.classList.add('form-control');
                    
                    // Set the ID attribute of the dropdown
                    const dropdownId = student.student_id ? `mentorDropdown_${student.student_id}` : `mentorDropdown_${counter}`;
                    dropdown.id = dropdownId; // Unique ID for each dropdown
                    mentorDropdownCell.appendChild(dropdown);
                    
                    // Add student data to the row
                    row.innerHTML = `
                        <td>${student.student_username}</td>
                        <td>${student.student_name}</td>
                        <td></td>
                        <td>
                            <button class="btn btn-primary update-btn" data-sid="${student.s_id}">Update</button>
                        </td>
                    `;
                    
                    // Append mentor dropdown cell to the row
                    row.querySelector('td:nth-child(3)').appendChild(mentorDropdownCell);
                    
                    // Append the row to the table body
                    tableBody.appendChild(row);
                    
                    // Increment the counter
                    counter++;
                    
                    // Populate the mentor dropdown
                    fetchMentorDropdown(c_id, dropdownId);
                });

                // Add event listeners to the update buttons
                document.querySelectorAll('.update-btn').forEach(button => {
                    button.addEventListener('click', async () => {
                        const dropdownId = button.closest('tr').querySelector('select').id;
                        const selectedMentorId = document.getElementById(dropdownId).value;
                        const studentId = button.dataset.sid; // Retrieve student ID from data attribute
                        console.log('Selected Mentor ID:', selectedMentorId);
                        console.log('Student ID:', studentId);
                        
                        // Call function to assign mentor to the student
                        assignMentorToStudent(studentId, selectedMentorId);
                    });
                });
            }
        } else {
            console.error('Failed to fetch students without mentor:', response.statusText);
        }
    } catch (error) {
        console.error('Error fetching students without mentor:', error.message);
    }
}



async function fetchMentorDropdown(c_id, dropdownId) {
    try {
        const response = await fetch('https://learning-u7aw.onrender.com/api/listmentor', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ c_id })
        });

        if (response.ok) {
            let mentorList = await response.json();
            console.log('Mentor list:', mentorList);

            // Remove the mentor where m_id equals userId
            mentorList = mentorList.filter(mentor => mentor.m_id !== userId);

            // Get a reference to the dropdown
            const dropdown = document.getElementById(dropdownId);

            // Clear previous dropdown options
            dropdown.innerHTML = '';

            // Add the default "Select" option
            const defaultOption = document.createElement('option');
            defaultOption.value = ''; // Empty value
            defaultOption.textContent = 'Select';
            dropdown.appendChild(defaultOption);

            // Populate dropdown with mentor names
            mentorList.forEach(mentor => {
                const option = document.createElement('option');
                option.value = mentor.m_id; // Assuming mentor id is used as value
                option.textContent = mentor.name;
                dropdown.appendChild(option);
            });
        } else {
            console.error('Failed to fetch mentor list:', response.statusText);
        }
    } catch (error) {
        console.error('Error fetching mentor list:', error.message);
    }
}


    async function assignMentorToStudent(studentId, selectedMentorId) {
    try {
        const response = await fetch('https://learning-u7aw.onrender.com/api/assignmentor', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ s_id: studentId, m_id: selectedMentorId })
        });

        if (response.ok) {
            // If response is successful, log the message
            console.log("mentor updated .. ")
            const responseData = await response.json();
            console.log('Server Response:', responseData.message);

            // Fetch students without mentor again to reflect the changes
            fetchStudentsWithoutMentor(c_id);
        } else {
            // If response is not successful, log the error
            const errorData = await response.json();
            console.error('Server Error:', errorData.error || 'Unknown error');
        }
    } catch (error) {
        console.error('Error assigning mentor:', error.message);
    }
}
 
async function fetchMentorListDropdown(c_id) {
    try {
        const mentorListResponse = await fetch('https://learning-u7aw.onrender.com/api/listmentor', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ c_id })
        });

        if (!mentorListResponse.ok) {
            throw new Error('Failed to fetch mentor list');
        }

        const mentorList = await mentorListResponse.json();
        console.log('Mentor list:', mentorList);

        // Filter out the mentor where m_id equals userId
        const filteredMentorList = mentorList.filter(mentor => mentor.m_id !== userId);

        // Get a reference to the dropdown
        const filterDropdown = document.getElementById('filterDropdown');
        
        // Clear previous dropdown options
        filterDropdown.innerHTML = '';

        // Create and append the default option
        const defaultOption = document.createElement('option');
        defaultOption.value = ''; // Empty value
        defaultOption.textContent = 'Select mentor';
        filterDropdown.appendChild(defaultOption);

        // Populate dropdown with mentor names from the filtered list
        filteredMentorList.forEach(mentor => {
            const option = document.createElement('option');
            option.value = mentor.m_id; // Assuming mentor id is used as value
            option.textContent = mentor.name;
            filterDropdown.appendChild(option);
        });

        // Add event listener to the dropdown
        filterDropdown.addEventListener('change', async (event) => {
            const selectedMentorId = parseInt(event.target.value); // Parse the selected mentor ID to an integer
            console.log('Selected mentor id:', selectedMentorId);
            if (selectedMentorId) {
                // Find the selected mentor in the filteredMentorList
                const selectedMentor = filteredMentorList.find(mentor => mentor.m_id === selectedMentorId);
                if (selectedMentor) {
                    // Update mentor details card with the selected mentor's details
                    document.getElementById('mentorName').value = selectedMentor.name;
                    document.getElementById('mentorUsername').value = selectedMentor.username;
                    document.getElementById('mentorPosition').value = selectedMentor.position;
                    document.getElementById('numberOfStudents').value = selectedMentor.no_of_students;

                    // Display mentor details card
                    document.getElementById('mentorDetailsCard').style.display = 'block';
                } else {
                    console.error('Selected mentor not found in mentor list');
                }
            } else {
                // Hide mentor details card if no mentor selected
                document.getElementById('mentorDetailsCard').style.display = 'none';
            } 
        });

    } catch (error) {
        console.error('Error fetching mentor list:', error.message);
    }
}

    window.onload = decodeToken;
