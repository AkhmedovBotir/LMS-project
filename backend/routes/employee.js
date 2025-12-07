const express = require('express');
const router = express.Router();
const { getAllEmployees, getEmployeeById, createEmployee, updateEmployee, deleteEmployee, updateStatus, login } = require('../controllers/EmployeeController');
const auth = require('../middleware/auth');


// Get all employees with pagination and filters
router.get('/', auth, getAllEmployees);

// Get single employee by ID
router.get('/:id', auth, getEmployeeById);

// Create new employee
router.post('/', auth, createEmployee);

// Update employee
router.put('/:id', auth, updateEmployee);

// Delete employee
router.delete('/:id', auth, deleteEmployee);

// Update employee status
router.put('/:id/status', auth, updateStatus);

// login
router.post('/login', login);

module.exports = router; 