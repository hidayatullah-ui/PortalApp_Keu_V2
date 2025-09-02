import { renderSbuUserForm } from '../shared/forms.js';

export function renderSkkKonstruksiForm(submission, certificate, appState) {
    // This also calls the generic SBU form renderer, which handles the isSkk case.
    return renderSbuUserForm(submission, certificate, appState);
}
