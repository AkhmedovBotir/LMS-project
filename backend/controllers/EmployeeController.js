const Employee = require('../models/Employee');
const Department = require('../models/Department');
const Position = require('../models/Position');
const UserType = require('../models/UserType');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Get all employees with pagination and filters
exports.getAllEmployees = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      department_id,
      position_id,
      role,
      status,
      search
    } = req.query;

    const query = {};
    if (department_id) query.department_id = department_id;
    if (position_id) query.position_id = position_id;
    if (role) query.role = role;
    if (status) query.status = status;
    
    if (search) {
      query.$or = [
        { first_name: { $regex: search, $options: 'i' } },
        { last_name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const [employees, count] = await Promise.all([
      Employee.find(query)
        .populate('department_id', 'name')
        .populate('position_id', 'name')
        .populate('role', 'name')
        .select('-password')
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Employee.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: employees,
      pagination: {
        total: count,
        page: parseInt(page),
        total_pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error getting employees:', error);
    res.status(500).json({
      success: false,
      message: 'Xodimlarni olishda xatolik yuz berdi'
    });
  }
};

// Get single employee
exports.getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findById(id)
      .populate('department_id', 'name')
      .populate('position_id', 'name')
      .populate('role', 'name')
      .select('-password');

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Xodim topilmadi'
      });
    }

    res.json({
      success: true,
      data: employee
    });
  } catch (error) {
    console.error('Error getting employee:', error);
    res.status(500).json({
      success: false,
      message: 'Xodimni olishda xatolik yuz berdi'
    });
  }
};

// Create new employee
exports.createEmployee = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      phone,
      username,
      password,
      role,
      id_number,
      birth_date,
      hire_date,
      address,
      department_id,
      position_id
    } = req.body;

    // Validate department
    const department = await Department.findById(department_id);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Bo\'lim topilmadi'
      });
    }

    // Validate position
    const position = await Position.findById(position_id);
    if (!position) {
      return res.status(404).json({
        success: false,
        message: 'Lavozim topilmadi'
      });
    }

    // Validate user type
    const userType = await UserType.findOne({ name: role });
    if (!userType) {
      return res.status(404).json({
        success: false,
        message: 'Foydalanuvchi turi topilmadi'
      });
    }

    // Check if username exists
    const existingUsername = await Employee.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({
        success: false,
        message: 'Bu login allaqachon mavjud'
      });
    }

    // Check if phone exists
    const existingPhone = await Employee.findOne({ phone });
    if (existingPhone) {
      return res.status(400).json({
        success: false,
        message: 'Bu telefon raqami allaqachon mavjud'
      });
    }

    // Check if ID number exists
    const existingIdNumber = await Employee.findOne({ id_number });
    if (existingIdNumber) {
      return res.status(400).json({
        success: false,
        message: 'Bu ID raqami allaqachon mavjud'
      });
    }

    // Create new employee instance
    const employee = new Employee({
      first_name,
      last_name,
      phone,
      username,
      password,
      role: userType._id,
      id_number,
      birth_date,
      hire_date,
      address,
      department_id,
      position_id
    });

    // Save employee (this will trigger the pre-save middleware)
    await employee.save();

    // Remove password from response
    const employeeResponse = employee.toObject();
    delete employeeResponse.password;

    res.status(201).json({
      success: true,
      message: 'Xodim muvaffaqiyatli yaratildi',
      data: employeeResponse
    });
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({
      success: false,
      message: 'Xodimni yaratishda xatolik yuz berdi'
    });
  }
};

