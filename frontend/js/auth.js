// Authentication JavaScript

document.addEventListener('DOMContentLoaded', function () {

    const loginForm = document.getElementById('loginForm');

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    const registerForm = document.getElementById('registerForm');

    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

});


// =========================
// API URL
// =========================

const AUTH_API = 'https://ap-court-documents-backend.onrender.com/api';


// =========================
// LOGIN
// =========================

async function handleLogin(e) {

    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    const errorDiv = document.getElementById('loginError');
    const errorText = document.getElementById('errorText');

    try {

        const response = await fetch(
            `${AUTH_API}/auth/login`,
            {
                method: 'POST',

                headers: {
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify({
                    email: email,
                    password: password
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || 'Login failed'
            );
        }

        localStorage.setItem(
            'token',
            data.token
        );

        localStorage.setItem(
            'userData',
            JSON.stringify(data.user)
        );

        alert('Login successful!');

        window.location.href = 'dashboard.html';

    } catch (error) {

        console.error('Login error:', error);

        if (errorDiv) {
            errorDiv.style.display = 'flex';
        }

        if (errorText) {
            errorText.textContent = error.message;
        }

        alert(error.message);
    }
}


// =========================
// REGISTER
// =========================

async function handleRegister(e) {

    e.preventDefault();

    const firstName =
        document.getElementById('firstName').value.trim();

    const lastName =
        document.getElementById('lastName').value.trim();

    const email =
        document.getElementById('email').value.trim();

    const phone =
        document.getElementById('phone').value.trim();

    const role =
        document.getElementById('role').value;

    const password =
        document.getElementById('password').value;

    const confirmPassword =
        document.getElementById('confirmPassword').value;

    const terms =
        document.getElementById('terms').checked;

    const errorDiv =
        document.getElementById('registerError');

    const errorText =
        document.getElementById('errorText');


    // Password check

    if (password !== confirmPassword) {

        errorDiv.style.display = 'flex';

        errorText.textContent =
            'Passwords do not match';

        return;
    }


    // Password length

    if (password.length < 6) {

        errorDiv.style.display = 'flex';

        errorText.textContent =
            'Password must be at least 6 characters';

        return;
    }


    // Terms

    if (!terms) {

        errorDiv.style.display = 'flex';

        errorText.textContent =
            'Please agree to the Terms of Service';

        return;
    }


    try {

        console.log(
            'Sending registration request...'
        );


        const response = await fetch(
            `${AUTH_API}/auth/register`,
            {
                method: 'POST',

                headers: {
                    'Content-Type':
                        'application/json'
                },

                body: JSON.stringify({

                    firstName: firstName,

                    lastName: lastName,

                    email: email,

                    phone: phone,

                    role: role,

                    password: password

                })
            }
        );


        const data =
            await response.json();


        console.log(
            'Registration response:',
            data
        );


        if (!response.ok) {

            throw new Error(
                data.message ||
                'Registration failed'
            );
        }


        // SUCCESS

        alert(
            'Registration successful! Please login.'
        );


        window.location.href =
            'login.html';


    } catch (error) {

        console.error(
            'Registration error:',
            error
        );


        if (errorDiv) {
            errorDiv.style.display =
                'flex';
        }


        if (errorText) {
            errorText.textContent =
                error.message;
        }


        alert(
            error.message
        );

    }

}


// =========================
// PASSWORD TOGGLE
// =========================

function togglePassword() {

    const passwordField =
        document.getElementById('password');

    const toggleIcon =
        document.querySelector('.toggle-password');

    if (!passwordField) {
        return;
    }


    if (passwordField.type === 'password') {

        passwordField.type = 'text';

        if (toggleIcon) {
            toggleIcon.className =
                'fas fa-eye-slash toggle-password';
        }

    } else {

        passwordField.type = 'password';

        if (toggleIcon) {
            toggleIcon.className =
                'fas fa-eye toggle-password';
        }

    }

}


// =========================
// AUTH FUNCTIONS
// =========================

function isAuthenticated() {

    return !!localStorage.getItem('token');

}


function getCurrentUser() {

    const userData =
        localStorage.getItem('userData');

    return userData
        ? JSON.parse(userData)
        : null;

}


function logout() {

    localStorage.removeItem('token');

    localStorage.removeItem('userData');

    window.location.href =
        'login.html';

}


function requireAuth() {

    if (!isAuthenticated()) {

        window.location.href =
            'login.html';

        return false;

    }

    return true;

}