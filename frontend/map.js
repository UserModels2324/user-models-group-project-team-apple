const apiUrl = 'http://localhost:5000';

function goBack() {
    window.location.href = 'index.html'; // Assuming your main menu page is named 'index.html'
}

function handleButtonClick(event) {
    const buttonSelection = event.target.textContent;

    fetch(apiUrl + '/api/continents', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ continentChoice: buttonSelection }),
    })
    .then(response => response.text())
    .then(data => {
        console.log(data);
        window.location.href = 'flashcard.html';
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

// Get all buttons with class "custom-button"
var buttons = document.getElementsByClassName("custom-button");

// Attach the click event listener to each button
for (var i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener("click", handleButtonClick);
}
