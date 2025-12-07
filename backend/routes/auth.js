const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const auth = require('../middleware/auth');

// Login route
router.post('/login', AuthController.login);

// Admin routes
router.get('/user-types', auth, AuthController.getUserTypes);
router.get('/admins', auth, AuthController.getAllAdmins);
router.get('/admins/:id', auth, AuthController.getAdmin);
router.post('/admins', auth, AuthController.createAdmin);
router.put('/admins/:id', auth, AuthController.updateAdmin);
router.delete('/admins/:id', auth, AuthController.deleteAdmin);
router.patch('/admins/:id/status', auth, AuthController.updateAdminStatus);

// Change password route
router.put('/admin/:id/change-password', auth, AuthController.changePassword);

module.exports = router; 