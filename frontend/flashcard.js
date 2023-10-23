let currentFact = null;
let context = false;
let correctCount = 0;
let incorrectCount = 0;

let sessionStart = true

const card = document.querySelector('.card__inner');

// Function to fetch facts from the backend
// Prompts the user with 'what is the capital of...'
function question() {
    const apiUrl = 'http://localhost:5000/api/question';
    return fetch(apiUrl)
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

            // Capitalize the first letter of the question (country) and answer (capital)
            const capitalizedQuestion = capitalizeFirstLetter(currentFact.question);
            const capitalizedAnswer = capitalizeFirstLetter(currentFact.answer);

            document.getElementById('question').textContent = `What is the capital of ${capitalizedQuestion}?`;

            // If the fact is new, display the answer above the input field
            const displayedAnswerElement = document.getElementById('displayedAnswer');
            const answerInput = document.getElementById('answer');

            // console.log(currentFact.new, typeof currentFact.new);

            if (currentFact.new) {
                displayedAnswerElement.textContent = capitalizedAnswer;
            } else if (currentFact.condition == 3 && currentFact.rof > 0) {
                displayedAnswerElement.textContent = currentFact.question_context;
            } else {
                displayedAnswerElement.textContent = ''; // Clear the displayed answer
                answerInput.value = ''; // Clear the input field
            }

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
    // Capitalize the first letter of the question (country) and answer (capital)
    const capitalizedQuestion = capitalizeFirstLetter(currentFact.question);
    const capitalizedAnswer = capitalizeFirstLetter(currentFact.answer);

    // Check if the input is empty
    if (userAnswer === '') {
        errorMessageElement.textContent = 'You need to type in some answer!';
        return;  // Exit the function early
    }

    const feedbackStatusDiv = document.getElementById('feedbackStatus');
    const feedbackDetailDiv = document.getElementById('feedbackDetail');
    const correctTickElement = document.getElementById('correctTick');
    const contextDisplayDiv = document.getElementById('contextDisplay');
    const textContextDiv = document.querySelector('#contextDisplay .text-context');
    const imageContextDiv = document.querySelector('#contextDisplay .image-context');

    // send the user answer to the backend
    fetch('http://localhost:5000/api/answer', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userAnswer: userAnswer }),
    })
        .then(() => {
            // Flip the card after submitting the answer
            card.classList.toggle('is-flipped');

            if (userAnswer.toLowerCase() === currentFact.answer.toLowerCase()) {
                feedbackStatusDiv.textContent = 'Correct!';
                feedbackStatusDiv.style.color = 'green';
                feedbackDetailDiv.textContent = `The capital of ${capitalizedQuestion} is ${capitalizedAnswer}.`;
                correctTickElement.style.display = "block";
                correctCount += 1;

                textContextDiv.innerHTML = ''; // Clear text context
                imageContextDiv.innerHTML = ''; // Clear image context
                document.getElementById('correctTick').style.display = 'flex';
            } else {
                feedbackStatusDiv.textContent = 'Wrong!';
                feedbackStatusDiv.style.color = 'red';
                feedbackDetailDiv.textContent = `The capital of ${capitalizedQuestion} is ${capitalizedAnswer}.`;
                correctTickElement.style.display = "none";
                incorrectCount += 1;

                // Display context based on condition
                // Condition 1 - only text context shown
                if (currentFact.condition == 1 && currentFact.rof > 0) {
                        imageContextDiv.innerHTML = ''; // Clear image context
                        textContextDiv.classList.add('text-context-padding');
                        textContextDiv.textContent = currentFact.text_context;
                    // Condition 2 - both text and images
                } else if (currentFact.condition == 2 && currentFact.rof > 0) {
                        textContextDiv.textContent = currentFact.text_context;
                        imageContextDiv.innerHTML = `<img src="../capital_images/${removeSpaces(currentFact.image_context)}.jpg" alt="Context Image">`;
                } else if (currentFact.condition == 3 && currentFact.rof > 0) {
                        textContextDiv.textContent = currentFact.text_context;
                        imageContextDiv.innerHTML = `<img src="../capital_images/${removeSpaces(currentFact.image_context)}.jpg" alt="Context Image">`;
                }

                // Display context based on rof
                // if (currentFact.rof > 0.6) {
                //     textContextDiv.textContent = currentFact.text_context;
                //     imageContextDiv.innerHTML = `<img src="../capital_images/${currentFact.image_context}.jpg" alt="Context Image">`;
                // } else if (currentFact.rof > 0.5) {
                //     textContextDiv.innerHTML = ''; // Clear text context
                //     imageContextDiv.innerHTML = `<img src="../capital_images/${currentFact.image_context}.jpg" alt="Context Image">`;
                // } else if (currentFact.rof > 0.4) {
                //     imageContextDiv.innerHTML = ''; // Clear image context
                //     textContextDiv.classList.add('text-context-padding');
                //     textContextDiv.textContent = currentFact.text_context;
                // }
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
    fetch('http://localhost:5000/api/remaining_time')
        .then(response => response.json())
        .then(data => {
            // Update the timer display
            document.getElementById('timer').textContent = `${data.minutes}m ${data.seconds}s left`;

            // Check if the timer has finished
            if (data.minutes === 0 && data.seconds === 0 && sessionStart === false) {
                // Store the results in localStorage
                localStorage.setItem('correctCount', correctCount);
                localStorage.setItem('incorrectCount', incorrectCount);

                // dump the results
                fetch('http://localhost:5000/api/results', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                })
                    .then(response => response.json())
                    .then(data => {
                        console.log(data.message);
                        // Redirect to the feedback screen
                        window.location.href = 'feedback.html';
                    })
                    .catch((error) => { console.error('Error:', error); });

            }
        });
}

function goBack() {
    window.location.href = 'index.html'; // Assuming your main menu page is named 'index.html'
}

function removeSpaces(str) {
    return str.replace(/\s+/g, '');
}

// Call the function every 10 seconds to update the timer
setInterval(updateRemainingTime, 1000);

// Add event listener for the "Enter" key press on the input field
document.getElementById('answer').addEventListener('keyup', function (event) {
    const errorMessageElement = document.getElementById('error-message');

    // Check if the pressed key is "Enter"
    if (event.key === 'Enter') {
        // Check if the card is flipped (showing the back side)
        if (card.classList.contains('is-flipped')) {
            nextQuestion();  // Fetch the next question
        } else {
            if (this.value.trim() !== '') {
                answer();  // Call the answer function
                errorMessageElement.textContent = '';  // Clear the error message
            } else {
                errorMessageElement.textContent = 'You need to type in some answer!';  // Display the error message
            }
        }
    }
});

function startSession() {
    sessionStart = true

    // Set the session length to 60 minutes
    const sessionLength = "60";

    // Initialize and start the timer display
    document.getElementById('timer').textContent = `${sessionLength}m 0s left`;

    // Hide the session selection div
    document.querySelector('.session-selection').style.display = 'none';

    // Show the question section div
    document.querySelector('.question-section').style.display = 'block';

    // Show the timer display
    document.getElementById('timer-display').style.display = 'block';

    // Load the first question or start the session as needed
    sessionStart = false
    // question()

    // Make the API call
    fetch('http://localhost:5000/api/start', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log(data);
        // Load the first question or start the session as needed
        question();
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function capitalizeFirstLetter(str) {
    const wordsToIgnore = ["and", "of", "in", "the", "to", "with", "on", "at", "by", "for"]; // Add more words as needed
    return str.split(' ').map((word, index) => {
        // Always capitalize the first word or if the word is not in the ignore list
        if (index === 0 || !wordsToIgnore.includes(word.toLowerCase())) {
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        } else {
            return word.toLowerCase();
        }
    }).join(' ');
}
