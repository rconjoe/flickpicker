function showToast(message, type) {
    const toast = new window.bootstrap.Toast(document.getElementById('liveToast'));
    const toastBody = document.querySelector('.toast-body');
    toastBody.textContent = message;
    toast.show();
}