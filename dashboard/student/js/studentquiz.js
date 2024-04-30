
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
                checkStudent(user_id)
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
            fetchQuizData(c_id)


            // Process student data as needed
        } else {
            console.error('Failed to check student status:', response.statusText);
        }
    } catch (error) {
        console.error('Error checking student status:', error.message);
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
                    console.log(user_id)
                    q_id=selectedQuiz.q_id
                    console.log('q_id:', q_id);
                    viewPerformance(user_id, q_id);
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
    resetQuizState(); // Reset quiz state before fetching new quiz info
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

            // Check if quizInfoData contains quiz questions
            if (Array.isArray(quizInfoData.quizInfo)) {
                quizData = quizInfoData.quizInfo; // Assign fetched quiz data to quizData variable
                loadQuestion(); // Load the first question
                 // Display the quiz form container
                 document.getElementById('quizFormContainer').style.display = 'block';

// Add event listener to next button
document.getElementById('nextBtn').addEventListener('click', selectOption);
            } else {
                console.error('Quiz data is not in the expected format:', quizInfoData);
            }
        } else {
            console.error('Failed to fetch quiz info:', response.statusText);
        }
    } catch (error) {
        console.error('Error fetching quiz info:', error.message);
    }


}


function resetQuizState() {
      quizData = [];
      currentQuestion = 0;
      correctAnswers = 0;
      wrongAnswers = 0;
      document.getElementById('questionContainer').innerHTML = '';
      document.getElementById('result').innerHTML = '';
      
      document.getElementById('nextBtn').style.display = 'block'; // Show next button
  }


let quizData = [];
  let currentQuestion = 0;
  let correctAnswers = 0;
  let wrongAnswers = 0;



  function loadQuestion() {
      const questionDiv = document.createElement('div');
      questionDiv.classList.add('question');

      const questionNumber = currentQuestion + 1;

      questionDiv.innerHTML = `
          <h3> ${questionNumber}: ${quizData[currentQuestion].question}</h3>
          <div id="optionsContainer" class="mt-3">
              <!-- Options will be dynamically added here -->
          </div>
      `;

      const optionsContainer = questionDiv.querySelector('#optionsContainer');
      const options = ['a', 'b', 'c', 'd']; // Options columns
      options.forEach((optionKey, index) => {
          const optionValue = quizData[currentQuestion][optionKey];
          if (optionValue) { // Check if option is not null
              const optionInput = document.createElement('input');
              optionInput.type = 'radio';
              optionInput.name = 'option';
              optionInput.value = optionValue;
              optionInput.id = `option${index}`;
              optionInput.classList.add('mr-2');
              const optionLabel = document.createElement('label');
              optionLabel.textContent = optionValue;
              optionLabel.setAttribute('for', `option${index}`);
              optionsContainer.appendChild(optionInput);
              optionsContainer.appendChild(optionLabel);
              optionsContainer.appendChild(document.createElement('br'));
          }
      });

      document.getElementById('questionContainer').innerHTML = '';
      document.getElementById('questionContainer').appendChild(questionDiv);
  }

  function selectOption() {
        const selectedOption = document.querySelector('input[name="option"]:checked').value;
        const correctAnswer = quizData[currentQuestion].answer;

        console.log(`Selected Option: ${selectedOption}`);
        console.log(`Correct Answer: ${correctAnswer}`);

        if (selectedOption === correctAnswer) {
            console.log('Selected option is CORRECT.');
            correctAnswers++;
        } else {
            console.log('Selected option is WRONG.');
            wrongAnswers++;
        }

        
        if (currentQuestion < quizData.length - 1) {
            currentQuestion++;
            loadQuestion();
        } else {
            // If it's the last question, hide the Next button and show the Submit button
            document.getElementById('nextBtn').style.display = 'none';
            document.getElementById('submitBtn').style.display = 'block';
        }

        // Calculate and print the mark for each question
        const totalQuestions = quizData.length;
        const maxMark = totalQuestions;
        const mark = correctAnswers * (maxMark / totalQuestions);
        console.log('Mark for current question:', mark);
        const progressPercentage = ((currentQuestion + 1) / totalQuestions) * 100;
         updateProgressBar(progressPercentage);
    }

    // Add event listener to the Submit button
    document.getElementById('submitBtn').addEventListener('click', function(event) {
        event.preventDefault(); // Prevent default button behavior
        displayResult(); // Display quiz results
        hideForm(); // Hide the form
    });

    function hideForm() {
        document.getElementById('quizForm').style.display = 'none'; // Hide the form
        document.getElementById('result').style.display = 'block'; // Show the result container
    }

    function updateProgressBar(progressPercentage) {
    const progressBar = document.getElementById('progressBar');
    progressBar.style.width = `${progressPercentage}%`;
    progressBar.setAttribute('aria-valuenow', progressPercentage);

}

