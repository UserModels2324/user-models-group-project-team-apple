// Sample data for demonstration purposes
const progressData = {
    "Europe": 50,  // 50% progress for Europe
    "Africa": 23,
    "Asia": 10,
    "America": 0,
    "Oceania": 80,
};

// Update progress bars based on data
function updateProgressBars() {
    for (const [continent, progress] of Object.entries(progressData)) {
        const progressBar = document.querySelector(`.continent-progress[data-continent="${continent}"] .filler`);
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }
    }
}

function goBack() {
    window.location.href = 'index.html'; // Assuming your main menu page is named 'index.html'
}

// Call the function to update progress bars
updateProgressBars();
