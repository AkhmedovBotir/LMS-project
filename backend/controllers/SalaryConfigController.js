const SalaryConfig = require('../models/SalaryConfig');
const Employee = require('../models/Employee');

// Get all salary configs with pagination and filters
exports.getAllSalaryConfigs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.employee_id) query.employee_id = req.query.employee_id;
    if (req.query.status) query.status = req.query.status;

    const configs = await SalaryConfig.find(query)
      .populate('employee_id', 'first_name last_name')
      .skip(skip)
      .limit(limit)
      .sort({ created_at: -1 });

    const total = await SalaryConfig.countDocuments(query);

    res.json({
      success: true,
      data: configs,
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

// Get salary config by ID
exports.getSalaryConfigById = async (req, res) => {
  try {
    const config = await SalaryConfig.findById(req.params.id)
      .populate('employee_id', 'first_name last_name');

    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Maosh konfiguratsiyasi topilmadi'
      });
    }

    res.json({
      success: true,
      data: config
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Xatolik yuz berdi',
      error: error.message
    });
  }
};

// Create new salary config
exports.createSalaryConfig = async (req, res) => {
  try {
    const { employee_id } = req.body;

    // Check if employee exists
    const employee = await Employee.findById(employee_id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Xodim topilmadi'
      });
    }

    // Check if config already exists for this employee
    const existingConfig = await SalaryConfig.findOne({ employee_id });
    if (existingConfig) {
      return res.status(400).json({
        success: false,
        message: 'Bu xodim uchun maosh konfiguratsiyasi allaqachon mavjud'
      });
    }

    const config = await SalaryConfig.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Maosh konfiguratsiyasi muvaffaqiyatli yaratildi',
      data: config
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Xatolik yuz berdi',
      error: error.message
    });
  }
};

// Update salary config
exports.updateSalaryConfig = async (req, res) => {
  try {
    const { employee_id } = req.body;

    // Check if config exists
    const config = await SalaryConfig.findById(req.params.id);
    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Maosh konfiguratsiyasi topilmadi'
      });
    }

    // Check if employee exists if being updated
    if (employee_id) {
      const employee = await Employee.findById(employee_id);
      if (!employee) {
        return res.status(404).json({
          success: false,
          message: 'Xodim topilmadi'
        });
      }

      // Check for duplicate config if employee is being updated
      const existingConfig = await SalaryConfig.findOne({
        employee_id,
        _id: { $ne: req.params.id }
      });

      if (existingConfig) {
        return res.status(400).json({
          success: false,
          message: 'Bu xodim uchun maosh konfiguratsiyasi allaqachon mavjud'
        });
      }
    }

    const updatedConfig = await SalaryConfig.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json({
      success: true,
      message: 'Maosh konfiguratsiyasi muvaffaqiyatli yangilandi',
      data: updatedConfig
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Xatolik yuz berdi',
      error: error.message
    });
  }
};

// Delete salary config
exports.deleteSalaryConfig = async (req, res) => {
  try {
    const config = await SalaryConfig.findById(req.params.id);
    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Maosh konfiguratsiyasi topilmadi'
      });
    }

    await config.deleteOne();

    res.json({
      success: true,
      message: 'Maosh konfiguratsiyasi muvaffaqiyatli o\'chirildi'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Xatolik yuz berdi',
      error: error.message
    });
  }
}; 