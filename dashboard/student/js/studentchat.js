
    let user_id; // Global variable to store user ID
    let c_id; // Global variable to store mentor c_id

    async function decodeToken() {
        const token = localStorage.getItem('Token');
        if (!token) {
            console.error('Token not found in local storage');
       
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
                welcomeMessage.textContent = `Hi, ${data.name}!`;
                // Fetch list of mentors
                checkStudent(user_id);
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
                viewChat(c_id);

                // Process student data as needed
            } else {
                console.error('Failed to check student status:', response.statusText);
            }
        } catch (error) {
            console.error('Error checking student status:', error.message);
        }
    }

    async function viewChat(c_id) {
        try {
            const response = await fetch('https://learning-l3tf.onrender.com/api/viewchat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ c_id })
            });

            if (!response.ok) {
                throw new Error('Failed to retrieve chat messages');
            }

            const data = await response.json();
            console.log('Chat messages:', data.chat);

            // Get the container element for chat messages
            const chatContainer = document.getElementById('accordion-nine');

            // Clear any existing chat messages
            chatContainer.innerHTML = '';

            // Define colors for different scenarios
            const colors = {
                red: '#FF0000',
                pink: 'brown',
                green: 'orange'
            };

            // Iterate through the chat messages and create HTML elements for each
            data.chat.forEach((message, index) => {
                // Create a div element for the chat message
                const messageCard = document.createElement('div');
                messageCard.classList.add('message-card');
                
                // Determine the color for the user name based on the s_id
                let userNameColor;
                if (message.s_id === user_id) {
                    userNameColor = colors.green; // Green for user's own messages
                    messageCard.classList.add('own-message'); // Add class for own message
                } else if (message.s_id % 2 === 0) {
                    userNameColor = colors.red; // Red for even s_id
                } else {
                    userNameColor = colors.pink; // Pink for odd s_id
                }
                
                // Create a paragraph element for the user name
                const userName = document.createElement('p');
                userName.classList.add('user-name');
                userName.textContent = message.name;
                userName.style.color = userNameColor; // Set color based on s_id
                
                // Create a paragraph element for the message content
                const messageContent = document.createElement('p');
                messageContent.classList.add('message-content');
                messageContent.textContent = message.msg;
                
                // Append user name and message content to the message card
                messageCard.appendChild(userName);
                messageCard.appendChild(messageContent);
                
                // Append the message card to the chat container
                chatContainer.appendChild(messageCard);
            });

            // Scroll to the card footer after loading new messages
            scrollToCardFooter();

        } catch (error) {
            console.error('Error retrieving chat messages:', error);
        }
    }

    // Function to scroll to the card footer
    function scrollToCardFooter() {
        const cardFooter = document.querySelector('.card-footer');
        cardFooter.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }

    // Function to send message to chat
    async function sendMessage() {
    const chatInput = document.getElementById('chatInput');
    const message = chatInput.value.trim();
    if (!message) return; // Exit if the message is empty

    try {
        const response = await fetch('https://learning-l3tf.onrender.com/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ s_id: user_id, c_id, msg: message })
        });

        if (response.ok) {
            // Refresh chat after sending message
            viewChat(c_id);
            // Clear input field
            chatInput.value = '';
        } else if (response.status === 400) {
            const responseData = await response.json();
            // Extract message from response data
            const errorMessage = responseData.error;
            // Show warning message
            const warningAlert = document.getElementById('warningAlert');
            const warningMessage = document.getElementById('warningMessage');
            warningMessage.textContent = errorMessage; // Display only the message
            warningAlert.style.display = 'block'; // Show the warning alert
            
            // Hide the warning message after 3 seconds
            setTimeout(() => {
                warningAlert.style.display = 'none';
            }, 5000);
        } else {
            console.error('Failed to send message:', response.statusText);
        }
    } catch (error) {
        console.error('Error sending message:', error.message);
    }
}

    // Function to handle keydown event on chat input
    function handleChatInput(event) {
        if (event.key === 'Enter') {
            sendMessage();
        }
    }

    async function autoRefresh() {
    await checkStudent(user_id);
    setInterval(() => {
        viewChat(c_id);
    }, 3000); // Refresh every 3 seconds
}

window.onload = () => {
    decodeToken();
    autoRefresh();
    document.getElementById('chatInput').addEventListener('keydown', handleChatInput);
    document.getElementById('sendButton').addEventListener('click', sendMessage);
};

