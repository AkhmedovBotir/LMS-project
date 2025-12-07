const express = require('express');
const router = express.Router();
const GroupStudentController = require('../controllers/GroupStudentController');
const authMiddleware = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get all group-student records with filters
router.get('/', GroupStudentController.getAll);

// Create new group-student record
router.post('/', GroupStudentController.create);

// Get group-student by ID
router.get('/:id', GroupStudentController.getById);

// Update group-student record
router.patch('/:id', GroupStudentController.update);

// Delete group-student record
router.delete('/:id', GroupStudentController.delete);

// Get student's groups
router.get('/student/:student_id', GroupStudentController.getStudentGroups);

// Get group's students
router.get('/group/:group_id', GroupStudentController.getGroupStudents);

module.exports = router; 