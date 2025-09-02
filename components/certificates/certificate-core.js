import { showMessage } from '../shared/utils.js';
import { saveToStorage } from '../shared/storage.js';

export function handleCertificateSelection(appState, renderApp, certId) {
    appState.selectedCertificateForForm = appState.certificates.find(c => c.id === certId);
    appState.isCertificateFormVisible = true;
    renderApp();
}

export function handleBackToPortal(appState, renderApp) {
    if (appState.editingSubmission) {
        if (appState.loggedInUser.role === 'Super admin') {
            appState.activeTab = 'sertifikat';
        } else {
            appState.activeTab = 'dataInput';
        }
    }

    appState.isCertificateFormVisible = false;
    appState.selectedCertificateForForm = null;
    appState.editingSubmission = null;
    renderApp();
}

export function showSubmissionFormForEdit(appState, renderApp, submissionId) {
    const submission = appState.userSubmissions.find(s => s.id === submissionId);
    const certificate = appState.certificates.find(c => c.name === submission.certificateType);
    if (!certificate) {
        showMessage('Tipe sertifikat tidak ditemukan.', 'error');
        return;
    }
    appState.activeTab = 'inputSertifikat';
    appState.isCertificateFormVisible = true;
    appState.selectedCertificateForForm = certificate;
    appState.editingSubmission = submission;
    renderApp();
}

export async function handleSaveSubmission(appState, renderApp, e) {
    e.preventDefault();
    const form = e.target;
    const { selectedSub, selectedKlasifikasi, selectedSubKlasifikasi, selectedKualifikasi, selectedBiayaLainnya } = appState.sbuUserFormState;
    const certificateType = form.querySelector('#submission-cert-type-input').value;
    const isSkk = certificateType === 'SKK Konstruksi';
    const sbuType = form.querySelector('#submission-sbu-type-input').value;

    let biayaSetorDataSource;
    if (sbuType === 'konstruksi') {
        const context = selectedSub?.name === 'GAPEKNAS' ? 'gapeknas' : 'p3sm';
        biayaSetorDataSource = context === 'gapeknas' ? appState.gapeknasBiayaSetorData : appState.p3smBiayaSetorData;
    } else if (sbuType === 'skk') {
        biayaSetorDataSource = appState.skkBiayaSetorData;
    } else if (sbuType === 'konsultan') {
        biayaSetorDataSource = appState.konsultanBiayaSetorData;
    } else if (sbuType === 'smap') {
        biayaSetorDataSource = appState.smapBiayaSetorData;
    } else if (sbuType === 'simpk') {
        biayaSetorDataSource = appState.simpkBiayaSetorData;
    } else if (sbuType === 'notaris') {
        biayaSetorDataSource = appState.notarisBiayaSetorData;
    }

    const biayaKualifikasiValue = (sbuType === 'smap' || sbuType === 'simpk') ? 0 : (selectedKualifikasi?.biaya || 0);
    const biayaSetorKantorValue = (sbuType === 'smap' || sbuType === 'simpk') ? (biayaSetorDataSource[0]?.biaya || 0) : (sbuType === 'notaris' ? (selectedKualifikasi ? (biayaSetorDataSource.find(b => b.name === selectedKualifikasi.name)?.biaya || 0) : 0) : (selectedKualifikasi ? (biayaSetorDataSource.find(b => b.name === selectedKualifikasi.name)?.biaya || 0) : 0));
    const biayaLainnyaValue = (sbuType === 'smap' || sbuType === 'simpk') ? 0 : (selectedBiayaLainnya?.biaya || 0);
    const keuntunganValue = biayaSetorKantorValue - biayaKualifikasiValue - biayaLainnyaValue;

    let finalCompanyName = '';
    if (isSkk) {
        finalCompanyName = form.querySelector('#submission-company-name').value;
    } else {
        finalCompanyName = `${form.querySelector('#submission-company-prefix').value} ${form.querySelector('#submission-company-name').value}`;
    }

    const submissionData = {
        id: form.querySelector('#submission-id-input').value,
        companyName: finalCompanyName,
        marketingName: form.querySelector('#submission-marketing-name').value,
        inputDate: form.querySelector('#submission-input-date').value,
        submittedById: appState.loggedInUser.id,
        certificateType: certificateType,
        sbuType: sbuType,
        selectedSub,
        selectedKlasifikasi,
        selectedSubKlasifikasi,
        selectedKualifikasi,
        selectedBiayaLainnya,
        biayaSetorKantor: biayaSetorKantorValue,
        keuntungan: keuntunganValue
    };

    const requiredOk = (sbuType === 'smap' || sbuType === 'simpk')
        ? (!!submissionData.companyName.trim() && !!submissionData.marketingName && !!submissionData.inputDate)
        : (sbuType === 'notaris'
            ? (!!submissionData.companyName.trim() && !!submissionData.marketingName && !!submissionData.inputDate && !!submissionData.selectedSubKlasifikasi && !!submissionData.selectedKualifikasi)
            : (!!submissionData.companyName.trim() && !!submissionData.marketingName && !!submissionData.inputDate && !!submissionData.selectedKlasifikasi && !!submissionData.selectedSubKlasifikasi && !!submissionData.selectedKualifikasi));
    if (!requiredOk) {
        showMessage('Harap lengkapi semua pilihan!', 'error');
        return;
    }
     if ((sbuType === 'konstruksi' || sbuType === 'skk') && !submissionData.selectedSub) {
        showMessage('Harap pilih Asosiasi!', 'error');
        return;
    }
    if (sbuType === 'notaris' && !submissionData.selectedSub) {
        showMessage('Harap pilih Sub-Kategori!', 'error');
        return;
    }

    if (submissionData.id) {
        appState.userSubmissions = appState.userSubmissions.map(s => s.id === submissionData.id ? submissionData : s);
        showMessage('Data berhasil diperbarui!', 'success');
    } else {
        appState.userSubmissions.push({ ...submissionData, id: generateId(), ...submissionData });
        showMessage('Data baru berhasil ditambahkan!', 'success');
    }
    await saveToStorage('sulthan-group-user-submissions', appState.userSubmissions);
    handleBackToPortal(appState, renderApp);
}

export function deleteSubmission(appState, renderApp, submissionId) {
    openConfirmationModal(async () => {
        appState.userSubmissions = appState.userSubmissions.filter(s => s.id !== submissionId);
        await saveToStorage('sulthan-group-user-submissions', appState.userSubmissions);
        showMessage('Data berhasil dihapus!', 'success');
        renderApp();
    });
}
