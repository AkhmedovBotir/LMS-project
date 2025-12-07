const express = require('express');
const router = express.Router();
const ContactController = require('../controllers/ContactController');
const auth = require('../middleware/auth');

// Get students with issues
router.get('/students-with-issues', auth, ContactController.getStudentsWithIssues);

// Create contact record
router.post('/', auth, ContactController.createContact);

// Update contact status
router.put('/:contact_id/status', auth, ContactController.updateContactStatus);

// Get contact history
router.get('/history', auth, ContactController.getContactHistory);

module.exports = router;
