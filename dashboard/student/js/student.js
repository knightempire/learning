
  let s_id; // Declare s_id as a global variable

  // Function to hide all sections
  function hideAllSections() {
      document.querySelector('.progress').style.display = 'none';
      document.querySelector('.quiztest').style.display = 'none';
      document.getElementById('video-frame').style.display = 'none';
  }

  // Function to show progress section and hide others
  function showProgress() {
      hideAllSections();
      document.querySelector('.progress').style.display = 'block';
  }

  // Function to show iframe and hide others, and update title
  function showIframe(title) {
      hideAllSections();
      document.getElementById('video-frame').style.display = 'block';
      document.getElementById('video-title').textContent = title;
  }

  // Function to show quiz section and hide others, and update title
  function showQuiz(title) {
      hideAllSections();
      document.querySelector('.quiztest').style.display = 'block';
      document.getElementById('video-title').textContent = title;
  }

  // Function to display performance data in a table
  function displayPerformanceData(performanceData) {
      const tableContainer = document.querySelector('.table');
      const table = document.createElement('table');
      table.classList.add('performance-table');

      // Create table headers
      const tableHeaders = `
          <tr>
              <th>No of Quiz</th>
              <th>Recent Mark</th>
              <th>Attempt Count</th>
              <th>Best Score</th>
          </tr>
      `;
      table.innerHTML = tableHeaders;

      // Populate the table with performance data
      performanceData.forEach(performance => {
          const tableRow = `
              <tr>
                  <td>${performance.q_id}</td>
                  <td>${performance.mark}</td>
                  <td>${performance.count}</td>
                  <td>${performance.best_score}</td>
              </tr>
          `;
          table.innerHTML += tableRow;
      });

      // Append the table to the table container
      tableContainer.innerHTML = '';
      tableContainer.appendChild(table);
  }

  // Retrieve the token from local storage
  const token = localStorage.getItem('Token');

  // Send the token to the server-side API endpoint
  fetch('https://learning-u7aw.onrender.com/api/decodeToken', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({ token: token })
  })
      .then(response => {
          if (!response.ok) {
            window.location.href = '../../index.html';
            throw new Error('Network response was not ok.');
         
          }
          return response.json();
      })
      .then(data => {
          // Handle the response from the server
          console.log(data);
          // Check if data contains user_id and print it
          s_id = data.user_id; // Assign value to s_id
          const name = data.name;
          const userNameElement = document.querySelector('.is-user-name span');
          userNameElement.textContent = name;

          // Call function to view all performance data
          checkStudentProfile(s_id);
          viewAllPerformanceData(s_id);

          // Send the s_id to the /api/lecture endpoint
          fetch('https://learning-u7aw.onrender.com/api/lecture', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({ s_id: s_id })
          })
              .then(response => {
                  if (!response.ok) {
                      throw new Error('Network response was not ok.');
                  }
                  return response.json();
              })
              .then(data => {
                  // Handle the response from the server
                  console.log('Response from /api/lecture:', data);
                  const firstLecture = data.data[0];

                  // Print the c_id value of the first lecture
                  const c_id = firstLecture.c_id;
                  const course_name = firstLecture.course_name;
                  console.log('course_name:', course_name);
                  console.log('c_id:', c_id);

                  // Display course_name
                  document.getElementById('course-name-li').textContent = `${course_name}`;

                  // Dynamically populate the dropdown menu with lecture titles
                  const lectureDropdownItems = document.getElementById('lecture-dropdown-items');

                  data.data.forEach(lecture => {
                      const li = document.createElement('li');
                      const anchor = document.createElement('a');
                      anchor.href = '#';
                      anchor.textContent = lecture.title;
                      anchor.addEventListener('click', () => {
                          // When a lecture title is clicked, set the src of the iframe to the corresponding video URL
                          document.getElementById('video-frame').src = lecture.video_url;
                          // Show the iframe and update title
                          showIframe(lecture.title);
                      });
                      li.appendChild(anchor);
                      lectureDropdownItems.appendChild(li);
                  });

                  // After populating the dropdown, call the /api/quiz endpoint
                  fetch('https://learning-u7aw.onrender.com/api/quiz', {
                      method: 'POST',
                      headers: {
                          'Content-Type': 'application/json'
                      },
                      body: JSON.stringify({ c_id: c_id })
                  })
                      .then(response => {
                          if (!response.ok) {
                              throw new Error('Network response was not ok.');
                          }
                          return response.json();
                      })
                      .then(data => {
                          // Handle the response from the server
                          console.log('Response from /api/quiz:', data);
                          // Dynamically populate the quiz dropdown menu with quiz titles
                          const quizDropdownItems = document.getElementById('quiz-dropdown-items');
                          quizDropdownItems.innerHTML = ''; // Clear previous quiz dropdown items
                          data.data.forEach(quiz => {
                              const li = document.createElement('li');
                              const anchor = document.createElement('a');
                              anchor.href = '#';
                              anchor.textContent = quiz.title;
                              anchor.addEventListener('click', () => {
                                  // Show the quiz section and update title
                                  showQuiz(quiz.title);
                                  console.log('Quiz ID:', quiz.q_id);
                                  fetchQuizData(quiz.q_id);
                                  fetchPerformanceData(s_id, quiz.q_id); // Call the function to fetch performance data
                              });
                              li.appendChild(anchor);
                              quizDropdownItems.appendChild(li);
                          });
                      })
                      .catch(error => {
                          // Handle any errors that occur during the fetch
                          console.error('Error in /api/quiz request:', error);
                      });
              })
              .catch(error => {
                  // Handle any errors that occur during the fetch
                  console.error('Error in /api/lecture request:', error);
              });
      })
      .catch(error => {
          // Handle any errors that occur during the fetch
          console.error('Error in /api/decodeToken request:', error);
      });

  let quizData = [];
  let currentQuestion = 0;
  let correctAnswers = 0;
  let wrongAnswers = 0;

  function fetchQuizData(quizId) {
      resetQuizState(); // Reset quiz state before fetching new quiz data
      const requestBody = {
          q_id: quizId
      };
      console.log(requestBody.q_id);
      fetch('https://learning-u7aw.onrender.com/api/quizinfo', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
      })
          .then(response => {
              if (!response.ok) {
                  throw new Error('Network response was not ok');
              }
              return response.json();
          })
          .then(data => {
              quizData = data.quizInfo;
              loadQuestion();
          })
          .catch(error => {
              console.error('There was a problem fetching quiz data:', error);
          });
  }

  function resetQuizState() {
      quizData = [];
      currentQuestion = 0;
      correctAnswers = 0;
      wrongAnswers = 0;
      document.getElementById('questionContainer').innerHTML = '';
      document.getElementById('result').innerHTML = '';
      document.getElementById('submitBtn').style.display = 'none'; // Hide submit button
      document.getElementById('nextBtn').style.display = 'block'; // Show next button
  }

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
      if (selectedOption === quizData[currentQuestion].answer) {
          correctAnswers++;
      } else {
          wrongAnswers++;
      }

      if (currentQuestion < quizData.length - 1) {
          currentQuestion++;
          loadQuestion();
      } else {
          document.getElementById('nextBtn').style.display = 'none';
          document.getElementById('submitBtn').style.display = 'block';
      }
  }

  function displayResult() {
      // Print results in console
      console.log('Correct Answers:', correctAnswers);
      console.log('Wrong Answers:', wrongAnswers);

      // Calculate mark (assuming each question carries equal marks)
      const totalQuestions = quizData.length;
      const maxMark = totalQuestions;
      const mark = correctAnswers * (maxMark / totalQuestions);

      // Display results on the page
      document.getElementById('result').innerHTML = `
          <h3>Quiz Result</h3>
          <p>Correct Answers: ${correctAnswers}</p>
          <p>Wrong Answers: ${wrongAnswers}</p>
          <p>Mark: ${mark}</p>
      `;

      // Send the mark to the server-side API
      sendQuizMark(quizData[0].q_id, s_id, mark);
  }

  function sendQuizMark(q_id, s_id, mark) {
      const progressBody = {
          s_id: s_id,
          q_id: q_id,
          mark: mark
      };
      console.log(progressBody);
      fetch('https://learning-u7aw.onrender.com/api/performance', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify(progressBody)
      })
      .then(response => {
          if (!response.ok) {
              throw new Error('Network response was not ok.');
          }
          return response.json();
      })
      .then(data => {
          console.log('Quiz mark sent successfully:', data);
      })
      .catch(error => {
          console.error('Error sending quiz mark:', error);
      });
  }

  function fetchPerformanceData(s_id, q_id) {
    const viewperformBody = {
        s_id: s_id,
        q_id: q_id
    };

    fetch('https://learning-u7aw.onrender.com/api/viewperform', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(viewperformBody)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok.');
        }
        return response.json();
    })
    .then(data => {
        // Handle the response from the server
        console.log('Performance data:', data);

        const performanceData = data.performance[0];
        if (performanceData) {
            console.log(performanceData.mark);
            console.log(performanceData.count);
            console.log(performanceData.best_score);

            // Update HTML elements with performance data
            const countElement = document.querySelector('.count');
            const attemptedElement = document.querySelector('.attempted');
            const notAttemptedElement = document.querySelector('.not-attempted');

            countElement.textContent = `No of Attempts: ${performanceData.count}`;

            // Check if the quiz was attempted
            if (performanceData.count > 0) {
                attemptedElement.style.display = 'block';
                notAttemptedElement.style.display = 'none';
            } else {
                attemptedElement.style.display = 'none';
                notAttemptedElement.style.display = 'block';
            }

            // Dynamically update the best score or display a hyphen if it's null
            const bestScoreElement = document.querySelector('.bestscore');
            bestScoreElement.textContent = `Best Score: ${performanceData.best_score !== null ? performanceData.best_score : '-'}`;
        } else {
            console.log('Performance data is empty or undefined');

            // Update HTML elements with hyphens and "Not attempted"
            const countElement = document.querySelector('.count');
            const attemptedElement = document.querySelector('.attempted');
            const notAttemptedElement = document.querySelector('.not-attempted');

            countElement.textContent = 'No of Attempts: -';
            attemptedElement.style.display = 'none';
            notAttemptedElement.style.display = 'block';

            // Display a hyphen for best score
            const bestScoreElement = document.querySelector('.bestscore');
            bestScoreElement.textContent = 'Best Score: -';
        }
    })
    .catch(error => {
        console.error('Error fetching performance data:', error);
    });
}

  document.getElementById('quizForm').addEventListener('submit', function (event) {
      event.preventDefault();
      displayResult();
  });

  document.getElementById('nextBtn').addEventListener('click', function () {
      selectOption();
  });

  fetchQuizData();

  // Function to view all performance data
  function viewAllPerformanceData(s_id) {
      const requestBody = {
          s_id: s_id
      };

      fetch('https://learning-u7aw.onrender.com/api/viewperform', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
      })
      .then(response => {
          if (!response.ok) {
              throw new Error('Network response was not ok.');
          }
          return response.json();
      })
      .then(data => {
          // Handle the response from the server
          console.log('Performance data:', data);

          // Display performance data in a table
          displayPerformanceData(data.performance);
      })
      .catch(error => {
          console.error('Error fetching performance data:', error);
      });
  }

  function checkStudentProfile(s_id) {
    // Define the request body
    const studentprofile = {
        s_id: s_id
    };
      console.log("api checkstuent",studentprofile)

    // Make a POST request to the API endpoint
    fetch('https://learning-u7aw.onrender.com/api/checkstudentprofile', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(studentprofile)
    })
    .then(response => {
        if (!response.ok) {
            // Check if the response status is 404 (Not Found)
            if (response.status === 404) {
                // Redirect to profile.html
                window.location.href = '../../profile.html';
            } else {
                // Throw an error for other non-OK responses
                throw new Error('Network response was not ok.');
            }
        }
        return response.json();
    })
    .then(data => {
        // Handle the response from the server
        console.log('Performance data:', data);

        // Assuming you have a function to display performance data
        displayPerformanceData(data.performance);
    })
    .catch(error => {
        console.error('Error fetching performance data:', error);
    });
}

  function logout() {
  console.log("button clicked")
  // Remove the token from localStorage
  localStorage.removeItem('Token');

  // Redirect to index.html
  window.location.href = '../../index.html';
}

  // Function to handle click event on menu items
  function handleMenuItemClick(event) {
    // Remove "active" class from all menu items
    const menuItems = document.querySelectorAll('.menu-item-label');
    menuItems.forEach(item => {
      item.classList.remove('active');
    });
    // Add "active" class to the clicked menu item
    event.target.classList.add('active');
    // Update the course name to the clicked menu item's label
    document.getElementById('active').textContent = event.target.textContent;
  }

  // Add click event listeners to menu items
  document.querySelectorAll('.menu-item-label').forEach(item => {
    item.addEventListener('click', handleMenuItemClick);
  });

