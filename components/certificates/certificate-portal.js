export function renderCertificatePortal(appState, handleCertificateSelection) {
    return `
        <div class="text-gray-800">
            <h2 class="text-2xl font-semibold mb-4">Portal Sertifikat</h2>
            <div class="space-y-4">
                <p class="text-lg">Pilih menu sertifikat untuk memulai:</p>
                ${appState.certificates.map(cert => `
                    <button onclick="handleCertificateSelectionWrapper('${cert.id}')" class="w-full text-left bg-indigo-100 text-indigo-800 font-semibold py-3 px-6 rounded-xl transition hover:bg-indigo-200">
                        ${cert.name}
                    </button>
                `).join('')}
            </div>
        </div>
    `;
}
