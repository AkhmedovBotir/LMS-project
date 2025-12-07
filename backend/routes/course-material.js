const express = require('express');
const router = express.Router();
const CourseMaterialController = require('../controllers/CourseMaterialController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// Apply auth middleware
router.use(auth);

// Get materials by course
router.get('/course/:course_id', CourseMaterialController.getByCourse);

// Create new material
router.post('/', upload.single('file'), CourseMaterialController.create);

// Update material
router.put('/:id', upload.single('file'), CourseMaterialController.update);

// Delete material
router.delete('/:id', CourseMaterialController.delete);

module.exports = router;