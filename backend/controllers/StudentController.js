const { Student, Course, Payment, Group, GroupStudent, Attendance } = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Create a new student
exports.create = async (req, res) => {
  try {
    const { 
      first_name, 
      last_name, 
      phone, 
      password, 
      birth_date, 
      address, 
      parent_name, 
      parent_phone, 
      gender, 
      status,
      payment_status,
      trial_lesson_date,
      created_at,
      joined_date
    } = req.body;

    // Validate required fields
    if (!first_name || !last_name || !phone || !gender || !trial_lesson_date || !created_at || !joined_date) {
      return res.status(400).json({ 
        success: false,
        message: 'Ism, familiya, telefon, jins, sinov darsi sanasi, yaratilgan sana va qo\'shilgan sana kiritilishi shart' 
      });
    }

    // Check if phone number already exists
    const existingStudent = await Student.findOne({ where: { phone } });
    if (existingStudent) {
      return res.status(400).json({ 
        success: false,
        message: 'Bu telefon raqam allaqachon ro\'yxatdan o\'tgan' 
      });
    }

    // Format dates
    const formattedTrialLessonDate = new Date(trial_lesson_date);
    const formattedBirthDate = birth_date ? new Date(birth_date) : null;
    const formattedCreatedAt = new Date(created_at);
    const formattedJoinedDate = new Date(joined_date);

    // Validate dates
    if (isNaN(formattedTrialLessonDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Noto\'g\'ri sinov darsi sana formati kiritilgan'
      });
    }

    if (isNaN(formattedCreatedAt.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Noto\'g\'ri yaratilgan sana formati kiritilgan'
      });
    }

    if (isNaN(formattedJoinedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Noto\'g\'ri qo\'shilgan sana formati kiritilgan'
      });
    }

    // Parolni hash qilish
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create student with optional parent information
    const student = await Student.create({
      first_name,
      last_name,
      phone,
      password: hashedPassword,
      birth_date: formattedBirthDate,
      address: address || null,
      parent_name: parent_name || null,
      parent_phone: parent_phone || null,
      gender,
      status: status || 'active',
      payment_status: payment_status || 'trial',
      trial_lesson_date: formattedTrialLessonDate,
      joined_date: formattedJoinedDate,
      created_at: formattedCreatedAt,
      updated_at: formattedCreatedAt
    });

    // Remove password from response
    const studentResponse = student.toJSON();
    delete studentResponse.password;

    res.status(201).json({
      success: true,
      message: 'Talaba muvaffaqiyatli yaratildi',
      data: studentResponse
    });
  } catch (error) {
    console.error('Error creating student:', error);
    res.status(500).json({ 
      success: false,
      message: 'Talaba yaratishda xatolik yuz berdi' 
    });
  }
};

