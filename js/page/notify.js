export function showError(message) {
    const errorDiv = document.getElementById('error-message');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';

    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

export function showNotification(message) {
    const notificationDiv = document.getElementById('notification-message');
    notificationDiv.textContent = message;
    notificationDiv.style.display = 'block';
}
