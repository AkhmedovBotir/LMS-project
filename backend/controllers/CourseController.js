const Course = require('../models/Course');
const Employee = require('../models/Employee');

// Get all courses with pagination and filters
exports.getAllCourses = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      instructor_id,
      status,
      search
    } = req.query;

    const query = {};
    if (instructor_id) query.instructor_id = instructor_id;
    if (status) query.status = status;
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const [courses, count] = await Promise.all([
      Course.find(query)
        .populate('instructor_id', 'first_name last_name')
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Course.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: courses,
      pagination: {
        total: count,
        page: parseInt(page),
        total_pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error getting courses:', error);
    res.status(500).json({
      success: false,
      message: 'Kurslarni olishda xatolik yuz berdi'
    });
  }
};

// Get single course
exports.getCourseById = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id)
      .populate('instructor_id', 'first_name last_name')
      .populate('groups')
      .populate('topics');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Kurs topilmadi'
      });
    }

    res.json({
      success: true,
      data: course
    });
  } catch (error) {
    console.error('Error getting course:', error);
    res.status(500).json({
      success: false,
      message: 'Kursni olishda xatolik yuz berdi'
    });
  }
};

// Create new course
exports.createCourse = async (req, res) => {
  try {
    const { name, description, standart_price, standart_duration_months, intensive_price, intensive_duration_months, instructor_id } = req.body;

    // Validate instructor
    const instructor = await Employee.findOne({ _id: instructor_id });
    if (!instructor) {
      return res.status(404).json({
        success: false,
        message: 'O\'qituvchi topilmadi'
      });
    }

    // Check if course with same name exists
    const existingCourse = await Course.findOne({ name });
    if (existingCourse) {
      return res.status(400).json({
        success: false,
        message: 'Bu nomdagi kurs allaqachon mavjud'
      });
    }

    const course = await Course.create({
      name,
      description,
      standart_price,
      standart_duration_months,
      intensive_price,
      intensive_duration_months,
      instructor_id
    });

    // Populate instructor details
    const populatedCourse = await Course.findById(course._id)
      .populate('instructor_id', 'first_name last_name position');

    res.status(201).json({
      success: true,
      message: 'Kurs muvaffaqiyatli yaratildi',
      data: populatedCourse
    });
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({
      success: false,
      message: 'Kursni yaratishda xatolik yuz berdi'
    });
  }
};

// Update course
exports.updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, standart_price, standart_duration_months, intensive_price, intensive_duration_months, instructor_id, status } = req.body;

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Kurs topilmadi'
      });
    }

    // If name is being changed, check for duplicates
    if (name && name !== course.name) {
      const existingCourse = await Course.findOne({ name });
      if (existingCourse) {
        return res.status(400).json({
          success: false,
          message: 'Bu nomdagi kurs allaqachon mavjud'
        });
      }
    }

    // If instructor is being changed, validate new instructor
    if (instructor_id && instructor_id !== course.instructor_id.toString()) {
      const instructor = await Employee.findById(instructor_id);
      if (!instructor) {
        return res.status(404).json({
          success: false,
          message: 'O\'qituvchi topilmadi'
        });
      }
    }

    if (name) course.name = name;
    if (description !== undefined) course.description = description;
    if (standart_price !== undefined) course.standart_price = standart_price;
    if (standart_duration_months !== undefined) course.standart_duration_months = standart_duration_months;
    if (intensive_price !== undefined) course.intensive_price = intensive_price;
    if (intensive_duration_months !== undefined) course.intensive_duration_months = intensive_duration_months;
    if (instructor_id) course.instructor_id = instructor_id;
    if (status) course.status = status;

    await course.save();

    res.json({
      success: true,
      message: 'Kurs yangilandi',
      data: course
    });
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({
      success: false,
      message: 'Kursni yangilashda xatolik yuz berdi'
    });
  }
};

// Delete course
exports.deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Kurs topilmadi'
      });
    }

    // Check if course has any groups
    if (course.groups && course.groups.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Bu kursda guruhlar mavjud. Avval guruhlarni o\'chiring'
      });
    }

    await course.deleteOne();

    res.json({
      success: true,
      message: 'Kurs o\'chirildi'
    });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({
      success: false,
      message: 'Kursni o\'chirishda xatolik yuz berdi'
    });
  }
}; 

exports.updateCourseStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Kurs topilmadi'
      });
    }

    course.status = status;
    await course.save();

    res.json({
      success: true,
      message: 'Kurs statusi o\'zgartirildi',
      data: course
    });
  } catch (error) {
    console.error('Error updating course status:', error);
    res.status(500).json({
      success: false,
      message: 'Kurs statusini o\'zgartirishda xatolik yuz berdi'
    });
  }
};