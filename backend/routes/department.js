const express = require('express');
const router = express.Router();
const { getAllDepartments, getDepartmentById, createDepartment, updateDepartment, deleteDepartment, updateStatus } = require('../controllers/departmentController');
const auth = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(auth);

// Get all departments with pagination and filters
router.get('/', getAllDepartments);

// Get single department by ID
router.get('/:id', getDepartmentById);

// Create new department
router.post('/', createDepartment);

// Update department
router.put('/:id', updateDepartment);

// Delete department
router.delete('/:id', deleteDepartment);

// Update department status
router.patch('/:id/status', updateStatus);

module.exports = router; 