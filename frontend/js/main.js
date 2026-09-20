// Main JavaScript file

window.API_BASE_URL = 'https://ap-court-documents-backend.onrender.com/api';

// ===============================
// DOM READY
// ===============================

document.addEventListener('DOMContentLoaded', function () {
    initNavbar();
    checkAuthStatus();

    var logoutBtn = document.getElementById('logoutBtn');

    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
});

// ===============================
// NAVBAR
// ===============================

function initNavbar() {
    var hamburger = document.querySelector('.hamburger');
    var navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function () {
            this.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }
}

// ===============================
// AUTH STATUS
// ===============================

function checkAuthStatus() {
    var token = localStorage.getItem('token');

    var authLinks = document.getElementById('authLinks');
    var userLinks = document.getElementById('userLinks');

    if (token) {
        if (authLinks) {
            authLinks.style.display = 'none';
        }

        if (userLinks) {
            userLinks.style.display = 'flex';
        }
    } else {
        if (authLinks) {
            authLinks.style.display = 'flex';
        }

        if (userLinks) {
            userLinks.style.display = 'none';
        }
    }
}

// ===============================
// LOGOUT
// ===============================

function handleLogout(e) {
    e.preventDefault();

    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        localStorage.removeItem('user');

        window.location.href = 'login.html';
    }
}

// ===============================
// API REQUEST
// ===============================

async function apiRequest(endpoint, options) {
    var token = localStorage.getItem('token');

    if (!options) {
        options = {};
    }

    var headers = options.headers || {};

    headers['Content-Type'] = 'application/json';

    if (token) {
        headers['Authorization'] = 'Bearer ' + token;
    }

    options.headers = headers;

    var response = await fetch(
        window.API_BASE_URL + endpoint,
        options
    );

    var result;

    try {
        result = await response.json();
    } catch (error) {
        result = {
            success: false,
            message: 'Invalid server response'
        };
    }

    if (!response.ok) {
        throw new Error(
            result.message || 'API request failed'
        );
    }

    return result;
}