const { AttendanceStudent, Student, Group, GroupStudent } = require('../models');
const { Op } = require('sequelize');

// Create new attendance record
exports.create = async (req, res) => {
  try {
    const { student_id, group_id, date, status, notes } = req.body;

    // Check if attendance record already exists
    const existingAttendance = await AttendanceStudent.findOne({
      student_id,
      group_id,
      date
    });

    if (existingAttendance) {
      return res.status(400).json({
        success: false,
        message: 'Bu sana uchun davomat ma\'lumoti mavjud'
      });
    }

    // Verify if student belongs to the group
    const groupStudent = await GroupStudent.findOne({
      student_id,
      group_id,
      status: 'active'
    });

    if (!groupStudent) {
      return res.status(400).json({
        success: false,
        message: 'O\'quvchi bu guruhga tegishli emas'
      });
    }

    // Get student to check payment status
    const student = await Student.findById(student_id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'O\'quvchi topilmadi'
      });
    }

    // Create attendance record
    const attendance = await AttendanceStudent.create({
      student_id,
      group_id,
      date,
      status,
      notes
    });

    // If this is student's first lesson and they are in trial status, update their payment status
    if (student.payment_status === 'trial') {
      // Check if this is their first attendance record
      const attendanceCount = await AttendanceStudent.countDocuments({
        student_id,
        status: 'present'
      });

      if (attendanceCount === 1) {
        // Update student's payment status to unpaid
        await Student.findByIdAndUpdate(student_id, {
          payment_status: 'unpaid',
          trial_lesson_date: new Date(date)
        });
      }
    }

    // Get attendance with related data
    const attendanceWithDetails = await AttendanceStudent.findById(attendance._id)
      .populate('student_id', 'first_name last_name')
      .populate('group_id', 'name');

    res.status(201).json({
      success: true,
      message: 'Davomat muvaffaqiyatli saqlandi',
      data: attendanceWithDetails
    });
  } catch (error) {
    console.error('Error creating attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Davomat ma\'lumotini saqlashda xatolik yuz berdi'
    });
  }
};

// Get all attendance records with filters
exports.getAll = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      group_id,
      student_id,
      date,
      status,
      start_date,
      end_date
    } = req.query;

    // Build filter conditions
    const query = {};
    if (group_id) query.group_id = group_id;
    if (student_id) query.student_id = student_id;
    if (status) query.status = status;
    if (date) query.date = date;
    if (start_date || end_date) {
      query.date = {};
      if (start_date) query.date.$gte = new Date(start_date);
      if (end_date) query.date.$lte = new Date(end_date);
    }

    // Calculate skip
    const skip = (page - 1) * limit;

    // Get attendance records with pagination
    const [attendanceRecords, count] = await Promise.all([
      AttendanceStudent.find(query)
        .populate('student_id', 'first_name last_name')
        .populate('group_id', 'name')
        .sort({ date: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      AttendanceStudent.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: attendanceRecords,
      pagination: {
        total: count,
        page: parseInt(page),
        total_pages: Math.ceil(count / limit),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error getting attendance records:', error);
    res.status(500).json({
      success: false,
      message: 'Davomat ma\'lumotlarini olishda xatolik yuz berdi'
    });
  }
};

// Get attendance by ID
exports.getById = async (req, res) => {
  try {
    const attendance = await AttendanceStudent.findById(req.params.id)
      .populate('student_id', 'first_name last_name')
      .populate('group_id', 'name');

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Davomat ma\'lumoti topilmadi'
      });
    }

    res.json({
      success: true,
      data: attendance
    });
  } catch (error) {
    console.error('Error getting attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Davomat ma\'lumotini olishda xatolik yuz berdi'
    });
  }
};

// Update attendance record
exports.update = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const attendance = await AttendanceStudent.findById(req.params.id);

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Davomat ma\'lumoti topilmadi'
      });
    }

    // Update attendance
    attendance.status = status;
    attendance.notes = notes;
    await attendance.save();

    // Get updated attendance with details
    const updatedAttendance = await AttendanceStudent.findById(attendance._id)
      .populate('student_id', 'first_name last_name')
      .populate('group_id', 'name');

    res.json({
      success: true,
      message: 'Davomat ma\'lumoti yangilandi',
      data: updatedAttendance
    });
  } catch (error) {
    console.error('Error updating attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Davomat ma\'lumotini yangilashda xatolik yuz berdi'
    });
  }
};

