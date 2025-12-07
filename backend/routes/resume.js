const express = require('express');
const router = express.Router();
const {
  getAllResumes,
  getResumeById,
  createResume,
  updateResume,
  deleteResume
} = require('../controllers/ResumeController');
const authMiddleware = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get all resumes
router.get('/', getAllResumes);

// Get resume by ID
router.get('/:id', getResumeById);

// Create new resume
router.post('/', createResume);

// Update resume
router.put('/:id', updateResume);

// Delete resume
router.delete('/:id', deleteResume);

module.exports = router; 