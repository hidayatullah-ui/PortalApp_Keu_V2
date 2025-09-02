// --- AUTHENTICATION ---
export function handleLogin(appState, domElements, utils, renderApp) {
    return async (e) => {
        e.preventDefault();
        const username = domElements.usernameInput.value;
        const password = domElements.passwordInput.value;

        const userFound = appState.users.find(u => u.username === username);

        if (userFound && password === atob(userFound.password)) {
            appState.loggedInUser = userFound;
            await utils.saveToStorage('sulthan-group-loggedInUser', userFound);
            utils.showMessage('Login Berhasil!', 'success');
            renderApp();
        } else {
            utils.showMessage('Nama Pengguna atau Kata Sandi Salah!', 'error');
        }
    };
}
