
    let user_id; // Global variable to store user ID
    let phoneElement; // Global variable to store the phone element
    let nameElement; // Global variable to store the name element

    async function decodeToken() {
        const token = localStorage.getItem('Token');
        if (!token) {
            console.error('Token not found in local storage');
            redirectToLogin();
            return;
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

                // Update the phone number and name elements
                updateUserInfo(data.phoneNumber, data.name);
                viewPayment(user_id)
            } else {
                console.error('Failed to decode token:', response.statusText);
            }
        } catch (error) {
            console.error('Error decoding token:', error.message);
        }
    }

    async function viewPayment(user_id) {
    try {
        const response = await fetch('https://learning-l3tf.onrender.com/api/viewpayment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ user_id })
        });

        if (response.ok) {
            const paymentData = await response.json();
            console.log('Payment data:', paymentData);
            // Display payment data
            displayPaymentData(paymentData);
        } else {
            console.error('Failed to fetch payment data:', response.statusText);
        }
    } catch (error) {
        console.error('Error fetching payment data:', error.message);
    }
}

function displayPaymentData(paymentDataObject) {
    // Check if paymentDataObject contains the data property
    if (paymentDataObject.hasOwnProperty('data')) {
        const paymentDataArray = paymentDataObject.data; // Get the payment data array

        // Check if paymentDataArray is an array and contains at least one element
        if (Array.isArray(paymentDataArray) && paymentDataArray.length > 0) {
            const paymentData = paymentDataArray[0]; // Get the first payment object from the array

            // Update payment date
            const paymentDateElement = document.getElementById('paymentdate');
            if (paymentDateElement) {
                const paymentDate = new Date(paymentData.payment_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
                paymentDateElement.textContent = paymentDate;
            }

            // Update payment ID
            const paymentIdElement = document.getElementById('paymentid');
            if (paymentIdElement) {
                paymentIdElement.textContent = `#${paymentData.payment_id}`;
            }

            // Update course name
            const courseNameElement = document.getElementById('course_name');
            if (courseNameElement) {
                courseNameElement.textContent = paymentData.course_name;
            }
        } else {
            console.error('Payment data array is empty or invalid.');
        }
    } else {
        console.error('Payment data object does not contain the data property.');
    }
}

    function updateUserInfo(phone, name) {
        if (phoneElement) {
            phoneElement.textContent = phone;
        }
        if (nameElement) {
            nameElement.textContent = name;
        }
    }

    window.onload = () => {
        phoneElement = document.getElementById('phone');
        nameElement = document.getElementById('name');
        decodeToken();
    };
