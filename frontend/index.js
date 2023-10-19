var circle = document.getElementById("circle");
var upBtn = document.getElementById("upBtn");
var downBtn = document.getElementById("downBtn");

const apiUrl = 'http://localhost:5000';
// const apiUrl = 'https://icojocaru4.pythonanywhere.com';

var rotateValue = circle.style.transform;
var rotateSum;

upBtn.onclick = function()
{
    rotateSum = rotateValue  + "rotate(-90deg)";
    circle.style.transform = rotateSum;
    rotateValue = rotateSum;
}

downBtn.onclick = function()
{
    rotateSum = rotateValue  + "rotate(90deg)";
    circle.style.transform = rotateSum;
    rotateValue = rotateSum;
}

function redirectTo(page) {
    // If the "Learn" button is clicked
    if (page === 'map.html') {
        // Initialize the user and timer with base value
        fetch(apiUrl + '/api/init', {
            method: 'POST',
        })
        .then(response => response.json())
        .then(data => {
            if (data.message === 'User initialized successfully') {
                // Redirect to the map page
                window.location.href = page;
            } else if ((data.message === 'User already initialized')){
                window.location.href = page;
            } else{
                throw new Error('Failed to initialize user.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    } else {
        // If it's not the "Learn" button, just redirect
        window.location.href = page;
    }
}





