import { getRoleBadgeClass, showMessage, generateId } from '../shared/utils.js';
import { saveToStorage } from '../shared/storage.js';
import { openConfirmationModal } from '../shared/modals.js';

export function renderUserTable(appState, openUserModal, deleteUser) {
    return `
        <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
                <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Lengkap</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Peran</th>
                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
                </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
                ${appState.users.map(user => `
                    <tr class="hover:bg-gray-50">
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${user.fullName}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${user.username}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500"><span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeClass(user.role)}">${user.role}</span></td>
                        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button onclick="openUserModalWrapper('${user.id}')" class="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                            <button onclick="deleteUserWrapper('${user.id}')" class="text-red-600 hover:text-red-900">Hapus</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

export function openUserModal(userId, appState) {
    const modal = document.getElementById('user-modal');
    const title = document.getElementById('user-modal-title');
    const form = document.getElementById('user-form');
    form.reset();

    if (userId) {
        const user = appState.users.find(u => u.id === userId);
        title.textContent = 'Edit Pengguna';
        document.getElementById('user-id').value = user.id;
        document.getElementById('user-fullName').value = user.fullName;
        document.getElementById('user-username').value = user.username;
        document.getElementById('user-email').value = user.email;
        document.getElementById('user-role').value = user.role;
        document.getElementById('user-password').placeholder = 'Biarkan kosong untuk password lama';
        document.getElementById('user-password').required = false;
    } else {
        title.textContent = 'Tambah Pengguna Baru';
        document.getElementById('user-id').value = '';
        document.getElementById('user-password').placeholder = 'Masukkan password';
        document.getElementById('user-password').required = true;
    }
    modal.classList.add('show');
}

export function closeUserModal() {
    document.getElementById('user-modal').classList.remove('show');
}

export async function handleUserFormSubmit(e, appState, renderApp) {
    e.preventDefault();
    const userData = {
        id: document.getElementById('user-id').value,
        fullName: document.getElementById('user-fullName').value,
        username: document.getElementById('user-username').value,
        email: document.getElementById('user-email').value,
        role: document.getElementById('user-role').value,
        password: document.getElementById('user-password').value,
    };

    if (userData.id) {
        const userIndex = appState.users.findIndex(u => u.id === userData.id);
        if (userData.password) {
            appState.users[userIndex].password = btoa(userData.password);
        }
        appState.users[userIndex] = { ...appState.users[userIndex], ...userData, password: appState.users[userIndex].password };
        showMessage('Pengguna berhasil diperbarui!', 'success');
    } else {
        appState.users.push({ ...userData, id: generateId(), password: btoa(userData.password) });
        showMessage('Pengguna baru berhasil ditambahkan!', 'success');
    }
    await saveToStorage('sulthan-group-users', appState.users);
    closeUserModal();
    renderApp();
}

export async function deleteUser(userId, appState, renderApp) {
    openConfirmationModal(async () => {
        appState.users = appState.users.filter(u => u.id !== userId);
        await saveToStorage('sulthan-group-users', appState.users);
        showMessage('Pengguna berhasil dihapus!', 'success');
        renderApp();
    });
}
