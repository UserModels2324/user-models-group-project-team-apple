let currentFact = null;

// Function to fetch facts from the backend
function fetchFacts() {
    const apiUrl = 'http://localhost:5000/api/facts';
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            // Select a random fact
            const randomIndex = Math.floor(Math.random() * data.length);
            currentFact = data[randomIndex];
            // Display the question
            document.getElementById('question').textContent = `What is the capital of ${currentFact.question}?`;
        })
        .catch(error => {
            console.error('Error fetching facts:', error);
        });
}

// Function to submit the answer and check it against the fact.answer
function submitAnswer() {
    const userAnswer = document.getElementById('answer').value.trim().toLowerCase();
    const feedbackDiv = document.getElementById('feedback');
    feedbackDiv.style.opacity = '0';
    setTimeout(() => {
        if (userAnswer === currentFact.answer.toLowerCase()) {
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
