const { Group, Course, Employee, Student, GroupStudent } = require('../models');
const mongoose = require('mongoose');

class GroupController {
  // Get all groups with filters and pagination
  static async getAll(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        course_id,
        teacher_id,
        status,
        start_date,
        end_date
      } = req.query;

      // Build filter conditions
      const query = {};
      
      if (search) {
        query.name = { $regex: search, $options: 'i' };
      }

      if (course_id && mongoose.Types.ObjectId.isValid(course_id)) query.course_id = course_id;
      if (teacher_id) query.teacher_id = teacher_id;
      if (status) query.status = status;
      
      if (start_date || end_date) {
        query.$and = [];
        if (start_date) {
          query.$and.push({ start_date: { $gte: new Date(start_date) } });
        }
        if (end_date) {
          query.$and.push({ end_date: { $lte: new Date(end_date) } });
        }
    }

      // Calculate skip
      const skip = (page - 1) * limit;

      // Get groups with pagination
      const [groups, total] = await Promise.all([
        Group.find(query)
          .populate('course_id', 'name')
          .populate('teacher_id', 'first_name last_name')
          .populate({
            path: 'students',
            match: { status: 'active' },
            select: 'first_name last_name'
          })
          .sort({ created_at: -1 })
          .skip(skip)
          .limit(parseInt(limit)),
        Group.countDocuments(query)
      ]);

      // Calculate total pages
      const total_pages = Math.ceil(total / limit);

      res.json({
        success: true,
        data: groups,
        pagination: {
          total,
          page: parseInt(page),
          total_pages,
          limit: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Error getting groups:', error);
      res.status(500).json({
        success: false,
        message: 'Guruhlarni olishda xatolik yuz berdi'
      });
    }
  }

  // Create new group
  static async create(req, res) {
    try {
      const {
        name,
        time,
        days,
        course_id,
        teacher_id,
        start_date,
        end_date,
        status,
        tarif_type
      } = req.body;

      // Convert IDs to ObjectId
      const courseObjectId = new mongoose.Types.ObjectId(course_id);
      const teacherObjectId = new mongoose.Types.ObjectId(teacher_id);

      // Validate course
      const course = await Course.findById(courseObjectId);
      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Kurs topilmadi'
        });
      }

      // Validate teacher
      const teacher = await Employee.findById(teacherObjectId);
      if (!teacher) {
        return res.status(404).json({
          success: false,
          message: 'O\'qituvchi topilmadi'
        });
      }

      // Create group
      const group = await Group.create({
        name,
        time,
        days,
        course_id: courseObjectId,
        teacher_id: teacherObjectId,
        start_date: start_date ? new Date(start_date) : null,
        end_date: end_date ? new Date(end_date) : null,
        status,
        tarif_type
      });

      // Get group with relations
      const groupWithRelations = await Group.findById(group._id)
        .populate('course_id', 'name')
        .populate('teacher_id', 'first_name last_name');

      res.status(201).json({
        success: true,
        data: groupWithRelations
      });
    } catch (error) {
      console.error('Error creating group:', error);
      res.status(500).json({
        success: false,
        message: 'Guruh yaratishda xatolik yuz berdi'
      });
    }
  }

// Get group by ID
  static async getById(req, res) {
    try {
      // Validate that the ID is a valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid group ID'
        });
      }

      const group = await Group.findById(req.params.id)
        .populate('course_id', 'name')
        .populate('teacher_id', 'first_name last_name')
        .populate({
          path: 'students',
          match: { status: 'active' },
          select: 'first_name last_name payment_status'
        });

      if (!group) {
        return res.status(404).json({
          success: false,
          message: 'Guruh topilmadi'
        });
    }

      res.json({
        success: true,
        data: group
      });
  } catch (error) {
      console.error('Error getting group:', error);
      res.status(500).json({
        success: false,
        message: 'Guruh ma\'lumotlarini olishda xatolik yuz berdi'
      });
  }
  }

