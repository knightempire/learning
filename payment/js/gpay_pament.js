
    // Wait for the Google Pay library to load
    window.onload = function() {
      // Initialize Google Pay client
      const googlePayClient = new google.payments.api.PaymentsClient({
        environment: 'TEST', // Use 'PRODUCTION' for production environment
      });

      // Create Google Pay button
      const button = googlePayClient.createButton({
        buttonColor: 'black',
        buttonType: 'long',
        onClick: function() {
          // Show loader
          document.getElementById('loader').style.display = 'block';

          // Call your API here
          fetch('https://learning-l3tf.onrender.com/api/paymentmake', {
            method: 'POST',
            // Add any necessary headers and body for your API call
          })
          .then(response => {
            // Check if the response status is 200
            if (response.status === 200) {
              // Hide loader
              document.getElementById('loader').style.display = 'none';
              
              // Show the thank you message after 4 seconds
              setTimeout(() => {
                document.getElementById('thankYouMessage').style.display = 'block';
              }, 4000);
            } else {
              // Handle other status codes if needed
              console.error('Error completing payment:', response.statusText);
            }
          })
          .catch(error => {
            // Handle errors
            console.error('Error completing payment:', error);
          });

          // Log a message indicating that the API is called
          console.log('API is called');
        },
        paymentOptions: {
          // Define your payment options here
        }
      });

      // Append the button to the container
      document.getElementById('googlePayButton').appendChild(button);
    };
  