const express = require('express');
const router = express.Router();
const { getAllCourses, getCourseById, createCourse, updateCourse, deleteCourse, updateCourseStatus } = require('../controllers/CourseController');
const auth = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(auth);

// Get all courses with pagination and filters
router.get('/', getAllCourses);

// Get single course by ID
router.get('/:id', getCourseById);

// Create new course
router.post('/', createCourse);

// Update course
router.put('/:id', updateCourse);

// Delete course
router.delete('/:id', deleteCourse);

// Update course status
router.patch('/:id/status', updateCourseStatus);


module.exports = router; 