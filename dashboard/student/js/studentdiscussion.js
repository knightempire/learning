
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
                c_id = responseData.data.c_id;
                console.log('c_id:', c_id);
                viewDiscussion(c_id);



                // Process student data as needed
            } else {
                console.error('Failed to check student status:', response.statusText);
            }
        } catch (error) {
            console.error('Error checking student status:', error.message);
        }
    }

    async function studentLecture(s_id) {
        try {
            const response = await fetch('https://learning-l3tf.onrender.com/api/lecture', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ s_id })
            });

            if (response.ok) {
                const responseData = await response.json();
                const lectureData = responseData.data; // Access the array of lectures
                console.log('Lecture data:', lectureData);
                const lectureSelect = document.getElementById('lectureSelect');

                // Add an initial option prompting the user to select a lecture
                const initialOption = document.createElement('option');
                initialOption.value = ''; // Set value as empty string
                initialOption.textContent = 'Select a Lecture';
                lectureSelect.appendChild(initialOption);

                // Populate the dropdown with lecture options
                lectureData.forEach(lecture => {
                    const option = document.createElement('option');
                    option.value = lecture.lecture_id;
                    option.textContent = lecture.title;
                    lectureSelect.appendChild(option);
                });
            } else {
                console.error('Failed to fetch lecture data:', response.statusText);
            }
        } catch (error) {
            console.error('Error fetching lecture data:', error.message);
        }
    }

    async function submitDiscussion() {
    const lectureSelect = document.getElementById('lectureSelect');
    const selectedLectureId = lectureSelect.value;
    if (!selectedLectureId) {
        console.error('Please select a lecture');
        return;
    }

    // Get other form data
    const questionTextarea = document.getElementById('questionTextarea');
    const question = questionTextarea.value.trim();

    if (!question) {
        console.error('Please enter a question');
        return;
    }

    const discussionData = {
        s_id: user_id,
        c_id: c_id,
        lecture_id: selectedLectureId,
        question: question
    };

    // Print the data before sending
    console.log('Discussion data:', discussionData);

    try {
        const response = await fetch('https://learning-l3tf.onrender.com/api/discussion', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(discussionData)
        });

        if (response.ok) {
            const responseData = await response.json();
            console.log('Discussion submitted successfully:', responseData);
            // Optionally, reset the form
            questionTextarea.value = '';

            // Hide the form
            $('#discussionModal').modal('hide');

            // Display the success message for 5 seconds
            document.getElementById('success').style.display = 'block';

            setTimeout(() => {
                document.getElementById('success').style.display = 'none';
                // Refresh the page
                location.reload();
            }, 2000); // Display for 2 seconds
            
        } else {
            console.error('Failed to submit discussion:', response.statusText);
            // Provide feedback to the user
            alert('Failed to submit discussion. Please try again later.');
        }
    } catch (error) {
        console.error('Error submitting discussion:', error.message);
        // Provide feedback to the user
        alert('An error occurred while submitting the discussion. Please try again later.');
    }
}


// Object to store user colors
const userColors = {};

// Function to generate a random RGB color based on the user ID
function getUserNameColor(userId) {
    // Generate random values for red, green, and blue components
    const red = Math.floor(Math.random() * 256);
    const green = Math.floor(Math.random() * 256);
    const blue = Math.floor(Math.random() * 256);
    
    // Return the RGB color string
    return `rgb(${red}, ${green}, ${blue})`;
}