async function displayResult() {
    // Print results in console
    console.log('Correct Answers:', correctAnswers);
    console.log('Wrong Answers:', wrongAnswers);

    // Calculate mark (assuming each question carries equal marks)
    const totalQuestions = quizData.length;
    const maxMark = totalQuestions;
    const mark = correctAnswers * (maxMark / totalQuestions);

    // Display result in the UI
    document.getElementById('result').innerHTML = `
        <div class="card">
            <div class="card-body">
                <h3 class="card-title">Quiz Result</h3>
                <p class="card-text">Correct Answers: ${correctAnswers}</p>
                <p class="card-text">Wrong Answers: ${wrongAnswers}</p>
                <p class="card-text">Mark: ${mark}</p>
            </div>
        </div>
    `;

    try {
        // Call the /api/performance endpoint
        const response = await fetch('https://learning-l3tf.onrender.com/api/performance', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                s_id: user_id, // Assuming user_id holds the student ID
                q_id: q_id, // Assuming q_id holds the quiz ID
                mark: mark
            })
        });

        if (response.ok) {
            console.log('Performance data sent successfully.');
            // Handle success response if needed
        } else {
            console.error('Failed to send performance data:', response.statusText);
            // Handle error response if needed
        }
    } catch (error) {
        console.error('Error sending performance data:', error.message);
        // Handle fetch error if needed
    }
}



async function viewPerformance(user_id, q_id) {
    try {
        const response = await fetch('https://learning-l3tf.onrender.com/api/viewperformance', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ s_id: user_id, q_id })
        });

        if (!response.ok) {
            throw new Error('Failed to retrieve performance data');
        }

        const data = await response.json();

        // Display performance data and statistics
        console.log(' view Performance Data:', data.performance);
        console.log('Statistics:', data.stats2);

        const performanceRow = document.querySelector('.perfo');
        const attemptedBadge = performanceRow.querySelector('.perform');

        if (data.stats2 && data.stats2[q_id]) {
            // If performance data is available for the specified quiz ID, display it
            performanceRow.style.display = '';
            const stats = data.stats2[q_id];
            const bestScoreElement = performanceRow.querySelector('.bestscore');
            const countElement = performanceRow.querySelector('.count');
            bestScoreElement.textContent = `Best Score: ${stats.maxMark || 'N/A'}`;
            countElement.textContent = `No of Attempts: ${stats.markCount || 0}`;

            // Update badge content and style for attempted
            attemptedBadge.textContent = 'Attempted';
            attemptedBadge.classList.add('badge-outline-success');
            attemptedBadge.classList.remove('badge-outline-danger');
        } else {
            // If no performance data is available for the specified quiz ID, hide the container and update badge content and style for not attempted
            performanceRow.style.display = '';
            attemptedBadge.textContent = 'Not Attempted';
            attemptedBadge.classList.add('badge-outline-danger');
            attemptedBadge.classList.remove('badge-outline-success');
            const bestScoreElement = performanceRow.querySelector('.bestscore');
            const countElement = performanceRow.querySelector('.count');
            bestScoreElement.textContent = `Best Score: 'N/A'`;
            countElement.textContent = `No of Attempts:  0`;
        }

    } catch (error) {
        console.error('Error:', error);
    }
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


    

