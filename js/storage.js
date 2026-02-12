/**
 * storage.js
 * Manages localStorage for user profiles.
 */

const STORAGE_KEY = 'medSafe_users';

const Storage = {
    // Get all users
    getAllUsers: () => {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : {};
    },

    // Get specific user by phone
    getUser: (phone) => {
        const users = Storage.getAllUsers();
        return users[phone] || null;
    },

    // Save or update a user (phone acts as the "account" ID)
    // profiles are stored as an array under the user `profiles` key
    saveUser: (phone, name, email) => {
        const users = Storage.getAllUsers();
        if (!users[phone]) {
            users[phone] = {
                phone,
                name,
                email,
                profiles: []
            };
        } else {
            // Update basic info
            users[phone].name = name;
            users[phone].email = email;
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
        return users[phone];
    },

    // Add a profile to a user account
    addProfile: (phone, profileData) => {
        const users = Storage.getAllUsers();
        if (!users[phone]) return null;

        // Generate a simple ID
        profileData.id = Date.now().toString();
        profileData.createdAt = new Date().toISOString();

        users[phone].profiles.push(profileData);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
        return profileData;
    },

    // Mock Session Management in localStorage
    setCurrentSession: (phone, profileId = null) => {
        localStorage.setItem('medSafe_current_phone', phone);
        if (profileId) {
            localStorage.setItem('medSafe_current_profile_id', profileId);
        } else {
            localStorage.removeItem('medSafe_current_profile_id');
        }
    },

    getCurrentSession: () => {
        const phone = localStorage.getItem('medSafe_current_phone');
        const profileId = localStorage.getItem('medSafe_current_profile_id');
        return { phone, profileId };
    },

    clearSession: () => {
        localStorage.removeItem('medSafe_current_phone');
        localStorage.removeItem('medSafe_current_profile_id');
    }
};

window.Storage = Storage;
