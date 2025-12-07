const CourseMaterial = require('../models/CourseMaterial');
const Course = require('../models/Course');
const Employee = require('../models/Employee');
const Topic = require('../models/Topic');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const CourseMaterialController = {
  // Get course materials
  async getByCourse(req, res) {
    try {
      const { course_id } = req.params;
      
      // Validate course_id
      if (!mongoose.Types.ObjectId.isValid(course_id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid course ID'
        });
      }

      const materials = await CourseMaterial.find({ course_id })
        .populate('topic_id', 'title')
        .populate('created_by', 'first_name last_name')
        .sort({ order: 1 });

      res.json({
        success: true,
        data: materials
      });
    } catch (error) {
      console.error('Error getting course materials:', error);
      res.status(500).json({
        success: false,
        message: 'Kurs materiallarini olishda xatolik yuz berdi'
      });
    }
  },

  // Create new material
  async create(req, res) {
    try {
      const {
        course_id,
        topic_id,
        type,
        description,
        order,
        created_by
      } = req.body;

      // Check if file is uploaded
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Fayl yuborilmadi'
        });
      }

      // Check if file type matches material type
      const allowedTypes = {
        'pdf': ['application/pdf'],
        'video': ['video/mp4', 'video/x-flv', 'video/x-m4v', 'video/x-matroska'],
        'image': ['image/jpeg', 'image/png', 'image/gif']
      };

      if (!allowedTypes[type].includes(req.file.mimetype)) {
        return res.status(400).json({
          success: false,
          message: `Noto'g'ri fayl turi. ${type} uchun quyidagi formatlar qabul qilinadi: ${allowedTypes[type].join(', ')}`
        });
      }

      // Save material
      const material = new CourseMaterial({
        course_id,
        topic,
        type,
        file: req.file.path,
        description,
        order: order || 0,
        created_by
      });

      await material.save();

      res.status(201).json({
        success: true,
        message: 'Material muvaffaqiyatli qo\'shildi',
        data: material
      });
    } catch (error) {
      console.error('Error creating course material:', error);
      res.status(500).json({
        success: false,
        message: 'Material qo\'shishda xatolik yuz berdi'
      });
    }
  },

  // Update material
  async update(req, res) {
    try {
      const { id } = req.params;
      const {
        topic,
        description,
        order,
        status
      } = req.body;

      const material = await CourseMaterial.findById(id);
      if (!material) {
        return res.status(404).json({
          success: false,
          message: 'Material topilmadi'
        });
      }

      // Update file if new file is uploaded
      if (req.file) {
        // Delete old file
        if (material.file && fs.existsSync(material.file)) {
          fs.unlinkSync(material.file);
        }

        // Update file path
        material.file = req.file.path;
      }

      // Update other fields
      material.topic = topic || material.topic;
      material.description = description || material.description;
      material.order = order || material.order;
      material.status = status || material.status;
      material.updated_by = req.body.updated_by;

      await material.save();

      res.json({
        success: true,
        message: 'Material muvaffaqiyatli yangilandi',
        data: material
      });
    } catch (error) {
      console.error('Error updating course material:', error);
      res.status(500).json({
        success: false,
        message: 'Material yangilashda xatolik yuz berdi'
      });
    }
  },

  // Delete material
  async delete(req, res) {
    try {
      const { id } = req.params;
      const material = await CourseMaterial.findById(id);

      if (!material) {
        return res.status(404).json({
          success: false,
          message: 'Material topilmadi'
        });
      }

      // Delete file
      if (material.file && fs.existsSync(material.file)) {
        fs.unlinkSync(material.file);
      }

      await material.deleteOne();

      res.json({
        success: true,
        message: 'Material muvaffaqiyatli o\'chirildi'
      });
    } catch (error) {
      console.error('Error deleting course material:', error);
      res.status(500).json({
        success: false,
        message: 'Material o\'chirishda xatolik yuz berdi'
      });
    }
  }
};

module.exports = CourseMaterialController;