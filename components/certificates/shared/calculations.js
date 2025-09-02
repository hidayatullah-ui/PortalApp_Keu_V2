export function calculateKeuntungan(appState, sbuUserFormState) {
    const { selectedSub, selectedKlasifikasi, selectedKualifikasi, selectedBiayaLainnya } = sbuUserFormState;
    const sbuType = document.getElementById('submission-sbu-type-input').value;

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

    return biayaSetorKantorValue - biayaKualifikasiValue - biayaLainnyaValue;
}
