const Position = require('../models/Position');
const Department = require('../models/Department');

// Get all positions with pagination and filters
exports.getAllPositions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.department_id) query.department_id = req.query.department_id;
    if (req.query.status) query.status = req.query.status;
    if (req.query.search) {
      query.name = { $regex: req.query.search, $options: 'i' };
    }

    const positions = await Position.find(query)
      .populate('department', 'name')
      .skip(skip)
      .limit(limit)
      .sort({ name: 1 });

    const total = await Position.countDocuments(query);

    res.json({
      success: true,
      data: positions,
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
};

// Get position by ID
exports.getPositionById = async (req, res) => {
  try {
    const position = await Position.findById(req.params.id)
      .populate('department', 'name');

    if (!position) {
      return res.status(404).json({
        success: false,
        message: 'Lavozim topilmadi'
      });
    }

    res.json({
      success: true,
      data: position
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Xatolik yuz berdi',
      error: error.message
    });
  }
};

// Create new position
exports.createPosition = async (req, res) => {
  try {
    const { name, description, department_id, status } = req.body;

    // Check if department exists if department_id is provided
    if (department_id) {
      const department = await Department.findById(department_id);
      if (!department) {
        return res.status(404).json({
          success: false,
          message: 'Bo\'lim topilmadi'
        });
      }
    }

    const position = await Position.create({
      name,
      description,
      department_id,
      status
    });

    res.status(201).json({
      success: true,
      message: 'Lavozim muvaffaqiyatli yaratildi',
      data: position
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Xatolik yuz berdi',
      error: error.message
    });
  }
};

// Update position
exports.updatePosition = async (req, res) => {
  try {
    const { name, description, department_id, status } = req.body;

    const position = await Position.findById(req.params.id);
    if (!position) {
      return res.status(404).json({
        success: false,
        message: 'Lavozim topilmadi'
      });
    }

    // Check if department exists if department_id is provided
    if (department_id) {
      const department = await Department.findById(department_id);
      if (!department) {
        return res.status(404).json({
          success: false,
          message: 'Bo\'lim topilmadi'
        });
      }
    }

    const updatedPosition = await Position.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        department_id,
        status
      },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Lavozim muvaffaqiyatli yangilandi',
      data: updatedPosition
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Xatolik yuz berdi',
      error: error.message
    });
  }
};

// Delete position
exports.deletePosition = async (req, res) => {
  try {
    const position = await Position.findById(req.params.id);
    if (!position) {
      return res.status(404).json({
        success: false,
        message: 'Lavozim topilmadi'
      });
    }

    await position.deleteOne();

    res.json({
      success: true,
      message: 'Lavozim muvaffaqiyatli o\'chirildi'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Xatolik yuz berdi',
      error: error.message
    });
  }
};

// update position status
exports.updatePositionStatus = async (req, res) => {
  try {
    const position = await Position.findById(req.params.id);
    if (!position) {
      return res.status(404).json({
        success: false,
        message: 'Lavozim topilmadi'
      });
    }

    position.status = req.body.status;
    await position.save();

    res.json({
      success: true,
      message: 'Lavozim statusi muvaffaqiyatli o\'zgartirildi'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Xatolik yuz berdi',
      error: error.message
    });
  }
};