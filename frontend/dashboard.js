// Update progress bars based on data
function updateProgressBars() {
    const apiUrl = 'http://localhost:5000/api/progress';
    return fetch(apiUrl)
    .then(response => {
        if (!response.ok) {
            throw new Error('PROGRESS ERROR');
        }
        return response.json();
    })
    .then(data =>{
        for (const [continent, progress] of Object.entries(data)) {
            const progressBar = document.querySelector(`.continent-progress[data-continent="${continent}"] .filler`);
            if (progressBar) {
                progressBar.style.width = `${progress}%`;
            }
        }
    })
}

function goBack() {
    window.location.href = 'index.html'; // Assuming your main menu page is named 'index.html'
}

// Call the function to update progress bars
updateProgressBars();
