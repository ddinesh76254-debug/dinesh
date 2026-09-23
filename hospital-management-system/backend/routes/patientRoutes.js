const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');

// Patient Routes
router.get('/', patientController.getAll);
router.post('/', patientController.create);
router.get('/:id', patientController.getById);
router.put('/:id', patientController.update);
router.delete('/:id', patientController.delete);

module.exports = router;