// Get all students with pagination and filtering
exports.getAll = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      gender,
      payment_status
    } = req.query;

    // Build filter conditions
    const query = {};

    if (search) {
      query.$or = [
        { first_name: { $regex: search, $options: 'i' } },
        { last_name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { parent_phone: { $regex: search, $options: 'i' } }
      ];
    }

    if (status) query.status = status;
    if (gender) query.gender = gender;
    if (payment_status) query.payment_status = payment_status;

    // Calculate skip
    const skip = (page - 1) * limit;

    // Get students with pagination
    const [students, total] = await Promise.all([
      Student.find(query)
        .select('-password')
        .populate({
          path: 'group_students',
          match: { status: 'active' },
          populate: {
            path: 'group_id',
            select: 'name',
            populate: {
              path: 'course_id',
              select: 'name'
            }
          }
        })
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Student.countDocuments(query)
    ]);

    // Calculate total pages
    const total_pages = Math.ceil(total / limit);

    // Get next_payment_due for each student from their latest completed payment
    const studentsWithNextPayment = await Promise.all(students.map(async student => {
      // Find latest completed payment for this student
      const latestPayment = await Payment.findOne({
        student_id: student._id,
        status: 'completed'
      }).sort({ payment_date: -1 });

      let next_payment_due = null;
      if (latestPayment && latestPayment.payment_period && latestPayment.payment_period.end_date) {
        next_payment_due = latestPayment.payment_period.end_date;
      }

      const s = student.toObject ? student.toObject() : student;
      return {
        ...s,
        next_payment_due
      };
    }));

    res.json({
      success: true,
      data: studentsWithNextPayment,
      pagination: {
        total,
        page: parseInt(page),
        total_pages,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({
      success: false,
      message: 'O\'quvchilarni olishda xatolik yuz berdi'
    });
  }
};

// Get student by ID
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await Student.findById(id)
      .select('-password')
      .populate({
        path: 'group_students',
        populate: {
          path: 'group_id',
          populate: {
            path: 'course_id',
            select: 'id name'
          }
        }
    });

    if (!student) {
      return res.status(404).json({ 
        success: false,
        message: 'Talaba topilmadi' 
      });
    }

    // Get student's payments with course details
    const payments = await Payment.find({ student_id: id })
      .populate({
        path: 'course_id',
        select: 'id name'
      })
      .sort({ payment_date: -1 });

    // Get student's attendance with group details
    const attendance = await Attendance.find({ student_id: id })
      .populate({
        path: 'group_id',
        select: 'id name',
        populate: {
          path: 'course_id',
          select: 'id name'
        }
      })
      .sort({ date: -1 });

    // Format groups data
    const groups = student.group_students
      .filter(gs => gs.status === 'active')
      .map(gs => ({
        id: gs.group_id._id,
        name: gs.group_id.name,
        course: {
          id: gs.group_id.course_id._id,
          name: gs.group_id.course_id.name
        },
        joined_at: gs.joined_at
      }));

    const studentData = {
      ...student.toObject(),
      groups,
      payments,
      attendance
    };

    // Remove group_students from response
    delete studentData.group_students;

    res.json({
      success: true,
      data: studentData
    });
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({ 
      success: false,
      message: 'Talabani yuklashda xatolik yuz berdi' 
    });
  }
};

// Update student
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      first_name, 
      last_name, 
      phone, 
      birth_date, 
      address, 
      parent_name, 
      parent_phone, 
      gender, 
      status,
      trial_lesson_date,
      password,
      created_at,
      joined_date
    } = req.body;

    // O'quvchini topish
    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ 
        success: false,
        message: 'Talaba topilmadi' 
      });
    }

    // Telefon raqamini tekshirish
    if (phone && phone !== student.phone) {
      const existingStudent = await Student.findOne({ phone });
      if (existingStudent) {
        return res.status(400).json({ 
          success: false,
          message: 'Bu telefon raqam boshqa talabaga tegishli'
        });
      }
    }

    // Sana formatini tekshirish
    if (created_at) {
      const formattedCreatedAt = new Date(created_at);
      if (isNaN(formattedCreatedAt.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Noto\'g\'ri yaratilgan sana formati kiritilgan'
        });
      }
    }

    if (joined_date) {
      const formattedJoinedDate = new Date(joined_date);
      if (isNaN(formattedJoinedDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Noto\'g\'ri qo\'shilgan sana formati kiritilgan'
        });
      }
    }

    // Ma'lumotlarni yangilash
    const updateData = {
      first_name: first_name || student.first_name,
      last_name: last_name || student.last_name,
      phone: phone || student.phone,
      birth_date: birth_date || student.birth_date,
      address: address || student.address,
      parent_name: parent_name || student.parent_name,
      parent_phone: parent_phone || student.parent_phone,
      gender: gender || student.gender,
      status: status || student.status,
      trial_lesson_date: trial_lesson_date || student.trial_lesson_date,
      joined_date: joined_date ? new Date(joined_date) : student.joined_date,
      created_at: created_at ? new Date(created_at) : student.created_at,
      updated_at: new Date() // Yangilash vaqtini hozirgi vaqtga o'rnatamiz
    };

    // Agar yangi parol kiritilgan bo'lsa
    if (password) {
      // Parolni hash qilish
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    const updatedStudent = await Student.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Talaba ma\'lumotlari muvaffaqiyatli yangilandi',
      data: updatedStudent
    });
  } catch (error) {
    console.error('Talaba ma\'lumotlarini yangilashda xatolik:', error);
    res.status(500).json({ 
      success: false,
      message: 'Talaba ma\'lumotlarini yangilashda xatolik yuz berdi'
    });
  }
};

