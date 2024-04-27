
    let c_id; // Global variable to store mentor c_id
    let user_id; // Global variable to store user ID

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
                
                user_id = data.user_id; // Assign user ID to the global variable
                console.log('User ID:', user_id);
                const welcomeMessage = document.getElementById('welcome');
                welcomeMessage.textContent = `Hi, ${data.name}  !`;

                // Fetch list of mentors
                fetchMentorDashboard(user_id)

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
                    fetchMentorList(c_id)
                }
            } else {
                console.error('Failed to fetch mentor dashboard:', response.statusText);
            }
        } catch (error) {
            console.error('Error fetching mentor dashboard:', error.message);
        }
    }
    

    async function fetchMentorList(c_id) {
        try {
            const response = await fetch('https://learning-u7aw.onrender.com/api/listmentor', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ c_id }) // Include c_id in the request body
            });

            if (response.ok) {
                const mentorData = await response.json();
                console.log('Mentor data:', mentorData);

                // Populate table with mentor data
                const tableBody = document.querySelector('#example tbody');
                mentorData.forEach(mentor => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${mentor.username}</td>
                        <td>${mentor.name}</td>
                        <td>${mentor.position}</td>
                        <td>${mentor.no_of_students}</td>
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
                        const nameColumn = row.querySelector('td:nth-child(2)'); // Select the second column (name)
                        const name = nameColumn.textContent.toLowerCase();
                        if (name.includes(searchText)) {
                            row.style.display = ''; // Show the row if the name matches the search text
                        } else {
                            row.style.display = 'none'; // Hide the row if the name does not match
                        }
                    });
                });

            } else {
                console.error('Failed to fetch mentor list:', response.statusText);
            }
        } catch (error) {
            console.error('Error fetching mentor list:', error.message);
        }
    }

    window.onload = decodeToken;
