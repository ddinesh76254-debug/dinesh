const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const patientRoutes = require('./routes/patientRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const adminController = require('./controllers/adminController');

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'UP', message: 'Hospital Management System API is healthy' });
});

// Departments endpoint alias
app.get('/api/departments', adminController.getDepartments);

// Main REST Routes
app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/admin', adminRoutes);

// 404 Route Handler
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'API route not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Unhandled server error:', err.stack);
    res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
});

app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(` Hospital Management System Backend running on:`);
    console.log(` http://localhost:${PORT}`);
    console.log(`===============================================`);
});

module.exports = app;
