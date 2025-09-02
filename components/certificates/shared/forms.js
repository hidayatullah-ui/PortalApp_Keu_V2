import { formatCurrency } from '../../shared/utils.js';

export function renderSbuUserForm(submission, certificate, appState) {
    const isEditMode = !!submission;
    const isSkk = certificate.id === 'cert-2';

    let sbuType;
    if (certificate.id === 'cert-1') sbuType = 'konstruksi';
    else if (certificate.id === 'cert-2') sbuType = 'skk';
    else if (certificate.id === 'cert-3') sbuType = 'konsultan';
    else if (certificate.id === 'cert-4') sbuType = 'smap';
    else if (certificate.id === 'cert-5') sbuType = 'simpk';
    else if (certificate.id === 'cert-6') sbuType = 'notaris';


    const initialData = submission || {};
    const name = initialData.companyName || '';
    let prefix = 'PT.';
    let companyName = name;

    if (!isSkk) {
        if (name.startsWith('PT. ')) { prefix = 'PT.'; companyName = name.substring(4); }
        else if (name.startsWith('CV. ')) { prefix = 'CV.'; companyName = name.substring(4); }
    }

    let sbuDataSource;
    if (sbuType === 'konstruksi') sbuDataSource = appState.sbuKonstruksiData;
    else if (sbuType === 'skk') sbuDataSource = appState.skkKonstruksiData;
    else if (sbuType === 'konsultan') sbuDataSource = appState.sbuKonsultanData;
    else if (sbuType === 'smap') sbuDataSource = [{ id: 'smap-main', name: 'Dokumen SMAP' }];
    else if (sbuType === 'simpk') sbuDataSource = [{ id: 'simpk-main', name: 'Akun SIMPK dan Alat' }];
    else if (sbuType === 'notaris') sbuDataSource = [{ id: 'notaris-main', name: 'Notaris', subKlasifikasi: ['Akta Tanah', 'Akta Perusahaan', 'Akta Waris', 'Akta Perkawinan'] }];


    const nameInputHtml = (isSkk) ? `
        <div>
            <label class="block text-gray-700 font-medium mb-1">Nama Pemegang Sertifikat</label>
            <input type="text" id="submission-company-name" class="w-full px-5 py-3 border rounded-xl" value="${name}" required>
        </div>
    ` : `
        <div>
            <label class="block text-gray-700 font-medium mb-1">Nama Perusahaan</label>
            <div class="flex items-center gap-2">
                <select id="submission-company-prefix" class="px-4 py-3 border rounded-xl bg-gray-50">
                    <option ${prefix === 'PT.' ? 'selected' : ''}>PT.</option>
                    <option ${prefix === 'CV.' ? 'selected' : ''}>CV.</option>
                </select>
                <input type="text" id="submission-company-name" class="w-full px-5 py-3 border rounded-xl" value="${companyName}" required>
            </div>
        </div>
    `;

    return `
        <div class="text-gray-800">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-semibold">${isEditMode ? "Edit Data Input" : certificate.name}</h2>
                <button type="button" onclick="handleBackToPortalWrapper()" class="bg-gray-200 text-gray-700 font-semibold px-4 py-2 rounded-xl">Kembali ke Portal</button>
            </div>
            <form id="sbu-user-form" class="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                <input type="hidden" id="submission-id-input" value="${initialData.id || ''}">
                <input type="hidden" id="submission-cert-type-input" value="${certificate.name}">
                <input type="hidden" id="submission-sbu-type-input" value="${sbuType}">
                ${nameInputHtml}
                <div>
                    <label class="block text-gray-700 font-medium mb-1">Nama Marketing</label>
                    <select id="submission-marketing-name" class="w-full px-5 py-3 border rounded-xl" required>
                        <option value="">-- Pilih Nama Marketing --</option>
                        ${appState.marketingNames.map(m => `<option value="${m.name}" ${initialData.marketingName === m.name ? 'selected' : ''}>${m.name}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label class="block text-gray-700 font-medium mb-1">Tanggal Input</label>
                    <input type="date" id="submission-input-date" class="w-full px-5 py-3 border rounded-xl" value="${initialData.inputDate || ''}" required>
                </div>
                <div class="flex space-x-4" id="submission-sub-buttons">
                    ${sbuDataSource.map(sub => `<button type="button" data-sub-id="${sub.id}" class="sub-btn font-semibold py-2 px-4 rounded-xl ${initialData.selectedSub?.id === sub.id ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}">${sub.name}</button>`).join('')}
                </div>
                <div id="submission-dynamic-content"></div>
                <div class="flex justify-end gap-2 mt-6 pt-4 border-t">
                    <button type="button" onclick="handleBackToPortalWrapper()" class="px-6 py-3 rounded-xl font-semibold bg-gray-200 text-gray-700">Batal</button>
                    <button type="submit" class="px-6 py-3 rounded-xl font-semibold bg-indigo-600 text-white">Simpan</button>
                </div>
            </form>
        </div>
    `;
}

export function renderSimpleCertForm(submission, certificate, appState) {
     return `
        <div class="text-gray-800">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-semibold">${certificate.name}</h2>
                <button type="button" onclick="handleBackToPortalWrapper()" class="bg-gray-200 text-gray-700 font-semibold px-4 py-2 rounded-xl">Kembali ke Portal</button>
            </div>
            ${certificate.id === 'cert-4' || certificate.id === 'cert-5' || certificate.id === 'cert-6' ? `
            <form id="sbu-user-form" class="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                <input type="hidden" id="submission-id-input" value="${submission?.id || ''}">
                <input type="hidden" id="submission-cert-type-input" value="${certificate.name}">
                <input type="hidden" id="submission-sbu-type-input" value="${certificate.id === 'cert-4' ? 'smap' : (certificate.id === 'cert-5' ? 'simpk' : 'notaris')}">
                <div>
                    <label class="block text-gray-700 font-medium mb-1">Nama Perusahaan</label>
                    <div class="flex items-center gap-2">
                        <select id="submission-company-prefix" class="px-4 py-3 border rounded-xl bg-gray-50">
                            <option ${submission?.companyName?.startsWith('PT.') ? 'selected' : ''}>PT.</option>
                            <option ${submission?.companyName?.startsWith('CV.') ? 'selected' : ''}>CV.</option>
                        </select>
                        <input type="text" id="submission-company-name" class="w-full px-5 py-3 border rounded-xl" value="${(submission?.companyName || '').replace(/^PT\.\s|^CV\.\s/, '')}" required>
                    </div>
                </div>
                <div>
                    <label class="block text-gray-700 font-medium mb-1">Nama Marketing</label>
                    <select id="submission-marketing-name" class="w-full px-5 py-3 border rounded-xl" required>
                        <option value="">-- Pilih Nama Marketing --</option>
                        ${appState.marketingNames.map(m => `<option value="${m.name}" ${submission?.marketingName === m.name ? 'selected' : ''}>${m.name}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label class="block text-gray-700 font-medium mb-1">Tanggal Input</label>
                    <input type="date" id="submission-input-date" class="w-full px-5 py-3 border rounded-xl" value="${submission?.inputDate || ''}" required>
                </div>
                <div id="submission-dynamic-content"></div>
                <div class="flex justify-end gap-2 mt-6 pt-4 border-t">
                    <button type="button" onclick="handleBackToPortalWrapper()" class="px-6 py-3 rounded-xl font-semibold bg-gray-200 text-gray-700">Batal</button>
                    <button type="submit" class="px-6 py-3 rounded-xl font-semibold bg-indigo-600 text-white">Simpan</button>
                </div>
            </form>
            ` : `
            <div class="text-center p-8 text-gray-500">
                <p class="text-lg">Fungsionalitas untuk sertifikat ini masih dalam pengembangan.</p>
                <p>Silakan gunakan menu SBU Konstruksi atau SBU Konsultan.</p>
            </div>`}
        </div>
     `;
}

export function attachSbuUserFormListeners(appState, handleSaveSubmission) {
    const form = document.getElementById('sbu-user-form');
    if (!form) return;

    form.addEventListener('submit', handleSaveSubmission);

    const initialSubmission = appState.editingSubmission || {};
    appState.sbuUserFormState = { ...JSON.parse(JSON.stringify(initialSubmission)) };

    const sbuType = document.getElementById('submission-sbu-type-input').value;
    let klasifikasiDataSource;
    if (sbuType === 'konstruksi') klasifikasiDataSource = appState.konstruksiKlasifikasiData;
    else if (sbuType === 'skk') klasifikasiDataSource = appState.skkKlasifikasiData;
    else if (sbuType === 'konsultan') klasifikasiDataSource = appState.konsultanKlasifikasiData;

    if (appState.sbuUserFormState.selectedKlasifikasi && appState.sbuUserFormState.selectedKlasifikasi.id) {
        const fullKlasifikasi = klasifikasiDataSource.find(k => k.id === appState.sbuUserFormState.selectedKlasifikasi.id);
        if (fullKlasifikasi) {
            appState.sbuUserFormState.selectedKlasifikasi = fullKlasifikasi;
        }
    }

    if (sbuType === 'notaris' && !appState.sbuUserFormState.selectedSub) {
        appState.sbuUserFormState.selectedSub = { id: 'notaris-main', name: 'Notaris', subKlasifikasi: ['Akta Tanah', 'Akta Perusahaan', 'Akta Waris', 'Akta Perkawinan'] };
    }

    if (appState.sbuUserFormState.selectedSub || sbuType === 'notaris') {
         updateSbuUserFormDynamicContent(appState);
    }

    form.querySelectorAll('.sub-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            form.querySelectorAll('.sub-btn').forEach(b => {
                b.classList.remove('bg-indigo-600', 'text-white');
                b.classList.add('bg-gray-200', 'text-gray-700');
            });
            e.target.classList.add('bg-indigo-600', 'text-white');
            e.target.classList.remove('bg-gray-200', 'text-gray-700');

            const subId = e.target.dataset.subId;
            let sbuDataSource;
            if (sbuType === 'konstruksi') sbuDataSource = appState.sbuKonstruksiData;
            else if (sbuType === 'skk') sbuDataSource = appState.skkKonstruksiData;
            else if (sbuType === 'konsultan') sbuDataSource = appState.sbuKonsultanData;
            else if (sbuType === 'notaris') sbuDataSource = [{ id: 'notaris-main', name: 'Notaris', subKlasifikasi: ['Akta Tanah', 'Akta Perusahaan', 'Akta Waris', 'Akta Perkawinan'] }];

            appState.sbuUserFormState = {
                selectedSub: sbuDataSource.find(s => s.id === subId)
            };
            updateSbuUserFormDynamicContent(appState);
        });
    });
}

export function updateSbuUserFormDynamicContent(appState) {
    const container = document.getElementById('submission-dynamic-content');
    if (!container) return;

    const { selectedSub, selectedKlasifikasi, selectedSubKlasifikasi, selectedKualifikasi, selectedBiayaLainnya } = appState.sbuUserFormState;
    const sbuType = document.getElementById('submission-sbu-type-input').value;

    if (!selectedSub && (sbuType === 'konstruksi' || sbuType === 'skk')) {
        container.innerHTML = '';
        return;
    }

    let klasifikasiDataSource, kualifikasiDataSource, biayaSetorDataSource, biayaLainnyaDataSource;

    // ... (This logic is also very long and will be refactored later)
    container.innerHTML = `...`; // Placeholder
}
