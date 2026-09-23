const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');

// Appointment Routes
router.get('/', appointmentController.getAll);
router.post('/', appointmentController.create);
router.get('/:id', appointmentController.getById);
router.put('/:id', appointmentController.update);
router.delete('/:id', appointmentController.delete);

module.exports = router;
