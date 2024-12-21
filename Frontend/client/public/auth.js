import { state } from './state';
import { showToast } from '../public/utils';

// User Authentication
function updateAuthUI() {
    const authButtons = document.getElementById('auth-buttons');
    const userMenu = document.getElementById('userMenu');
    const loginButton = document.getElementById('loginButton');
    
    if (state.currentUser) {
        loginButton.classList.add('d-none');
        userMenu.classList.remove('d-none');
        document.querySelector('.username').textContent = state.currentUser.username;
    } else {
        loginButton.classList.remove('d-none');
        userMenu.classList.add('d-none');
    }
}

function registerUser(username, password) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Simple check to avoid duplicates (make sure username is unique)
    if (users.find(user => user.username === username)) {
        alert('Username already taken');
        return;
    }
    
    const newUser = { username, password };  // Password should be hashed in a real app
    users.push(newUser);
    
    localStorage.setItem('users', JSON.stringify(users));
    alert('Registration successful!');
}

function isAuthenticated() {
    return localStorage.getItem('authUser') !== null;
}

function validateCredentials(username, password) {
    // Implement proper validation
    return username.length > 0 && password.length > 0;
}

function loadUserFromSession() {
    const savedUser = sessionStorage.getItem('user');
    if (savedUser) {
        state.currentUser = JSON.parse(savedUser);
        updateAuthUI();
    }
}
function login(username, password) {
    // In production, this should be an API call
    if (validateCredentials(username, password)) {
        state.currentUser = { username, id: Date.now() };
        sessionStorage.setItem('user', JSON.stringify(state.currentUser));
        updateAuthUI();
        $('#loginModal').modal('hide');
        showToast('Successfully logged in!');
    } else {
        showError('Invalid credentials');
    }
}

function logout() {
    state.currentUser = null;
    sessionStorage.removeItem('user');
    updateAuthUI();
    showToast('Successfully logged out');
}

function loadUserFromSession() {
    const savedUser = sessionStorage.getItem('user');
    if (savedUser) {
        state.currentUser = JSON.parse(savedUser);
        updateAuthUI();
    }
}