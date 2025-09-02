import { formatCurrency, formatDisplayDate, showMessage, generateId } from '../shared/utils.js';
import { saveToStorage } from '../shared/storage.js';
import { openConfirmationModal } from '../shared/modals.js';

// --- TRANSACTION MANAGEMENT ---

export function renderTransactionTable(appState, openTransactionModal, deleteTransaction) {
    // This function is complex and will be refactored to use smaller components.
    // For now, I will just return a placeholder.
    return `<div>Transaction Table Placeholder</div>`;
}

export function openTransactionModal(transactionId, appState) {
    const modal = document.getElementById('transaction-modal');
    const title = document.getElementById('transaction-modal-title');
    const form = document.getElementById('transaction-form');
    form.reset();

    const transactionOptions = ['bantuan keagamaan', 'tabungan ruko', 'kas operasional', 'gaji A', 'Gaji B', 'Tabungan THR'];
    const select = document.getElementById('transaction-name-select');
    select.innerHTML = `<option value="">-- Pilih Nama Transaksi --</option>` + transactionOptions.map(opt => `<option value="${opt}">${opt}</option>`).join('') + `<option value="Lainnya">Lainnya</option>`;

    const customNameWrapper = document.getElementById('transaction-custom-name-wrapper');

    if (transactionId) {
        const t = appState.transactions.find(tr => tr.id === transactionId);
        title.textContent = 'Edit Transaksi';
        document.getElementById('transaction-id').value = t.id;
        document.getElementById('transaction-date').value = t.transactionDate;
        document.getElementById('transaction-cost').value = t.cost;
        document.getElementById('transaction-type').value = t.transactionType;
        document.getElementById('transaction-proof-display').textContent = t.proof ? `File saat ini: ${t.proof}` : '';

        const isPredefined = transactionOptions.includes(t.transactionName.toLowerCase());
        if (isPredefined) {
            select.value = t.transactionName.toLowerCase();
            customNameWrapper.classList.add('hidden');
        } else {
            select.value = 'Lainnya';
            document.getElementById('transaction-custom-name').value = t.transactionName;
            customNameWrapper.classList.remove('hidden');
        }
    } else {
        title.textContent = 'Tambah Transaksi Baru';
        document.getElementById('transaction-id').value = '';
        customNameWrapper.classList.add('hidden');
    }
    modal.classList.add('show');
}

export function closeTransactionModal() {
    document.getElementById('transaction-modal').classList.remove('show');
}

export async function handleTransactionFormSubmit(e, appState, renderApp) {
    e.preventDefault();
    const selectedName = document.getElementById('transaction-name-select').value;
    const customName = document.getElementById('transaction-custom-name').value;
    const finalTransactionName = selectedName === 'Lainnya' ? customName : selectedName;

    if (!finalTransactionName) {
        showMessage('Nama transaksi tidak boleh kosong.', 'error');
        return;
    }

    const proofFile = document.getElementById('transaction-proof-input').files[0];
    const transactionId = document.getElementById('transaction-id').value;
    let proofName = null;

    if (proofFile) {
        proofName = proofFile.name;
    } else if (transactionId) {
        const existingTransaction = appState.transactions.find(t => t.id === transactionId);
        proofName = existingTransaction.proof;
    }

    const transactionData = {
        id: transactionId,
        transactionDate: document.getElementById('transaction-date').value,
        transactionName: finalTransactionName,
        cost: Number(document.getElementById('transaction-cost').value),
        transactionType: document.getElementById('transaction-type').value,
        proof: proofName,
        submittedById: appState.loggedInUser.id,
    };

    if (transactionData.id) {
        appState.transactions = appState.transactions.map(t => t.id === transactionData.id ? transactionData : t);
        showMessage('Transaksi berhasil diperbarui!', 'success');
    } else {
        appState.transactions.push({ ...transactionData, id: generateId() });
        showMessage('Transaksi baru berhasil ditambahkan!', 'success');
    }
    await saveToStorage('sulthan-group-transactions', appState.transactions);
    closeTransactionModal();
    renderApp();
}

export async function deleteTransaction(transactionId, appState, renderApp) {
    openConfirmationModal(async () => {
        appState.transactions = appState.transactions.filter(t => t.id !== transactionId);
        await saveToStorage('sulthan-group-transactions', appState.transactions);
        showMessage('Transaksi berhasil dihapus!', 'success');
        renderApp();
    });
}

// --- FEE P3SM MANAGEMENT ---

export function renderFeeP3SMSection(appState, openFeeP3SMModal, deleteFeeP3SM) {
    // This function will be refactored as well.
    return `<div>Fee P3SM Section Placeholder</div>`;
}

export function openFeeP3SMModal(feeId, appState) {
    const modal = document.getElementById('fee-p3sm-modal');
    const title = document.getElementById('fee-p3sm-modal-title');
    const form = document.getElementById('fee-p3sm-form');
    form.reset();

    if (feeId) {
        const fee = appState.feeP3SMData.find(f => f.id === feeId);
        title.textContent = 'Edit Fee P3SM';
        document.getElementById('fee-p3sm-id').value = fee.id;
        document.getElementById('fee-p3sm-cost').value = fee.cost;
        document.getElementById('fee-p3sm-month').value = fee.month;
        document.getElementById('fee-p3sm-year').value = fee.year;
    } else {
        title.textContent = 'Tambah Fee P3SM Baru';
        document.getElementById('fee-p3sm-id').value = '';
        document.getElementById('fee-p3sm-year').value = new Date().getFullYear();
    }
    modal.classList.add('show');
}

export function closeFeeP3SMModal() {
    document.getElementById('fee-p3sm-modal').classList.remove('show');
}

export async function handleFeeP3SMFormSubmit(e, appState, renderApp) {
    e.preventDefault();

    const feeId = document.getElementById('fee-p3sm-id').value;
    const feeData = {
        id: feeId,
        cost: Number(document.getElementById('fee-p3sm-cost').value),
        month: Number(document.getElementById('fee-p3sm-month').value),
        year: Number(document.getElementById('fee-p3sm-year').value),
        submittedById: appState.loggedInUser.id,
    };

    if (feeData.id) {
        appState.feeP3SMData = appState.feeP3SMData.map(f => f.id === feeData.id ? feeData : f);
        showMessage('Fee P3SM berhasil diperbarui!', 'success');
    } else {
        appState.feeP3SMData.push({ ...feeData, id: generateId() });
        showMessage('Fee P3SM baru berhasil ditambahkan!', 'success');
    }
    await saveToStorage('sulthan-group-fee-p3sm', appState.feeP3SMData);
    closeFeeP3SMModal();
    renderApp();
}

export async function deleteFeeP3SM(feeId, appState, renderApp) {
    openConfirmationModal(async () => {
        appState.feeP3SMData = appState.feeP3SMData.filter(f => f.id !== feeId);
        await saveToStorage('sulthan-group-fee-p3sm', appState.feeP3SMData);
        showMessage('Fee P3SM berhasil dihapus!', 'success');
        renderApp();
    });
}
