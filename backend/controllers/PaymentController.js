const mongoose = require('mongoose');
const { Payment, Student, Group } = require('../models');
const Course = require('../models/Course');

class PaymentController {
  // Get all payments
  static async getAll(req, res) {
    try {
      const { page = 1, limit = 10, student_id, course_id, status, start_date, end_date } = req.query;

      // Build query
      const query = {};
      if (student_id) query.student_id = student_id;
      if (course_id) query.course_id = course_id;
      if (status) query.status = status;
      if (start_date || end_date) {
        query.payment_date = {};
        if (start_date) query.payment_date.$gte = new Date(start_date);
        if (end_date) query.payment_date.$lte = new Date(end_date);
      }

      // Get payments with pagination
      const payments = await Payment.find(query)
        .populate('student_id', 'first_name last_name')
        .populate('course_id', 'name')
        .sort({ payment_date: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

      // Get total count
      const total = await Payment.countDocuments(query);

      res.json({
        success: true,
        data: payments,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          total_pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Error getting payments:', error);
      res.status(500).json({
        success: false,
        message: 'To\'lov ma\'lumotlarini olishda xatolik yuz berdi'
      });
    }
  }

  // Get payment by ID
  static async getById(req, res) {
    try {
      const payment = await Payment.findById(req.params.id);
      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'To\'lov topilmadi'
        });
      }

      res.json({
        success: true,
        data: payment
      });
    } catch (error) {
    }
  }

  // Create new payment
  static async create(req, res) {
    try {
      console.log('--- [PAYMENT CREATE] Incoming body:', req.body);
      const {
        student_id,
        course_id,
        group_id,
        amount,
        payment_date,
        payment_type,
        months_count,
        start_date,
        notes,
        amounts, // new field for multiple payment types
        period_type // new field for period type
      } = req.body;

      // Log all IDs
      console.log('[PAYMENT CREATE] student_id:', student_id);
      console.log('[PAYMENT CREATE] course_id:', course_id);
      console.log('[PAYMENT CREATE] group_id:', group_id);

      // Validate required fields
      if (!student_id || !course_id || (!amounts && !amount) || !payment_date || !months_count || !start_date) {
        console.error('[PAYMENT CREATE] Validation failed: missing required fields', req.body);
        return res.status(400).json({
          success: false,
          message: "O'quvchi, kurs, to'lov miqdori, sana, oylar soni va boshlash sanasi kiritilishi shart"
        });
      }

      // Validate ObjectId format
      if (!mongoose.Types.ObjectId.isValid(student_id) || !mongoose.Types.ObjectId.isValid(course_id)) {
        console.error('[PAYMENT CREATE] Validation failed: invalid student_id or course_id', { student_id, course_id });
        return res.status(400).json({
          success: false,
          message: "Noto'g'ri ID format"
        });
      }
      if (group_id && !mongoose.Types.ObjectId.isValid(group_id)) {
        console.error('[PAYMENT CREATE] Validation failed: invalid group_id', { group_id });
        return res.status(400).json({
          success: false,
          message: "Noto'g'ri guruh ID format"
        });
      }

      // Check if student exists
      const student = await Student.findById(student_id);
      console.log('[PAYMENT CREATE] Student lookup result:', student);
      if (!student) {
        console.error('[PAYMENT CREATE] Student not found:', student_id);
        return res.status(404).json({
          success: false,
          message: "O'quvchi topilmadi"
        });
      }

      // Check if course exists
      const course = await Course.findById(course_id);
      console.log('[PAYMENT CREATE] Course lookup result:', course);
      if (!course) {
        console.error('[PAYMENT CREATE] Course not found:', course_id);
        return res.status(404).json({
          success: false,
          message: "Kurs topilmadi"
        });
      }

      // Check if group exists (if provided)
      let group = null;
      if (group_id) {
        group = await Group.findById(group_id);
        console.log('[PAYMENT CREATE] Group lookup result:', group);
        if (!group) {
          console.error('[PAYMENT CREATE] Group not found:', group_id);
          return res.status(404).json({
            success: false,
            message: "Guruh topilmadi"
          });
        }
      }

      // Calculate end date based on start date and months count
      const startDate = new Date(start_date);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + months_count - 1);
      endDate.setDate(endDate.getDate() + 29); // Set to last day of the last month

      // Prepare amounts object
      let paymentAmounts = amounts;
      if (!paymentAmounts && amount && payment_type) {
        paymentAmounts = { cash: 0, card: 0, transfer: 0 };
        if (payment_type === 'cash') paymentAmounts.cash = amount;
        else if (payment_type === 'card') paymentAmounts.card = amount;
        else if (payment_type === 'transfer') paymentAmounts.transfer = amount;
      }
      if (!paymentAmounts) {
        console.error('[PAYMENT CREATE] Validation failed: invalid amounts', { amounts, amount, payment_type });
        return res.status(400).json({
          success: false,
          message: "To'lov summasi va turi noto'g'ri kiritilgan"
        });
      }

      // Log the payment object before saving
      const paymentObj = {
        student_id,
        course_id,
        group_id: group_id || undefined,
        amounts: paymentAmounts,
        payment_date: new Date(payment_date),
        status: 'completed',
        payment_period: {
          start_date: startDate,
          end_date: endDate,
          months_count
        },
        period_type: period_type || 'monthly',
        notes: notes || ''
      };
      console.log('[PAYMENT CREATE] Payment object to be saved:', paymentObj);

      // Create payment
      const payment = await Payment.create(paymentObj);

      console.log('[PAYMENT CREATE] Payment created successfully:', payment._id);
      res.status(201).json({
        success: true,
        message: "To'lov muvaffaqiyatli qo'shildi",
        data: payment
      });
    } catch (error) {
      console.error('[PAYMENT CREATE] Error (full object):', error);
      res.status(500).json({
        success: false,
        message: "To'lov qo'sishda xatolik yuz berdi",
        error: error.message
      });
    }
  }

