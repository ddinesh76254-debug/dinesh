const db = require('../config/database');

const Appointment = {
    async getAll() {
        const [rows] = await db.query(`
            SELECT 
                a.id, 
                a.patient_id, 
                a.doctor_id, 
                a.appointment_date, 
                a.status, 
                a.created_at,
                p.name AS patient_name,
                p.address AS patient_address,
                d.doctor_name,
                d.specialization,
                dept.department_name
            FROM appointments a
            JOIN patients p ON a.patient_id = p.id
            JOIN doctors d ON a.doctor_id = d.id
            JOIN departments dept ON d.department_id = dept.id
            ORDER BY a.created_at DESC
        `);
        return rows;
    },

    async getById(id) {
        const [rows] = await db.query(`
            SELECT 
                a.id, 
                a.patient_id, 
                a.doctor_id, 
                a.appointment_date, 
                a.status, 
                a.created_at,
                p.name AS patient_name,
                p.address AS patient_address,
                d.doctor_name,
                d.specialization,
                dept.department_name
            FROM appointments a
            JOIN patients p ON a.patient_id = p.id
            JOIN doctors d ON a.doctor_id = d.id
            JOIN departments dept ON d.department_id = dept.id
            WHERE a.id = ?
        `, [id]);
        return rows[0] || null;
    },

    async create({ patient_id, doctor_id, appointment_date, status = 'Pending' }) {
        const [result] = await db.query(
            'INSERT INTO appointments (patient_id, doctor_id, appointment_date, status, created_at) VALUES (?, ?, ?, ?, NOW())',
            [patient_id, doctor_id, appointment_date, status]
        );
        return {
            id: result.insertId,
            patient_id,
            doctor_id,
            appointment_date,
            status
        };
    },

    async update(id, { appointment_date, status, doctor_id }) {
        let updates = [];
        let params = [];

        if (appointment_date !== undefined) {
            updates.push('appointment_date = ?');
            params.push(appointment_date);
        }
        if (status !== undefined) {
            updates.push('status = ?');
            params.push(status);
        }
        if (doctor_id !== undefined) {
            updates.push('doctor_id = ?');
            params.push(doctor_id);
        }

        if (updates.length === 0) return true;

        params.push(id);
        const [result] = await db.query(
            `UPDATE appointments SET ${updates.join(', ')} WHERE id = ?`,
            params
        );
        return result.affectedRows > 0;
    },

    async delete(id) {
        const [result] = await db.query('DELETE FROM appointments WHERE id = ?', [id]);
        return result.affectedRows > 0;
    },

    async getStats() {
        const [[patientsCount]] = await db.query('SELECT COUNT(*) AS total FROM patients');
        const [[doctorsCount]] = await db.query('SELECT COUNT(*) AS total FROM doctors');
        const [[appointmentsCount]] = await db.query('SELECT COUNT(*) AS total FROM appointments');
        const [[pendingCount]] = await db.query('SELECT COUNT(*) AS total FROM appointments WHERE status = "Pending"');

        return {
            totalPatients: patientsCount.total,
            totalDoctors: doctorsCount.total,
            totalAppointments: appointmentsCount.total,
            pendingAppointments: pendingCount.total
        };
    }
};

module.exports = Appointment;
