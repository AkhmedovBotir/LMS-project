const express = require('express');
const router = express.Router();
const {
  // Written questions
  getAllWrittenQuestions,
  getWrittenQuestionById,
  createWrittenQuestion,
  updateWrittenQuestion,
  deleteWrittenQuestion,

  // Test questions
  getAllTestQuestions,
  getTestQuestionById,
  createTestQuestion,
  updateTestQuestion,
  deleteTestQuestion,

  // Terms
  getAllTerms,
  getTermById,
  createTerm,
  updateTerm,
  deleteTerm
} = require('../controllers/QuestionController');
const authMiddleware = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(authMiddleware);


// Written Questions Routes
router.get('/written', getAllWrittenQuestions);
router.get('/written/:id', getWrittenQuestionById);
router.post('/written', createWrittenQuestion);
router.put('/written/:id', updateWrittenQuestion);
router.delete('/written/:id', deleteWrittenQuestion);

// Test Questions Routes
router.get('/test', getAllTestQuestions);
router.get('/test/:id', getTestQuestionById);
router.post('/test',  createTestQuestion);
router.put('/test/:id', updateTestQuestion);
router.delete('/test/:id', deleteTestQuestion);

// Terms Routes
router.get('/terms', getAllTerms);
router.get('/terms/:id', getTermById);
router.post('/terms', createTerm);
router.put('/terms/:id', updateTerm);
router.delete('/terms/:id', deleteTerm);

module.exports = router; 