// Delete student
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await Student.findById(id);

    if (!student) {
      return res.status(404).json({ 
        success: false,
        message: 'Talaba topilmadi' 
      });
    }

    await student.deleteOne();

    res.json({ 
      success: true,
      message: 'Talaba muvaffaqiyatli o\'chirildi' 
    });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ 
      success: false,
      message: 'Talabani o\'chirishda xatolik yuz berdi' 
    });
  }
};

// Update student status
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const student = await Student.findById(id);
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'O\'quvchi topilmadi'
      });
    }

    student.status = status;
    await student.save();

    res.json({
      success: true,
      message: 'O\'quvchi holati muvaffaqiyatli yangilandi',
      data: student
    });

  } catch (error) {
    console.error('Error updating student status:', error);
    res.status(500).json({
      success: false,
      message: 'O\'quvchi holatini yangilashda xatolik yuz berdi'
    });
  }
};

// Get student courses with payment status
exports.getStudentCourses = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await Student.findByPk(id, {
      include: [
        {
          model: Payment,
          as: 'payments',
          include: [
            {
              model: Course,
              as: 'course',
              attributes: ['id', 'name', 'price']
            }
          ]
        }
      ]
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'O\'quvchi topilmadi'
      });
    }

    // Group and process courses with payment info
    const coursesWithPayment = student.payments.reduce((acc, payment) => {
      const course_id = payment.course_id;
      if (!acc[course_id]) {
        acc[course_id] = {
          course: payment.course,
          total_paid: 0,
          last_payment: null,
          payment_status: student.payment_status,
          has_access: false,
          next_payment_due: null
        };
      }

      acc[course_id].total_paid += Number(payment.amount);
      
      // Update last payment info if this is more recent
      if (!acc[course_id].last_payment || 
          new Date(payment.payment_date) > new Date(acc[course_id].last_payment.payment_date)) {
        acc[course_id].last_payment = payment;
        acc[course_id].next_payment_due = payment.period_end_date;
        
        // Check if student has access to this course
        const now = new Date();
        if (student.payment_status === 'trial' && student.trial_lesson_date) {
          acc[course_id].has_access = now <= new Date(student.trial_lesson_date);
        } else if (student.payment_status === 'paid') {
          acc[course_id].has_access = now <= new Date(payment.period_end_date);
        }
      }

      return acc;
    }, {});

    res.json({
      success: true,
      data: Object.values(coursesWithPayment)
    });
  } catch (error) {
    console.error('Error getting student courses:', error);
    res.status(500).json({
      success: false,
      message: 'O\'quvchi kurslarini olishda xatolik yuz berdi'
    });
  }
};

// Update student payment status
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_status, trial_lesson_date } = req.body;

    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'O\'quvchi topilmadi'
      });
    }

    // Validate payment status
    const validStatuses = ['trial', 'paid', 'expired', 'unpaid'];
    if (!validStatuses.includes(payment_status)) {
      return res.status(400).json({
        success: false,
        message: 'Noto\'g\'ri to\'lov statusi'
      });
    }

    // Agar sinov darsi sanasi o'tgan bo'lsa va status trial bo'lsa
    const now = new Date();
    const trialDate = trial_lesson_date ? new Date(trial_lesson_date) : student.trial_lesson_date;
    
    if (trialDate && now > trialDate && student.payment_status === 'trial') {
      // Avtomatik ravishda unpaid ga o'tkazish
      student.payment_status = 'unpaid';
      student.trial_lesson_date = trialDate;
      await student.save();
    } else {
      // Oddiy yangilash
      student.payment_status = payment_status;
      student.trial_lesson_date = trial_lesson_date ? new Date(trial_lesson_date) : student.trial_lesson_date;
      await student.save();
    }

    res.json({
      success: true,
      data: student
    });
  } catch (error) {
    console.error('Error updating student payment status:', error);
    res.status(500).json({
      success: false,
      message: 'O\'quvchi to\'lov statusini yangilashda xatolik yuz berdi'
    });
  }
};


