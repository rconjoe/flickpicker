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

// Handle modal closure
export function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    const bsModal = window.bootstrap.Modal.getInstance(modal);

    if (bsModal) {
        bsModal.hide();
    }
}
