const express = require('express');
const router = express.Router();
const DashboardController = require('../controllers/DashboardController');
const auth  = require('../middleware/auth');

// Get all dashboard statistics
router.get('/stats', auth, DashboardController.getDashboardStats);

// Get financial statistics
router.get('/financial', auth, DashboardController.getFinancialStats);

// Get payment statistics
router.get('/payments', auth, DashboardController.getPaymentStats);

// Get salary statistics
router.get('/salaries', auth, DashboardController.getSalaryStats);

// Get group statistics
router.get('/groups', auth, DashboardController.getGroupStats);

// Get marketing statistics
router.get('/marketing', auth, DashboardController.getMarketingStats);

// Get transaction statistics
router.get('/transactions', auth, DashboardController.getTransactionStats);

// Get attendance statistics
router.get('/attendance', auth, DashboardController.getAttendanceStats);

// Get student statistics
router.get('/students', auth, DashboardController.getStudentStats);

// Get course statistics
router.get('/courses', auth, DashboardController.getCourseStats);

// Get teacher statistics
router.get('/teachers', auth, DashboardController.getTeacherStats);

module.exports = router; 