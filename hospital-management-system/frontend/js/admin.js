/**
 * Hospital Management System - Admin Dashboard JS
 */

document.addEventListener('DOMContentLoaded', () => {
    // Check Auth
    requireAdminAuth();

    // Display admin username
    const adminUser = JSON.parse(localStorage.getItem('admin_user') || '{}');
    const adminNameEl = document.getElementById('adminUserName');
    if (adminNameEl && adminUser.username) {
        adminNameEl.textContent = adminUser.username;
    }

    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            adminLogout();
        });
    }

    // Modal elements
    const doctorModal = document.getElementById('doctorModal');
    const doctorForm = document.getElementById('doctorForm');
    const addDoctorBtn = document.getElementById('addDoctorBtn');
    const closeDoctorModal = document.getElementById('closeDoctorModal');
    const modalTitle = document.getElementById('modalTitle');
    const doctorDeptSelect = document.getElementById('doctorDepartment');

    // Data containers
    let departmentsList = [];
    let doctorsList = [];
    let appointmentsList = [];
    let patientsList = [];

    // Load initial data
    initDashboard();

    async function initDashboard() {
        await loadDepartments();
        await loadStats();
        await loadAppointments();
        await loadDoctors();
        await loadPatients();
    }

    // 1. Load Stats
    async function loadStats() {
        try {
            const res = await fetch(`${API_BASE_URL}/admin/stats`);
            const data = await res.json();
            if (data.success) {
                document.getElementById('statPatients').textContent = data.data.totalPatients;
                document.getElementById('statDoctors').textContent = data.data.totalDoctors;
                document.getElementById('statAppointments').textContent = data.data.totalAppointments;
                document.getElementById('statPending').textContent = data.data.pendingAppointments;
            }
        } catch (e) {
            console.error('Error loading stats:', e);
        }
    }

    // 2. Load Departments
    async function loadDepartments() {
        try {
            const res = await fetch(`${API_BASE_URL}/departments`);
            const data = await res.json();
            if (data.success) {
                departmentsList = data.data;
                if (doctorDeptSelect) {
                    doctorDeptSelect.innerHTML = '<option value="">-- Select Department --</option>' +
                        departmentsList.map(d => `<option value="${d.id}">${escapeHtml(d.department_name)}</option>`).join('');
                }
            }
        } catch (e) {
            console.error('Error loading departments:', e);
        }
    }

    // 3. Load Appointments & Render Table
    async function loadAppointments() {
        const tbody = document.getElementById('adminAppointmentsTable');
        if (!tbody) return;

        try {
            const res = await fetch(`${API_BASE_URL}/appointments`);
            const data = await res.json();
            if (data.success) {
                appointmentsList = data.data;
                renderAppointmentsTable(appointmentsList);
            }
        } catch (e) {
            console.error('Error loading appointments:', e);
        }
    }

    function renderAppointmentsTable(list) {
        const tbody = document.getElementById('adminAppointmentsTable');
        if (!tbody) return;

        if (list.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding: 2rem;">No appointments recorded.</td></tr>';
            return;
        }

        tbody.innerHTML = list.map(apt => `
            <tr>
                <td><strong>#${apt.id}</strong></td>
                <td>
                    <div style="font-weight: 600;">${escapeHtml(apt.patient_name)}</div>
                    <div style="font-size: 0.8rem; color: #64748b;">${escapeHtml(apt.patient_address)}</div>
                </td>
                <td>${formatDate(apt.appointment_date)}</td>
                <td>${escapeHtml(apt.department_name)}</td>
                <td>${escapeHtml(apt.doctor_name)}</td>
                <td>${getStatusBadge(apt.status)}</td>
                <td>
                    <div style="display: flex; gap: 6px;">
                        ${apt.status !== 'Approved' ? `<button class="btn-sm btn-approve" onclick="updateAppointmentStatus(${apt.id}, 'Approved')">Approve</button>` : ''}
                        ${apt.status !== 'Cancelled' ? `<button class="btn-sm btn-cancel" onclick="updateAppointmentStatus(${apt.id}, 'Cancelled')">Cancel</button>` : ''}
                        <button class="btn-sm btn-delete" onclick="deleteAppointment(${apt.id})">Delete</button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    // 4. Load Doctors & Render Table
    async function loadDoctors() {
        const tbody = document.getElementById('adminDoctorsTable');
        if (!tbody) return;

        try {
            const res = await fetch(`${API_BASE_URL}/doctors`);
            const data = await res.json();
            if (data.success) {
                doctorsList = data.data;
                renderDoctorsTable(doctorsList);
            }
        } catch (e) {
            console.error('Error loading doctors:', e);
        }
    }

    function renderDoctorsTable(list) {
        const tbody = document.getElementById('adminDoctorsTable');
        if (!tbody) return;

        if (list.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 2rem;">No doctors registered yet.</td></tr>';
            return;
        }

        tbody.innerHTML = list.map(doc => `
            <tr>
                <td>#${doc.id}</td>
                <td><strong>${escapeHtml(doc.doctor_name)}</strong></td>
                <td><span style="color: #0284c7; font-weight: 500;">${escapeHtml(doc.department_name)}</span></td>
                <td>${escapeHtml(doc.specialization)}</td>
                <td>
                    <div style="display: flex; gap: 6px;">
                        <button class="btn-sm btn-secondary" onclick="openEditDoctorModal(${doc.id})">Edit</button>
                        <button class="btn-sm btn-delete" onclick="deleteDoctor(${doc.id})">Delete</button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    // 5. Load Patients & Render Table
    async function loadPatients() {
        const tbody = document.getElementById('adminPatientsTable');
        if (!tbody) return;

        try {
            const res = await fetch(`${API_BASE_URL}/patients`);
            const data = await res.json();
            if (data.success) {
                patientsList = data.data;
                renderPatientsTable(patientsList);
            }
        } catch (e) {
            console.error('Error loading patients:', e);
        }
    }

    function renderPatientsTable(list) {
        const tbody = document.getElementById('adminPatientsTable');
        if (!tbody) return;

        if (list.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 2rem;">No patients registered yet.</td></tr>';
            return;
        }

        tbody.innerHTML = list.map(pt => `
            <tr>
                <td>#${pt.id}</td>
                <td><strong>${escapeHtml(pt.name)}</strong></td>
                <td>${formatDate(pt.date)}</td>
                <td>${escapeHtml(pt.address)}</td>
                <td>
                    <button class="btn-sm btn-delete" onclick="deletePatient(${pt.id})">Delete</button>
                </td>
            </tr>
        `).join('');
    }

    // Global action functions attached to window for HTML onclicks
    window.updateAppointmentStatus = async function(id, status) {
        try {
            const res = await fetch(`${API_BASE_URL}/appointments/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            const data = await res.json();
            if (data.success) {
                showAlert(`Appointment #${id} updated to ${status}`, 'success');
                await loadAppointments();
                await loadStats();
            } else {
                showAlert(data.message, 'danger');
            }
        } catch (e) {
            showAlert('Failed to update appointment status.', 'danger');
        }
    };

    window.deleteAppointment = async function(id) {
        if (!confirm(`Are you sure you want to delete appointment #${id}?`)) return;

        try {
            const res = await fetch(`${API_BASE_URL}/appointments/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                showAlert(`Appointment #${id} deleted successfully.`, 'success');
                await loadAppointments();
                await loadStats();
            } else {
                showAlert(data.message, 'danger');
            }
        } catch (e) {
            showAlert('Failed to delete appointment.', 'danger');
        }
    };

    window.deleteDoctor = async function(id) {
        if (!confirm(`Are you sure you want to delete this doctor? Associated appointments will also be deleted.`)) return;

        try {
            const res = await fetch(`${API_BASE_URL}/doctors/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                showAlert(`Doctor deleted successfully.`, 'success');
                await loadDoctors();
                await loadAppointments();
                await loadStats();
            } else {
                showAlert(data.message, 'danger');
            }
        } catch (e) {
            showAlert('Failed to delete doctor.', 'danger');
        }
    };

    window.deletePatient = async function(id) {
        if (!confirm(`Are you sure you want to delete this patient record? Associated appointments will also be deleted.`)) return;

        try {
            const res = await fetch(`${API_BASE_URL}/patients/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                showAlert(`Patient record deleted successfully.`, 'success');
                await loadPatients();
                await loadAppointments();
                await loadStats();
            } else {
                showAlert(data.message, 'danger');
            }
        } catch (e) {
            showAlert('Failed to delete patient.', 'danger');
        }
    };

    // Doctor Modal Handlers
    window.openAddDoctorModal = function() {
        modalTitle.textContent = 'Add New Doctor';
        document.getElementById('doctorId').value = '';
        doctorForm.reset();
        doctorModal.classList.add('active');
    };

    window.openEditDoctorModal = function(id) {
        const doctor = doctorsList.find(d => d.id === id);
        if (!doctor) return;

        modalTitle.textContent = 'Edit Doctor Details';
        document.getElementById('doctorId').value = doctor.id;
        document.getElementById('doctorName').value = doctor.doctor_name;
        document.getElementById('doctorDepartment').value = doctor.department_id;
        document.getElementById('doctorSpecialization').value = doctor.specialization;
        doctorModal.classList.add('active');
    };

    if (addDoctorBtn) {
        addDoctorBtn.addEventListener('click', window.openAddDoctorModal);
    }

    if (closeDoctorModal) {
        closeDoctorModal.addEventListener('click', () => {
            doctorModal.classList.remove('active');
        });
    }

    // Save Doctor (Create or Edit)
    if (doctorForm) {
        doctorForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const doctorId = document.getElementById('doctorId').value;
            const doctor_name = document.getElementById('doctorName').value.trim();
            const department_id = document.getElementById('doctorDepartment').value;
            const specialization = document.getElementById('doctorSpecialization').value.trim();

            if (!doctor_name || !department_id || !specialization) {
                showAlert('Please fill in all doctor details', 'danger');
                return;
            }

            const isEdit = Boolean(doctorId);
            const url = isEdit ? `${API_BASE_URL}/doctors/${doctorId}` : `${API_BASE_URL}/doctors`;
            const method = isEdit ? 'PUT' : 'POST';

            try {
                const res = await fetch(url, {
                    method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ doctor_name, department_id, specialization })
                });

                const data = await res.json();
                if (data.success) {
                    showAlert(isEdit ? 'Doctor updated successfully!' : 'Doctor added successfully!', 'success');
                    doctorModal.classList.remove('active');
                    await loadDoctors();
                    await loadStats();
                } else {
                    showAlert(data.message, 'danger');
                }
            } catch (err) {
                console.error(err);
                showAlert('Failed to save doctor.', 'danger');
            }
        });
    }

    function escapeHtml(text) {
        if (!text) return '';
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.toString().replace(/[&<>"']/g, m => map[m]);
    }
});
