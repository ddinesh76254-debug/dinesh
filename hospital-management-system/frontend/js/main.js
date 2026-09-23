/**
 * Hospital Management System - Shared JavaScript Utilities
 */

const API_BASE_URL = window.location.port === '5000' || window.location.port === '3000' 
    ? '/api' 
    : 'http://localhost:5000/api';

// Shared Alert Display
function showAlert(message, type = 'success', containerId = 'alert-container') {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
        <div class="alert alert-${type}">
            <span>${message}</span>
        </div>
    `;

    setTimeout(() => {
        if (container.innerHTML.includes(message)) {
            container.innerHTML = '';
        }
    }, 6000);
}

// Format Date YYYY-MM-DD to readable format
function formatDate(dateString) {
    if (!dateString) return '-';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch (e) {
        return dateString;
    }
}

// Format Status Badge
function getStatusBadge(status) {
    const s = (status || 'Pending').toLowerCase();
    return `<span class="status-badge ${s}">${status || 'Pending'}</span>`;
}

// Check Admin Auth
function checkAdminAuth() {
    const token = localStorage.getItem('admin_token');
    return !!token;
}

function requireAdminAuth() {
    if (!checkAdminAuth()) {
        window.location.href = 'login.html';
    }
}

function adminLogout() {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    window.location.href = 'login.html';
}
