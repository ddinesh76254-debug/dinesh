/**
 * Hospital Management System - Patient Registration & Booking JS
 */

document.addEventListener('DOMContentLoaded', () => {
    const departmentSelect = document.getElementById('department');
    const doctorSelect = document.getElementById('doctor');
    const registrationForm = document.getElementById('patientRegistrationForm');
    const resetBtn = document.getElementById('resetBtn');
    const successCard = document.getElementById('bookingSuccessCard');

    // Set minimum date to today
    const dateInput = document.getElementById('date');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.min = today;
        dateInput.value = today;
    }

    let allDoctorsList = [];

    // Preload all doctors for instant selection
    async function initDoctors() {
        try {
            const res = await fetch(`${API_BASE_URL}/doctors`);
            const data = await res.json();
            if (data.success && data.data) {
                allDoctorsList = data.data;
                populateDoctorDropdown(allDoctorsList);
            }
        } catch (e) {
            console.warn('Could not preload all doctors:', e);
        }
    }
    initDoctors();

    function populateDoctorDropdown(doctors, selectedDept = '') {
        if (!doctorSelect) return;
        doctorSelect.disabled = false;
        doctorSelect.innerHTML = selectedDept 
            ? `<option value="">-- Choose Doctor for ${selectedDept} (${doctors.length} available) --</option>`
            : `<option value="">-- Choose Any Doctor (${doctors.length} available) --</option>`;

        doctors.forEach(doctor => {
            const option = document.createElement('option');
            option.value = doctor.id;
            option.textContent = `${doctor.doctor_name} — ${doctor.department_name || ''} (${doctor.specialization})`;
            doctorSelect.appendChild(option);
        });
    }

    // Load departments or set default dynamic listener
    if (departmentSelect) {
        departmentSelect.addEventListener('change', async (e) => {
            const selectedDepartment = e.target.value;
            await loadDoctorsForDepartment(selectedDepartment);
        });
    }

    // Direct doctor selection auto-syncs department
    if (doctorSelect) {
        doctorSelect.addEventListener('change', (e) => {
            const chosenId = Number(e.target.value);
            if (!chosenId) return;
            const chosenDoc = allDoctorsList.find(d => d.id === chosenId);
            if (chosenDoc && chosenDoc.department_name && departmentSelect) {
                if (departmentSelect.value !== chosenDoc.department_name) {
                    departmentSelect.value = chosenDoc.department_name;
                }
            }
        });
    }

    // Function to fetch doctors dynamically based on department
    async function loadDoctorsForDepartment(departmentName) {
        if (!doctorSelect) return;

        if (!departmentName) {
            populateDoctorDropdown(allDoctorsList);
            return;
        }

        doctorSelect.innerHTML = '<option value="">Loading doctors...</option>';
        doctorSelect.disabled = true;

        try {
            // Dynamic fetch from backend API
            const response = await fetch(`${API_BASE_URL}/doctors/department/${encodeURIComponent(departmentName)}`);
            const data = await response.json();

            if (data.success && data.data && data.data.length > 0) {
                populateDoctorDropdown(data.data, departmentName);
            } else {
                doctorSelect.innerHTML = '<option value="">No doctors available for this department</option>';
                doctorSelect.disabled = false;
            }
        } catch (error) {
            console.error('Error fetching doctors:', error);
            // Fallback to local filter if network failed
            const localFiltered = allDoctorsList.filter(d => (d.department_name || '').toLowerCase() === departmentName.toLowerCase());
            if (localFiltered.length > 0) {
                populateDoctorDropdown(localFiltered, departmentName);
            } else {
                doctorSelect.innerHTML = '<option value="">Failed to load doctors</option>';
                showAlert('Could not load doctors from backend server. Please ensure the backend is running.', 'danger');
            }
        }
    }

    // Validation Helper
    function validateForm(formData) {
        let isValid = true;

        // Clear previous error states
        document.querySelectorAll('.form-group').forEach(group => group.classList.remove('has-error'));

        // Validate Name (Required, min 2 chars)
        if (!formData.name || formData.name.trim().length < 2) {
            setError('name', 'Patient name is required (minimum 2 characters)');
            isValid = false;
        }

        // Validate Date (Required, valid date)
        if (!formData.date) {
            setError('date', 'Appointment date is required');
            isValid = false;
        } else {
            const parsed = new Date(formData.date);
            if (isNaN(parsed.getTime())) {
                setError('date', 'Please enter a valid appointment date');
                isValid = false;
            }
        }

        // Validate Address (Required)
        if (!formData.address || formData.address.trim().length === 0) {
            setError('address', 'Patient residential address is required');
            isValid = false;
        }

        // Validate Department (Required)
        if (!formData.department) {
            setError('department', 'Please select a medical department');
            isValid = false;
        }

        // Validate Doctor (Required)
        if (!formData.doctor_id) {
            setError('doctor', 'Please select a specialist doctor');
            isValid = false;
        }

        return isValid;
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

    // Form Submission
    if (registrationForm) {
        registrationForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = {
                name: document.getElementById('name').value.trim(),
                date: document.getElementById('date').value,
                address: document.getElementById('address').value.trim(),
                department: document.getElementById('department').value,
                doctor_id: document.getElementById('doctor').value
            };

            if (!validateForm(formData)) {
                return;
            }

            const submitBtn = document.getElementById('submitBtn');
            const originalText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Submitting...';

            try {
                // Post to appointments API (creates patient record + appointment record)
                const response = await fetch(`${API_BASE_URL}/appointments`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();

                if (response.ok && result.success) {
                    // Show success message and appointment ID
                    if (successCard) {
                        successCard.style.display = 'block';
                        document.getElementById('displayAppointmentId').textContent = result.appointment_id || result.data.id;
                        document.getElementById('displayPatientName').textContent = formData.name;
                        document.getElementById('displayDoctorName').textContent = result.data.doctor_name || 'Assigned Doctor';
                        document.getElementById('displayDeptName').textContent = result.data.department_name || formData.department;
                        document.getElementById('displayApptDate').textContent = formatDate(formData.date);
                        document.getElementById('displayStatus').textContent = result.data.status || 'Pending';
                        
                        // Scroll to success card
                        successCard.scrollIntoView({ behavior: 'smooth' });
                    }

                    showAlert(`Appointment booked successfully! Your Appointment ID is #${result.appointment_id || result.data.id}`, 'success');
                    registrationForm.reset();
                    doctorSelect.innerHTML = '<option value="">Select Department first</option>';
                    doctorSelect.disabled = true;
                } else {
                    showAlert(result.message || 'Error creating appointment registration.', 'danger');
                }
            } catch (error) {
                console.error('Submission error:', error);
                showAlert('Network error: Could not reach the server. Please check your backend connection.', 'danger');
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        });
    }

    // Reset Button Handler
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            registrationForm.reset();
            document.querySelectorAll('.form-group').forEach(group => group.classList.remove('has-error'));
            if (doctorSelect) {
                doctorSelect.innerHTML = '<option value="">Select Department first</option>';
                doctorSelect.disabled = true;
            }
            if (successCard) {
                successCard.style.display = 'none';
            }
        });
    }
});
