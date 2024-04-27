
    const inputs = document.querySelectorAll(".otp-field > input");
    const button = document.querySelector(".btn");

    function submitForm(event) {
        event.preventDefault(); // Prevent form submission

        let otp = "";
        inputs.forEach(input => {
            otp += input.value;
        });

        console.log("Entered OTP:", otp);

        // Decode the encoded phone number from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const encodedPhoneNumber = urlParams.get('phoneNumber');
        const decodedPhoneNumber = atob(encodedPhoneNumber);
        document.getElementById('phoneNumberPlaceholder').textContent = decodedPhoneNumber;
        // Call the function to verify OTP
        verifyOtp(otp, decodedPhoneNumber);
    }

    async function verifyOtp(otp, phoneNumber) {
        const apiUrl = 'https://learning-u7aw.onrender.com/api/verify-otp'; // Update with your API endpoint

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ phoneNumber, otp }),
            });

            const result = await response.json();

            if (response.ok) {
                // OTP verification successful, redirect to setforgot.html with phone number and option
                const urlParams = new URLSearchParams(window.location.search);
                const option = urlParams.get('option');
                window.location.href = `./setup/settup.html?option=${option}&phoneNumber=${phoneNumber}`;
            } else {
                // OTP verification failed, handle accordingly
                console.error('OTP verification failed:', result.error);
                showError(result.error); // Show error message
            }
        } catch (error) {
            console.error('Error verifying OTP:', error);
            showError('Failed to verify OTP. Please try again later.'); // Show error message
        }
    }

    document.getElementById('verificationForm').addEventListener('submit', submitForm);

    inputs[0].addEventListener("paste", function (event) {
        event.preventDefault();

        const pastedValue = (event.clipboardData || window.clipboardData).getData("text");
        const otpLength = inputs.length;

        for (let i = 0; i < otpLength; i++) {
            if (i < pastedValue.length) {
                inputs[i].value = pastedValue[i];
                inputs[i].removeAttribute("disabled");
                inputs[i].focus;
            } else {
                inputs[i].value = "";
                inputs[i].focus;
            }
        }
    });

    inputs.forEach((input, index1) => {
        input.addEventListener("keyup", (e) => {
            const currentInput = input;
            const nextInput = input.nextElementSibling;
            const prevInput = input.previousElementSibling;

            if (currentInput.value.length > 1) {
                currentInput.value = "";
                return;
            }

            if (
                nextInput &&
                nextInput.hasAttribute("disabled") &&
                currentInput.value !== ""
            ) {
                nextInput.removeAttribute("disabled");
                nextInput.focus();
            }

            if (e.key === "Backspace") {
                inputs.forEach((input, index2) => {
                    if (index1 <= index2 && prevInput) {
                        input.setAttribute("disabled", true);
                        input.value = "";
                        prevInput.focus();
                    }
                });
            }

            button.classList.remove("active");
            button.setAttribute("disabled", "disabled");

            const inputsNo = inputs.length;
            if (!inputs[inputsNo - 1].disabled && inputs[inputsNo - 1].value !== "") {
                button.classList.add("active");
                button.removeAttribute("disabled");

                return;
            }
        });
    });

    document.addEventListener('DOMContentLoaded', function () {
        const urlParams = new URLSearchParams(window.location.search);
        const option = urlParams.get('option');

        if (!option) {
        window.location.href = './forgot.html'; // Redirect to a.html if option is not provided
    } else {
        // Use the option if needed in your JavaScript logic
        console.log('Option:', option);
    }
        // Use the option if needed in your JavaScript logic
    });

    function showError(message) {
        const loginMessage = document.getElementById('loginMessage');
        loginMessage.textContent = message;
        loginMessage.classList.add('show'); // Show the popup message
        setTimeout(() => {
            loginMessage.classList.remove('show'); // Hide the popup message after 3 seconds
        }, 3000);
    }
