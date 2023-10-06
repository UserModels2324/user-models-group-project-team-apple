let hardcodedUser = {
    username: "apple",
    password: "a"
};

// Event listener for the login button
document.querySelector('#login-form button').addEventListener('click', login);

// Event listener to switch to the register form
document.querySelector('#login-form button[onclick="switchToRegister()"]').addEventListener('click', switchToRegister);

// Event listener to switch back to the login form
document.querySelector('#register-form button[onclick="switchToLogin()"]').addEventListener('click', switchToLogin);

let registeredUsers = [];

function login() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    if (username === hardcodedUser.username && password === hardcodedUser.password) {
        // Redirect to the main page or dashboard
        window.location.href = 'index.html';
    } else {
        document.getElementById('login-error-message').textContent = "Invalid credentials!";
    }
}

function switchToRegister() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'flex';
}

function switchToLogin() {
    document.getElementById('register-form').style.display = 'none';
    document.getElementById('login-form').style.display = 'flex';
}

function register() {
    const username = document.getElementById('create-username').value;
    const password = document.getElementById('create-password').value;
    const avatar = document.getElementById('avatar').value;

    // Store the details in the registeredUsers array
    registeredUsers.push({
        username: username,
        password: password,
        avatar: avatar
    });

    alert("Registered successfully!");
    // Switch back to the login form
    document.querySelector('.login-container').style.display = 'block';
    document.querySelector('.register-container').style.display = 'none';
}

let chosenAvatar = null;

// Event listeners for avatar selection
const avatarOptions = document.querySelectorAll('.avatar-option');
avatarOptions.forEach(option => {
    option.addEventListener('click', function() {
        // Remove highlight from all avatars
        avatarOptions.forEach(opt => opt.classList.remove('selected-avatar'));

        // Highlight the chosen avatar
        this.classList.add('selected-avatar');

        // Store the chosen avatar's value
        chosenAvatar = this.getAttribute('data-avatar');
    });
});

function createAccount() {
    const username = document.getElementById('create-username').value.trim();
    const password = document.getElementById('create-password').value.trim();

    // Check if fields are empty or no avatar is chosen
    if (!username || !password || !chosenAvatar) {
        alert('Please fill out all fields and choose an avatar.');
        return;
    }

    // Store the details in the registeredUsers array
    registeredUsers.push({
        username: username,
        password: password,
        avatar: chosenAvatar
    });

    alert("Registered successfully!");
    // Switch back to the login form
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('register-form').style.display = 'none';
}

document.getElementById('login-password').addEventListener('keyup', function(event) {
    if (event.keyCode === 13) {
        login();
    }
});

document.getElementById('create-password').addEventListener('keyup', function(event) {
    if (event.keyCode === 13) {
        createAccount();
    }
});



