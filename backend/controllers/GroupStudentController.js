const mongoose = require('mongoose');
const { GroupStudent, Group, Student, Course } = require('../models');

class GroupStudentController {
  // Get all group-student records with filters
  static async getAll(req, res) {
    try {
      const {
        group_id,
        student_id,
        status
      } = req.query;

      // Build filter conditions
      const query = {};
      if (group_id) query.group_id = group_id;
      if (student_id) query.student_id = student_id;
      if (status) query.status = status;

      // Get all group students with populated data
      const records = await GroupStudent.find(query)
        .populate({
          path: 'group_id',
          select: 'name course_id',
          populate: {
            path: 'course_id',
            select: 'name'
          }
        })
        .populate({
          path: 'student_id',
          select: 'first_name last_name phone'
        })
        .sort({ created_at: -1 });

      res.json({
        success: true,
        data: records
      });
    } catch (error) {
      console.error('Error fetching group students:', error);
      res.status(500).json({
        success: false,
        message: 'Guruh o\'quvchilarini olishda xatolik yuz berdi'
      });
    }
  }

  // Create new group-student record
  static async create(req, res) {
    try {
      const { group_id, student_id } = req.body;

      // Convert IDs to ObjectId
      const groupObjectId = new mongoose.Types.ObjectId(group_id);
      const studentObjectId = new mongoose.Types.ObjectId(student_id);

      // Check if record already exists
      const existingRecord = await GroupStudent.findOne({
        group_id: groupObjectId,
        student_id: studentObjectId,
        status: 'active'
      });

      if (existingRecord) {
        return res.status(400).json({
          success: false,
          message: 'O\'quvchi allaqachon bu guruhga qo\'shilgan'
        });
      }

      // Create record
      const groupStudent = await GroupStudent.create({
        group_id: groupObjectId,
        student_id: studentObjectId
      });

      // Get record with relations
      const recordWithRelations = await GroupStudent.findById(groupStudent._id)
        .populate({
          path: 'group_id',
          select: 'name',
          populate: {
            path: 'course_id',
            select: 'name'
          }
        })
        .populate('student_id', 'first_name last_name');

      res.status(201).json({
        success: true,
        data: recordWithRelations
      });
    } catch (error) {
      console.error('Error creating group-student record:', error);
      res.status(500).json({
        success: false,
        message: 'Guruh-o\'quvchi ma\'lumotini yaratishda xatolik yuz berdi'
      });
    }
  }

  // Get group-student by ID
  static async getById(req, res) {
    try {
      const record = await GroupStudent.findById(req.params.id)
        .populate({
          path: 'group_id',
          select: 'name',
          populate: {
            path: 'course_id',
            select: 'name'
          }
        })
        .populate('student_id', 'first_name last_name');

      if (!record) {
        return res.status(404).json({
          success: false,
          message: 'Guruh-o\'quvchi ma\'lumoti topilmadi'
        });
      }

      res.json({
        success: true,
        data: record
      });
    } catch (error) {
      console.error('Error getting group-student record:', error);
      res.status(500).json({
        success: false,
        message: 'Guruh-o\'quvchi ma\'lumotini olishda xatolik yuz berdi'
      });
    }
  }

  // Update group-student record
  static async update(req, res) {
    try {
      const { status } = req.body;
      const record = await GroupStudent.findById(req.params.id);

      if (!record) {
        return res.status(404).json({
          success: false,
          message: 'Guruh-o\'quvchi ma\'lumoti topilmadi'
        });
      }

      // Update record
      record.status = status;
      await record.save();

      // Get updated record with relations
      const updatedRecord = await GroupStudent.findById(record._id)
        .populate({
          path: 'group_id',
          select: 'name',
          populate: {
            path: 'course_id',
            select: 'name'
          }
        })
        .populate('student_id', 'first_name last_name');

      res.json({
        success: true,
        data: updatedRecord
      });
    } catch (error) {
      console.error('Error updating group-student record:', error);
      res.status(500).json({
        success: false,
        message: 'Guruh-o\'quvchi ma\'lumotini yangilashda xatolik yuz berdi'
      });
    }
  }

  // Delete group-student record
  static async delete(req, res) {
    try {
      const record = await GroupStudent.findById(req.params.id);

      if (!record) {
        return res.status(404).json({
          success: false,
          message: 'Guruh-o\'quvchi ma\'lumoti topilmadi'
        });
      }

      await GroupStudent.findByIdAndDelete(req.params.id);

      res.json({
        success: true,
        message: 'Guruh-o\'quvchi ma\'lumoti o\'chirildi'
      });
    } catch (error) {
      console.error('Error deleting group-student record:', error);
      res.status(500).json({
        success: false,
        message: 'Guruh-o\'quvchi ma\'lumotini o\'chirishda xatolik yuz berdi'
      });
    }
  }