// Function to display subdiscussion data
function displaySubdiscussion(data, discussionId) {
    // Get the subdiscussContainer element
    const subdiscussContainer = document.getElementById(`subdiscuss${discussionId}`);

    // Check if the subdiscussContainer element exists
    if (!subdiscussContainer) {
        console.error(`Subdiscussion container not found for discussion ID ${discussionId}`);
        return;
    }

    // Clear previous content
    subdiscussContainer.innerHTML = '';

    // Sort subdiscussions by user role and number of likes
    data.subdiscussions.sort((a, b) => {
        // First, sort by user role (mentor first)
        if (a.user_role === 'mentor' && b.user_role !== 'mentor') {
            return -1; // Mentor first
        } else if (a.user_role !== 'mentor' && b.user_role === 'mentor') {
            return 1; // Mentor first
        } else {
            // If user roles are the same, sort by number of likes
            return b.likes - a.likes; // Sort in descending order of likes
        }
    });

    // Iterate over each subdiscussion and create HTML for each card
    data.subdiscussions.forEach((subdiscussion, subIndex) => {
        const userId = subdiscussion.user_id; // Get the user ID
        const userName = subdiscussion.user_name || 'Unknown User'; // Ensure user_name property exists
        const userRole = subdiscussion.user_role; // Get the user role
        const likessub = subdiscussion.likes;

        // Ensure that the subdiscussion object and its liked_by property are defined before accessing includes method
        const userLiked = subdiscussion && subdiscussion.liked_by && subdiscussion.liked_by.includes(user_id);

        // Determine the displayed username based on the role
        let displayedUserName = userName;
        if (userRole === "mentor") {
            displayedUserName += " (mentor)";
        }

        // Set the button color based on whether the user has liked the subdiscussion
        const buttonColor = userLiked ? 'red' : 'currentColor';

        // HTML for the subdiscussion card
        const subdiscussionCard = `
            <div class="card mb-3">
                <div class="d-flex justify-content-between align-items-center">
                    <div class="card-header" style="color: ${getUserNameColor(userId)};">${displayedUserName}</div> 
                    <button class="like-button" style="background-color: transparent; border: none; padding: 5px; color: ${buttonColor};" onclick="likesubdiscussion(${subdiscussion.subdiscussion_id})">
                        ${likessub}
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="${buttonColor}" class="bi bi-heart" viewBox="0 0 16 16">
                            <path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143q.09.083.176.171a3 3 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15"/>
                        </svg>
                    </button>
                </div>
                <div class="card-body">
                    <p class="card-text" style="color: black;">${subdiscussion.subdiscussion_text}</p>
                </div>
            </div>
        `;

        // Append the card to the subdiscuss container
        subdiscussContainer.insertAdjacentHTML('beforeend', subdiscussionCard);
    });
}


