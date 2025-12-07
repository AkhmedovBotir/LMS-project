const { Attendance, Employee } = require('../models');

// Get all attendance records with pagination and filters
exports.getAllAttendance = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      employee_id,
      start_date,
      end_date,
      status,
      search
    } = req.query;

    const query = {};
    if (employee_id) query.employee_id = employee_id;
    if (status) query.status = status;
    
    if (start_date || end_date) {
      query.date = {};
      if (start_date) query.date.$gte = new Date(start_date);
      if (end_date) query.date.$lte = new Date(end_date);
    }

    const skip = (page - 1) * limit;

    // Build employee search query if search term provided
    let employeeQuery = {};
    if (search) {
      employeeQuery = {
        $or: [
          { first_name: { $regex: search, $options: 'i' } },
          { last_name: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const [records, count] = await Promise.all([
      Attendance.find(query)
        .populate({
          path: 'employee_id',
          match: employeeQuery,
          select: 'first_name last_name'
        })
        .sort({ date: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Attendance.countDocuments(query)
    ]);

    // Filter out records where employee doesn't match search
    const filteredRecords = records.filter(record => record.employee_id);

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
    console.error('Error getting attendance records:', error);
    res.status(500).json({
      success: false,
      message: 'Davomat yozuvlarini olishda xatolik yuz berdi'
    });
  }
};

// Get single attendance record
exports.getAttendanceById = async (req, res) => {
  try {
    const { id } = req.params;

    const record = await Attendance.findById(id)
      .populate('employee_id', 'first_name last_name');

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Davomat yozuvi topilmadi'
      });
    }

    res.json({
      success: true,
      data: record
    });
  } catch (error) {
    console.error('Error getting attendance record:', error);
    res.status(500).json({
      success: false,
      message: 'Davomat yozuvini olishda xatolik yuz berdi'
    });
  }
};

// Create attendance record
exports.createAttendance = async (req, res) => {
  try {
    const { employee_id, date, checkin_time, checkout_time, status, notes } = req.body;

    // Validate employee
    const employee = await Employee.findById(employee_id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Xodim topilmadi'
      });
    }

    // Check if attendance record already exists for this date
    const existingRecord = await Attendance.findOne({
      employee_id,
      date: new Date(date)
    });

    if (existingRecord) {
      return res.status(400).json({
        success: false,
        message: 'Bu sana uchun davomat yozuvi allaqachon mavjud'
      });
    }

    const record = await Attendance.create({
      employee_id,
      date: new Date(date),
      checkin_time,
      checkout_time,
      status,
      notes
    });

    res.status(201).json({
      success: true,
      message: 'Davomat yozuvi muvaffaqiyatli yaratildi',
      data: record
    });
  } catch (error) {
    console.error('Error creating attendance record:', error);
    res.status(500).json({
      success: false,
      message: 'Davomat yozuvini yaratishda xatolik yuz berdi'
    });
  }
};

// Update attendance record
exports.updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { checkin_time, checkout_time, status, notes } = req.body;

    const record = await Attendance.findById(id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Davomat yozuvi topilmadi'
      });
    }

    if (checkin_time) record.checkin_time = checkin_time;
    if (checkout_time) record.checkout_time = checkout_time;
    if (status) record.status = status;
    if (notes !== undefined) record.notes = notes;

    await record.save();

    res.json({
      success: true,
      message: 'Davomat yozuvi yangilandi',
      data: record
    });
  } catch (error) {
    console.error('Error updating attendance record:', error);
    res.status(500).json({
      success: false,
      message: 'Davomat yozuvini yangilashda xatolik yuz berdi'
    });
  }
};

// Delete attendance record
exports.deleteAttendance = async (req, res) => {
  try {
    const { id } = req.params;

    const record = await Attendance.findById(id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Davomat yozuvi topilmadi'
      });
    }

    await record.deleteOne();

    res.json({
      success: true,
      message: 'Davomat yozuvi o\'chirildi'
    });
  } catch (error) {
    console.error('Error deleting attendance record:', error);
    res.status(500).json({
      success: false,
      message: 'Davomat yozuvini o\'chirishda xatolik yuz berdi'
    });
  }
};

// Get employee attendance history
exports.getEmployeeAttendance = async (req, res) => {
  try {
    const { employee_id } = req.params;
    const { start_date, end_date } = req.query;

    const query = { employee_id };
    
    if (start_date || end_date) {
      query.date = {};
      if (start_date) query.date.$gte = new Date(start_date);
      if (end_date) query.date.$lte = new Date(end_date);
    }

    const records = await Attendance.find(query)
      .sort({ date: -1 });

    res.json({
      success: true,
      data: records
    });
  } catch (error) {
    console.error('Error getting employee attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Xodim davomatini olishda xatolik yuz berdi'
    });
  }
};

// Get employee attendance summary
exports.getEmployeeSummary = async (req, res) => {
  try {
    const { employee_id, start_date, end_date } = req.query;

    if (!employee_id || !start_date || !end_date) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID, start date, and end date are required'
      });
    }

    const attendances = await Attendance.find({
      employee_id,
      date: {
        $gte: new Date(start_date),
        $lte: new Date(end_date)
      }
    }).sort({ date: 1 });

    const summary = {
      total_days: attendances.length,
      present: attendances.filter(a => a.status === 'present').length,
      absent: attendances.filter(a => a.status === 'absent').length,
      late: attendances.filter(a => a.status === 'late').length,
      excused: attendances.filter(a => a.status === 'excused').length,
      details: attendances
    };

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Error fetching employee attendance summary:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching employee attendance summary',
      error: error.message
    });
  }
}; 