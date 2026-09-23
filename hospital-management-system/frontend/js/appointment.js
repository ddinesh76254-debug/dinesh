/**
 * Hospital Management System - Appointment Lookup & List JS
 */

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchAppointmentInput');
    const searchBtn = document.getElementById('searchBtn');
    const appointmentsTableBody = document.getElementById('appointmentsTableBody');
    const statusFilter = document.getElementById('statusFilter');

    let allAppointments = [];

    // Initial fetch of appointments
    fetchAppointments();

    async function fetchAppointments() {
        if (!appointmentsTableBody) return;

        appointmentsTableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center; padding: 2rem; color: #64748b;">
                    Loading appointments from hospital database...
                </td>
            </tr>
        `;

        try {
            const response = await fetch(`${API_BASE_URL}/appointments`);
            const data = await response.json();

            if (data.success) {
                allAppointments = data.data || [];
                renderAppointments(allAppointments);
            } else {
                appointmentsTableBody.innerHTML = `
                    <tr>
                        <td colspan="6" style="text-align:center; padding: 2rem; color: #ef4444;">
                            Failed to load appointments: ${data.message}
                        </td>
                    </tr>
                `;
            }
        } catch (error) {
            console.error('Error fetching appointments:', error);
            appointmentsTableBody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align:center; padding: 2rem; color: #ef4444;">
                        Failed to connect to backend API server.
                    </td>
                </tr>
            `;
        }
    }

    function renderAppointments(appointments) {
        if (!appointmentsTableBody) return;

        if (appointments.length === 0) {
            appointmentsTableBody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align:center; padding: 2.5rem; color: #64748b;">
                        No appointments found matching your search.
                    </td>
                </tr>
            `;
            return;
        }

        appointmentsTableBody.innerHTML = appointments.map(apt => `
            <tr>
                <td><strong>#${apt.id}</strong></td>
                <td>
                    <div style="font-weight: 600; color: #0f172a;">${escapeHtml(apt.patient_name || 'Anonymous')}</div>
                    <div style="font-size: 0.8rem; color: #64748b;">${escapeHtml(apt.patient_address || '')}</div>
                </td>
                <td>${formatDate(apt.appointment_date)}</td>
                <td>
                    <span style="font-weight: 500; color: #0284c7;">${escapeHtml(apt.department_name || '-')}</span>
                </td>
                <td>
                    <div style="font-weight: 600;">${escapeHtml(apt.doctor_name || 'Dr. Not Assigned')}</div>
                    <div style="font-size: 0.8rem; color: #64748b;">${escapeHtml(apt.specialization || '')}</div>
                </td>
                <td>${getStatusBadge(apt.status)}</td>
            </tr>
        `).join('');
    }

    function filterAppointments() {
        const query = (searchInput ? searchInput.value : '').toLowerCase().trim();
        const selectedStatus = statusFilter ? statusFilter.value : 'all';

        const filtered = allAppointments.filter(apt => {
            const matchesQuery = 
                !query ||
                (apt.id && apt.id.toString().includes(query)) ||
                (apt.patient_name && apt.patient_name.toLowerCase().includes(query)) ||
                (apt.doctor_name && apt.doctor_name.toLowerCase().includes(query)) ||
                (apt.department_name && apt.department_name.toLowerCase().includes(query));

            const matchesStatus = 
                selectedStatus === 'all' || 
                (apt.status && apt.status.toLowerCase() === selectedStatus.toLowerCase());

            return matchesQuery && matchesStatus;
        });

        renderAppointments(filtered);
    }

    if (searchInput) {
        searchInput.addEventListener('input', filterAppointments);
    }

    if (searchBtn) {
        searchBtn.addEventListener('click', filterAppointments);
    }

    if (statusFilter) {
        statusFilter.addEventListener('change', filterAppointments);
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
        return text.replace(/[&<>"']/g, m => map[m]);
    }
});
