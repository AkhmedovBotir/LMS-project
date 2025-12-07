const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/PaymentController');
const auth = require('../middleware/auth');

// Create payment (supports split/multi-method payments, group, and flexible period)
router.post('/', auth, async (req, res) => {
    console.log('--- [ROUTE] /payments POST called');
    await PaymentController.create(req, res);
});

// Get all payments
router.get('/', auth, async (req, res) => {
    await PaymentController.getAll(req, res);
});

// Get payment by ID
router.get('/:id', auth, async (req, res) => {
    await PaymentController.getById(req, res);
});

// Get student payments
router.get('/student/:studentId', auth, async (req, res) => {
    await PaymentController.getStudentPayments(req, res);
});

// Get course payments
router.get('/course/:courseId', auth, async (req, res) => {
    await PaymentController.getCoursePayments(req, res);
});

// Get course payment statistics
router.get('/course/:courseId/stats', auth, async (req, res) => {
    await PaymentController.getCoursePaymentStats(req, res);
});

// Check payment status
router.get('/check/:studentId/:courseId', auth, async (req, res) => {
    await PaymentController.checkPaymentStatus(req, res);
});

// Check payment status
router.post('/check-status/:studentId/:courseId', auth, async (req, res) => {
    await PaymentController.checkPaymentStatus(req, res);
});

// Cancel payment
router.put('/:id/cancel', auth, async (req, res) => {
    await PaymentController.cancelPayment(req, res);
});

// Pay remaining for a course
router.post('/pay-remaining', auth, async (req, res) => {
    await PaymentController.payRemaining(req, res);
});

module.exports = router; 