// Function to show a toast notification
export function showToast(message, type = 'success') {
    // Find the toast element and its body
    const toast = new window.bootstrap.Toast(document.getElementById('liveToast'));
    const toastBody = document.querySelector('.toast-body');
    
    // Set the message and type
    toastBody.textContent = message;
    
    // Customization based on type (success, error, info)
    const toastElement = document.querySelector('.toast');
    toastElement.classList.remove('bg-success', 'bg-danger', 'bg-info');
    
    // Remove any previous types
    if (type === 'error') {
        toastElement.classList.add('bg-danger'); // Red for error
    } else if (type === 'info') {
        toastElement.classList.add('bg-info'); // Blue for info
    } else {
        toastElement.classList.add('bg-success'); // Green for success (default)
    }
    
    // Show the toast
    toast.show();
}

// Function to show an error message dynamically
export function showError(message, duration = 3000) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    // Add error class for different types of error messages
    errorDiv.classList.add('error', 'alert', 'alert-danger');
    
    // Default 'danger' style
    document.body.appendChild(errorDiv);
    
    // Remove error message after a set duration
    setTimeout(() => {
        errorDiv.remove();
    }, duration);
}

// Function to check if a string is a valid URL
export function isValidUrl(string) {
    if (!string) return true; // Allow empty strings
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}