// Delete attendance record
exports.delete = async (req, res) => {
  try {
    const attendance = await AttendanceStudent.findById(req.params.id);

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Davomat ma\'lumoti topilmadi'
      });
    }

    await attendance.deleteOne();

    res.json({
      success: true,
      message: 'Davomat ma\'lumoti o\'chirildi'
    });
  } catch (error) {
    console.error('Error deleting attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Davomat ma\'lumotini o\'chirishda xatolik yuz berdi'
    });
  }
};

// Get student attendance summary
exports.getStudentSummary = async (req, res) => {
  try {
    const { student_id } = req.params;
    const { start_date, end_date, group_id } = req.query;

    // Build query
    const query = { student_id };
    if (group_id) query.group_id = group_id;
    if (start_date || end_date) {
      query.date = {};
      if (start_date) query.date.$gte = new Date(start_date);
      if (end_date) query.date.$lte = new Date(end_date);
    }

    // Get attendance records
    const attendances = await AttendanceStudent.find(query)
      .populate('group_id', 'name')
      .sort({ date: -1 });

    // Calculate summary
    const summary = {
      total_days: attendances.length,
      present: attendances.filter(a => a.status === 'present').length,
      absent: attendances.filter(a => a.status === 'absent').length,
      late: attendances.filter(a => a.status === 'late').length,
      attendance_rate: attendances.length ? 
        ((attendances.filter(a => a.status === 'present').length / attendances.length) * 100).toFixed(2) : 0,
      records: attendances
    };

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Error getting student attendance summary:', error);
    res.status(500).json({
      success: false,
      message: 'O\'quvchi davomat ma\'lumotlarini olishda xatolik yuz berdi'
    });
  }
};

// Create attendance for entire group
exports.createGroupAttendance = async (req, res) => {
  try {
    const { group_id } = req.params;
    const { date, attendance_data } = req.body;

    // Check if any attendance records exist for this group and date
    const existingAttendance = await AttendanceStudent.findOne({
        group_id,
        date
    });

    if (existingAttendance) {
      return res.status(400).json({
        success: false,
        message: 'Bu sana uchun guruh davomati mavjud'
      });
    }

    // Verify all students exist and belong to the group
    const studentIds = attendance_data.map(data => data.student_id);
    const validStudents = await GroupStudent.find({
      student_id: { $in: studentIds },
        group_id,
        status: 'active'
    }).populate('student_id');

    const validStudentIds = validStudents.map(gs => gs.student_id);
    const invalidStudents = studentIds.filter(id => !validStudentIds.includes(id));

    if (invalidStudents.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Ba\'zi o\'quvchilar guruhda mavjud emas',
        invalid_student_ids: invalidStudents
      });
    }

    // Create attendance records only for valid students
    const attendanceRecords = await Promise.all(
      attendance_data
        .filter(data => validStudentIds.includes(data.student_id))
        .map(async (data) => {
          return await AttendanceStudent.create({
            student_id: data.student_id,
            group_id,
            date,
            status: data.status || 'absent',
            notes: data.notes || ''
          });
        })
    );

    // Get full attendance details
    const fullAttendanceRecords = await AttendanceStudent.find({
      _id: { $in: attendanceRecords.map(record => record._id) }
    })
    .populate('student_id', 'first_name last_name')
    .populate('group_id', 'name');

    res.status(201).json({
      success: true,
      message: 'Guruh davomati muvaffaqiyatli saqlandi',
      data: fullAttendanceRecords
    });
  } catch (error) {
    console.error('Error creating group attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Guruh davomatini saqlashda xatolik yuz berdi'
    });
  }
};

