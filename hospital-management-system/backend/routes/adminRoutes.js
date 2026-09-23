const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Admin and Department Routes
router.post('/login', adminController.login);
router.get('/stats', adminController.getStats);
router.get('/departments', adminController.getDepartments);

module.exports = router;