  // Get all groups for a student
  static async getStudentGroups(req, res) {
    try {
      const { student_id } = req.params;
      const { status } = req.query;

      const query = { student_id };
      if (status) query.status = status;

      const records = await GroupStudent.find(query)
        .populate({
          path: 'group_id',
          select: 'name',
          populate: {
            path: 'course_id',
            select: 'name'
          }
        })
        .sort({ created_at: -1 });

      res.json({
        success: true,
        data: records
      });
    } catch (error) {
      console.error('Error getting student groups:', error);
      res.status(500).json({
        success: false,
        message: 'O\'quvchining guruhlarini olishda xatolik yuz berdi'
      });
    }
  }

  // Get all students in a group
  static async getGroupStudents(req, res) {
    try {
      const { group_id } = req.params;
      const { status } = req.query;

      const query = { group_id };
      if (status) query.status = status;

      const records = await GroupStudent.find(query)
        .populate('student_id', 'first_name last_name')
        .sort({ created_at: -1 });

      res.json({
        success: true,
        data: records
      });
    } catch (error) {
      console.error('Error getting group students:', error);
      res.status(500).json({
        success: false,
        message: 'Guruh o\'quvchilarini olishda xatolik yuz berdi'
      });
    }
  }

  // Get all group students with pagination and filters
  static async getAllGroupStudents(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const query = {};
      if (req.query.group_id) query.group_id = req.query.group_id;
      if (req.query.student_id) query.student_id = req.query.student_id;
      if (req.query.status) query.status = req.query.status;

      const groupStudents = await GroupStudent.find(query)
        .populate('group', 'name')
        .populate('student', 'first_name last_name')
        .skip(skip)
        .limit(limit)
        .sort({ joined_at: -1 });

      const total = await GroupStudent.countDocuments(query);

      res.json({
        success: true,
        data: groupStudents,
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

  // Get group student by ID
  static async getGroupStudentById(req, res) {
    try {
      const groupStudent = await GroupStudent.findById(req.params.id)
        .populate('group', 'name')
        .populate('student', 'first_name last_name');

      if (!groupStudent) {
        return res.status(404).json({
          success: false,
          message: 'Guruh o\'quvchisi topilmadi'
        });
      }

      res.json({
        success: true,
        data: groupStudent
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Xatolik yuz berdi',
        error: error.message
      });
    }
  }

  // Add student to group
  static async addStudentToGroup(req, res) {
    try {
      const { group_id, student_id } = req.body;

      // Check if group exists
      const group = await Group.findById(group_id);
      if (!group) {
        return res.status(404).json({
          success: false,
          message: 'Guruh topilmadi'
        });
      }

      // Check if student exists
      const student = await Student.findById(student_id);
      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'O\'quvchi topilmadi'
        });
      }

      // Check if student is already in the group
      const existingGroupStudent = await GroupStudent.findOne({
        group_id,
        student_id,
        status: 'active'
      });

      if (existingGroupStudent) {
        return res.status(400).json({
          success: false,
          message: 'O\'quvchi allaqachon bu guruhda'
        });
      }

      const groupStudent = await GroupStudent.create({
        group_id,
        student_id,
        joined_at: new Date()
      });

      res.status(201).json({
        success: true,
        message: 'O\'quvchi guruhga muvaffaqiyatli qo\'shildi',
        data: groupStudent
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Xatolik yuz berdi',
        error: error.message
      });
    }
  }

  // Update group student status
  static async updateGroupStudentStatus(req, res) {
    try {
      const { status } = req.body;

      const groupStudent = await GroupStudent.findById(req.params.id);
      if (!groupStudent) {
        return res.status(404).json({
          success: false,
          message: 'Guruh o\'quvchisi topilmadi'
        });
      }

      const updatedGroupStudent = await GroupStudent.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true, runValidators: true }
      );

      res.json({
        success: true,
        message: 'Guruh o\'quvchisi statusi muvaffaqiyatli yangilandi',
        data: updatedGroupStudent
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Xatolik yuz berdi',
        error: error.message
      });
    }
  }

  // Remove student from group
  static async removeStudentFromGroup(req, res) {
    try {
      const groupStudent = await GroupStudent.findById(req.params.id);
      if (!groupStudent) {
        return res.status(404).json({
          success: false,
          message: 'Guruh o\'quvchisi topilmadi'
        });
      }

      await groupStudent.deleteOne();

      res.json({
        success: true,
        message: 'O\'quvchi guruhdan muvaffaqiyatli olib tashlandi'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Xatolik yuz berdi',
        error: error.message
      });
    }
  }
}

module.exports = GroupStudentController; 