// Get attendance records for teacher's students
exports.getTeacherStudentsAttendance = async (req, res) => {
  try {
    const teacher_id = req.user._id;
    
    // Get groups where teacher is assigned
    const teacherGroups = await Group.find({
        teacher_id,
        status: 'active'
    });

    const group_ids = teacherGroups.map(group => group._id);

    // Get attendance records for students in teacher's groups
    const attendances = await AttendanceStudent.find({
      group_id: { $in: group_ids }
    })
    .populate('student_id', 'first_name last_name')
    .populate('group_id', 'name')
    .sort({ date: -1 });

    res.json({
      success: true,
      data: attendances
    });
  } catch (error) {
    console.error('Error getting teacher students attendance:', error);
    res.status(500).json({
      success: false,
      message: 'O\'quvchilar davomatini olishda xatolik yuz berdi'
    });
  }
};

// Get attendance records for a specific group
exports.getGroupAttendance = async (req, res) => {
  try {
    const { group_id } = req.params;
    const { date, start_date, end_date } = req.query;

    // If teacher, verify they have access to this group
    if (req.user.role === 'teacher') {
      const group = await Group.findOne({
        _id: group_id,
        teacher_id: req.user._id,
          status: 'active'
      });

      if (!group) {
        return res.status(403).json({
          success: false,
          message: 'Bu guruhga kirishga ruxsat yo\'q'
        });
      }
    }

    // Build query
    const query = { group_id };

    // Handle date filtering
    if (date) {
      query.date = new Date(date);
    } else if (start_date || end_date) {
      query.date = {};
      if (start_date) query.date.$gte = new Date(start_date);
      if (end_date) query.date.$lte = new Date(end_date);
    }

    // Get attendance records
    const attendances = await AttendanceStudent.find(query)
      .populate('student_id', 'first_name last_name')
      .populate('group_id', 'name')
      .sort({ date: -1 });

    // Get all active students in the group
    const activeStudents = await GroupStudent.find({
        group_id,
        status: 'active'
    }).populate('student_id', 'first_name last_name');

    // Create a map of existing attendance records
    const attendanceMap = new Map(
      attendances.map(att => [att.student_id.toString(), att])
    );

    // Create final attendance list including students without attendance
    const finalAttendanceList = activeStudents.map(gs => {
      const existingAttendance = attendanceMap.get(gs.student_id.toString());
      if (existingAttendance) {
        return existingAttendance;
      }
      // Return a placeholder for students without attendance
      return {
        student_id: gs.student_id,
        group_id: group_id,
        student: gs.student_id,
        group: {
          _id: group_id,
          name: gs.group ? gs.group.name : ''
        },
        date: date || new Date().toISOString().split('T')[0],
        status: null,
        notes: null
      };
    });

    res.json({
      success: true,
      data: finalAttendanceList
    });
  } catch (error) {
    console.error('Error getting group attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Guruh davomatini olishda xatolik yuz berdi'
    });
  }
};

