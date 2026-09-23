const bcrypt = require('bcryptjs');
const db = require('../config/database');
const Appointment = require('../models/appointmentModel');
const Department = require('../models/departmentModel');

const adminController = {
    // POST /api/admin/login
    async login(req, res) {
        try {
            const { username, password } = req.body;

            if (!username || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Username and password are required'
                });
            }

            const [rows] = await db.query('SELECT * FROM admins WHERE username = ?', [username.trim()]);
            const admin = rows[0];

            if (!admin) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid username or password'
                });
            }

            const isMatch = await bcrypt.compare(password, admin.password);
            if (!isMatch) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid username or password'
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Login successful',
                admin: {
                    id: admin.id,
                    username: admin.username
                },
                token: 'mock-jwt-token-' + Date.now() // Token for frontend session
            });
        } catch (error) {
            console.error('Error during admin login:', error);
            return res.status(500).json({ success: false, message: 'Server error during login' });
        }
    },

    // GET /api/admin/stats
    async getStats(req, res) {
        try {
            const stats = await Appointment.getStats();
            return res.status(200).json({
                success: true,
                data: stats
            });
        } catch (error) {
            console.error('Error fetching admin stats:', error);
            return res.status(500).json({ success: false, message: 'Server error while fetching stats' });
        }
    },

    // GET /api/departments
    async getDepartments(req, res) {
        try {
            const departments = await Department.getAll();
            return res.status(200).json({
                success: true,
                count: departments.length,
                data: departments
            });
        } catch (error) {
            console.error('Error fetching departments:', error);
            return res.status(500).json({ success: false, message: 'Server error while fetching departments' });
        }
    }
};

module.exports = adminController;
