const router = require('express').Router();
const AttendanceController = require('../controllers/AttendanceController');
const auth = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(auth);

// Get all attendance records with pagination and filters
router.get('/', AttendanceController.getAllAttendance);

// Get single attendance record
router.get('/:id', AttendanceController.getAttendanceById);

// Create new attendance record
router.post('/', AttendanceController.createAttendance);

// Update attendance record
router.put('/:id', AttendanceController.updateAttendance);

// Delete attendance record
router.delete('/:id', AttendanceController.deleteAttendance);

// Get employee attendance history
router.get('/employee/:employee_id', AttendanceController.getEmployeeAttendance);

module.exports = router; 