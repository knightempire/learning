
 document.addEventListener('DOMContentLoaded', function () {
    // Get the option from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const option = urlParams.get('option');
    
    // Check if option is not provided, then redirect to forgot.html
    if (!option) {
        window.location.href = './forgot.html';
    }

    // Event listener for form submission
    document.getElementById('verificationForm').addEventListener('submit', async function(event) {
        // Prevent default form submission
        event.preventDefault();

        // Get the phone number from the form input
        const phoneNumberInput = document.getElementById('phone');
        const phoneNumber = phoneNumberInput.value;

        // Encode the phone number using btoa
        const encodedPhoneNumber = btoa(phoneNumber);

        // Send the phone number to the API
        const apiUrl = 'https://learning-u7aw.onrender.com/api/forgotgenerate-otp';
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ phoneNumber }),
            });

            if (response.ok) {
                // Redirect to forgototp_verify.html page with both parameters as URL parameters
                const redirectUrl = `./forgototp_verify.html?option=${option}&phoneNumber=${encodedPhoneNumber}`;
                window.location.href = redirectUrl;
            } else {
                // Get the error message from the response
                const { error } = await response.json(); // Extract the error message
                showError(error);
            }
        } catch (error) {
            console.error('Error generating OTP:', error);
            showError('Failed to generate OTP. Please try again later.');
        }
    });

    function showError(message) {
        const loginMessage = document.getElementById('loginMessage');
        loginMessage.textContent = message;
        loginMessage.classList.add('show'); // Show the popup message
        setTimeout(() => {
            loginMessage.classList.remove('show'); // Hide the popup message after 3 seconds
        }, 3000);
    }
});