// Update employee
exports.updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      first_name,
      last_name,
      phone,
      username,
      password,
      role,
      id_number,
      birth_date,
      hire_date,
      address,
      department_id,
      position_id,
      status
    } = req.body;

    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Xodim topilmadi'
      });
    }

    // If department is being changed, validate new department
    if (department_id && department_id !== employee.department_id.toString()) {
      const department = await Department.findById(department_id);
      if (!department) {
        return res.status(404).json({
          success: false,
          message: 'Bo\'lim topilmadi'
        });
      }
    }

    // If position is being changed, validate new position
    if (position_id && position_id !== employee.position_id.toString()) {
      const position = await Position.findById(position_id);
      if (!position) {
        return res.status(404).json({
          success: false,
          message: 'Lavozim topilmadi'
        });
      }
    }

    // If role is being changed, validate new role
    if (role) {
      const userType = await UserType.findOne({ name: role });
      if (!userType) {
        return res.status(404).json({
          success: false,
          message: 'Foydalanuvchi turi topilmadi'
        });
      }
      employee.role = userType._id;
    }

    // If username is being changed, check for duplicates
    if (username && username !== employee.username) {
      const existingUsername = await Employee.findOne({ username });
      if (existingUsername) {
        return res.status(400).json({
          success: false,
          message: 'Bu login allaqachon mavjud'
        });
      }
    }

    // If phone is being changed, check for duplicates
    if (phone && phone !== employee.phone) {
      const existingPhone = await Employee.findOne({ phone });
      if (existingPhone) {
        return res.status(400).json({
          success: false,
          message: 'Bu telefon raqami allaqachon mavjud'
        });
      }
    }

    // If ID number is being changed, check for duplicates
    if (id_number && id_number !== employee.id_number) {
      const existingIdNumber = await Employee.findOne({ id_number });
      if (existingIdNumber) {
        return res.status(400).json({
          success: false,
          message: 'Bu ID raqami allaqachon mavjud'
        });
      }
    }

    // Update fields
    if (first_name) employee.first_name = first_name;
    if (last_name) employee.last_name = last_name;
    if (phone) employee.phone = phone;
    if (username) employee.username = username;
    if (id_number) employee.id_number = id_number;
    if (birth_date) employee.birth_date = birth_date;
    if (hire_date) employee.hire_date = hire_date;
    if (address) employee.address = address;
    if (department_id) employee.department_id = department_id;
    if (position_id) employee.position_id = position_id;
    if (status) employee.status = status;

    // Update password if provided
    if (password) {
      employee.password = password; // pre-save middleware will hash this
    }

    // Save the employee (this will trigger the pre-save middleware)
    await employee.save();

    // Remove password from response
    const employeeResponse = employee.toObject();
    delete employeeResponse.password;

    res.json({
      success: true,
      message: 'Xodim yangilandi',
      data: employeeResponse
    });
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({
      success: false,
      message: 'Xodimni yangilashda xatolik yuz berdi'
    });
  }
};

// Delete employee
exports.deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Xodim topilmadi'
      });
    }

    // Check if employee has any resumes
    if (employee.resumes && employee.resumes.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Bu xodimda rezyumelar mavjud. Avval rezyumelarni o\'chiring'
      });
    }

    // Check if employee has any attendance records
    if (employee.attendances && employee.attendances.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Bu xodimda davomat yozuvlari mavjud. Avval davomat yozuvlarini o\'chiring'
      });
    }

    await employee.deleteOne();

    res.json({
      success: true,
      message: 'Xodim o\'chirildi'
    });
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({
      success: false,
      message: 'Xodimni o\'chirishda xatolik yuz berdi'
    });
  }
};

// Get employee attendance
exports.getAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { start_date, end_date } = req.query;

    const query = { employee_id: id };
    if (start_date && end_date) {
      query.date = {
        $gte: new Date(start_date),
        $lte: new Date(end_date)
      };
    }

    const attendance = await Attendance.find(query)
      .sort({ date: -1 });

    res.json({
      success: true,
      data: attendance
    });
  } catch (error) {
    console.error('Error fetching employee attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching employee attendance',
      error: error.message
    });
  }
};

// Get employee groups
exports.getGroups = async (req, res) => {
  try {
    const { id } = req.params;
    const groups = await Group.find({ teacher_id: id })
      .populate('course_id', 'name')
      .sort({ created_at: -1 });

    res.json({
      success: true,
      data: groups
    });
  } catch (error) {
    console.error('Error fetching employee groups:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching employee groups',
      error: error.message
    });
  }
};

// Update employee status
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either active or inactive'
      });
    }

    employee.status = status;
    await employee.save();

    // Remove password from response
    const employeeData = employee.toObject();
    delete employeeData.password;

    res.json({
      success: true,
      data: employeeData
    });
  } catch (error) {
    console.error('Error updating employee status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating employee status',
      error: error.message
    });
  }
};

// Employee login
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate required fields
    if (!username || !password) {
      return res.status(400).json({ message: 'Username va parol kiritilishi shart' });
    }

    // Find employee by username
    const employee = await Employee.findOne({ username })
      .populate('department_id', 'name')
      .populate('position_id', 'name')
      .populate('role', 'name');

    // Check if employee exists
    if (!employee) {
      return res.status(401).json({ message: 'Noto\'g\'ri username yoki parol' });
    }

    // Debug logging
    console.log('Input password:', password);
    console.log('Stored hashed password:', employee.password);

    // Check if password is correct
    const isValidPassword = await bcrypt.compare(password, employee.password);
    console.log('Password comparison result:', isValidPassword);

    if (!isValidPassword) {
      return res.status(401).json({ message: 'Noto\'g\'ri username yoki parol' });
    }

    // Check if employee is active
    if (employee.status !== 'active') {
      return res.status(403).json({ message: 'Hisobingiz faol emas' });
    }

    // Prepare employee data for token
    const employeeData = employee.toObject();
    delete employeeData.password;

    // Generate JWT token with employee data
    const token = jwt.sign(
      {
        ...employeeData,
        role: 'employee'
      },
      process.env.JWT_SECRET,
      { expiresIn: '365d' }
    );

    res.json({
      message: 'Muvaffaqiyatli kirildi',
      data: { token }
    });
  } catch (error) {
    console.error('Error in employee login:', error);
    res.status(500).json({ message: 'Kirishda xatolik yuz berdi' });
  }
}; 