
    let userId; // Declare userId variable outside the scope of any function

// Function to extract the course name from the URL query parameter
function getCourseNameFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('course');
}

// Example usage
const courseName = getCourseNameFromURL();
// console.log('Course Name:', courseName);

async function checkPaymentStatus() {
    try {
        const paymentStatusResponse = await fetch('https://learning-u7aw.onrender.com/api/paymentcall');
        if (paymentStatusResponse.ok) {
            const paymentStatus = await paymentStatusResponse.json();
            console.log('Payment Status:', paymentStatus.value);
            if (paymentStatus.value === 1) {
                insertPaymentDetails();
            }
        } else {
            console.error('Failed to fetch payment status');
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

async function insertPaymentDetails() {
    const courseName = getCourseNameFromURL(); // Assuming you have a function to get course name from URL
    const amount = 100; // Example amount

    try {
        const paymentData = {
            user_id: userId, // Use userId variable here
            amount: amount,
            course_name: courseName,
            payment_date: new Date().toISOString().slice(0, 19).replace('T', ' '), // Get current date and time
        };

        console.log('API Request:', paymentData);

        const paymentResponse = await fetch('https://learning-u7aw.onrender.com/api/payment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(paymentData)
        });

        if (paymentResponse.ok) {
            console.log('Payment successful');
            window.location.href = './loading.html'; // Redirect on success
        } else {
            console.error('Error submitting payment');
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

// Call the function to check payment status every 2 seconds
setInterval(checkPaymentStatus, 4000);

function decodeTokenAndLoad() {
    // Retrieve token from local storage
    const token = localStorage.getItem('Token');
    if (!token) {
        console.error('Token not found in local storage');
        window.location.href = '../index.html';
        return;
    }
    //   console.log(token)

    // Perform AJAX request to decodeToken endpoint
    fetch('https://learning-u7aw.onrender.com/api/decodeToken', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: token })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to decode token');
        }
        return response.json();
    })
    .then(userData => {
        // console.log('User data:', userData);
        userId = userData.user_id; // Assign value to userId variable here
        // console.log('User ID:', userId);

        // Now you have access to the decoded user data, you can perform further actions if needed
    })
    .catch(error => {
        console.error('Error decoding token:', error.message);
        // Handle the error condition here, such as redirecting to a login page or displaying an error message to the user
    });
}

window.onload = decodeTokenAndLoad;

