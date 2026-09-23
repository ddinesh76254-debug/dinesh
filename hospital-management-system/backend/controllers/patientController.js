const Patient = require('../models/patientModel');

const patientController = {
    // GET /api/patients
    async getAll(req, res) {
        try {
            const patients = await Patient.getAll();
            return res.status(200).json({ success: true, count: patients.length, data: patients });
        } catch (error) {
            console.error('Error fetching patients:', error);
            return res.status(500).json({ success: false, message: 'Server error while fetching patients' });
        }
    },

    // GET /api/patients/:id
    async getById(req, res) {
        try {
            const { id } = req.params;
            const patient = await Patient.getById(id);
            if (!patient) {
                return res.status(404).json({ success: false, message: 'Patient not found' });
            }
            return res.status(200).json({ success: true, data: patient });
        } catch (error) {
            console.error('Error fetching patient:', error);
            return res.status(500).json({ success: false, message: 'Server error while fetching patient' });
        }
    },

    // POST /api/patients
    async create(req, res) {
        try {
            const { name, date, address } = req.body;

            // Form validation
            if (!name || typeof name !== 'string' || name.trim().length < 2) {
                return res.status(400).json({
                    success: false,
                    message: 'Patient name is required and must be at least 2 characters long'
                });
            }

            if (!address || typeof address !== 'string' || address.trim().length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Address is required'
                });
            }

            if (!date) {
                return res.status(400).json({
                    success: false,
                    message: 'Date is required'
                });
            }

            const parsedDate = new Date(date);
            if (isNaN(parsedDate.getTime())) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide a valid date'
                });
            }

            const newPatient = await Patient.create({
                name: name.trim(),
                date,
                address: address.trim()
            });

            return res.status(201).json({
                success: true,
                message: 'Patient registered successfully',
                data: newPatient
            });
        } catch (error) {
            console.error('Error creating patient:', error);
            return res.status(500).json({ success: false, message: 'Server error while creating patient' });
        }
    },

    // PUT /api/patients/:id
    async update(req, res) {
        try {
            const { id } = req.params;
            const { name, date, address } = req.body;

            const existing = await Patient.getById(id);
            if (!existing) {
                return res.status(404).json({ success: false, message: 'Patient not found' });
            }

            if (name && name.trim().length < 2) {
                return res.status(400).json({
                    success: false,
                    message: 'Patient name must be at least 2 characters'
                });
            }

            const updated = await Patient.update(id, {
                name: name ? name.trim() : existing.name,
                date: date || existing.date,
                address: address ? address.trim() : existing.address
            });

            if (!updated) {
                return res.status(400).json({ success: false, message: 'Failed to update patient' });
            }

            const updatedPatient = await Patient.getById(id);
            return res.status(200).json({
                success: true,
                message: 'Patient updated successfully',
                data: updatedPatient
            });
        } catch (error) {
            console.error('Error updating patient:', error);
            return res.status(500).json({ success: false, message: 'Server error while updating patient' });
        }
    },

    // DELETE /api/patients/:id
    async delete(req, res) {
        try {
            const { id } = req.params;
            const existing = await Patient.getById(id);
            if (!existing) {
                return res.status(404).json({ success: false, message: 'Patient not found' });
            }

            await Patient.delete(id);
            return res.status(200).json({ success: true, message: 'Patient deleted successfully' });
        } catch (error) {
            console.error('Error deleting patient:', error);
            return res.status(500).json({ success: false, message: 'Server error while deleting patient' });
        }
    }
};

module.exports = patientController;
