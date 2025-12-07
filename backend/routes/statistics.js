const express = require('express');
const router = express.Router();
const StatisticsController = require('../controllers/StatisticsController');
const auth = require('../middleware/auth');

// Protect all routes
router.use(auth);

// Financial statistics and reports
router.get('/financial', StatisticsController.getFinancialStats);
router.get('/payments', StatisticsController.getPaymentReport);
router.get('/salaries', StatisticsController.getSalaryReport);

module.exports = router; 