const correctCount = parseInt(localStorage.getItem('correctCount') || '0');
const incorrectCount = parseInt(localStorage.getItem('incorrectCount') || '0');

document.addEventListener('DOMContentLoaded', function() {
    displayFeedback();
});

function displayFeedback() {
    const totalQuestions = correctCount + incorrectCount;
    const percentageCorrect = (correctCount / totalQuestions) * 100;

    document.getElementById('correctCount').textContent = correctCount;
    document.getElementById('totalQuestions').textContent = totalQuestions;
    document.getElementById('incorrectCount').textContent = incorrectCount;

    // Update the circle to represent the correct answers
    const circle = document.querySelector('.circle');
    circle.style.strokeDasharray = `${percentageCorrect}, 100`;
}

function goBack() {
    window.location.href = 'index.html'; // Assuming your main menu page is named 'index.html'
}

// Call the function to display feedback when the page loads
displayFeedback();
