const express = require('express');
const router = express.Router();
const StudentController = require('../controllers/StudentController');
const authMiddleware = require('../middleware/auth');

// Public routes
router.post('/login', StudentController.login);

// Protected routes - apply auth middleware
router.use(authMiddleware);

// Get all students with filters and pagination
router.get('/', StudentController.getAll);

// Create new student
router.post('/', StudentController.create);

// Get student by ID with payment info
router.get('/:id', StudentController.getById);

// Update student
router.patch('/:id', StudentController.update);

// Delete student
router.delete('/:id', StudentController.delete);

// Get student courses with payment status
router.get('/:id/courses', StudentController.getStudentCourses);

// Update student payment status
router.patch('/:id/payment-status', StudentController.updatePaymentStatus);

// Get students with expired payments
router.get('/expired-payments', StudentController.getExpiredPayments);

// Get student profile
router.get('/profile', StudentController.getProfile);

// Update student profile
router.put('/profile', StudentController.updateProfile);

module.exports = router; 