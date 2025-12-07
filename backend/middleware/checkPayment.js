const { Payment } = require('../models');

const checkPayment = async (req, res, next) => {
  try {
    // Skip payment check for non-student roles
    if (req.user.role !== 'student') {
      return next();
    }

    const student_id = req.user.id;
    const { course_id } = req.params;

    if (!course_id) {
      return res.status(400).json({
        success: false,
        message: 'Kurs ID si ko\'rsatilmagan'
      });
    }

    // Get all completed payments for this student and course
    const payments = await Payment.find({
      student_id,
      course_id,
      status: 'completed'
    }).sort({ payment_date: -1 });

    // Get latest payment
    const latestPayment = payments[0];
    
    if (!latestPayment) {
      return res.status(403).json({
        success: false,
        message: 'Kursni ko\'rish uchun to\'lov qilish kerak'
      });
    }

    // Calculate next payment due date based on latest payment
    const paymentDate = new Date(latestPayment.payment_date);
    let nextPaymentDue = new Date(paymentDate);

    switch (latestPayment.payment_period) {
      case 'trial':
        nextPaymentDue.setDate(paymentDate.getDate() + 1);
        break;
      case 'monthly':
        nextPaymentDue.setMonth(paymentDate.getMonth() + 1);
        break;
      case 'quarterly':
        nextPaymentDue.setMonth(paymentDate.getMonth() + 3);
        break;
      case 'full_course':
        nextPaymentDue.setFullYear(paymentDate.getFullYear() + 1);
        break;
    }

    // Check if payment is still valid
    const now = new Date();
    if (now > nextPaymentDue) {
      return res.status(403).json({
        success: false,
        message: 'To\'lov muddati tugagan. Yangi to\'lov qilish kerak'
      });
    }

    next();
  } catch (error) {
    console.error('Error checking payment status:', error);
    res.status(500).json({
      success: false,
      message: 'To\'lov holatini tekshirishda xatolik yuz berdi'
    });
  }
};

module.exports = checkPayment; 