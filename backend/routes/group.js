const express = require('express');
const router = express.Router();
const GroupController = require('../controllers/GroupController');
const authMiddleware = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get all groups with filters
router.get('/', GroupController.getAll);

// Create new group
router.post('/', GroupController.create);

// Get only active groups
router.get('/active', GroupController.getActiveGroups);

// Get only archived (completed) groups
router.get('/archived', GroupController.getArchivedGroups);

// Get group by ID
router.get('/:id', GroupController.getById);

// Update group
router.patch('/:id', GroupController.update);

// Delete group
router.delete('/:id', GroupController.delete);

// Add student to group
router.post('/add-student', GroupController.addStudent);

// Remove student from group
router.delete('/:group_id/students/:student_id', GroupController.removeStudent);

// Get group students
router.get('/:id/students', GroupController.getStudents);

// Move student to another group
router.post('/move-student', GroupController.moveStudentToAnotherGroup);

// Finish group
router.post('/:id/finish', GroupController.finishGroup);

module.exports = router; 