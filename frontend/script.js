let currentFact = null;

// Function to fetch facts from the backend
function fetchFacts() {
    const apiUrl = 'http://localhost:5000/api/facts';
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

// Function to submit the answer and check it against the fact.answer
function submitAnswer() {
    const userAnswer = document.getElementById('answer').value.trim();
    const capitalizedUserAnswer = userAnswer.charAt(0).toUpperCase() + userAnswer.slice(1);


    // send the user answer to the backend
    fetch('http://localhost:5000/api/submit_answer', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userAnswer: capitalizedUserAnswer}),
    })   

    const feedbackDiv = document.getElementById('feedback');
    feedbackDiv.style.opacity = '0';
    setTimeout(() => {
        // Ensure currentFact.answer is a string and trim it
        if (userAnswer === correctAnswer) {
            feedbackDiv.textContent = 'Correct!';
            feedbackDiv.style.color = 'green';
        } else {
            feedbackDiv.textContent = `Wrong! The correct answer is ${currentFact.answer}.`;
            feedbackDiv.style.color = 'red';
        }
        feedbackDiv.style.opacity = '1';
    }, 500);
}

// Call the fetchFacts function when the page loads
window.onload = fetchFacts;
