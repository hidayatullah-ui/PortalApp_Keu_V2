import { showMessage } from './utils.js';

// --- DATABASE ONLINE ---
export const loadFromStorage = async (key, defaultValue) => {
    // Gunakan sessionStorage untuk data login agar setiap tab/profil terpisah
    if (key === 'sulthan-group-loggedInUser') {
        try {
            const data = sessionStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (error) {
            console.error('Error loading from sessionStorage:', error);
            return defaultValue;
        }
    }

    // Gunakan database untuk data lainnya
    try {
        const response = await fetch(`api/storage.php?key=${encodeURIComponent(key)}`);
        if (response.ok) {
            const data = await response.json();
            return data !== null ? data : defaultValue;
        }
    } catch (error) {
        console.error('Error loading from database:', error);
    }
    return defaultValue;
};

export const saveToStorage = async (key, value) => {
    // Gunakan sessionStorage untuk data login agar setiap tab/profil terpisah
    if (key === 'sulthan-group-loggedInUser') {
        try {
            if (value === null) {
                sessionStorage.removeItem(key);
            } else {
                sessionStorage.setItem(key, JSON.stringify(value));
            }
            return;
        } catch (error) {
            console.error('Error saving to sessionStorage:', error);
            return;
        }
    }

    // Gunakan database untuk data lainnya
    try {
        const response = await fetch('api/storage.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ key, value })
        });
        if (!response.ok) {
            throw new Error('Failed to save to database');
        }
    } catch (error) {
        console.error('Error saving to database:', error);
        showMessage('Gagal menyimpan ke database online', 'error');
    }
};
