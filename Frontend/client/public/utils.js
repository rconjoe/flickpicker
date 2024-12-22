function showToast(message, type) {
    const toast = new window.bootstrap.Toast(document.getElementById('liveToast'));
    const toastBody = document.querySelector('.toast-body');
    toastBody.textContent = message;
    toast.show();
}

function showError(message, duration = 3000) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    document.body.appendChild(errorDiv);
  
    setTimeout(() => {
      errorDiv.remove();
    }, duration);
  }