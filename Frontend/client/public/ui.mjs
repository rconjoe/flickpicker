// ui.mjs

import { state } from './state.mjs';

// Password toggle
export function togglePasswordVisibility() {
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
}

// Update the UI based on authentication status
export function updateAuthUI() {
    const loginButton = document.getElementById('loginButton');
    const userMenu = document.getElementById('userMenu');
    
    // If there is a current user, show the user menu and hide the login button
    if (state.currentUser) {
        loginButton?.classList.add('d-none'); // Hide login button
        userMenu?.classList.remove('d-none'); // Show user menu
        
        const usernameElement = document.querySelector('#userMenu .username');
        if (usernameElement) {
            usernameElement.textContent = state.currentUser.username; // Display username in user menu
        }
    } else {
        loginButton?.classList.remove('d-none'); // Show login button
        userMenu?.classList.add('d-none'); // Hide user menu
    }
}


// Handle modal closure
export function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    const bsModal = window.bootstrap.Modal.getInstance(modal);
    if (bsModal) {
        bsModal.hide();
    }
}
