/**
 * app.js
 * Main application logic.
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const authView = document.getElementById('auth-view');
    const profileView = document.getElementById('profile-view');
    const scannerView = document.getElementById('scanner-view');
    const resultsView = document.getElementById('results-view');

    const views = [authView, profileView, scannerView, resultsView];

    const userInfoHeader = document.getElementById('user-info');
    const curUserName = document.getElementById('current-user-name');
    const logoutBtn = document.getElementById('logout-btn');

    // Auth Form
    const authForm = document.getElementById('auth-form');
    const existingProfilesDiv = document.getElementById('existing-profiles');
    const profileList = document.getElementById('profile-list');

    // Profile Form
    const profileForm = document.getElementById('profile-form');
    const genderSelect = document.getElementById('p-gender');
    const femaleQuestions = document.getElementById('female-questions');

    // Scanner Form
    const scannerForm = document.getElementById('scanner-form');
    const medList = document.getElementById('med-list');
    const scanMed1 = document.getElementById('scan-med-1');
    const scanMed2 = document.getElementById('scan-med-2');

    // Results
    const scanAgainBtn = document.getElementById('scan-again-btn');
    const resultHeader = document.getElementById('result-header');
    const resultDetails = document.getElementById('result-details');


    // --- State ---
    let currentUser = null;
    let currentProfile = null;

    // --- Helpers ---
    const showView = (viewId) => {
        views.forEach(v => {
            if (v.id === viewId) v.classList.remove('hidden');
            else v.classList.add('hidden');
        });
    };

    const updateHeader = () => {
        if (currentUser && currentProfile) {
            userInfoHeader.classList.remove('hidden');
            curUserName.textContent = `${currentUser.name} (${currentProfile.gender}, ${currentProfile.age})`;
        } else {
            userInfoHeader.classList.add('hidden');
        }
    };

    // Populate Datalist
    const populateMedicines = () => {
        medList.innerHTML = '';
        window.DB.MEDICINES.forEach(med => {
            const option = document.createElement('option');
            option.value = med.name;
            medList.appendChild(option);
        });
    };
    populateMedicines();

    // --- Auth Logic ---
    authForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const phone = document.getElementById('auth-phone').value;
        const name = document.getElementById('auth-name').value;
        const email = document.getElementById('auth-email').value;

        // Save User
        currentUser = window.Storage.saveUser(phone, name, email);

        // Check for profiles
        if (currentUser.profiles && currentUser.profiles.length > 0) {
            // Show selection
            existingProfilesDiv.classList.remove('hidden');
            profileList.innerHTML = '';

            // Add "New Profile" button
            const newBtn = document.createElement('div');
            newBtn.className = 'profile-item';
            newBtn.innerHTML = `<strong>+ Create New Profile</strong>`;
            newBtn.onclick = () => {
                showView('profile-view');
            };
            profileList.appendChild(newBtn);

            currentUser.profiles.forEach(p => {
                const div = document.createElement('div');
                div.className = 'profile-item';
                div.innerHTML = `<strong>${p.age} ${p.gender}</strong> - Weight: ${p.weight}kg`;
                div.onclick = () => {
                    currentProfile = p;
                    updateHeader();
                    showView('scanner-view');
                };
                profileList.appendChild(div);
            });
        } else {
            // No profiles, go to create
            showView('profile-view');
        }
    });

    logoutBtn.addEventListener('click', () => {
        currentUser = null;
        currentProfile = null;
        updateHeader();
        existingProfilesDiv.classList.add('hidden');
        authForm.reset();
        showView('auth-view');
    });

    // --- Profile Logic ---
    // Toggle Female Questions
    genderSelect.addEventListener('change', (e) => {
        if (e.target.value === 'female') {
            femaleQuestions.classList.remove('hidden');
        } else {
            femaleQuestions.classList.add('hidden');
        }
    });

    profileForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Gather Data
        const profile = {
            gender: genderSelect.value,
            age: document.getElementById('p-age').value,
            weight: document.getElementById('p-weight').value,
            stomach: document.getElementById('p-stomach').checked,
            pregnant: document.getElementById('p-pregnant') ? document.getElementById('p-pregnant').checked : false,
            allergies: document.getElementById('p-allergies').value,
            alcohol: document.getElementById('p-alcohol').value,
            smoking: document.getElementById('p-smoking').checked,
            // Collect checkboxes
            conditions: Array.from(document.querySelectorAll('input[name="conditions"]:checked')).map(cb => cb.value)
        };

        currentProfile = window.Storage.addProfile(currentUser.phone, profile);
        updateHeader();
        showView('scanner-view');
    });

    // --- Scanner Logic ---
    scannerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const m1 = scanMed1.value;
        const m2 = scanMed2.value;

        if (!currentProfile) {
            alert("Please create a profile first.");
            return;
        }

        const results = window.Scanner.scan(m1, m2, currentProfile);
        renderResults(results, m1, m2);
        showView('results-view');
    });

    scanAgainBtn.addEventListener('click', () => {
        // Clear inputs? Optional. keeping them might be useful.
        showView('scanner-view');
    });

    // --- Render Results ---
    const renderResults = (results, m1Name, m2Name) => {
        // 1. Header Logic
        let statusClass = 'status-safe';
        let icon = '✅';
        let title = 'Low Risk';

        if (results.riskLevel === 'Caution') {
            statusClass = 'status-caution';
            icon = '⚠️';
            title = 'Caution Advised';
        } else if (results.riskLevel === 'Unsafe') {
            statusClass = 'status-unsafe';
            icon = '🚫';
            title = 'Unsafe Combination';
        }

        resultHeader.className = `result-header ${statusClass}`;
        resultHeader.innerHTML = `
            <span class="result-icon">${icon}</span>
            <div class="result-title">${title}</div>
            <p>Analysis for <strong>${m1Name}</strong> + <strong>${m2Name}</strong></p>
        `;

        // 2. Details
        let html = '';

        if (results.interactions.length === 0 && results.contraindications.length === 0) {
            html += `<div class="warning-item" style="background:#E8F5E9; border-color: #2E7D32;">
                <p>No known interactions found in our database for this combination.</p>
             </div>`;
        }

        // Interactions
        results.interactions.forEach(i => {
            html += `
            <div class="warning-item">
                <strong>Interaction:</strong> ${i.description || 'Unknown'} <br>
                <em>Recommendation: ${i.recommendation || 'Consult a doctor.'}</em>
            </div>
           `;
        });

        // Contraindications
        results.contraindications.forEach(c => {
            html += `
             <div class="warning-item">
                 <strong>Personal Warning (${c.reason}):</strong> ${c.warning}
             </div>
            `;
        });

        resultDetails.innerHTML = html;
    }
});
