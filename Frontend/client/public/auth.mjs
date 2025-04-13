// Import dependencies
import { state } from './state.mjs';
import { showToast, showError } from './utils.mjs';
import { updateAuthUI, closeModal } from './ui.mjs';

// Default test users
const defaultUsers = [
    { username: 'user1', password: 'pass1' },
    { username: 'admin', password: 'admin123' }
];

// Cached DOM elements for performance optimization
const cachedElements = {};

// Cache commonly accessed DOM elements
function cacheDOM() {
    cachedElements.loginBtn = document.getElementById('loginBtn');
    cachedElements.usernameInput = document.getElementById('username');
    cachedElements.passwordInput = document.getElementById('password');
    cachedElements.logoutLink = document.getElementById('logoutLink');
}

// Attach event listeners to the DOM elements
function attachEventListeners() {
    // Login Button
    if (cachedElements.loginBtn) {
        cachedElements.loginBtn.addEventListener('click', debounce(async (e) => {
            e.preventDefault();
            const username = cachedElements.usernameInput?.value;
            const password = cachedElements.passwordInput?.value;

            if (!validateCredentials(username, password)) {
                showError('Please fill in all fields');
                return;
            }

            try {
                await login(username, password);
                closeModal('loginModal'); // Close modal upon successful login
            } catch (error) {
                showError(error.message);
            }
        }, 300)); // Debounce to prevent rapid button clicks
    }

    // Logout Link
    if (cachedElements.logoutLink) {
        cachedElements.logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            handleLogout();
        });
    }
}

// Validate user credentials
function validateCredentials(username, password) {
    return !!username?.trim() && !!password?.trim();
}

// Login function
export async function login(username, password) {
    const loginBtn = cachedElements.loginBtn;
    if (loginBtn) loginBtn.disabled = true; // Disable button to prevent multiple clicks

    try {
        showToast('Authenticating...');
        const user = defaultUsers.find(u => u.username === username && u.password === password);

        if (user) {
            state.currentUser = { username: user.username };

            // Save user session to sessionStorage
            sessionStorage.setItem('user', JSON.stringify(state.currentUser));

            updateAuthUI();
            showToast(`Welcome, ${user.username}!`);
        } else {
            throw new Error('Invalid credentials');
        }
    } finally {
        if (loginBtn) loginBtn.disabled = false; // Re-enable button after processing
    }
}

// Logout function
export function logout() {
    state.currentUser = null;

    // Remove user session from sessionStorage
    sessionStorage.removeItem('user');

    updateAuthUI(); // Update UI after logout
    showToast('You have logged out successfully');
}

// Load user session from storage
export function loadUserFromSession() {
    const savedUser = sessionStorage.getItem('user');
    if (savedUser) {
        state.currentUser = JSON.parse(savedUser);
        updateAuthUI();
    }
}

// Handle login/logout logic
export function handleLogout() {
    logout();
}

export function isAuthenticated() {
    return !!state.currentUser;
}

// Debounce utility function to optimize event handling
function debounce(fn, delay) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn.apply(this, args), delay);
    };
}

// Initialize authentication module
export function initializeAuth() {
    cacheDOM(); // Cache DOM elements
    attachEventListeners(); // Attach event listeners
    loadUserFromSession(); // Load session on page load
}

// Event listener for page load
document.addEventListener('DOMContentLoaded', () => {
    initializeAuth();
});
