const Doctor = require('../models/doctorModel');
const Department = require('../models/departmentModel');

const doctorController = {
    // GET /api/doctors
    async getAll(req, res) {
        try {
            const doctors = await Doctor.getAll();
            return res.status(200).json({ success: true, count: doctors.length, data: doctors });
        } catch (error) {
            console.error('Error fetching doctors:', error);
            return res.status(500).json({ success: false, message: 'Server error while fetching doctors' });
        }
    },

    // GET /api/doctors/:id
    async getById(req, res) {
        try {
            const { id } = req.params;
            const doctor = await Doctor.getById(id);
            if (!doctor) {
                return res.status(404).json({ success: false, message: 'Doctor not found' });
            }
            return res.status(200).json({ success: true, data: doctor });
        } catch (error) {
            console.error('Error fetching doctor:', error);
            return res.status(500).json({ success: false, message: 'Server error while fetching doctor' });
        }
    },

    // GET /api/doctors/department/:department
    async getByDepartment(req, res) {
        try {
            const { department } = req.params;
            if (!department) {
                return res.status(400).json({ success: false, message: 'Department is required' });
            }

            const doctors = await Doctor.getByDepartment(department);
            return res.status(200).json({ success: true, count: doctors.length, data: doctors });
        } catch (error) {
            console.error('Error fetching doctors by department:', error);
            return res.status(500).json({ success: false, message: 'Server error while fetching doctors by department' });
        }
    },

    // POST /api/doctors
    async create(req, res) {
        try {
            const { doctor_name, department_id, specialization } = req.body;

            if (!doctor_name || doctor_name.trim().length < 2) {
                return res.status(400).json({
                    success: false,
                    message: 'Doctor name is required and must be at least 2 characters'
                });
            }

            if (!department_id) {
                return res.status(400).json({
                    success: false,
                    message: 'Department is required'
                });
            }

            const dept = await Department.getById(department_id);
            if (!dept) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid department ID'
                });
            }

            if (!specialization || specialization.trim().length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Specialization is required'
                });
            }

            const newDoctor = await Doctor.create({
                doctor_name: doctor_name.trim(),
                department_id: Number(department_id),
                specialization: specialization.trim()
            });

            return res.status(201).json({
                success: true,
                message: 'Doctor added successfully',
                data: { ...newDoctor, department_name: dept.department_name }
            });
        } catch (error) {
            console.error('Error creating doctor:', error);
            return res.status(500).json({ success: false, message: 'Server error while adding doctor' });
        }
    },

    // PUT /api/doctors/:id
    async update(req, res) {
        try {
            const { id } = req.params;
            const { doctor_name, department_id, specialization } = req.body;

            const existing = await Doctor.getById(id);
            if (!existing) {
                return res.status(404).json({ success: false, message: 'Doctor not found' });
            }

            if (doctor_name && doctor_name.trim().length < 2) {
                return res.status(400).json({
                    success: false,
                    message: 'Doctor name must be at least 2 characters'
                });
            }

            let deptId = existing.department_id;
            if (department_id) {
                const dept = await Department.getById(department_id);
                if (!dept) {
                    return res.status(400).json({ success: false, message: 'Invalid department ID' });
                }
                deptId = Number(department_id);
            }

            await Doctor.update(id, {
                doctor_name: doctor_name ? doctor_name.trim() : existing.doctor_name,
                department_id: deptId,
                specialization: specialization ? specialization.trim() : existing.specialization
            });

            const updatedDoctor = await Doctor.getById(id);
            return res.status(200).json({
                success: true,
                message: 'Doctor updated successfully',
                data: updatedDoctor
            });
        } catch (error) {
            console.error('Error updating doctor:', error);
            return res.status(500).json({ success: false, message: 'Server error while updating doctor' });
        }
    },

    // DELETE /api/doctors/:id
    async delete(req, res) {
        try {
            const { id } = req.params;
            const existing = await Doctor.getById(id);
            if (!existing) {
                return res.status(404).json({ success: false, message: 'Doctor not found' });
            }

            await Doctor.delete(id);
            return res.status(200).json({ success: true, message: 'Doctor deleted successfully' });
        } catch (error) {
            console.error('Error deleting doctor:', error);
            return res.status(500).json({ success: false, message: 'Server error while deleting doctor' });
        }
    }
};

module.exports = doctorController;