// Update group
  static async update(req, res) {
  try {
      const {
        name,
        time,
        days,
        course_id,
        teacher_id,
        start_date,
        end_date,
        status,
        tarif_type
      } = req.body;

      const group = await Group.findById(req.params.id);

    if (!group) {
        return res.status(404).json({
          success: false,
          message: 'Guruh topilmadi'
        });
    }

      // Update fields
      if (name) group.name = name;
      if (time) group.time = time;
      if (days) group.days = days;
      if (course_id) group.course_id = course_id;
      if (teacher_id) group.teacher_id = teacher_id;
      if (start_date) group.start_date = new Date(start_date);
      if (end_date) group.end_date = new Date(end_date);
      if (status) group.status = status;
      if (tarif_type) group.tarif_type = tarif_type;

      await group.save();

      // Get updated group with relations
      const updatedGroup = await Group.findById(group._id)
        .populate('course_id', 'name')
        .populate('teacher_id', 'first_name last_name');

      res.json({
        success: true,
        data: updatedGroup
      });
  } catch (error) {
    console.error('Error updating group:', error);
      res.status(500).json({
        success: false,
        message: 'Guruhni yangilashda xatolik yuz berdi'
      });
  }
  }

// Delete group
  static async delete(req, res) {
  try {
      const group = await Group.findById(req.params.id);

    if (!group) {
        return res.status(404).json({
          success: false,
          message: 'Guruh topilmadi'
        });
    }

      await Group.findByIdAndDelete(req.params.id);

      res.json({
        success: true,
        message: 'Guruh muvaffaqiyatli o\'chirildi'
      });
  } catch (error) {
    console.error('Error deleting group:', error);
      res.status(500).json({
        success: false,
        message: 'Guruhni o\'chirishda xatolik yuz berdi'
      });
    }
  }

  // Add student to group
  static async addStudent(req, res) {
    try {
      const { group_id, student_id } = req.body;

      // Check if student is already in the group
      const existingRecord = await GroupStudent.findOne({
          group_id,
          student_id,
          status: 'active'
      });

      if (existingRecord) {
        return res.status(400).json({
          success: false,
          message: 'O\'quvchi allaqachon bu guruhga qo\'shilgan'
        });
      }

      // Create group-student record
      const groupStudent = await GroupStudent.create({
        group_id,
        student_id
      });

      res.status(201).json({
        success: true,
        data: groupStudent
      });
    } catch (error) {
      console.error('Error adding student to group:', error);
      res.status(500).json({
        success: false,
        message: 'O\'quvchini guruhga qo\'shishda xatolik yuz berdi'
      });
    }
  }

  // Remove student from group
  static async removeStudent(req, res) {
    try {
      const { group_id, student_id } = req.body;

      const groupStudent = await GroupStudent.findOne({
          group_id,
          student_id,
          status: 'active'
      });

      if (!groupStudent) {
        return res.status(404).json({
          success: false,
          message: 'O\'quvchi guruhda topilmadi'
        });
      }

      groupStudent.status = 'inactive';
      await groupStudent.save();

      res.json({
        success: true,
        message: 'O\'quvchi guruhdan muvaffaqiyatli olib tashlandi'
      });
    } catch (error) {
      console.error('Error removing student from group:', error);
      res.status(500).json({
        success: false,
        message: 'O\'quvchini guruhdan olib tashlashda xatolik yuz berdi'
      });
    }
  }

  // Get all students in a group
  static async getStudents(req, res) {
    try {
      const { group_id } = req.params;
      const { status } = req.query;

      const query = { group_id };
      if (status) query.status = status;

      const groupStudents = await GroupStudent.find(query)
        .populate('student_id', 'first_name last_name payment_status')
        .sort({ created_at: -1 });

      res.json({
        success: true,
        data: groupStudents
      });
    } catch (error) {
      console.error('Error getting group students:', error);
      res.status(500).json({
        success: false,
        message: 'Guruh o\'quvchilarini olishda xatolik yuz berdi'
      });
    }
  }

  // Move student from one group to another (automatic transfer)
  static async moveStudentToAnotherGroup(req, res) {
    try {
      const { student_id, from_group_id, to_group_id } = req.body;
      if (!student_id || !from_group_id || !to_group_id) {
        return res.status(400).json({ success: false, message: 'student_id, from_group_id, to_group_id majburiy' });
      }
      // Archive old GroupStudent
      const oldGS = await GroupStudent.findOne({ student_id, group_id: from_group_id, status: 'active' });
      if (oldGS) {
        oldGS.status = 'archived';
        oldGS.completed_at = new Date();
        oldGS.finished_reason = 'moved_to_another_group';
        await oldGS.save();
      }
      // Create new GroupStudent for new group
      const newGS = await GroupStudent.create({
        student_id,
        group_id: to_group_id,
        status: 'active',
        joined_at: new Date()
      });
      res.json({
        success: true,
        message: 'O\'quvchi yangi guruhga o\'tkazildi, eski guruh arxivlandi',
        data: { old_group_student: oldGS, new_group_student: newGS }
      });
    } catch (error) {
      console.error('Error moving student:', error);
      res.status(500).json({ success: false, message: 'O\'quvchini guruhdan guruhga o\'tkazishda xatolik yuz berdi' });
    }
  }

  // Mark group as finished
  static async finishGroup(req, res) {
    try {
      const { id } = req.params;
      const group = await Group.findById(id);
      if (!group) {
        return res.status(404).json({ success: false, message: 'Guruh topilmadi' });
      }
      
      // Update all required fields
      group.status = 'completed';
      group.finished_at = new Date();
      
      // If tarif_type is not set, use the default value
      if (!group.tarif_type) {
        group.tarif_type = 'standart'; // Default to 'standart' if not set
      }
      
      await group.save();
      res.json({ success: true, message: 'Guruh tugatildi', data: group });
    } catch (error) {
      console.error('Error finishing group:', error);
      res.status(500).json({ success: false, message: 'Guruhni tugatishda xatolik yuz berdi' });
    }
  }

  // Get only active (not completed) groups
  static async getActiveGroups(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        course_id,
        teacher_id,
        status,
        search
      } = req.query;

      // Build filter conditions
      const query = { status: { $ne: 'completed' } };
      if (search) query.name = { $regex: search, $options: 'i' };
      if (course_id && mongoose.Types.ObjectId.isValid(course_id)) query.course_id = course_id;
      if (teacher_id) query.teacher_id = teacher_id;
      if (status) query.status = status;

      const skip = (page - 1) * limit;
      const [groups, total] = await Promise.all([
        Group.find(query)
          .populate('course_id', 'name')
          .populate('teacher_id', 'first_name last_name')
          .sort({ created_at: -1 })
          .skip(skip)
          .limit(parseInt(limit)),
        Group.countDocuments(query)
      ]);
      const total_pages = Math.ceil(total / limit);
      res.json({
        success: true,
        data: groups,
        pagination: {
          total,
          page: parseInt(page),
          total_pages,
          limit: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Error getting active groups:', error);
      res.status(500).json({ success: false, message: 'Faol guruhlarni olishda xatolik yuz berdi' });
    }
  }

  // Get only archived (completed) groups
  static async getArchivedGroups(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        course_id,
        teacher_id,
        search
      } = req.query;

      // Build filter conditions
      const query = { status: 'completed' };
      if (search) query.name = { $regex: search, $options: 'i' };
      if (course_id && mongoose.Types.ObjectId.isValid(course_id)) query.course_id = course_id;
      if (teacher_id) query.teacher_id = teacher_id;

      const skip = (page - 1) * limit;
      const [groups, total] = await Promise.all([
        Group.find(query)
          .populate('course_id', 'name')
          .populate('teacher_id', 'first_name last_name')
          .sort({ created_at: -1 })
          .skip(skip)
          .limit(parseInt(limit)),
        Group.countDocuments(query)
      ]);
      const total_pages = Math.ceil(total / limit);
      res.json({
        success: true,
        data: groups,
        pagination: {
          total,
          page: parseInt(page),
          total_pages,
          limit: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Error getting archived groups:', error);
      res.status(500).json({ success: false, message: 'Arxiv guruhlarni olishda xatolik yuz berdi' });
    }
  }
}

module.exports = GroupController; 