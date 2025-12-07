const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Admin, UserType } = require('../models');

// Get all user types
exports.getUserTypes = async (req, res) => {
  try {
    const userTypes = await UserType.find().sort({ _id: 1 });

    console.log(`[GET USER TYPES] Retrieved ${userTypes.length} user types`);

    res.json({
      success: true,
      data: userTypes
    });
  } catch (error) {
    console.error('[GET USER TYPES ERROR]', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    const admin = await Admin.findOne({ username })
      .populate('user_type_id', 'name');

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    if (admin.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'Account is inactive'
      });
    }

    const isPasswordValid = await admin.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Create admin data object for token
    const adminData = {
      id: admin._id,
      first_name: admin.first_name,
      last_name: admin.last_name,
      username: admin.username,
      phone: admin.phone,
      user_type_id: admin.user_type_id._id,
      user_type: admin.user_type_id.name,
      status: admin.status,
      created_at: admin.created_at,
      updated_at: admin.updated_at
    };

    const token = jwt.sign(
      adminData,
      process.env.JWT_SECRET,
      { expiresIn: '365d' }
    );

    console.log(`[LOGIN] Admin ${admin.username} logged in successfully`);

    res.json({
      success: true,
      data: {
        token,
        user: adminData
      }
    });
  } catch (error) {
    console.error('[LOGIN ERROR]', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get all admins with pagination and filters
exports.getAllAdmins = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      user_type_id,
      sort_by = '_id',
      sort_order = 'asc'
    } = req.query;

    const skip = (page - 1) * limit;
    const query = {};

    // Search filter
    if (search) {
      query.$or = [
        { first_name: { $regex: search, $options: 'i' } },
        { last_name: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    // Status filter
    if (status) {
      query.status = status;
    }

    // User type filter
    if (user_type_id) {
      query.user_type_id = user_type_id;
    }

    // Validate sort_by
    const allowedSortFields = ['_id', 'first_name', 'last_name', 'username', 'status', 'created_at'];
    const finalSortBy = allowedSortFields.includes(sort_by) ? sort_by : '_id';

    // Validate sort_order
    const finalSortOrder = sort_order.toLowerCase() === 'desc' ? -1 : 1;

    const [admins, total] = await Promise.all([
      Admin.find(query)
        .populate('user_type_id', 'name')
        .select('-password')
        .sort({ [finalSortBy]: finalSortOrder })
        .skip(skip)
        .limit(parseInt(limit)),
      Admin.countDocuments(query)
    ]);

    console.log(`[GET ALL ADMINS] Retrieved ${admins.length} admins`);

    res.json({
      success: true,
      data: admins,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        total_pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('[GET ALL ADMINS ERROR]', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get single admin
exports.getAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const admin = await Admin.findById(id)
      .populate('user_type_id', 'name')
      .select('-password');

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    console.log(`[GET ADMIN] Retrieved admin with ID: ${id}`);

    res.json({
      success: true,
      data: admin
    });
  } catch (error) {
    console.error('[GET ADMIN ERROR]', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Create admin
exports.createAdmin = async (req, res) => {
  try {
    const { first_name, last_name, username, phone, password, user_type_id } = req.body;

    // Check if username or phone already exists
    const existingAdmin = await Admin.findOne({
      $or: [{ username }, { phone }]
    });

    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Username or phone number already exists'
      });
    }

    const admin = await Admin.create({
      first_name,
      last_name,
      username,
      phone,
      password,
      user_type_id,
      status: 'active'
    });

    console.log(`[CREATE ADMIN] Created new admin with username: ${username}`);

    res.status(201).json({
      success: true,
      data: admin
    });
  } catch (error) {
    console.error('[CREATE ADMIN ERROR]', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { new_password } = req.body;

    const admin = await Admin.findById(id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }
    admin.password = new_password;
    await admin.save();

    console.log(`[CHANGE PASSWORD] Changed password for admin with ID: ${id}`);

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('[CHANGE PASSWORD ERROR]', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update admin
exports.updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, username, phone, password, user_type_id, status } = req.body;

    // Check if admin exists
    const admin = await Admin.findById(id);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    // Check if username or phone is being changed and if they already exist
    if (username !== admin.username || phone !== admin.phone) {
      const existingAdmin = await Admin.findOne({
        _id: { $ne: id },
        $or: [{ username }, { phone }]
      });

      if (existingAdmin) {
        return res.status(400).json({
          success: false,
          message: 'Username or phone number already exists'
        });
      }
    }

    // Update fields
    if (first_name) admin.first_name = first_name;
    if (last_name) admin.last_name = last_name;
    if (username) admin.username = username;
    if (phone) admin.phone = phone;
    if (password) admin.password = password;
    if (user_type_id) admin.user_type_id = user_type_id;
    if (status) admin.status = status;

    await admin.save();

    console.log(`[UPDATE ADMIN] Updated admin with ID: ${id}`);

    res.json({
      success: true,
      data: admin
    });
  } catch (error) {
    console.error('[UPDATE ADMIN ERROR]', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Delete admin
exports.deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const admin = await Admin.findById(id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    await admin.softDelete();

    console.log(`[DELETE ADMIN] Deleted admin with ID: ${id}`);

    res.json({
      success: true,
      message: 'Admin deleted successfully'
    });
  } catch (error) {
    console.error('[DELETE ADMIN ERROR]', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update admin status
exports.updateAdminStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const admin = await Admin.findById(id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    admin.status = status;
    await admin.save();

    console.log(`[UPDATE ADMIN STATUS] Updated status for admin with ID: ${id}`);

    res.json({
      success: true,
      data: admin
    });
  } catch (error) {
    console.error('[UPDATE ADMIN STATUS ERROR]', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}; 