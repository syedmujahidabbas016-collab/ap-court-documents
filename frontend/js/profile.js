// ===============================
// PROFILE PAGE JAVASCRIPT
// ===============================

document.addEventListener('DOMContentLoaded', function () {
    loadProfile();
});


// ===============================
// LOAD PROFILE
// ===============================

async function loadProfile() {
    try {
        const response = await apiRequest('/users/profile');

        if (!response || !response.user) {
            console.error('Profile data not found');
            return;
        }

        const user = response.user;

        // Update profile header
        const nameElement = document.querySelector('.profile-header h1');
        if (nameElement) {
            nameElement.textContent =
                `${user.firstName || ''} ${user.lastName || ''}`.trim();
        }

        // Update email in header
        const emailElement =
            document.querySelector('.profile-header .email');

        if (emailElement) {
            emailElement.textContent = user.email || '';
        }

        // Update profile information by text fields
        updateProfileText(user);

    } catch (error) {
        console.error('Error loading profile:', error);
    }
}


// ===============================
// UPDATE PROFILE DISPLAY
// ===============================

function updateProfileText(user) {

    const fullName =
        `${user.firstName || ''} ${user.lastName || ''}`.trim();

    // Replace visible text where possible
    const elements = document.querySelectorAll(
        '.profile-info, .profile-details, .profile-content'
    );

    elements.forEach(element => {

        const text = element.textContent;

        if (text.includes('First Name')) {
            const value = element.querySelector('.value');
            if (value) value.textContent = user.firstName || '-';
        }

        if (text.includes('Last Name')) {
            const value = element.querySelector('.value');
            if (value) value.textContent = user.lastName || '-';
        }

        if (text.includes('Email')) {
            const value = element.querySelector('.value');
            if (value) value.textContent = user.email || '-';
        }

        if (text.includes('Phone')) {
            const value = element.querySelector('.value');
            if (value) value.textContent = user.phone || '-';
        }
    });

    console.log('Profile loaded:', fullName);
}


// ===============================
// EDIT PROFILE
// ===============================

async function editProfile() {

    const firstName = prompt(
        'Enter your first name:'
    );

    if (firstName === null) return;

    if (firstName.trim() === '') {
        alert('First name cannot be empty.');
        return;
    }

    const lastName = prompt(
        'Enter your last name:'
    );

    if (lastName === null) return;

    if (lastName.trim() === '') {
        alert('Last name cannot be empty.');
        return;
    }

    const phone = prompt(
        'Enter your phone number:'
    );

    if (phone === null) return;

    try {

        const response = await apiRequest(
            '/users/profile',
            {
                method: 'PUT',

                headers: {
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify({
                    firstName: firstName.trim(),
                    lastName: lastName.trim(),
                    phone: phone.trim()
                })
            }
        );

        if (response && response.success) {

            alert('Profile updated successfully!');

            await loadProfile();

            location.reload();

        } else {

            alert(
                response?.message ||
                'Failed to update profile.'
            );
        }

    } catch (error) {

        console.error(
            'Update profile error:',
            error
        );

        alert(
            'Failed to update profile. Please try again.'
        );
    }
}


// ===============================
// CHANGE PASSWORD
// ===============================

async function changePassword() {

    const currentPassword = prompt(
        'Enter your current password:'
    );

    if (currentPassword === null) return;

    if (currentPassword === '') {
        alert('Current password is required.');
        return;
    }

    const newPassword = prompt(
        'Enter your new password:'
    );

    if (newPassword === null) return;

    if (newPassword.length < 6) {

        alert(
            'New password must be at least 6 characters.'
        );

        return;
    }

    const confirmPassword = prompt(
        'Confirm your new password:'
    );

    if (confirmPassword === null) return;

    if (newPassword !== confirmPassword) {

        alert(
            'New passwords do not match.'
        );

        return;
    }

    try {

        const response = await apiRequest(
            '/users/change-password',
            {
                method: 'PUT',

                headers: {
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify({
                    currentPassword: currentPassword,
                    newPassword: newPassword
                })
            }
        );

        if (response && response.success) {

            alert(
                'Password changed successfully!'
            );

        } else {

            alert(
                response?.message ||
                'Failed to change password.'
            );
        }

    } catch (error) {

        console.error(
            'Change password error:',
            error
        );

        alert(
            'Failed to change password.'
        );
    }
}


// ===============================
// DELETE ACCOUNT
// ===============================

async function deleteAccount() {

    const confirmation = confirm(
        'Are you sure you want to delete your account?'
    );

    if (!confirmation) return;

    const finalConfirmation = confirm(
        'WARNING: Your account and uploaded documents will be permanently deleted. Continue?'
    );

    if (!finalConfirmation) return;

    try {

        const response = await apiRequest(
            '/users/account',
            {
                method: 'DELETE'
            }
        );

        if (response && response.success) {

            alert(
                'Account deleted successfully.'
            );

            // Clear login data
            localStorage.removeItem('token');
            localStorage.removeItem('user');

            // Redirect to login
            window.location.href = 'login.html';

        } else {

            alert(
                response?.message ||
                'Failed to delete account.'
            );
        }

    } catch (error) {

        console.error(
            'Delete account error:',
            error
        );

        alert(
            'Failed to delete account.'
        );
    }
}