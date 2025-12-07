const { Employee, Department, Position, Course, Group, Student, GroupStudent } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Grade = require('../models/Grade');


// Get instructor courses
exports.getInstructorCourses = async (req, res) => {
  try {
    console.log('User ID:', req.user._id); // Debug log

    // First check if the user exists
    const user = await Employee.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Xodim topilmadi'
      });
    }

    // Get courses where this user is the instructor
    const courses = await Course.find({
      instructor_id: user._id,
      status: 'active'
    }).populate('instructor_id', 'first_name last_name');


    res.json({
      success: true,
      data: courses
    });
  } catch (error) {
    console.error('Error fetching instructor courses:', error);
    res.status(500).json({
      success: false,
      message: 'Kurslarni olishda xatolik yuz berdi'
    });
  }
};

// Get teacher groups
exports.getTeacherGroups = async (req, res) => {
  try {
    const groups = await Group.find({
      teacher_id: req.user._id,
      status: 'active'
    }).populate('course_id', 'name');

    res.json({
      success: true,
      data: groups
    });
  } catch (error) {
    console.error('Error fetching teacher groups:', error);
    res.status(500).json({
      success: false,
      message: 'Guruhlarni olishda xatolik yuz berdi'
    });
  }
};

// Get teacher's students by group
exports.getStudentsByGroup = async (req, res) => {
  try {
    const { group_id } = req.params;

    // Check if the group belongs to the teacher
    const group = await Group.findOne({
      _id: group_id,
      teacher_id: req.user._id,
      status: 'active'
    });

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Guruh topilmadi'
      });
    }

    // Get students in the group
    const students = await Student.find({
      status: 'active'
    })
    .populate({
      path: 'group_students',
      match: {
        group_id: group_id,
        status: 'active'
      }
    })
    .sort({ first_name: 1 });

    // Filter out students without matching group_students
    const filteredStudents = students.filter(student => student.group_students.length > 0);

    res.json({
      success: true,
      data: filteredStudents
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({
      success: false,
      message: 'Talabalarni olishda xatolik yuz berdi'
    });
  }
};

// Get all teacher's students
exports.getAllStudents = async (req, res) => {
  try {
    // Get all active groups of the teacher
    const groups = await Group.find({
      teacher_id: req.user._id,
      status: 'active'
    }, '_id');

    const groupIds = groups.map(group => group._id);

    // Get all students from teacher's groups
    const students = await Student.find({
      status: 'active'
    })
    .populate({
      path: 'group_students',
      match: {
        group_id: { $in: groupIds },
        status: 'active'
      },
      populate: {
        path: 'group_id',
        select: 'name',
        populate: {
          path: 'course_id',
          select: 'name'
        }
      }
    })
    .sort({ first_name: 1 });

    // Filter out students without matching group_students
    const filteredStudents = students.filter(student => student.group_students.length > 0);

    res.json({
      success: true,
      data: filteredStudents
    });
  } catch (error) {
    console.error('Error fetching all students:', error);
    res.status(500).json({
      success: false,
      message: 'Talabalarni olishda xatolik yuz berdi'
    });
  }
};

// Grade students
exports.gradeStudents = async (req, res) => {
    try {
        const { group_id, date, grades } = req.body;

        // Validate required fields
        if (!group_id || !date || !grades || !Array.isArray(grades)) {
            return res.status(400).json({
                success: false,
                message: 'Barcha majburiy maydonlarni to\'ldiring'
            });
        }

        // Validate grades array
        for (const grade of grades) {
            if (!grade.student_id || !grade.mark || grade.mark < 1 || grade.mark > 5) {
                return res.status(400).json({
                    success: false,
                    message: 'Har bir o\'quvchi uchun 1 dan 5 gacha baho kiriting'
                });
            }
        }

        // Check if group exists and teacher has access
        const group = await Group.findOne({
            _id: group_id,
            teacher_id: req.user._id
        });

        if (!group) {
            return res.status(404).json({
                success: false,
                message: 'Guruh topilmadi yoki sizga ruxsat yo\'q'
            });
        }

        // Create grades
        const gradePromises = grades.map(grade => {
            return Grade.create({
                student_id: grade.student_id,
                group_id: group_id,
                teacher_id: req.user._id,
                date: date,
                mark: grade.mark,
                note: grade.note || '',
                created_by: req.user._id
            });
        });

        await Promise.all(gradePromises);

        res.status(201).json({
            success: true,
            message: 'Baxolar muvaffaqiyatli saqlandi'
        });
    } catch (error) {
        console.error('Error grading students:', error);
        res.status(500).json({
            success: false,
            message: 'Baxolarni saqlashda xatolik yuz berdi'
        });
    }
};

// Get grades for a group
exports.getGrades = async (req, res) => {
    try {
        const { group_id, date } = req.query;

        // Validate required fields
        if (!group_id || !date) {
            return res.status(400).json({
                success: false,
                message: 'Guruh ID va sana majburiy'
            });
        }

        // Check if group exists and teacher has access
        const group = await Group.findOne({
            _id: group_id,
            teacher_id: req.user._id
        });

        if (!group) {
            return res.status(404).json({
                success: false,
                message: 'Guruh topilmadi yoki sizga ruxsat yo\'q'
            });
        }

        // Get grades for the specified date
        const grades = await Grade.find({
            group_id: group_id,
            date: new Date(date)
        }).populate('student_id', 'first_name last_name');

        res.status(200).json({
            success: true,
            data: grades
        });
    } catch (error) {
        console.error('Error getting grades:', error);
        res.status(500).json({
            success: false,
            message: 'Baxolarni olishda xatolik yuz berdi'
        });
    }
};

