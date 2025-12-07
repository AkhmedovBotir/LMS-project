const express = require('express');
const router = express.Router();
const TransactionController = require('../controllers/TransactionController');
const auth = require('../middleware/auth');

// Protect all routes
router.use(auth);

// Create new transaction
router.post('/', TransactionController.create);

// Get all transactions with filters
router.get('/', TransactionController.getAll);

// Get transactions summary
router.get('/summary', TransactionController.getSummary);

// Get transaction by ID
router.get('/:id', TransactionController.getById);

// Update transaction
router.put('/:id', TransactionController.update);

// Cancel transaction
router.delete('/:id', TransactionController.delete);

module.exports = router; 