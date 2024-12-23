import { state } from './state';
import { showToast, showError } from '../public/utils';

// Global variables
let users = []; // Array to store all users
let currentUser = null; // Current logged in user

// User Authentication
export function updateAuthUI() {
    const authButtons = document.getElementById('auth-buttons');
    const userMenu = document.getElementById('userMenu');
    const loginButton = document.getElementById('loginButton');
    
    if (currentUser) {
        loginButton.classList.add('d-none');
        userMenu.classList.remove('d-none');
        document.querySelector('.username').textContent = currentUser.username;
    } else {
        loginButton.classList.remove('d-none');
        userMenu.classList.add('d-none');
    }
}

export async function registerUser(username, password) {
    try {
        // Check for duplicate usernames
        if (users.find(user => user.username === username)) {
            throw new Error('Username already taken');
        }
        
        // Hash the password (you might want to use a library like bcrypt)
        const hashedPassword = hashPassword(password);
        
        const newUser = { username, password: hashedPassword };
        users.push(newUser);
        
        localStorage.setItem('users', JSON.stringify(users));
        showToast('Registration successful!');
    } catch (error) {
        showError(error.message);
    }
}

export function isAuthenticated() {
    return !!currentUser;
}

export function validateCredentials(username, password) {
    return !!username.trim() && !!password.trim();
}

export async function loadUserFromSession() {
    const savedUser = sessionStorage.getItem('user');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateAuthUI();
    }
}

export async function login(username, password) {
    try {
        if (!validateCredentials(username, password)) {
            throw new Error('Invalid credentials');
        }

        const user = findUserByUsername(users, username);
        if (user && verifyPassword(password, user.password)) {
            currentUser = user;
            sessionStorage.setItem('user', JSON.stringify(currentUser));
            updateAuthUI();
            showToast('Successfully logged in!');
        } else {
            throw new Error('Invalid credentials');
        }
    } catch (error) {
        showError(error.message);
    }
}

export function logout() {
    currentUser = null;
    sessionStorage.removeItem('user');
    updateAuthUI();
    showToast('Successfully logged out');
}

// Protected routes
export function isProtectedRoute(route) {
    return route.startsWith('/protected');
}

// Helper functions
function hashPassword(password) {
    // Implement proper password hashing here
    return password; // Placeholder
}

function verifyPassword(attemptedPassword, hashedPassword) {
    // Implement proper password verification here
    return attemptedPassword === hashedPassword; // Placeholder
}

function findUserByUsername(users, username) {
    return users.find(user => user.username === username);
}

export async function handleLogin(username, password) {
    try {
        await login(username, password);
        // Redirect to protected page
        window.location.href = '/protected';
    } catch(error) {
        showError(error.message);
    }
}

export function handleLogout() {
    logout();
    // Redirect to home page
    window.location.href = '/';
}
