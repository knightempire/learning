
    let c_id; // Global variable to store mentor c_id
    let user_id; // Global variable to store user ID

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
               
                    fetchQuizData(c_id)
                    getLecturesWithoutQuizzes(c_id)
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
            const response = await fetch('http://localhost:3000/api/quiz', {
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
        const response = await fetch('http://localhost:3000/api/quizinfo', {
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


function initializeQuizForm() {
    const addQuizButtons = document.querySelectorAll('.addQuizButton');
    const quizForms = document.querySelectorAll('.quizForm');
    const closeFormButtons = document.querySelectorAll('.closeFormButton');

    addQuizButtons.forEach((addQuizButton, index) => {
        addQuizButton.addEventListener('click', function() {
            quizForms[index].style.display = 'block';
        });
    });

    closeFormButtons.forEach((closeFormButton, index) => {
        closeFormButton.addEventListener('click', function() {
            quizForms[index].style.display = 'none';
        });
    });
}


function initializeQuizForm() {
    // Select the quiz form element
    const quizForm = document.querySelector('.quizForm');
    
    // Toggle the display property of the quiz form
    if (quizForm.style.display === 'none') {
        // If form is hidden, show it
        quizForm.style.display = 'block';
    } else {
        // If form is visible, hide it
        quizForm.style.display = 'none';
    }
}


async function getLectureCount(c_id) {
    try {
        const url = 'http://localhost:3000/api/getlecture';
        const body = JSON.stringify({ c_id });
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: body
        };
        const response = await fetch(url, options);
        const data = await response.json();
        if (response.ok) {
            return data.data.length;
        } else {
            console.error('Error retrieving lecture count:', data.error);
            return 0;
        }
    } catch (error) {
        console.error('Error fetching lecture count:', error);
        return 0;
    }
}


async function getLecturesWithoutQuizzes(c_id) {
    try {
        const url = 'http://localhost:3000/api/viewnoquizlecture';
        const body = JSON.stringify({ c_id });
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: body
        };
        const response = await fetch(url, options);
        const data = await response.json();
        if (response.ok) {
            const totalLectureCount = await getLectureCount(c_id);
            const totalQuizCount = data.lectures.length;
            const totalQuizWithoutLecture = totalQuizCount - totalLectureCount;
            document.getElementById('totalQuizCount').textContent = totalQuizWithoutLecture;
            document.getElementById('totalLectureCount').textContent = totalLectureCount;
            
            const lectureSelect = document.querySelector('.lectureSelect');
      
            
            if (lectureSelect) {
                // Set initial option to "Select Lecture"
                lectureSelect.innerHTML = '<option value="" selected>Select Lecture</option>'; 
                
                if (totalLectureCount === 0) {
                    // If there are no lectures, show a message or handle the case as needed
                    console.log('No lectures found');
                } else {
                    // Populate the dropdown with lecture titles
                    populateLectureDropdown(data.lectures);
                }
            } else {
                console.error('Dropdown element not found');
            }
            
            return data.lectures;
        } else {
            console.error('Error retrieving lectures:', data.error);
            return null;
        }
    } catch (error) {
        console.error('Error fetching lectures:', error);
        return null;
    }
}


function populateLectureDropdown(lectures) {
    const lectureSelect = document.querySelector('.lectureSelect');
    lectureSelect.innerHTML = '<option value="" selected>Select Lecture</option>'; // Set initial option to "Select Lecture"
    lectures.forEach(lecture => {
        const option = document.createElement('option');
        option.value = lecture.lecture_id;
        option.textContent = lecture.title; // Assuming 'title' is the property name containing the lecture title
        lectureSelect.appendChild(option);
    });
}



function populateLectureDropdown(lectures) {
    const lectureSelect = document.querySelector('.lectureSelect');

    try {
        // Clear existing options
        lectureSelect.innerHTML = '';

        // Check if lectures were successfully retrieved
        if (lectures) {
            // Populate dropdown with lecture titles
            lectures.forEach(lecture => {
                const option = document.createElement('option');
                option.value = lecture.lecture_id;
                option.textContent = lecture.title; // Assuming 'title' is the property name containing the lecture title
                lectureSelect.appendChild(option);
            });
        } else {
            // Handle case where lectures couldn't be retrieved
            console.error('Failed to retrieve lectures without quizzes');
        }
    } catch (error) {
        // Log any errors that occur during retrieval
        console.error('Error populating lecture dropdown:', error);
    }
}


function hideForm() {
    const form = document.querySelector('.quizForm');
    form.style.display = 'none';
}

function updateFileName(input) {
    const fileName = input.files[0].name;
    const label = input.parentElement.querySelector('.custom-file-label');
    label.textContent = fileName;
}



// Function to handle uploading quiz data

function uploadingQuiz() {
    // Get the selected lecture ID
    const lectureSelect = document.querySelector('.lectureSelect');
    const selectedLectureId = lectureSelect.value;
    
    // Get the uploaded file
    const uploadedFile = document.querySelector('.fileUpload').files[0];
    
    // Check if a lecture is selected
    if (!selectedLectureId) {
        console.error('No lecture selected');
        return;
    }
    
    // Check if a file is uploaded
    if (!uploadedFile) {
        console.error('No file uploaded');
        return;
    }
    
    // Get c_id from the global scope
    const globalCId = c_id;
    
    // Log the lecture ID, uploaded file name, and c_id
    console.log('Lecture ID:', selectedLectureId);
    console.log('Uploaded File Name:', uploadedFile.name);
    console.log('c_id in global:', globalCId);
    
    // Create a new FormData object
    const formData = new FormData();
    
    // Append other form data fields
    formData.append('c_id', globalCId);
    formData.append('lecture_id', selectedLectureId);
    
    // Append the file as a blob
    formData.append('file', uploadedFile);
    
    // Send a POST request to the server
    fetch('http://localhost:3000/api/uploadquizinfos', {
        method: 'POST',
        body: formData // Send the FormData object
    })
    .then(response => {
        if (response.ok) {
            console.log('Quiz data uploaded successfully');
            // Handle success
            showSuccessMessage();
            // Refresh the page after 2 seconds
            setTimeout(() => {
                location.reload();
            }, 2000);
        } else {
            console.error('Failed to upload quiz data');
            // Handle failure
        }
    })
    .catch(error => {
        console.error('Error uploading quiz data:', error);
        // Handle error
    });
}



// Function to show success message
function showSuccessMessage() {
    const successAlert = document.getElementById('success');
    successAlert.style.display = 'block';
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
