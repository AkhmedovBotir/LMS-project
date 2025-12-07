const express = require('express');
const router = express.Router();
const SalaryController = require('../controllers/SalaryController');
const auth = require('../middleware/auth');

// Protect all routes
router.use(auth);

// Salary Config routes
router.get('/config', SalaryController.getSalaryConfigs);
router.get('/config/:id', SalaryController.getSalaryConfigById);
router.post('/config', SalaryController.updateSalaryConfig);
router.put('/config/:id', SalaryController.editSalaryConfig);
router.delete('/config/:id', SalaryController.deleteSalaryConfig);

// Salary routes
router.get('/', SalaryController.getSalaries);
router.get('/:id', SalaryController.getSalaryById);
router.post('/calculate', SalaryController.calculateSalary);
router.post('/', SalaryController.createSalary);
router.patch('/:id/status', SalaryController.updateSalaryStatus);
router.delete('/:id', SalaryController.deleteSalary);

module.exports = router; 