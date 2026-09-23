const db = require('../config/database');

const Department = {
    async getAll() {
        const [rows] = await db.query('SELECT * FROM departments ORDER BY department_name ASC');
        return rows;
    },

    async getById(id) {
        const [rows] = await db.query('SELECT * FROM departments WHERE id = ?', [id]);
        return rows[0] || null;
    },

    async getByName(name) {
        const [rows] = await db.query('SELECT * FROM departments WHERE LOWER(department_name) = LOWER(?)', [name]);
        return rows[0] || null;
    }
};

module.exports = Department;
