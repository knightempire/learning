
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
                checkStudent(user_id);
                studentLecture(user_id);
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

    async function checkStudent(s_id) {
    try {
        const response = await fetch('https://learning-l3tf.onrender.com/api/checkstudent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ s_id })
        });

        if (response.ok) {
            const responseData = await response.json();
            console.log('Student data:', responseData);
            
            // Access the c_id directly from the data object
            const c_id = responseData.data.c_id;
            console.log('c_id:', c_id);


            // Process student data as needed
        } else {
            console.error('Failed to check student status:', response.statusText);
        }
    } catch (error) {
        console.error('Error checking student status:', error.message);
    }
}

async function  studentLecture(s_id) {
        try {
            const response = await fetch('https://learning-l3tf.onrender.com/api/lecture', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ s_id })
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
                    <iframe width="100%" height="550" src="${lecture.video_url}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
                </div>
            `;

            // Append accordion header and body to the accordion item
            accordionItem.appendChild(accordionHeader);
            accordionItem.appendChild(accordionBody);

            // Append accordion item to the parent element
            accordionParent.appendChild(accordionItem);
        });
    }


    window.onload = decodeToken;
