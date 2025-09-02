import { renderSbuUserForm } from '../shared/forms.js';

export function renderSbuKonstruksiForm(submission, certificate, appState) {
    // For now, this just calls the generic SBU form renderer.
    // It could be customized in the future if needed.
    return renderSbuUserForm(submission, certificate, appState);
}
