const express = require('express');
const router = express.Router();
const studentController = require('../controllers/StudentController');
const authMiddleware = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Create a new student
router.post('/', studentController.create);

// Get all students with pagination and filtering
router.get('/', studentController.getAll);

// Get student by ID
router.get('/:id', studentController.getById);

// Update student
router.patch('/:id', studentController.update);

// Delete student
router.delete('/:id', studentController.delete);

// Update student status
router.patch('/:id/status', studentController.updateStatus);

// Update payment status
router.patch('/:id/payment-status', studentController.updatePaymentStatus);


module.exports = router; 