// Get students with expired payments
exports.getExpiredPayments = async (req, res) => {
  try {
    const now = new Date();

    const students = await Student.findAll({
      where: {
        [Op.or]: [
          {
            payment_status: 'paid',
            next_payment_due: {
              [Op.lt]: now
            }
          },
          {
            payment_status: 'trial',
            trial_lesson_date: {
              [Op.lt]: now
            }

          }
        ]
      },
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Payment,
          as: 'payments',
          include: [
            {
              model: Course,
              as: 'course',
              attributes: ['id', 'name', 'price']
            }
          ]
        }
      ]
    });

    res.json({
      success: true,
      data: students
    });
  } catch (error) {
    console.error('Error getting expired payments:', error);
    res.status(500).json({
      success: false,
      message: 'Muddati o\'tgan to\'lovlarni olishda xatolik yuz berdi'
    });
  }
};

// Student login
exports.login = async (req, res) => {
  try {
    const { phone } = req.body;

    // Find student by phone
    const student = await Student.findOne({ 
      where: { 
        phone,
        status: 'active'
      } 
    });

    if (!student) {
      return res.status(401).json({
        success: false,
        message: 'Telefon raqam noto\'g\'ri yoki akkaunt faol emas'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: student.id, role: 'student' },
      process.env.JWT_SECRET,
      { expiresIn: '365d' }
    );

    res.json({
      success: true,
      data: {
        token,
        student: {
          id: student.id,
          first_name: student.first_name,
          last_name: student.last_name,
          phone: student.phone
        }
      }
    });
  } catch (error) {
    console.error('Error in student login:', error);
    res.status(500).json({
      success: false,
      message: 'Tizimga kirishda xatolik yuz berdi'
    });
  }
};

// Get student profile
exports.getProfile = async (req, res) => {
  try {
    const student = await Student.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Group,
          as: 'groups',
          through: {
            model: GroupStudent,
            where: {
              status: 'active'
            }
          },
          include: [
            {
              model: Course,
              as: 'course',
              attributes: ['id', 'name']
            }
          ]
        }
      ]
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'O\'quvchi topilmadi'
      });
    }

    res.json({
      success: true,
      data: student
    });
  } catch (error) {
    console.error('Error getting student profile:', error);
    res.status(500).json({
      success: false,
      message: 'Profil ma\'lumotlarini olishda xatolik yuz berdi'
    });
  }
};

// Update student profile
exports.updateProfile = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      phone,
      birth_date,
      address,
      parent_name,
      parent_phone
    } = req.body;

    const student = await Student.findByPk(req.user.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'O\'quvchi topilmadi'
      });
    }

    // Check if phone is being changed and already exists
    if (phone && phone !== student.phone) {
      const existingStudent = await Student.findOne({ where: { phone } });
      if (existingStudent) {
        return res.status(400).json({
          success: false,
          message: 'Bu telefon raqam allaqachon ro\'yxatdan o\'tgan'
        });
      }
    }

    // Update student
    await student.update({
      first_name,
      last_name,
      phone,
      birth_date,
      address,
      parent_name,
      parent_phone
    });

    // Get updated student without password
    const updatedStudent = await Student.findByPk(student.id, {
      attributes: { exclude: ['password'] }
    });

    res.json({
      success: true,
      data: updatedStudent
    });
  } catch (error) {
    console.error('Error updating student profile:', error);
    res.status(500).json({
      success: false,
      message: 'Profil ma\'lumotlarini yangilashda xatolik yuz berdi'
    });
  }
}; 

