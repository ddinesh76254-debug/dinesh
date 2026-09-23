const db = require('../config/database');

const Doctor = {
    async getAll() {
        const [rows] = await db.query(`
            SELECT d.id, d.doctor_name, d.department_id, d.specialization, dept.department_name
            FROM doctors d
            JOIN departments dept ON d.department_id = dept.id
            ORDER BY d.doctor_name ASC
        `);
        return rows;
    },

    async getById(id) {
        const [rows] = await db.query(`
            SELECT d.id, d.doctor_name, d.department_id, d.specialization, dept.department_name
            FROM doctors d
            JOIN departments dept ON d.department_id = dept.id
            WHERE d.id = ?
        `, [id]);
        return rows[0] || null;
    },

    async getByDepartment(departmentIdentifier) {
        // Can be either department ID or department name
        const isNumeric = !isNaN(departmentIdentifier);
        let query, params;

        if (isNumeric) {
            query = `
                SELECT d.id, d.doctor_name, d.department_id, d.specialization, dept.department_name
                FROM doctors d
                JOIN departments dept ON d.department_id = dept.id
                WHERE d.department_id = ?
                ORDER BY d.doctor_name ASC
            `;
            params = [departmentIdentifier];
        } else {
            query = `
                SELECT d.id, d.doctor_name, d.department_id, d.specialization, dept.department_name
                FROM doctors d
                JOIN departments dept ON d.department_id = dept.id
                WHERE LOWER(dept.department_name) = LOWER(?)
                ORDER BY d.doctor_name ASC
            `;
            params = [departmentIdentifier];
        }

        const [rows] = await db.query(query, params);
        return rows;
    },

    async create({ doctor_name, department_id, specialization }) {
        const [result] = await db.query(
            'INSERT INTO doctors (doctor_name, department_id, specialization) VALUES (?, ?, ?)',
            [doctor_name, department_id, specialization]
        );
        return {
            id: result.insertId,
            doctor_name,
            department_id,
            specialization
        };
    },

    async update(id, { doctor_name, department_id, specialization }) {
        const [result] = await db.query(
            'UPDATE doctors SET doctor_name = ?, department_id = ?, specialization = ? WHERE id = ?',
            [doctor_name, department_id, specialization, id]
        );
        return result.affectedRows > 0;
    },

    async delete(id) {
        const [result] = await db.query('DELETE FROM doctors WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
};

module.exports = Doctor;
