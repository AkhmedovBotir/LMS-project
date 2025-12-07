const express = require('express');
const router = express.Router();
const StatisticsDepartmentController = require('../controllers/StatisticsDepartmentController');
const auth = require('../middleware/auth');

// Get detailed attendance statistics
// Query parameters:
// - period: daily, weekly, monthly, yearly (default: monthly)
// - customDate: specific date to get statistics for (format: YYYY-MM-DD)
router.get('/attendance', auth, StatisticsDepartmentController.getAttendanceStats);

// Get detailed payment statistics
// Query parameters:
// - period: daily, weekly, monthly, yearly (default: monthly)
// - customDate: specific date to get statistics for (format: YYYY-MM-DD)
// - group_id: filter by specific group
// - course_id: filter by specific course
router.get('/payments', auth, StatisticsDepartmentController.getPaymentStats);

// Get reception conversion statistics
// Query parameters:
// - period: daily, weekly, monthly, yearly (default: monthly)
// - customDate: specific date to get statistics for (format: YYYY-MM-DD)
// - course_id: filter by specific course
router.get('/reception', auth, StatisticsDepartmentController.getReceptionStats);

module.exports = router;

