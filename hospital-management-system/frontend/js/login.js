/**
 * Hospital Management System - Admin Login JS
 */

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('adminLoginForm');
    const loginBtn = document.getElementById('loginBtn');

    // If already logged in, redirect to admin dashboard
    if (checkAdminAuth()) {
        window.location.href = 'admin.html';
        return;
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const usernameInput = document.getElementById('username');
            const passwordInput = document.getElementById('password');

            const username = usernameInput.value.trim();
            const password = passwordInput.value;

            // Clear previous errors
            document.querySelectorAll('.form-group').forEach(group => group.classList.remove('has-error'));

            let isValid = true;
            if (!username) {
                setError('username', 'Username is required');
                isValid = false;
            }
            if (!password) {
                setError('password', 'Password is required');
                isValid = false;
            }

            if (!isValid) return;

            const originalText = loginBtn.innerHTML;
            loginBtn.disabled = true;
            loginBtn.innerHTML = 'Verifying credentials...';

            try {
                const response = await fetch(`${API_BASE_URL}/admin/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });

                const result = await response.json();

                if (response.ok && result.success) {
                    localStorage.setItem('admin_token', result.token);
                    localStorage.setItem('admin_user', JSON.stringify(result.admin));
                    showAlert('Login successful! Redirecting to dashboard...', 'success');
                    setTimeout(() => {
                        window.location.href = 'admin.html';
                    }, 800);
                } else {
                    showAlert(result.message || 'Invalid username or password', 'danger');
                }
            } catch (error) {
                console.error('Login error:', error);
                showAlert('Network error: Unable to connect to server.', 'danger');
            } finally {
                loginBtn.disabled = false;
                loginBtn.innerHTML = originalText;
            }
        });
    }

    function setError(fieldId, message) {
        const field = document.getElementById(fieldId);
        if (!field) return;
        const group = field.closest('.form-group');
        if (group) {
            group.classList.add('has-error');
            const feedback = group.querySelector('.form-feedback');
            if (feedback) feedback.textContent = message;
        }
    }
});
