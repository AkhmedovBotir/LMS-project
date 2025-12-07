const Schedule = require('../models/Schedule');
const Course = require('../models/Course');

// Get all schedules with pagination and filters
exports.getAllSchedules = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.course_id) query.course_id = req.query.course_id;
    if (req.query.day_of_week) query.day_of_week = req.query.day_of_week;
    if (req.query.status) query.status = req.query.status;

    const schedules = await Schedule.find(query)
      .populate('course_id', 'name')
      .skip(skip)
      .limit(limit)
      .sort({ day_of_week: 1 });

    const total = await Schedule.countDocuments(query);

    res.json({
      success: true,
      data: schedules,
      pagination: {
        total,
        page,
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
};

// Get schedule by ID
exports.getScheduleById = async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id)
      .populate('course_id', 'name');

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Dars jadvali topilmadi'
      });
    }

    res.json({
      success: true,
      data: schedule
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Xatolik yuz berdi',
      error: error.message
    });
  }
};

// Create new schedule
exports.createSchedule = async (req, res) => {
  try {
    const { course_id, day_of_week } = req.body;

    // Check if course exists
    const course = await Course.findById(course_id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Kurs topilmadi'
      });
    }

    // Check if schedule already exists for this course and day
    const existingSchedule = await Schedule.findOne({
      course_id,
      day_of_week
    });

    if (existingSchedule) {
      return res.status(400).json({
        success: false,
        message: 'Bu kurs uchun bu kunda dars jadvali allaqachon mavjud'
      });
    }

    const schedule = await Schedule.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Dars jadvali muvaffaqiyatli yaratildi',
      data: schedule
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Xatolik yuz berdi',
      error: error.message
    });
  }
};

// Update schedule
exports.updateSchedule = async (req, res) => {
  try {
    const { course_id, day_of_week } = req.body;

    // Check if schedule exists
    const schedule = await Schedule.findById(req.params.id);
    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Dars jadvali topilmadi'
      });
    }

    // Check if course exists if being updated
    if (course_id) {
      const course = await Course.findById(course_id);
      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Kurs topilmadi'
        });
      }
    }

    // Check for duplicate schedule if day is being updated
    if (day_of_week) {
      const existingSchedule = await Schedule.findOne({
        course_id: course_id || schedule.course_id,
        day_of_week,
        _id: { $ne: req.params.id }
      });

      if (existingSchedule) {
        return res.status(400).json({
          success: false,
          message: 'Bu kurs uchun bu kunda dars jadvali allaqachon mavjud'
        });
      }
    }

    const updatedSchedule = await Schedule.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json({
      success: true,
      message: 'Dars jadvali muvaffaqiyatli yangilandi',
      data: updatedSchedule
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Xatolik yuz berdi',
      error: error.message
    });
  }
};

// Delete schedule
exports.deleteSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id);
    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Dars jadvali topilmadi'
      });
    }

    await schedule.deleteOne();

    res.json({
      success: true,
      message: 'Dars jadvali muvaffaqiyatli o\'chirildi'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Xatolik yuz berdi',
      error: error.message
    });
  }
}; 