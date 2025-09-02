// --- FUNGSI HELPER ---
export const generateId = () => `id-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

export const formatCurrency = (number) => {
    if (typeof number !== 'number' || isNaN(number)) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(number);
};

export const formatDisplayDate = (dateString) => {
    if (!dateString || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return '-';
    const [year, month, day] = dateString.split('-');
    return `${day}-${month}-${year}`;
};

export const capitalizeWords = (str) => {
    if (!str) return '';
    const prefixes = ['PT. ', 'CV. '];
    let prefix = '';
    let namePart = str;
    for (const p of prefixes) {
        if (str.toUpperCase().startsWith(p.toUpperCase())) {
            prefix = str.substring(0, p.length);
            namePart = str.substring(p.length);
            break;
        }
    }
    const capitalizedNamePart = namePart.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    return prefix + capitalizedNamePart;
};

export const getRoleBadgeClass = (role) => {
    switch (role) {
        case 'Super admin': return 'bg-red-100 text-red-800';
        case 'admin': return 'bg-indigo-100 text-indigo-800';
        case 'manager': return 'bg-yellow-100 text-yellow-800';
        case 'karyawan': return 'bg-green-100 text-green-800';
        case 'marketing': return 'bg-blue-100 text-blue-800';
        case 'mitra': return 'bg-purple-100 text-purple-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

export const showMessage = (text, type = 'success') => {
    const container = document.getElementById('message-container');
    const messageDiv = document.createElement('div');
    messageDiv.className = `p-4 rounded-xl shadow-lg font-semibold text-white ${type === 'success' ? 'bg-green-500' : 'bg-red-500'}`;
    messageDiv.textContent = text;
    container.appendChild(messageDiv);
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
};
