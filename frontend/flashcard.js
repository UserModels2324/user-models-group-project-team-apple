let currentFact = null;
let context = false;

const card = document.querySelector('.card__inner');

// Function to fetch facts from the backend
// Prompts the user with 'what is the capital of...'
function question() {
    const apiUrl = 'http://localhost:5000/api/question';
    fetch(apiUrl)
        .then(response => {
            // Log the response headers
            console.log('Response Headers:', response.headers);
            // Get and log the response text
            return response.text().then(text => {
                console.log('Response Text:', text);
                // Try to parse the text as JSON
                try {
                    const data = JSON.parse(text);
                    return data;
                } catch (error) {
                    // If parsing fails, throw an error
                    throw new Error('Server response is not valid JSON');
                }
            });
        })
        .then(data => {
            // Handle the JSON data here
            currentFact = data;
            document.getElementById('question').textContent = `What is the capital of ${currentFact.question}?`;

            // Set the country name
            const countryElement = document.getElementById('country');
            countryElement.textContent = currentFact.question;

            // Set the background image based on the country or use a generic image
            const cardHeader = document.querySelector('.card__header');
            cardHeader.setAttribute('data-country', currentFact.question.toLowerCase());

            if (context) {
                // Use the country-specific image
                cardHeader.style.backgroundImage = `url('path_to_images/${currentFact.question.toLowerCase()}.jpg')`;
            } else {
                // Use a generic local image
                cardHeader.style.backgroundImage = `linear-gradient(to right, var(--green) 0%, var(--green) 40%, var(--yellow) 60%, var(--yellow) 100%)`;
            }
        })
        .catch(error => {
            console.error('Error fetching facts:', error);
        });
}

function answer() {
    const userAnswer = document.getElementById('answer').value.trim();
    const errorMessageElement = document.getElementById('error-message');

    // Check if the input is empty
    if (userAnswer === '') {
        errorMessageElement.textContent = 'You need to type in some answer!';
        return;  // Exit the function early
    }

    const capitalizedUserAnswer = userAnswer.charAt(0).toUpperCase() + userAnswer.slice(1);
    const backFeedbackDiv = document.getElementById('backFeedback');

    // send the user answer to the backend
    fetch('http://localhost:5000/api/answer', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userAnswer: capitalizedUserAnswer }),
    })
        .then(() => {
            // Flip the card after submitting the answer
            card.classList.toggle('is-flipped');

            if (userAnswer === currentFact.answer) {
                backFeedbackDiv.textContent = 'Correct!';
                backFeedbackDiv.style.color = 'green';
            } else {
                backFeedbackDiv.textContent = `Wrong! The correct answer is ${currentFact.answer}.`;
                backFeedbackDiv.style.color = 'red';
            }
            errorMessageElement.textContent = '';  // Clear the error message after processing the answer
        })
        .catch(error => {
            console.error('Error submitting answer:', error);
        });
}


function nextQuestion() {
    // Fetch the next question
    question();
    // Flip the card back to the front
    card.classList.toggle('is-flipped');
}

function updateRemainingTime() {
    fetch('http://localhost:5000/api/remaining_time')
        .then(response => response.json())
        .then(data => {
            // Assuming you have an element with id="timer" to display the time
            document.getElementById('timer').textContent = `${data.minutes}m ${data.seconds}s left`;
        });
}

function goBack() {
    window.location.href = 'index.html'; // Assuming your main menu page is named 'index.html'
}

// Call the function every 10 seconds to update the timer
setInterval(updateRemainingTime, 1000);

// Add event listener for the "Enter" key press on the input field
document.getElementById('answer').addEventListener('keyup', function(event) {
    const errorMessageElement = document.getElementById('error-message');

    // Check if the pressed key is "Enter"
    if (event.key === 'Enter') {
        if (this.value.trim() !== '') {
            answer();  // Call the answer function
            errorMessageElement.textContent = '';  // Clear the error message
        } else {
            errorMessageElement.textContent = 'You need to type in some answer!';  // Display the error message
        }
    }
});

document.getElementById("sessionLength").addEventListener("input", function() {
    document.getElementById("sessionValue").textContent = this.value + " minutes";
});

function startSession() {
    // Get the selected session length
    const sessionLength = document.getElementById("sessionLength").value;

    // Send the session length to the backend to start the timer
    fetch('http://localhost:5000/api/start_timer', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            sessionLength: sessionLength
        }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === 'Timer started successfully') {
            // Hide the session selection div
            document.querySelector(".session-selection").style.display = "none";

            // Load the first question or start the session as needed
            // Here, you can integrate your existing code that starts the session, loads the first question, etc.
        } else {
            console.error("Failed to start the timer on the backend.");
        }
    })
    .catch((error) => {
        console.error('Error:', error);
    });

    // Initialize and start the timer display
    document.getElementById('timer').textContent = `${document.getElementById('sessionLength').value}m 0s left`;

    // Hide the session selection div
    document.querySelector('.session-selection').style.display = 'none';

    // Show the question section div
    document.querySelector('.question-section').style.display = 'block';

    // Show the timer display
    document.getElementById('timer-display').style.display = 'block';

    // Load the first question or start the session as needed
    question()
}
