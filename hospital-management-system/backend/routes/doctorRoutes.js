const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');

// Doctors by department (must come before /:id)
router.get('/department/:department', doctorController.getByDepartment);

// General doctor routes
router.get('/', doctorController.getAll);
router.post('/', doctorController.create);
router.get('/:id', doctorController.getById);
router.put('/:id', doctorController.update);
router.delete('/:id', doctorController.delete);

module.exports = router;