// Update grades
exports.updateGrades = async (req, res) => {
    try {
        const { group_id, date, grades } = req.body;

        // Validate required fields
        if (!group_id || !date || !grades || !Array.isArray(grades)) {
            return res.status(400).json({
                success: false,
                message: 'Barcha majburiy maydonlarni to\'ldiring'
            });
        }

        // Validate grades array
        for (const grade of grades) {
            if (!grade.student_id || !grade.mark || grade.mark < 1 || grade.mark > 5) {
                return res.status(400).json({
                    success: false,
                    message: 'Har bir o\'quvchi uchun 1 dan 5 gacha baho kiriting'
                });
            }
        }

        // Check if group exists and teacher has access
        const group = await Group.findOne({
            _id: group_id,
            teacher_id: req.user._id
        });

        if (!group) {
            return res.status(404).json({
                success: false,
                message: 'Guruh topilmadi yoki sizga ruxsat yo\'q'
            });
        }

        // Update grades
        const updatePromises = grades.map(grade => {
            return Grade.findOneAndUpdate(
                {
                    student_id: grade.student_id,
                    group_id: group_id,
                    date: new Date(date)
                },
                {
                    mark: grade.mark,
                    note: grade.note || '',
                    updated_at: Date.now()
                },
                { new: true, upsert: true }
            );
        });

        await Promise.all(updatePromises);

        res.status(200).json({
            success: true,
            message: 'Baxolar muvaffaqiyatli yangilandi'
        });
    } catch (error) {
        console.error('Error updating grades:', error);
        res.status(500).json({
            success: false,
            message: 'Baxolarni yangilashda xatolik yuz berdi'
        });
    }
};

// Delete grades
exports.deleteGrades = async (req, res) => {
    try {
        const { group_id, date } = req.body;

        // Validate required fields
        if (!group_id || !date) {
            return res.status(400).json({
                success: false,
                message: 'Guruh ID va sana majburiy'
            });
        }

        // Check if group exists and teacher has access
        const group = await Group.findOne({
            _id: group_id,
            teacher_id: req.user._id
        });

        if (!group) {
            return res.status(404).json({
                success: false,
                message: 'Guruh topilmadi yoki sizga ruxsat yo\'q'
            });
        }

        // Delete grades for the specified date
        await Grade.deleteMany({
            group_id: group_id,
            date: new Date(date)
        });

        res.status(200).json({
            success: true,
            message: 'Baxolar muvaffaqiyatli o\'chirildi'
        });
    } catch (error) {
        console.error('Error deleting grades:', error);
        res.status(500).json({
            success: false,
            message: 'Baxolarni o\'chirishda xatolik yuz berdi'
        });
    }
};

// Get grades by group
exports.getGradesByGroup = async (req, res) => {
    try {
        const { group_id } = req.params;
        const { start_date, end_date } = req.query;

        // Validate required fields
        if (!group_id) {
            return res.status(400).json({
                success: false,
                message: 'Guruh ID majburiy'
            });
        }

        // Check if group exists and teacher has access
        const group = await Group.findOne({
            _id: group_id,
            teacher_id: req.user._id
        });

        if (!group) {
            return res.status(404).json({
                success: false,
                message: 'Guruh topilmadi yoki sizga ruxsat yo\'q'
            });
        }

        // Build date filter
        const dateFilter = {};
        if (start_date && end_date) {
            dateFilter.date = {
                $gte: new Date(start_date),
                $lte: new Date(end_date)
            };
        }

        // Get grades for the group
        const grades = await Grade.find({
            group_id: group_id,
            ...dateFilter
        })
        .populate('student_id', 'first_name last_name')
        .sort({ date: -1 });

        // Group grades by date
        const groupedGrades = grades.reduce((acc, grade) => {
            const date = grade.date.toISOString().split('T')[0];
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(grade);
            return acc;
        }, {});

        res.status(200).json({
            success: true,
            data: groupedGrades
        });
    } catch (error) {
        console.error('Error getting grades by group:', error);
        res.status(500).json({
            success: false,
            message: 'Baxolarni olishda xatolik yuz berdi'
        });
    }
};

// Get grades by student
exports.getGradesByStudent = async (req, res) => {
    try {
        const { student_id } = req.params;
        const { start_date, end_date } = req.query;

        // Validate required fields
        if (!student_id) {
            return res.status(400).json({
                success: false,
                message: 'O\'quvchi ID majburiy'
            });
        }

        // Check if student exists and teacher has access
        const student = await Student.findOne({
            _id: student_id,
            teacher_id: req.user._id
        });

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'O\'quvchi topilmadi yoki sizga ruxsat yo\'q'
            });
        }

        // Build date filter
        const dateFilter = {};
        if (start_date && end_date) {
            dateFilter.date = {
                $gte: new Date(start_date),
                $lte: new Date(end_date)
            };
        }

        // Get grades for the student
        const grades = await Grade.find({
            student_id: student_id,
            ...dateFilter
        })
        .populate('group_id', 'name')
        .sort({ date: -1 });

        // Group grades by date
        const groupedGrades = grades.reduce((acc, grade) => {
            const date = grade.date.toISOString().split('T')[0];
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(grade);
            return acc;
        }, {});

        res.status(200).json({
            success: true,
            data: groupedGrades
        });
    } catch (error) {
        console.error('Error getting grades by student:', error);
        res.status(500).json({
            success: false,
            message: 'Baxolarni olishda xatolik yuz berdi'
        });
    }
}; 