async function SubDiscussion(discussionId) {
    try {
        // Get the index based on the discussionId
        const index = discussionId;

        // Get the subdiscussion text from the textarea using the index
        const textarea = document.getElementById(`textarea${index}`);
        if (!textarea) {
            console.log(`Textarea element with ID "textarea${index}" not found.`);
            return; // Exit the function if textarea element is not found
        }
        
        const textareaValue = textarea.value.trim();
        console.log('Textarea Value:', textareaValue); // Log the textarea value

        // Prepare the data to send in the request body
        const requestBody = {
            discussion_id: discussionId,
            user_id: user_id, // Assuming `user_id` is a global variable
            subdiscussion_text: textareaValue
        };

        // Send a POST request to the API endpoint
        const response = await fetch('https://learning-l3tf.onrender.com/api/subdiscussion', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (response.ok) {
            // Optionally, clear the textarea after successful submission
            textarea.value = '';

            // Close the form by toggling its visibility
            toggleForm(`form${index}`);

            // Display the success message for 5 seconds
            document.getElementById('success').style.display = 'block';
            setTimeout(() => {
                document.getElementById('success').style.display = 'none';
            }, 5000);
        } else {
            console.error('Failed to submit subdiscussion:', response.statusText);
            // Provide feedback to the user
            alert('Failed to submit subdiscussion. Please try again later.');
        }
    } catch (error) {
        console.error('Error submitting subdiscussion:', error.message);
        // Provide feedback to the user
        alert('An error occurred while submitting the subdiscussion. Please try again later.');
    }
}



// Function to view discussion and handle accordion interactions
async function viewDiscussion(c_id) {
    try {
        const response = await fetch('https://learning-l3tf.onrender.com/api/viewdiscussion', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ c_id }) // Ensure that the c_id is being sent correctly
        });

        if (response.ok) {
            const responseData = await response.json();
            console.log('Discussion data:', responseData);

            // Get the accordion container
            const accordionContainer = document.getElementById('accordion-six');

            // Initialize the discussion index
            let index = 0;

            // Sort discussions in reverse order
            responseData.discussions.reverse();

            // Iterate over each discussion in the response data
            responseData.discussions.forEach((discussion) => {
                // Increment the index
                index++;

                console.log('Discussion index:', index);
                console.log('Discussion ID:', discussion.discussion_id);

                // Check if the current discussion is liked by the user
                const isLiked = Array.isArray(discussion.liked_by) && discussion.liked_by.includes(user_id);
                if (isLiked) {
                    console.log(`Discussion with ID ${discussion.discussion_id} is liked.`);
                }

                // Determine the fill color for the heart icon
                const heartFillColor = isLiked ? 'red' : 'currentColor';

                // Create HTML markup for the new accordion item with the question data
                const newAccordionItem = `
                    <div class="accordion__item" data-discussion-id="${discussion.discussion_id}">
                        <div class="accordion__header collapsed" data-toggle="collapse" data-target="#collapse${discussion.discussion_id}" aria-expanded="false" onclick="toggleButtons(this)">
                            <span class="accordion__header--icon"></span>
                            <span class="accordion__header--text">${discussion.question}</span>
                            <br><br>
                            <div class="btons">
                                <button class="like-button" style="display: none; background-color: transparent; border: none; padding-left: 10px;" onclick="likediscussion(${discussion.discussion_id})"> ${discussion.likes}
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="${heartFillColor}" class="bi bi-heart" viewBox="0 0 16 16">
                                        <path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.920 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143q.09.083.176.171a3 3 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15"/>
                                    </svg>
                                </button>
                                <button class="reply-button" style="display: none; background-color: transparent; border: none; padding-left: 10px;" onclick="toggleForm('form${discussion.discussion_id}')">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-reply" viewBox="0 0 16 16">
                                        <path d="M6.598 5.013a.144.144 0 0 1 .202.134V6.3a.5.5 0 0 0 .5.5c.667 0 2.013.005 3.3.822.984.624 1.99 1.76 2.595 3.876-1.02-.983-2.185-1.516-3.205-1.799a8.7 8.7 0 0 0-1.921-.306 7 7 0 0 0-.798.008h-.013l-.005.001h-.001L7.3 9.9l-.05-.498a.5.5 0 0 0-.45.498v1.153c0 .108-.11.176-.202.134L2.614 8.254l-.042-.028a.147.147 0 0 1 0-.252l.042-.028zM7.8 10.386q.103 0 .223.006c.434.02 1.034.086 1.7.271 1.326.368 2.896 1.202 3.94 3.08a.5.5 0 0 0 .933-.305c-.464-3.71-1.886-5.662-3.46-6.66-1.245-.79-2.527-.942-3.336-.971v-.66a1.144 1.144 0 0 0-1.767-.96l-3.994 2.94a1.147 1.147 0 0 0 0 1.946l3.994 2.94a1.144 1.144 0 0 0 1.767-.96z"/>
                                    </svg>
                                </button>
                            </div>
                            <form id="form${discussion.discussion_id}" class="reply-form" style="display: none;" data-discussion-id="${discussion.discussion_id}">
                            <textarea id="textarea${discussion.discussion_id}" class="form-control" rows="3" placeholder="Enter your reply"></textarea>
                            <button type="button" class="btn btn-primary mt-2" onclick="SubDiscussion(${discussion.discussion_id}, ${index})">Send</button>
                            <button type="button" class="btn btn-secondary mt-2" onclick="toggleForm('form${discussion.discussion_id}')">Close</button>
                        </form>
                            <span class="accordion__header--indicator indicator_bordered"></span>
                        </div>
                        <br>
                        <div id="collapse${discussion.discussion_id}" class="accordion__body collapse card" data-parent="#accordion-six">
                            <div class="accordion__body--title card-header"></div>
                            <div class="accordion__body--text card-body">
                                <div id="subdiscuss${discussion.discussion_id}"></div>
                            </div>
                        </div>
                    </div>
                `;

                // Add the new accordion item to the accordion container
                accordionContainer.insertAdjacentHTML('beforeend', newAccordionItem);
                console.log(`Accordion item added for discussion ID ${discussion.discussion_id}`);
            });

            // Add event listener to each card
            const accordionItems = document.querySelectorAll('.accordion__header');
            accordionItems.forEach((item) => {
                item.addEventListener('click', async function() {
                    // Retrieve the discussion_id from the clicked card
                    const discussionId = this.parentElement.dataset.discussionId;
                    console.log('Clicked card discussion ID:', discussionId);

                    try {
                        // Call the viewsubdiscussion API with the discussion_id
                        const response = await fetch('https://learning-l3tf.onrender.com/api/viewsubdiscussion', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ discussion_id: discussionId })
                        });

                        if (response.ok) {
                            const responseData = await response.json();
                            console.log('view Subdiscussion data:', responseData);
                            console.log('Calling displaySubdiscussion');
                            // Display the subdiscussion data for the clicked discussion
                            displaySubdiscussion(responseData, discussionId);
                        } else {
                            console.error('Failed to fetch subdiscussion data:', response.statusText);
                        }
                    } catch (error) {
                        console.error('Error fetching subdiscussion data:', error.message);
                        console.error('Error calling displaySubdiscussion:', error.message);
                    }
                });
            });
        } else {
            console.error('Failed to fetch discussion data:', response.statusText);
        }
    } catch (error) {
        console.error('Error fetching discussion data:', error.message);
    }
}





