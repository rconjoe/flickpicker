import { state } from './state.mjs';
import { showToast, showError } from './utils.mjs';
import { updateAuthUI, closeModal } from './ui.mjs';

// Default test user
const defaultUsers = [
    { username: 'user1', password: 'pass1' }
];

// Check if running in the browser environment
const isBrowser = typeof document !== 'undefined';

if (isBrowser) {
    // Initialize authentication functionality
    document.addEventListener('DOMContentLoaded', () => {
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) {
            loginBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                
                const username = document.getElementById('username')?.value;
                const password = document.getElementById('password')?.value;

                if (!validateCredentials(username, password)) {
                    showError('Please fill in all fields');
                    return;
                }

                try {
                    await login(username, password);
                    closeModal('loginModal');  // Close modal after successful login
                } catch (error) {
                    showError(error.message);
                }
            });
        }

        const logoutLink = document.getElementById('logoutLink');
        if (logoutLink) {
            logoutLink.addEventListener('click', (e) => {
                e.preventDefault();
                handleLogout();
            });
        }

        // Load user session on page load
        loadUserFromSession();
    });
}

// Validate credentials
function validateCredentials(username, password) {
    return !!username?.trim() && !!password?.trim();
}

// Load user session from storage
export async function loadUserFromSession() {
    if (isBrowser) {
        const savedUser = sessionStorage.getItem('user');
        if (savedUser) {
            state.currentUser = JSON.parse(savedUser);
            updateAuthUI();
        }
    }
}

// Login function
export async function login(username, password) {
    if (!validateCredentials(username, password)) {
        throw new Error('Invalid credentials');
    }

    // Check against default test user
    const user = defaultUsers.find(u => u.username === username && u.password === password);
    
    if (user) {
        state.currentUser = { username: user.username };
        if (isBrowser) {
            sessionStorage.setItem('user', JSON.stringify(state.currentUser));
        }
        updateAuthUI();
        showToast('Successfully logged in!');
    } else {
        throw new Error('Invalid credentials');
    }
}

// Logout function
export function logout() {
    state.currentUser = null;
    if (isBrowser) {
        sessionStorage.removeItem('user');
    }
    updateAuthUI(); // Update the UI to reflect the logged-out state
    showToast('Successfully logged out');
}

// Handle login/logout
export function handleLogin(username, password) {
    try {
        login(username, password);
    } catch (error) {
        showError(error.message);
    }
}

export function handleLogout() {
    logout();
}

export function isAuthenticated() {
    return !!state.currentUser;
}
