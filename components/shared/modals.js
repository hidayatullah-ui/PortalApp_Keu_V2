export function openConfirmationModal(action, message = 'Apakah Anda yakin ingin melanjutkan?') {
    document.getElementById('confirmation-message').textContent = message;
    // This is tricky. The action is a function. We can't just pass it as a string.
    // I'll need to handle this in the main script.
    // For now, I'll just store it in a global variable.
    window.actionToConfirm = action;
    document.getElementById('confirmation-modal').classList.add('show');
}

export function closeConfirmationModal() {
    window.actionToConfirm = null;
    document.getElementById('confirmation-modal').classList.remove('show');
}

export function attachConfirmationModalListener() {
    document.getElementById('confirm-action-btn').addEventListener('click', async () => {
        if (window.actionToConfirm) {
            await window.actionToConfirm();
        }
        closeConfirmationModal();
    });
}
