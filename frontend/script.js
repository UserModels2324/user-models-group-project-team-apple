let currentFact = null;

// Function to fetch facts from the backend
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
        })
        .catch(error => {
            console.error('Error fetching facts:', error);
        });
}

function answer() {
    const userAnswer = document.getElementById('answer').value.trim();
    const capitalizedUserAnswer = userAnswer.charAt(0).toUpperCase() + userAnswer.slice(1);
    const feedbackDiv = document.getElementById('feedback');
    feedbackDiv.style.opacity = '0';

    // send the user answer to the backend
    fetch('http://localhost:5000/api/answer', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userAnswer: capitalizedUserAnswer }),
    })
        // .then(response => response.json())  // Assuming backend returns JSON
        .then(() => {
            // Assuming the backend sends back data indicating if the answer is correct
            if (userAnswer === currentFact.answer) {
                feedbackDiv.textContent = 'Correct!';
                feedbackDiv.style.color = 'green';
            } else {
                feedbackDiv.textContent = `Wrong! The correct answer is ${currentFact.answer}.`;
                feedbackDiv.style.color = 'red';
            }
            feedbackDiv.style.opacity = '1';

            setTimeout(() => {
                feedbackDiv.style.opacity = '0';
            }, 1000); // fade out after 2 seconds

            // After displaying feedback, fetch the next question
            question();
        })
        .catch(error => {
            console.error('Error submitting answer:', error);
        });
}

// Call the fetchFacts function when the page loads
window.onload = question();
