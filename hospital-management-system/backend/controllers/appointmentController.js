const Appointment = require('../models/appointmentModel');
const Patient = require('../models/patientModel');
const Doctor = require('../models/doctorModel');
const Department = require('../models/departmentModel');

const appointmentController = {
    // GET /api/appointments
    async getAll(req, res) {
        try {
            const appointments = await Appointment.getAll();
            return res.status(200).json({ success: true, count: appointments.length, data: appointments });
        } catch (error) {
            console.error('Error fetching appointments:', error);
            return res.status(500).json({ success: false, message: 'Server error while fetching appointments' });
        }
    },

    // GET /api/appointments/:id
    async getById(req, res) {
        try {
            const { id } = req.params;
            const appointment = await Appointment.getById(id);
            if (!appointment) {
                return res.status(404).json({ success: false, message: 'Appointment not found' });
            }
            return res.status(200).json({ success: true, data: appointment });
        } catch (error) {
            console.error('Error fetching appointment:', error);
            return res.status(500).json({ success: false, message: 'Server error while fetching appointment' });
        }
    },

    // POST /api/appointments
    // Supports both direct patient_id + doctor_id OR combined registration form
    // (name, date, address, department, doctor_id/doctor_name)
    async create(req, res) {
        try {
            const {
                name,
                patient_name,
                date,
                appointment_date,
                address,
                department,
                doctor,
                doctor_id,
                patient_id,
                status = 'Pending'
            } = req.body;

            const finalName = (name || patient_name || '').trim();
            const finalDate = date || appointment_date;
            const finalAddress = (address || '').trim();

            let targetPatientId = patient_id;

            // If no existing patient_id is supplied, validate & create patient record first
            if (!targetPatientId) {
                if (!finalName || finalName.length < 2) {
                    return res.status(400).json({
                        success: false,
                        message: 'Patient name is required and must be at least 2 characters long'
                    });
                }

                if (!finalDate) {
                    return res.status(400).json({
                        success: false,
                        message: 'Appointment date is required'
                    });
                }

                const parsedDate = new Date(finalDate);
                if (isNaN(parsedDate.getTime())) {
                    return res.status(400).json({
                        success: false,
                        message: 'Please provide a valid date'
                    });
                }

                if (!finalAddress) {
                    return res.status(400).json({
                        success: false,
                        message: 'Address is required'
                    });
                }

                // Create new patient record
                const newPatient = await Patient.create({
                    name: finalName,
                    date: finalDate,
                    address: finalAddress
                });
                targetPatientId = newPatient.id;
            } else {
                // Verify patient exists
                const existingPatient = await Patient.getById(targetPatientId);
                if (!existingPatient) {
                    return res.status(404).json({ success: false, message: 'Patient not found' });
                }
            }

            // Determine doctor ID
            let targetDoctorId = doctor_id;
            if (!targetDoctorId && doctor) {
                if (!isNaN(doctor)) {
                    targetDoctorId = Number(doctor);
                } else {
                    const allDocs = await Doctor.getAll();
                    const matched = allDocs.find(d => d.doctor_name.toLowerCase() === doctor.trim().toLowerCase());
                    if (matched) targetDoctorId = matched.id;
                }
            }

            if (!targetDoctorId) {
                return res.status(400).json({
                    success: false,
                    message: 'Please select a valid doctor'
                });
            }

            const doctorRecord = await Doctor.getById(targetDoctorId);
            if (!doctorRecord) {
                return res.status(400).json({
                    success: false,
                    message: 'Selected doctor does not exist'
                });
            }

            // Create appointment record
            const newAppointment = await Appointment.create({
                patient_id: targetPatientId,
                doctor_id: targetDoctorId,
                appointment_date: finalDate,
                status: status || 'Pending'
            });

            // Fetch populated appointment record
            const populated = await Appointment.getById(newAppointment.id);

            return res.status(201).json({
                success: true,
                message: 'Appointment booked successfully!',
                appointment_id: newAppointment.id,
                data: populated
            });
        } catch (error) {
            console.error('Error creating appointment:', error);
            return res.status(500).json({ success: false, message: 'Server error while creating appointment' });
        }
    },

    // PUT /api/appointments/:id
    async update(req, res) {
        try {
            const { id } = req.params;
            const { status, appointment_date, doctor_id } = req.body;

            const existing = await Appointment.getById(id);
            if (!existing) {
                return res.status(404).json({ success: false, message: 'Appointment not found' });
            }

            const validStatuses = ['Pending', 'Approved', 'Cancelled', 'Completed'];
            if (status && !validStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: `Status must be one of: ${validStatuses.join(', ')}`
                });
            }

            await Appointment.update(id, {
                status: status || existing.status,
                appointment_date: appointment_date || existing.appointment_date,
                doctor_id: doctor_id || existing.doctor_id
            });

            const updatedAppointment = await Appointment.getById(id);
            return res.status(200).json({
                success: true,
                message: 'Appointment updated successfully',
                data: updatedAppointment
            });
        } catch (error) {
            console.error('Error updating appointment:', error);
            return res.status(500).json({ success: false, message: 'Server error while updating appointment' });
        }
    },

    // DELETE /api/appointments/:id
    async delete(req, res) {
        try {
            const { id } = req.params;
            const existing = await Appointment.getById(id);
            if (!existing) {
                return res.status(404).json({ success: false, message: 'Appointment not found' });
            }

            await Appointment.delete(id);
            return res.status(200).json({ success: true, message: 'Appointment deleted successfully' });
        } catch (error) {
            console.error('Error deleting appointment:', error);
            return res.status(500).json({ success: false, message: 'Server error while deleting appointment' });
        }
    }
};

module.exports = appointmentController;