  // Update payment status
  static async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      // Validate status
      if (!['pending', 'completed', 'cancelled'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Noto\'g\'ri to\'lov holati'
        });
      }

      // Update payment
      const payment = await Payment.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      );

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'To\'lov topilmadi'
        });
      }

      res.json({
        success: true,
        data: payment
      });
    } catch (error) {
      console.error('Error updating payment status:', error);
      res.status(500).json({
        success: false,
        message: 'To\'lov holatini yangilashda xatolik yuz berdi'
      });
    }
  }

  // Check student payment status
  static async checkStudentPaymentStatus(req, res) {
    try {
      const { student_id } = req.params;

      const student = await Student.findById(student_id);
      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'O\'quvchi topilmadi'
        });
      }

      // Get student's latest payment
      const latestPayment = await Payment.findOne({ student_id })
        .sort({ payment_date: -1 })
        .populate('course_id', 'name price');

      const response = {
        student: {
          id: student._id,
          first_name: student.first_name,
          last_name: student.last_name,
          payment_status: student.payment_status,
          next_payment_due: student.next_payment_due,
          last_payment_date: student.last_payment_date
        },
        latest_payment: latestPayment ? {
          id: latestPayment._id,
          amount: latestPayment.amount,
          payment_type: latestPayment.payment_type,
          payment_period: latestPayment.payment_period,
          payment_date: latestPayment.payment_date,
          status: latestPayment.status,
          course: latestPayment.course_id
        } : null
      };

      res.json({
        success: true,
        data: response
      });
    } catch (error) {
      console.error('Error checking student payment status:', error);
      res.status(500).json({
        success: false,
        message: 'O\'quvchi to\'lov statusini tekshirishda xatolik yuz berdi'
      });
    }
  }

  // Get student payment history
  static async getStudentPaymentHistory(req, res) {
    try {
      const { student_id } = req.params;
      const { course_id, start_date, end_date } = req.query;

      // Build query
      const query = { student_id };
      if (course_id) query.course_id = course_id;
      if (start_date || end_date) {
        query.payment_date = {};
        if (start_date) query.payment_date.$gte = new Date(start_date);
        if (end_date) query.payment_date.$lte = new Date(end_date);
      }

      // Get payments
      const payments = await Payment.find(query)
        .populate('course_id', 'name')
        .sort({ payment_date: -1 });

      res.json({
        success: true,
        data: payments
      });
    } catch (error) {
      console.error('Error getting student payment history:', error);
      res.status(500).json({
        success: false,
        message: 'O\'quvchi to\'lov tarixini olishda xatolik yuz berdi'
      });
    }
  }

  // Get course payment statistics
  static async getCoursePaymentStats(req, res) {
    try {
      const { course_id } = req.params;
      const { start_date, end_date } = req.query;

      // Build query
      const query = { course_id };
      if (start_date || end_date) {
        query.payment_date = {};
        if (start_date) query.payment_date.$gte = new Date(start_date);
        if (end_date) query.payment_date.$lte = new Date(end_date);
      }

      // Get payments
      const payments = await Payment.find(query);

      // Calculate statistics
      const stats = {
        total_payments: payments.reduce((sum, p) => sum + p.amount, 0),
        total_students: new Set(payments.map(p => p.student_id.toString())).size,
        payment_types: {
          cash: payments.filter(p => p.payment_type === 'cash').reduce((sum, p) => sum + p.amount, 0),
          card: payments.filter(p => p.payment_type === 'card').reduce((sum, p) => sum + p.amount, 0),
          transfer: payments.filter(p => p.payment_type === 'transfer').reduce((sum, p) => sum + p.amount, 0)
        },
        status_distribution: {
          pending: payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0),
          completed: payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0),
          cancelled: payments.filter(p => p.status === 'cancelled').reduce((sum, p) => sum + p.amount, 0)
        }
      };

      stats.average_payment = stats.total_payments / stats.total_students;

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error getting course payment statistics:', error);
      res.status(500).json({
        success: false,
        message: 'Kurs to\'lov statistikasini olishda xatolik yuz berdi'
      });
    }
  }

  // Get all payments with pagination and filters
  static async getAllPayments(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const query = {};
      if (req.query.student_id) query.student_id = req.query.student_id;
      if (req.query.course_id) query.course_id = req.query.course_id;
      if (req.query.status) query.status = req.query.status;
      if (req.query.payment_type) query.payment_type = req.query.payment_type;
      if (req.query.start_date && req.query.end_date) {
        query.payment_date = {
          $gte: new Date(req.query.start_date),
          $lte: new Date(req.query.end_date)
        };
      }

      const payments = await Payment.find(query)
        .populate('student_id', 'first_name last_name')
        .populate('course_id', 'name')
        .skip(skip)
        .limit(limit)
        .sort({ payment_date: -1 });

      const total = await Payment.countDocuments(query);

      res.json({
        success: true,
        data: payments,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Xatolik yuz berdi',
        error: error.message
      });
    }
  }

  // Get payment by ID
  static async getPaymentById(req, res) {
    try {
      const payment = await Payment.findById(req.params.id)
        .populate('student_id', 'first_name last_name')
        .populate('course_id', 'name');

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'To\'lov topilmadi'
        });
      }

      res.json({
        success: true,
        data: payment
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Xatolik yuz berdi',
        error: error.message
      });
    }
  }

  // Create new payment
  static async createPayment(req, res) {
    try {
      const { student_id, group_id, amount, payment_type, notes } = req.body;

      // Check if student exists
      const student = await Student.findById(student_id);
      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'O\'quvchi topilmadi'
        });
      }

      // Check if group exists
      const group = await Group.findById(group_id);
      if (!group) {
        return res.status(404).json({
          success: false,
          message: 'Guruh topilmadi'
        });
      }

      const payment = await Payment.create({
        student_id,
        group_id,
        amount,
        payment_type,
        payment_date: new Date(),
        notes
      });

      res.status(201).json({
        success: true,
        message: 'To\'lov muvaffaqiyatli yaratildi',
        data: payment
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Xatolik yuz berdi',
        error: error.message
      });
    }
  }

  // Update payment
  static async updatePayment(req, res) {
    try {
      const { amount, payment_type, status, notes, amounts, group_id, period_type } = req.body;

      const payment = await Payment.findById(req.params.id);
      if (!payment) {
        return res.status(404).json({
          success: false,
          message: "To'lov topilmadi"
        });
      }

      // Prepare amounts object for update
      let paymentAmounts = amounts;
      if (!paymentAmounts && amount && payment_type) {
        paymentAmounts = { cash: 0, card: 0, transfer: 0 };
        if (payment_type === 'cash') paymentAmounts.cash = amount;
        else if (payment_type === 'card') paymentAmounts.card = amount;
        else if (payment_type === 'transfer') paymentAmounts.transfer = amount;
      }

      // Build update object
      const updateObj = { status, notes };
      if (paymentAmounts) {
        updateObj.amounts = paymentAmounts;
      }
      if (group_id) {
        updateObj.group_id = group_id;
      }
      if (period_type) {
        updateObj.period_type = period_type;
      }

      const updatedPayment = await Payment.findByIdAndUpdate(
        req.params.id,
        updateObj,
        { new: true, runValidators: true }
      );

      res.json({
        success: true,
        message: "To'lov muvaffaqiyatli yangilandi",
        data: updatedPayment
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Xatolik yuz berdi',
        error: error.message
      });
    }
  }

  // Delete payment
  static async deletePayment(req, res) {
    try {
      const payment = await Payment.findById(req.params.id);
      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'To\'lov topilmadi'
        });
      }

      await payment.deleteOne();

      res.json({
        success: true,
        message: 'To\'lov muvaffaqiyatli o\'chirildi'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Xatolik yuz berdi',
        error: error.message
      });
    }
  }

  // Check student payment status for a group
  static async checkPaymentStatus(req, res) {
    try {
      // Support both snake_case and camelCase param names
      const student_id = req.params.student_id || req.params.studentId;
      const course_id = req.params.course_id || req.params.courseId;

      // Validate ObjectIds
      if (!mongoose.Types.ObjectId.isValid(student_id)) {
        return res.status(400).json({
          success: false,
          message: 'Noto\'g\'ri o\'quvchi ID formati'
        });
      }

      if (!mongoose.Types.ObjectId.isValid(course_id)) {
        return res.status(400).json({
          success: false,
          message: 'Noto\'g\'ri kurs ID formati'
        });
      }

      // Convert IDs to ObjectId
      const studentObjectId = new mongoose.Types.ObjectId(student_id);
      const courseObjectId = new mongoose.Types.ObjectId(course_id);

      // Check if student exists
      const student = await Student.findById(studentObjectId);
      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'O\'quvchi topilmadi'
        });
      }

      // Check if course exists
      const course = await Course.findById(courseObjectId);
      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Kurs topilmadi'
        });
      }

      // Get all payments for this student and course
      const payments = await Payment.find({
        student_id: studentObjectId,
        course_id: courseObjectId,
        status: 'completed'
      });

      // Calculate total paid amount (always use amounts fields)
      const totalPaid = payments.reduce((sum, payment) => {
        if (payment.amounts) {
          return sum + (payment.amounts.cash || 0) + (payment.amounts.card || 0) + (payment.amounts.transfer || 0);
        }
        return sum + (payment.amount || 0);
      }, 0);

      // Get course price from course model
      const coursePrice = course.price || 0;

      // Calculate payment status
      let paymentStatus = 'unpaid';
      if (totalPaid >= coursePrice) {
        paymentStatus = 'paid';
      } else if (totalPaid > 0) {
        paymentStatus = 'partial';
      }

      res.json({
        success: true,
        data: {
          student_id: studentObjectId,
          course_id: courseObjectId,
          total_paid: totalPaid,
          course_price: coursePrice,
          remaining_amount: Math.max(0, coursePrice - totalPaid),
          payment_status: paymentStatus,
          payments: payments
        }
      });
    } catch (error) {
      console.error('Error checking payment status:', error);
      res.status(500).json({
        success: false,
        message: 'To\'lov holatini tekshirishda xatolik yuz berdi'
      });
    }
  }

  // Cancel payment
  static async cancelPayment(req, res) {
    try {
      const { id } = req.params;

      // To'lovni topish
      const payment = await Payment.findById(id);
      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'To\'lov topilmadi'
        });
      }

      // To'lov allaqachon bekor qilinganligini tekshirish
      if (payment.status === 'cancelled') {
        return res.status(400).json({
          success: false,
          message: 'To\'lov allaqachon bekor qilingan'
        });
      }

      // To'lovni bekor qilish
      payment.status = 'cancelled';
      payment.cancelled_at = new Date();
      await payment.save();

      // O'quvchining to'lov holatini yangilash
      const student = await Student.findById(payment.student_id);
      if (student) {
        student.payment_status = 'unpaid';
        await student.save();
      }

      res.json({
        success: true,
        message: 'To\'lov muvaffaqiyatli bekor qilindi',
        data: payment
      });
    } catch (error) {
      console.error('To\'lovni bekor qilishda xatolik:', error);
      res.status(500).json({
        success: false,
        message: 'To\'lovni bekor qilishda xatolik yuz berdi'
      });
    }
  }

  // Pay remaining amount for a course
  static async payRemaining(req, res) {
    try {
      const { student_id, course_id, amounts, amount, payment_type, payment_date, notes } = req.body;

      // Validate required fields
      if (!student_id || !course_id || (!amounts && !amount)) {
        return res.status(400).json({
          success: false,
          message: "O'quvchi, kurs va to'lov miqdori kiritilishi shart"
        });
      }

      // Student va kursni tekshirish
      const student = await Student.findById(student_id);
      if (!student) {
        return res.status(404).json({ success: false, message: "O'quvchi topilmadi" });
      }
      const course = await Course.findById(course_id);
      if (!course) {
        return res.status(404).json({ success: false, message: "Kurs topilmadi" });
      }

      // Studentning shu kurs bo'yicha jami to'lagan summasini hisoblash
      const payments = await Payment.find({ student_id, course_id, status: 'completed' });
      const totalPaid = payments.reduce((sum, p) => {
        if (p.amounts) {
          return sum + (p.amounts.cash || 0) + (p.amounts.card || 0) + (p.amounts.transfer || 0);
        }
        return sum + (p.amount || 0);
      }, 0);

      const coursePrice = course.price || 0;
      const remaining = Math.max(0, coursePrice - totalPaid);

      // Yangi to'lov summasini aniqlash
      let payAmount = 0;
      let payAmounts = amounts;
      if (!payAmounts && amount && payment_type) {
        payAmounts = { cash: 0, card: 0, transfer: 0 };
        if (payment_type === 'cash') payAmounts.cash = amount;
        else if (payment_type === 'card') payAmounts.card = amount;
        else if (payment_type === 'transfer') payAmounts.transfer = amount;
      }
      if (payAmounts) {
        payAmount = (payAmounts.cash || 0) + (payAmounts.card || 0) + (payAmounts.transfer || 0);
      }

      if (payAmount > remaining) {
        return res.status(400).json({
          success: false,
          message: `Qolgan to'lovdan ko'p miqdor kiritildi. Qolgan: ${remaining}`
        });
      }
      if (payAmount <= 0) {
        return res.status(400).json({
          success: false,
          message: "To'lov miqdori 0 dan katta bo'lishi kerak"
        });
      }

      // To'lovni yaratish
      const payment = await Payment.create({
        student_id,
        course_id,
        amounts: payAmounts,
        payment_date: payment_date ? new Date(payment_date) : new Date(),
        status: 'completed',
        notes: notes || ''
      });

      res.status(201).json({
        success: true,
        message: "Qolgan to'lov muvaffaqiyatli amalga oshirildi",
        data: payment,
        remaining_after: remaining - payAmount
      });
    } catch (error) {
      console.error('Error paying remaining:', error);
      res.status(500).json({
        success: false,
        message: "Qolgan to'lovni amalga oshirishda xatolik yuz berdi"
      });
    }
  }
}

module.exports = PaymentController; 