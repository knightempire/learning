
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
                welcomeMessage.textContent = `Hi, welcome back ${data.name}!`;
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
               
                    fetchQuizData(c_id)
                }
            } else {
                console.error('Failed to fetch mentor dashboard:', response.statusText);
            }
        } catch (error) {
            console.error('Error fetching mentor dashboard:', error.message);
        }
    }


    async function fetchQuizData(c_id) {
        try {
            const response = await fetch('https://learning-l3tf.onrender.com/api/quiz', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ c_id })
            });

            if (response.ok) {
                const quizData = await response.json();
                console.log('Quiz data:', quizData);
                // Process quiz data as needed
                populateDropdown(quizData);
            } else {
                console.error('Failed to fetch quiz data:', response.statusText);
            }
        } catch (error) {
            console.error('Error fetching quiz data:', error.message);
        }
    }

    function populateDropdown(quizData) {
        const dropdown = document.getElementById('dropdown');

        // Clear previous options
        dropdown.innerHTML = '';

        // Add default option
        const defaultOption = document.createElement('option');
        defaultOption.value = ''; // Empty value
        defaultOption.textContent = 'Select Quiz';
        dropdown.appendChild(defaultOption);

        // Check if quizData is an object and contains the data property
        if (typeof quizData === 'object' && quizData.hasOwnProperty('data')) {
            // Populate dropdown with quiz names
            quizData.data.forEach(quiz => {
                const option = document.createElement('option');
                option.value = quiz.q_id; // Assuming quiz ID is used as value
                option.textContent = quiz.title;
                dropdown.appendChild(option);
            });

            // Add event listener to dropdown
            dropdown.addEventListener('change', function() {
                // Get the selected quiz title
                const selectedTitle = this.options[this.selectedIndex].textContent;
                // Find the corresponding quiz object in quizData
                const selectedQuiz = quizData.data.find(quiz => quiz.title === selectedTitle);
                if (selectedQuiz) {
                    // Print selected title and q_id
                    console.log('Selected Title:', selectedTitle);
                    q_id=selectedQuiz.q_id
                    console.log('q_id:', q_id);

                    fetchQuizInfo(q_id)
                    
                } else {
                    console.error('Selected quiz not found in quizData:', selectedTitle);
                }

                // Update the card title with the selected quiz title
                const cardTitleElement = document.getElementById('quiztitle');
                cardTitleElement.textContent = selectedTitle;

            });
        } else {
            console.error('Quiz data is not in the expected format:', quizData);
        }
    }

    async function fetchQuizInfo(q_id) {
    try {
        const response = await fetch('https://learning-l3tf.onrender.com/api/quizinfo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ q_id })
        });

        if (response.ok) {
            const quizInfoData = await response.json();
            console.log('Quiz info data:', quizInfoData);

            // Update quiz title in header
            const quizTitleElement = document.getElementById('quizTitle');
            if (quizTitleElement) {
                quizTitleElement.textContent = quizInfoData.quizTitle;
            } else {
                console.error('Element with id "quizTitle" not found.');
            }

            // Call displayQuizInfo to render quiz questions and options
            displayQuizInfo(quizInfoData);
        } else {
            console.error('Failed to fetch quiz info:', response.statusText);
        }
    } catch (error) {
        console.error('Error fetching quiz info:', error.message);
    }
}

// Function to display quiz questions and options in accordion format
function displayQuizInfo(quizInfoData) {
    // Get the accordion container
    const accordionContainer = document.getElementById('accordion-eleven');

    // Clear previous accordion items
    accordionContainer.innerHTML = '';

    // Loop through each quiz info object and create accordion items
    quizInfoData.quizInfo.forEach((quizItem, index) => {
        // Create accordion item
        const accordionItem = document.createElement('div');
        accordionItem.classList.add('accordion__item');

        // Create accordion header
        const accordionHeader = document.createElement('div');
        accordionHeader.classList.add('accordion__header', 'accordion__header--primary', 'collapsed');
        accordionHeader.setAttribute('data-toggle', 'collapse');
        accordionHeader.setAttribute('data-target', `#rounded-stylish_collapse${index}`);
        accordionHeader.setAttribute('aria-expanded', 'false');

        // Set header text as the question
        accordionHeader.innerHTML = `
            <span class="accordion__header--icon"></span>
            <span class="accordion__header--text">${quizItem.question}</span>
            <span class="accordion__header--indicator"></span>
        `;

        // Create accordion body
        const accordionBody = document.createElement('div');
        accordionBody.id = `rounded-stylish_collapse${index}`;
        accordionBody.classList.add('accordion__body', 'collapse');
        accordionBody.setAttribute('data-parent', '#accordion-eleven');

        // Create body text to hold options
        const bodyText = document.createElement('div');
        bodyText.classList.add('accordion__body--text');

        // Populate options in input boxes
        bodyText.innerHTML = `
            <div class="row">
                <div class="col-md-6">
                    <input type="text" class="form-control mb-2" value="${quizItem.a}" style="background-color: ${quizItem.answer === 'a' ? 'lightgreen' : '#f7f7f7'}; border-color: ${quizItem.answer === 'a' ? 'lightgreen' : '#ced4da'};" readonly>
                    <input type="text" class="form-control mb-2" value="${quizItem.b}" style="background-color: ${quizItem.answer === 'b' ? 'lightgreen' : '#f7f7f7'}; border-color: ${quizItem.answer === 'b' ? 'lightgreen' : '#ced4da'};" readonly>
                </div>
                <div class="col-md-6">
                    <input type="text" class="form-control mb-2" value="${quizItem.c}" style="background-color: ${quizItem.answer === 'c' ? 'lightgreen' : '#f7f7f7'}; border-color: ${quizItem.answer === 'c' ? 'lightgreen' : '#ced4da'};" readonly>
                    <input type="text" class="form-control mb-2" value="${quizItem.d}" style="background-color: ${quizItem.answer === 'd' ? 'lightgreen' : '#f7f7f7'}; border-color: ${quizItem.answer === 'd' ? 'lightgreen' : '#ced4da'};" readonly>
                </div>
            </div>
            <div class="row">
                <div class="col-md-6">
                    <br>
                    <button type="button" class="btn btn-danger btn-sm mb-3" onclick="deleteRow(this)">Delete</button>
                    <button type="button" class="btn btn-primary btn-sm mb-3" onclick="updateRow(this)">Update</button>
                </div>
                <div class="col-md-6 ">
                    <p>Correct Answer:
                    <input type="text" class="form-control mb-2" value="${quizItem.answer}" style="background-color: lightgreen; border-color: lightgreen;" readonly> </p>
                </div>
            </div>
        `;

        // Append accordion header and body to accordion item
        accordionItem.appendChild(accordionHeader);
        accordionItem.appendChild(accordionBody);
        accordionBody.appendChild(bodyText);

        // Append accordion item to accordion container
        accordionContainer.appendChild(accordionItem);
    });
}


    window.onload = function() {
        decodeToken();
        
        // Initialize the Select2 dropdown
        $('#dropdown').select2({
            width: '100%', // Adjust the width as needed
            placeholder: 'Search...',
            allowClear: true // Allow clearing the selection
        });
    };
