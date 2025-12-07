const express = require('express');
const router = express.Router();
const {
  getAllPositions,
  getPositionById,
  createPosition,
  updatePosition,
  deletePosition,
  updatePositionStatus
} = require('../controllers/PositionController');
const authMiddleware = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get all positions
router.get('/', getAllPositions);

// Get position by ID
router.get('/:id', getPositionById);

// Create new position
router.post('/', createPosition);

// Update position
router.put('/:id', updatePosition);

// Delete position
router.delete('/:id', deletePosition);

// Update position status
router.put('/:id/status', updatePositionStatus);

module.exports = router; 