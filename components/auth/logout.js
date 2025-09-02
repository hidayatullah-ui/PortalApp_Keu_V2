// --- AUTHENTICATION ---
export function handleLogout(appState, utils, renderApp) {
    return async () => {
        appState.loggedInUser = null;
        await utils.saveToStorage('sulthan-group-loggedInUser', null);
        appState.activeTab = 'dashboard';
        renderApp();
    };
}