async function likediscussion(discussionId) {
    try {
        // Prepare the data to send in the request body
        const requestBody = {
            s_id: user_id, // Assuming `s_id` is a global variable or obtained from somewhere
            discussion_id: discussionId
        };

        // Send a POST request to the API endpoint
        const response = await fetch('https://learning-l3tf.onrender.com/api/discussionlike', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (response.ok) {
            // Print the response
            const responseData = await response.json();
            console.log('Liked discussion response:', responseData);
            s_id = user_id;
            console.log(s_id);

            location.reload();

        } else {
            console.error('Failed to like discussion:', response.statusText);
            // Provide feedback to the user
            alert('Failed to like discussion. Please try again later.');
        }
    } catch (error) {
        console.error('Error liking discussion:', error.message);
        // Provide feedback to the user
        alert('An error occurred while liking the discussion. Please try again later.');
    }
}


async function likesubdiscussion(subdiscussionId) {
    try {
        // Prepare the data to send in the request body
        const requestBody = {
            s_id: user_id, // Assuming `user_id` is a global variable
            subdiscussion_id: subdiscussionId
        };

        // Send a POST request to the API endpoint
        const response = await fetch('https://learning-l3tf.onrender.com/api/subdiscussionlike', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (response.ok) {
            // If the request is successful, log the response
            const responseData = await response.json();
            console.log('Liked subdiscussion response:', responseData);
            location.reload();
        } else {
            // If the request fails, log the error and provide feedback to the user
            console.error('Failed to like subdiscussion:', response.statusText);
            alert('Failed to like subdiscussion. Please try again later.');
        }
    } catch (error) {
        // Catch any unexpected errors and log them
        console.error('Error liking subdiscussion:', error.message);
        alert('An error occurred while liking the subdiscussion. Please try again later.');
    }
}


    window.onload = decodeToken;
