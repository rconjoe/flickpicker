import { state } from './state.mjs';
import { showToast, showError } from './utils.mjs';

// Default test user
const defaultUsers = [
    { username: 'user1', password: 'pass1' }
];

// Initialize authentication functionality
document.addEventListener('DOMContentLoaded', () => {
    // Setup password visibility toggle
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    const eyeIcon = document.getElementById('eyeIcon');

    if (togglePassword && passwordInput && eyeIcon) {
        togglePassword.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            if (type === 'password') {
                eyeIcon.classList.remove('fa-eye-slash');
                eyeIcon.classList.add('fa-eye');
            } else {
                eyeIcon.classList.remove('fa-eye');
                eyeIcon.classList.add('fa-eye-slash');
            }
        });
    }

    // Setup login button handler
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
                const loginModal = document.getElementById('loginModal');
                const bsModal = window.bootstrap.Modal.getInstance(loginModal);
                if (bsModal) {
                    bsModal.hide();
                }
            } catch (error) {
                showError(error.message);
            }
        });
    }

    // Setup logout handler
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

function validateCredentials(username, password) {
    return !!username?.trim() && !!password?.trim();
}

function updateAuthUI() {
    const loginButton = document.getElementById('loginButton');
    const userMenu = document.getElementById('userMenu');
    
    if (state.currentUser) {
        loginButton?.classList.add('d-none');
        userMenu?.classList.remove('d-none');
        const usernameElement = document.querySelector('#userMenu .username');
        if (usernameElement) {
            usernameElement.textContent = state.currentUser.username;
        }
    } else {
        loginButton?.classList.remove('d-none');
        userMenu?.classList.add('d-none');
    }
}

async function loadUserFromSession() {
    const savedUser = sessionStorage.getItem('user');
    if (savedUser) {
        state.currentUser = JSON.parse(savedUser);
        updateAuthUI();
    }
}

async function login(username, password) {
    if (!validateCredentials(username, password)) {
        throw new Error('Invalid credentials');
    }

    // Check against default test user
    const user = defaultUsers.find(u => u.username === username && u.password === password);
    
    if (user) {
        state.currentUser = { username: user.username };
        sessionStorage.setItem('user', JSON.stringify(state.currentUser));
        updateAuthUI();
        showToast('Successfully logged in!');
    } else {
        throw new Error('Invalid credentials');
    }
}

function logout() {
    state.currentUser = null;
    sessionStorage.removeItem('user');
    updateAuthUI();
    showToast('Successfully logged out');
}

export async function handleLogin(username, password) {
    try {
        await login(username, password);
    } catch(error) {
        showError(error.message);
    }
}

export function handleLogout() {
    logout();
}

export function isAuthenticated() {
    return !!state.currentUser;
}