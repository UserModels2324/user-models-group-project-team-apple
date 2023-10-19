let currentFact = null;
let context = false;
let correctCount = 0;
let incorrectCount = 0;

const card = document.querySelector('.card__inner');

const apiUrl = 'http://localhost:5000';
// const apiUrl = 'https://icojocaru4.pythonanywhere.com';

// stores the session timer so it can be used in all functions. 
let sessionTimer;

// the Time class can be used to track all timings during the session. 
class Time {
    constructor(sessionTime) {
        this.startTime = Date.now();
        this.sessionTime = sessionTime;
        this.startRt = 0.0;
        this.endRt = 0.0;
    }

    getTime() {
        return Date.now();
    }

    getElapsedTime() {
        if (this.startTime !== null) {
            return this.getTime() - this.startTime;
        }
    }

    startTrackingRt() {
        this.startRt = this.getTime();
    }

    endTrackingRt() {
        this.endRt = this.getTime();
    }

    getgetReactionTime() {
        return this.endRt - this.startRt;
    }

    getRemainingTime() {
        const elapsedTime = this.getElapsedTime();
        const remainingTime = this.sessionTime - elapsedTime;
        return Math.max(0, remainingTime);
    }

    startTimer() {
        this.startTime = Date.now();
    }
}

// starts a learning session.
function startSession() {
    // Get the selected session length
    const sessionLength = document.getElementById("sessionLength").value;

    // creates a time object, saving current time and session length into the global sessionTimer
    sessionTimer = new Time(sessionLength)

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

// loads a question via the api by sending elapsed time and receiving a fact tuple.
function question() {

    // get the elapsed time of the session to send to the model
    let elapsed = sessionTimer.getElapsedTime();

    console.log(elapsed)

    return fetch(`${apiUrl}/api/question?elapsed=${elapsed}`)
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

            // starts tracking for reaction time
            sessionTimer.startRt();
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

    const backFeedbackDiv = document.getElementById('backFeedback');

    // end tracking the RT
    sessionTimer.endRt();


    // get the timings from sessionTimer to feed to the model
    const elapsedTime = sessionTimer.getElapsedTime();
    const reactionTime = sessionTimer.getReactionTime()

    // send the user answer to the backend
    fetch(apiUrl + '/api/answer', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            elapsed: elapsedTime,
            userAnswer: userAnswer,
            reactionTime: reactionTime
        }),
    })
        .then(() => {
            // Flip the card after submitting the answer
            card.classList.toggle('is-flipped');

            if (userAnswer === currentFact.answer) {
                backFeedbackDiv.textContent = 'Correct!';
                backFeedbackDiv.style.color = 'green';
                correctCount++;
            } else {
                backFeedbackDiv.textContent = `Wrong! The correct answer is ${currentFact.answer}.`;
                backFeedbackDiv.style.color = 'red';
                incorrectCount++;
            }
            errorMessageElement.textContent = '';  // Clear the error message after processing the answer
        })
        .catch(error => {
            console.error('Error submitting answer:', error);
        });
}


function nextQuestion() {
    // Fetch the next question
    question().then(() => {
        // Clear the input field
        document.getElementById('answer').value = '';

        // Flip the card back to the front after the new question data has been processed
        card.classList.toggle('is-flipped');
    });
}

function updateRemainingTime() {

    remaining = sessionTimer.getRemainingTime();
    document.getElementById('timer').textContent = `${data.minutes}m ${data.seconds}s left`;

    if (data.minutes === 0 && data.seconds === 0) {
        // Store the results in localStorage
        localStorage.setItem('correctCount', correctCount);
        localStorage.setItem('incorrectCount', incorrectCount);

    }
}

function goBack() {
    window.location.href = 'index.html'; // Assuming your main menu page is named 'index.html'
}

// Call the function every 10 seconds to update the timer
// setInterval(updateRemainingTime, 1000);

// Add event listener for the "Enter" key press on the input field
document.getElementById('answer').addEventListener('keyup', function (event) {
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

document.getElementById("sessionLength").addEventListener("input", function () {
    document.getElementById("sessionValue").textContent = this.value + " minutes";
});

