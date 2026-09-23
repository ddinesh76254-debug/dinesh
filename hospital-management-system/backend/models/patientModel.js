const db = require('../config/database');

const Patient = {
    async getAll() {
        const [rows] = await db.query('SELECT * FROM patients ORDER BY created_at DESC');
        return rows;
    },

    async getById(id) {
        const [rows] = await db.query('SELECT * FROM patients WHERE id = ?', [id]);
        return rows[0] || null;
    },

    async create({ name, date, address }) {
        const [result] = await db.query(
            'INSERT INTO patients (name, date, address, created_at) VALUES (?, ?, ?, NOW())',
            [name, date, address]
        );
        return {
            id: result.insertId,
            name,
            date,
            address
        };
    },

    async update(id, { name, date, address }) {
        const [result] = await db.query(
            'UPDATE patients SET name = ?, date = ?, address = ? WHERE id = ?',
            [name, date, address, id]
        );
        return result.affectedRows > 0;
    },

    async delete(id) {
        const [result] = await db.query('DELETE FROM patients WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
};

module.exports = Patient;
