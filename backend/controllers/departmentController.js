const Department = require('../models/Department');
const mongoose = require('mongoose');

// Get all departments with pagination and filters
const getAllDepartments = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      search
    } = req.query;

    const query = {};
    if (status) query.status = status;
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const [departments, count] = await Promise.all([
      Department.find(query)
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Department.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: departments,
      pagination: {
        total: count,
        page: parseInt(page),
        total_pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error getting departments:', error);
    res.status(500).json({
      success: false,
      message: 'Bo\'limlarni olishda xatolik yuz berdi'
    });
  }
};

// Get single department
const getDepartmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const department = await Department.findById(id)
      .populate('employees')
      .populate('positions');

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Bo\'lim topilmadi'
      });
    }

    res.json({
      success: true,
      data: department
    });
  } catch (error) {
    console.error('Error getting department:', error);
    res.status(500).json({
      success: false,
      message: 'Bo\'limni olishda xatolik yuz berdi'
    });
  }
};

// Create new department
const createDepartment = async (req, res) => {
  try {
    const { name, description } = req.body;

    // Check if department with same name exists
    const existingDepartment = await Department.findOne({ name });
    if (existingDepartment) {
      return res.status(400).json({
        success: false,
        message: 'Bu nomdagi bo\'lim allaqachon mavjud'
      });
    }

    const department = await Department.create({
      name,
      description
    });

    res.status(201).json({
      success: true,
      message: 'Bo\'lim muvaffaqiyatli yaratildi',
      data: department
    });
  } catch (error) {
    console.error('Error creating department:', error);
    res.status(500).json({
      success: false,
      message: 'Bo\'limni yaratishda xatolik yuz berdi'
    });
  }
};

// Update department
const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, status } = req.body;

    const department = await Department.findById(id);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Bo\'lim topilmadi'
      });
    }

    // If name is being changed, check for duplicates
    if (name && name !== department.name) {
      const existingDepartment = await Department.findOne({ name });
      if (existingDepartment) {
        return res.status(400).json({
          success: false,
          message: 'Bu nomdagi bo\'lim allaqachon mavjud'
        });
      }
    }

    if (name) department.name = name;
    if (description !== undefined) department.description = description;
    if (status) department.status = status;

    await department.save();

    res.json({
      success: true,
      message: 'Bo\'lim yangilandi',
      data: department
    });
  } catch (error) {
    console.error('Error updating department:', error);
    res.status(500).json({
      success: false,
      message: 'Bo\'limni yangilashda xatolik yuz berdi'
    });
  }
};

// Delete department
const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;

    const department = await Department.findById(id);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Bo\'lim topilmadi'
      });
    }

    // Check if department has any employees
    if (department.employees && department.employees.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Bu bo\'limda xodimlar mavjud. Avval xodimlarni boshqa bo\'limga ko\'chiring'
      });
    }

    // Check if department has any positions
    if (department.positions && department.positions.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Bu bo\'limda lavozimlar mavjud. Avval lavozimlarni o\'chiring'
      });
    }

    await department.deleteOne();

    res.json({
      success: true,
      message: 'Bo\'lim o\'chirildi'
    });
  } catch (error) {
    console.error('Error deleting department:', error);
    res.status(500).json({
      success: false,
      message: 'Bo\'limni o\'chirishda xatolik yuz berdi'
    });
  }
};

// Update department status
const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate ID
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid department ID'
      });
    }

    // Validate status
    if (!status || !['active', 'inactive'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either active or inactive'
      });
    }

    // Find and update department
    const department = await Department.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    console.log(`[UPDATE STATUS] Updated status for department with ID: ${id} to ${status}`);

    res.json({
      success: true,
      data: department
    });
  } catch (error) {
    console.error('[UPDATE STATUS ERROR]', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  updateStatus
}; 