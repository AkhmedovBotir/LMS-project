const express = require('express');
const router = express.Router();
const EmployeeMobileController = require('../controllers/EmployeeMobileController');
const authMiddleware = require('../middleware/auth');

// Protected routes - require authentication
router.use(authMiddleware);


// Get instructor's courses
router.get('/my-courses', EmployeeMobileController.getInstructorCourses);

// Get teacher's groups
router.get('/my-groups', EmployeeMobileController.getTeacherGroups);

// Get teacher's students by group
router.get('/group/:group_id/students', EmployeeMobileController.getStudentsByGroup);

// Get all teacher's students
router.get('/my-students', EmployeeMobileController.getAllStudents);

// Grade routes
router.post('/grade-students', EmployeeMobileController.gradeStudents);
router.get('/grades', EmployeeMobileController.getGrades);
router.put('/grades', EmployeeMobileController.updateGrades);
router.delete('/grades', EmployeeMobileController.deleteGrades);
router.get('/grades/group/:group_id', EmployeeMobileController.getGradesByGroup);
router.get('/grades/student/:student_id', EmployeeMobileController.getGradesByStudent);

module.exports = router; 