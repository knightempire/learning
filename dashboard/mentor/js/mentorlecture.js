
    let c_id; // Global variable to store mentor c_id
    let user_id; // Global variable to store user ID

    async function decodeToken() {
        const token = localStorage.getItem('Token');
        if (!token) {
            console.error('Token not found in local storage');
            redirectToLogin();
        }

        try {
            const response = await fetch('https://learning-l3tf.onrender.com/api/decodeToken', {
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
            const response = await fetch('https://learning-l3tf.onrender.com/api/mentordashboard', {
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
                    fetchLectureData(c_id);
                }
            } else {
                console.error('Failed to fetch mentor dashboard:', response.statusText);
            }
        } catch (error) {
            console.error('Error fetching mentor dashboard:', error.message);
        }
    }

    async function fetchLectureData(c_id) {
        try {
            const response = await fetch('https://learning-l3tf.onrender.com/api/getlecture', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ c_id })
            });

            if (response.ok) {
                const lectureData = await response.json();
                console.log('Lecture data:', lectureData);
                // Print lecture names in the accordion
                printLectureNames(lectureData.data);
            } else {
                console.error('Failed to fetch lecture data:', response.statusText);
            }
        } catch (error) {
            console.error('Error fetching lecture data:', error.message);
        }
    }

    function printLectureNames(lectures) {
        const accordionParent = document.getElementById('accordion-nine');
        lectures.forEach((lecture, index) => {
            // Create accordion item container
            const accordionItem = document.createElement('div');
            accordionItem.classList.add('accordion__item');

            // Create accordion header
            const accordionHeader = document.createElement('div');
            accordionHeader.classList.add('accordion__header');
            accordionHeader.classList.add('collapsed'); // Initially collapsed
            accordionHeader.setAttribute('data-toggle', 'collapse');
            accordionHeader.setAttribute('data-target', `#active-header_collapse_${index + 1}`); // Unique ID for each accordion header
            accordionHeader.innerHTML = `
                <span class="accordion__header--icon"></span>
                <span class="accordion__header--text">${lecture.title}</span>
                <span class="accordion__header--indicator"></span>
            `;

            // Create accordion body
            const accordionBody = document.createElement('div');
            accordionBody.classList.add('collapse');
            accordionBody.classList.add('accordion__body');
            accordionBody.setAttribute('id', `active-header_collapse_${index + 1}`); // Unique ID for each accordion body
            accordionBody.setAttribute('data-parent', '#accordion-nine');
            accordionBody.innerHTML = `
                <div class="accordion__body--text">
                    <!-- Content of ${lecture.title} -->
                    <iframe width="560" height="315" src="${lecture.video_url}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
                </div>
            `;

            // Append accordion header and body to the accordion item
            accordionItem.appendChild(accordionHeader);
            accordionItem.appendChild(accordionBody);

            // Append accordion item to the parent element
            accordionParent.appendChild(accordionItem);
        });
    }


    async function uploadvideo() {
    try {
        // Get the input values from the form
        const title = document.getElementById('title').value;
        const videoUrl = document.getElementById('video').value;

        // Create the request body
        const requestBody = {
            title: title,
            video_url: videoUrl,
            c_id: c_id // Assuming c_id is globally accessible
        };
        console.log(requestBody)

        // Send a POST request to the API endpoint
        const response = await fetch('https://learning-l3tf.onrender.com/api/uploadvideo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (response.ok) {
            // If the request is successful, close the modal
            $('#addLectureModal').modal('hide');
            console.log('Lecture uploaded successfully');

            // Show the success message for 5 seconds
            const successAlert = document.getElementById('success');
            successAlert.style.display = 'block';
            setTimeout(() => {
                successAlert.style.display = 'none';
                // Refresh the page after 5 seconds
                setTimeout(() => {
                    location.reload();
                }, 2000);
            }, 2000);
        } else {
            console.error('Failed to upload lecture:', response.statusText);
            alert('Failed to upload lecture. Please try again later.');
        }
    } catch (error) {
        console.error('Error uploading lecture:', error.message);
        alert('An error occurred while uploading the lecture. Please try again later.');
    }
}


    window.onload = decodeToken;
