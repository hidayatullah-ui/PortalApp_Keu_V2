import { showMessage } from '../../shared/utils.js';

export function validateSubmission(submissionData, sbuType) {
    const requiredOk = (sbuType === 'smap' || sbuType === 'simpk')
        ? (!!submissionData.companyName.trim() && !!submissionData.marketingName && !!submissionData.inputDate)
        : (sbuType === 'notaris'
            ? (!!submissionData.companyName.trim() && !!submissionData.marketingName && !!submissionData.inputDate && !!submissionData.selectedSubKlasifikasi && !!submissionData.selectedKualifikasi)
            : (!!submissionData.companyName.trim() && !!submissionData.marketingName && !!submissionData.inputDate && !!submissionData.selectedKlasifikasi && !!submissionData.selectedSubKlasifikasi && !!submissionData.selectedKualifikasi));

    if (!requiredOk) {
        showMessage('Harap lengkapi semua pilihan!', 'error');
        return false;
    }
    if ((sbuType === 'konstruksi' || sbuType === 'skk') && !submissionData.selectedSub) {
        showMessage('Harap pilih Asosiasi!', 'error');
        return false;
    }
    if (sbuType === 'notaris' && !submissionData.selectedSub) {
        showMessage('Harap pilih Sub-Kategori!', 'error');
        return false;
    }
    return true;
}
