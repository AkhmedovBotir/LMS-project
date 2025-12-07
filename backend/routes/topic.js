const express = require('express');
const router = express.Router();
const TopicController = require('../controllers/TopicController');
const authMiddleware = require('../middleware/auth');
const checkPayment = require('../middleware/checkPayment');

// All routes require authentication
router.use(authMiddleware);

// Middleware to check if user is not a student
const checkNotStudent = (req, res, next) => {
  if (req.user.role === 'student') {
    return res.status(403).json({
      success: false,
      message: 'Bu amalni bajarish uchun huquq yetarli emas'
    });
  }
  next();
};

// Create new topic (non-students only)
router.post('/', checkNotStudent, TopicController.create);

// Get topics by course (requires payment check for students)
router.get('/course/:course_id', checkPayment, TopicController.getByCourse);

// Update topic (non-students only)
router.put('/:id', checkNotStudent, TopicController.update);

// Delete topic (non-students only)
router.delete('/:id', checkNotStudent, TopicController.delete);

// Reorder topics (non-students only)
router.post('/reorder', checkNotStudent, TopicController.reorder);

module.exports = router; 