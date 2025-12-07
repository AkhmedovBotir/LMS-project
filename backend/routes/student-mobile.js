const express = require('express');
const router = express.Router();
const StudentMobileController = require('../controllers/StudentMobileController');

// Student login
router.post('/login', StudentMobileController.login);

module.exports = router;