// Get all student attendance records with pagination and filters
exports.getAllAttendance = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      student_id,
      group_id,
      start_date,
      end_date,
      status,
      search
    } = req.query;

    const query = {};
    if (student_id) query.student_id = student_id;
    if (group_id) query.group_id = group_id;
    if (status) query.status = status;
    
    if (start_date || end_date) {
      query.date = {};
      if (start_date) query.date.$gte = new Date(start_date);
      if (end_date) query.date.$lte = new Date(end_date);
    }

    const skip = (page - 1) * limit;

    // Build student search query if search term provided
    let studentQuery = {};
    if (search) {
      studentQuery = {
        $or: [
          { first_name: { $regex: search, $options: 'i' } },
          { last_name: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const [records, count] = await Promise.all([
      AttendanceStudent.find(query)
        .populate({
          path: 'student_id',
          match: studentQuery,
          select: 'first_name last_name'
        })
        .populate('group_id', 'name')
        .sort({ date: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      AttendanceStudent.countDocuments(query)
    ]);

    // Filter out records where student doesn't match search
    const filteredRecords = records.filter(record => record.student_id);

    res.json({
      success: true,
      data: filteredRecords,
      pagination: {
        total: count,
        page: parseInt(page),
        total_pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error getting student attendance records:', error);
    res.status(500).json({
      success: false,
      message: 'O\'quvchi davomat yozuvlarini olishda xatolik yuz berdi'
    });
  }
};

// Get single student attendance record
exports.getAttendanceById = async (req, res) => {
  try {
    const { id } = req.params;

    const record = await AttendanceStudent.findById(id)
      .populate('student_id', 'first_name last_name')
      .populate('group_id', 'name');

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'O\'quvchi davomat yozuvi topilmadi'
      });
    }

    res.json({
      success: true,
      data: record
    });
  } catch (error) {
    console.error('Error getting student attendance record:', error);
    res.status(500).json({
      success: false,
      message: 'O\'quvchi davomat yozuvini olishda xatolik yuz berdi'
    });
  }
};

// Create student attendance record
exports.createAttendance = async (req, res) => {
  try {
    const { student_id, group_id, date, status, notes } = req.body;

    // Validate student
    const student = await Student.findById(student_id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'O\'quvchi topilmadi'
      });
    }

    // Validate group
    const group = await Group.findById(group_id);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Guruh topilmadi'
      });
    }

    // Check if attendance record already exists for this date
    const existingRecord = await AttendanceStudent.findOne({
      student_id,
      group_id,
      date: new Date(date)
    });

    if (existingRecord) {
      return res.status(400).json({
        success: false,
        message: 'Bu sana uchun o\'quvchi davomat yozuvi allaqachon mavjud'
      });
    }

    const record = await AttendanceStudent.create({
      student_id,
      group_id,
      date: new Date(date),
      status,
      notes
    });

    res.status(201).json({
      success: true,
      message: 'O\'quvchi davomat yozuvi muvaffaqiyatli yaratildi',
      data: record
    });
  } catch (error) {
    console.error('Error creating student attendance record:', error);
    res.status(500).json({
      success: false,
      message: 'O\'quvchi davomat yozuvini yaratishda xatolik yuz berdi'
    });
  }
};

// Update student attendance record
exports.updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const record = await AttendanceStudent.findById(id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'O\'quvchi davomat yozuvi topilmadi'
      });
    }

    if (status) record.status = status;
    if (notes !== undefined) record.notes = notes;

    await record.save();

    res.json({
      success: true,
      message: 'O\'quvchi davomat yozuvi yangilandi',
      data: record
    });
  } catch (error) {
    console.error('Error updating student attendance record:', error);
    res.status(500).json({
      success: false,
      message: 'O\'quvchi davomat yozuvini yangilashda xatolik yuz berdi'
    });
  }
};

// Delete student attendance record
exports.deleteAttendance = async (req, res) => {
  try {
    const { id } = req.params;

    const record = await AttendanceStudent.findById(id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'O\'quvchi davomat yozuvi topilmadi'
      });
    }

    await record.deleteOne();

    res.json({
      success: true,
      message: 'O\'quvchi davomat yozuvi o\'chirildi'
    });
  } catch (error) {
    console.error('Error deleting student attendance record:', error);
    res.status(500).json({
      success: false,
      message: 'O\'quvchi davomat yozuvini o\'chirishda xatolik yuz berdi'
    });
  }
};

// Get student attendance history
exports.getStudentAttendance = async (req, res) => {
  try {
    const { student_id } = req.params;
    const { group_id, start_date, end_date } = req.query;

    const query = { student_id };
    if (group_id) query.group_id = group_id;
    
    if (start_date || end_date) {
      query.date = {};
      if (start_date) query.date.$gte = new Date(start_date);
      if (end_date) query.date.$lte = new Date(end_date);
    }

    const records = await AttendanceStudent.find(query)
      .populate('group_id', 'name')
      .sort({ date: -1 });

    res.json({
      success: true,
      data: records
    });
  } catch (error) {
    console.error('Error getting student attendance:', error);
    res.status(500).json({
      success: false,
      message: 'O\'quvchi davomatini olishda xatolik yuz berdi'
    });
  }
};

// Get group attendance for a specific date
exports.getGroupAttendance = async (req, res) => {
  try {
    const { group_id } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Sana parametri talab qilinadi'
      });
    }

    const records = await AttendanceStudent.find({
      group_id,
      date: new Date(date)
    })
    .populate('student_id', 'first_name last_name')
    .sort({ 'student_id.first_name': 1 });

    res.json({
      success: true,
      data: records
    });
  } catch (error) {
    console.error('Error getting group attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Guruh davomatini olishda xatolik yuz berdi'
    });
  }
}; 