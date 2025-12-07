const express = require('express');
const router = express.Router();
const AttendanceStudentController = require('../controllers/AttendanceStudentController');
const authMiddleware = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Teacher specific routes - these should come first
router.get('/teacher/my-students', authMiddleware, AttendanceStudentController.getTeacherStudentsAttendance);
router.get('/teacher/group/:group_id/attendance', authMiddleware, AttendanceStudentController.getGroupAttendance);
router.post('/teacher/group/:group_id/attendance', authMiddleware, AttendanceStudentController.createGroupAttendance);

// Get all student attendance records with pagination and filters
router.get('/', AttendanceStudentController.getAllAttendance);

// Get single student attendance record
router.get('/:id', AttendanceStudentController.getAttendanceById);

// Create new student attendance record
router.post('/', AttendanceStudentController.createAttendance);

// Update student attendance record
router.put('/:id', AttendanceStudentController.updateAttendance);

// Delete student attendance record
router.delete('/:id', AttendanceStudentController.deleteAttendance);

// Get student attendance history
router.get('/student/:student_id', AttendanceStudentController.getStudentAttendance);

// Get group attendance for a specific date
router.get('/group/:group_id', AttendanceStudentController.getGroupAttendance);

// Get student attendance summary
router.get('/student/:student_id/summary', checkRole('admin', 'teacher', 'student'), AttendanceStudentController.getStudentSummary);

module.exports = router; 