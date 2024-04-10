const inputs = document.querySelectorAll(".otp-field > input");
const button = document.querySelector(".btn");

function submitForm(event) {
    event.preventDefault(); // Prevent form submission

    let otp = "";
    inputs.forEach(input => {
        otp += input.value;
    });

    console.log("Entered OTP:", otp);

 
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

