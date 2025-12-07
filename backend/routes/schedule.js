const express = require('express');
const router = express.Router();
const { 
  getAllSchedules,
  getScheduleById,
  createSchedule,
  updateSchedule,
  deleteSchedule
} = require('../controllers/ScheduleController');
const authMiddleware = require('../middleware/auth');
const checkPayment = require('../middleware/checkPayment');

// All routes require authentication
router.use(authMiddleware);

// Get all schedules
router.get('/', getAllSchedules);

// Get schedule by ID
router.get('/:id', getScheduleById);

// Create new schedule
router.post('/', createSchedule);

// Update schedule
router.put('/:id', updateSchedule);

// Delete schedule
router.delete('/:id', deleteSchedule);

module.exports = router; 