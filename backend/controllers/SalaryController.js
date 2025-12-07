const { Salary, SalaryConfig, Employee, Student, Payment, GroupStudent, Group } = require('../models');

// ============= SALARY CONFIG CRUD =============

// Get all salary configs with pagination and filters
exports.getSalaryConfigs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      employee_id,
      status,
      search
    } = req.query;

    const query = {};
    if (employee_id) query.employee_id = employee_id;
    if (status) query.status = status;

    const skip = (page - 1) * limit;

    // Build employee search query if search term provided
    let employeeQuery = {};
    if (search) {
      employeeQuery = {
        $or: [
          { first_name: { $regex: search, $options: 'i' } },
          { last_name: { $regex: search, $options: 'i' } }
          ]
      };
    }

    const [configs, count] = await Promise.all([
      SalaryConfig.find(query)
        .populate({
          path: 'employee_id',
          match: employeeQuery,
          select: 'first_name last_name'
        })
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      SalaryConfig.countDocuments(query)
    ]);

    // Filter out configs where employee doesn't match search
    const filteredConfigs = configs.filter(config => config.employee_id);

    res.json({
      success: true,
      data: filteredConfigs,
      pagination: {
        total: count,
        page: parseInt(page),
        total_pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error getting salary configs:', error);
    res.status(500).json({
      success: false,
      message: 'Oylik konfiguratsiyalarini olishda xatolik yuz berdi'
    });
  }
};

// Get single salary config by ID
exports.getSalaryConfigById = async (req, res) => {
  try {
    const { id } = req.params;

    const config = await SalaryConfig.findById(id)
      .populate('employee_id', 'first_name last_name');

    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Oylik konfiguratsiyasi topilmadi'
      });
    }

    res.json({
      success: true,
      data: config
    });
  } catch (error) {
    console.error('Error getting salary config:', error);
    res.status(500).json({
      success: false,
      message: 'Oylik konfiguratsiyasini olishda xatolik yuz berdi'
    });
  }
};

// Create/Update salary config
exports.updateSalaryConfig = async (req, res) => {
  try {
    const { employee_id, base_salary, student_percentage } = req.body;

    // Validate employee
    const employee = await Employee.findById(employee_id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Xodim topilmadi'
      });
    }

    // Deactivate old config if exists
    await SalaryConfig.updateMany(
      { employee_id, status: 'active' },
      { status: 'inactive' }
    );

    // Create new config
    const config = await SalaryConfig.create({
      employee_id,
      base_salary: base_salary || null,
      student_percentage: student_percentage || null,
      status: 'active'
    });

    res.status(201).json({
      success: true,
      message: 'Oylik konfiguratsiyasi yaratildi',
      data: config
    });
  } catch (error) {
    console.error('Error creating salary config:', error);
    res.status(500).json({
      success: false,
      message: 'Oylik konfiguratsiyasini saqlashda xatolik yuz berdi'
    });
  }
};

// Delete salary config (soft delete by setting status to inactive)
exports.deleteSalaryConfig = async (req, res) => {
  try {
    const { id } = req.params;

    const config = await SalaryConfig.findById(id);
    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Oylik konfiguratsiyasi topilmadi'
      });
    }

    config.status = 'inactive';
    await config.save();

    res.json({
      success: true,
      message: 'Oylik konfiguratsiyasi o\'chirildi'
    });
  } catch (error) {
    console.error('Error deleting salary config:', error);
    res.status(500).json({
      success: false,
      message: 'Oylik konfiguratsiyasini o\'chirishda xatolik yuz berdi'
    });
  }
};

// Edit salary config
exports.editSalaryConfig = async (req, res) => {
  try {
    const { id } = req.params;
    const { base_salary, student_percentage } = req.body;

    const config = await SalaryConfig.findById(id);
    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Oylik konfiguratsiyasi topilmadi'
      });
    }

    if (config.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Faqat faol konfiguratsiyani tahrirlash mumkin'
      });
    }

    if (base_salary !== undefined) config.base_salary = base_salary;
    if (student_percentage !== undefined) config.student_percentage = student_percentage;

    await config.save();

    res.json({
      success: true,
      message: 'Oylik konfiguratsiyasi yangilandi',
      data: config
    });
  } catch (error) {
    console.error('Error editing salary config:', error);
    res.status(500).json({
      success: false,
      message: 'Oylik konfiguratsiyasini yangilashda xatolik yuz berdi'
    });
  }
};

// ============= SALARY CRUD =============

// Get all salaries with pagination and filters
exports.getSalaries = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      employee_id,
      start_date,
      end_date,
      status,
      search
    } = req.query;

    const query = {};
    if (employee_id) query.employee_id = employee_id;
    if (status) query.status = status;
    
    if (start_date || end_date) {
      query.month = {};
      if (start_date) query.month.$gte = new Date(start_date);
      if (end_date) query.month.$lte = new Date(end_date);
    }

    const skip = (page - 1) * limit;

    // Build employee search query if search term provided
    let employeeQuery = {};
    if (search) {
      employeeQuery = {
        $or: [
          { first_name: { $regex: search, $options: 'i' } },
          { last_name: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const [salaries, count] = await Promise.all([
      Salary.find(query)
        .populate({
          path: 'employee_id',
          match: employeeQuery,
          select: 'first_name last_name'
        })
        .sort({ month: -1 })
      .skip(skip)
        .limit(parseInt(limit)),
      Salary.countDocuments(query)
    ]);

    // Filter out salaries where employee doesn't match search
    const filteredSalaries = salaries.filter(salary => salary.employee_id);

    res.json({
      success: true,
      data: filteredSalaries,
      pagination: {
        total: count,
        page: parseInt(page),
        total_pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error getting salaries:', error);
    res.status(500).json({
      success: false,
      message: 'Oyliklarni olishda xatolik yuz berdi'
    });
  }
};

// Get single salary by ID
exports.getSalaryById = async (req, res) => {
  try {
    const { id } = req.params;

    const salary = await Salary.findById(id)
      .populate('employee_id', 'first_name last_name');

    if (!salary) {
      return res.status(404).json({
        success: false,
        message: 'Oylik topilmadi'
      });
    }

    res.json({
      success: true,
      data: salary
    });
  } catch (error) {
    console.error('Error getting salary:', error);
    res.status(500).json({
      success: false,
      message: 'Oylikni olishda xatolik yuz berdi'
    });
  }
};

// Calculate salary
exports.calculateSalary = async (req, res) => {
  try {
    const { employee_id, month } = req.body;

    // Validate employee
    const employee = await Employee.findById(employee_id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Xodim topilmadi'
      });
    }

    // Get active salary config
    const config = await SalaryConfig.findOne({
      employee_id,
      status: 'active'
    });

    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Xodim uchun oylik konfiguratsiyasi topilmadi'
      });
    }

    // Validate salary configuration
    if (!config.base_salary && !config.student_percentage) {
      return res.status(400).json({
        success: false,
        message: 'Xodim uchun oylik miqdori yoki foiz belgilanmagan'
      });
    }

    // Calculate period - validate and use current month if date is invalid or future
    const today = new Date();
    let targetMonth;
    
    if (month) {
      targetMonth = new Date(month);
      // Check if date is valid and not in future
      if (isNaN(targetMonth.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Noto\'g\'ri sana formati'
        });
      }
      // If future date, return error
      if (targetMonth > today) {
        return res.status(400).json({
          success: false,
          message: 'Kelajak oy uchun hisob-kitob qilib bo\'lmaydi'
        });
      }
    } else {
      targetMonth = today;
    }
    
    // Set to first day of month
    const startDate = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 1);
    startDate.setHours(0, 0, 0, 0);

    // Set to last day of month
    const endDate = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0);
    endDate.setHours(23, 59, 59, 999);

    let percentageAmount = 0;
    let baseAmount = config.base_salary || 0;

    // Calculate percentage from student payments if configured
    if (config.student_percentage) {
      // First get all active groups of the teacher
      const teacherGroups = await Group.find({ 
        teacher_id: employee_id,
        status: 'active'
      });

      const studentIds = [];
      for (const group of teacherGroups) {
        const groupStudents = await GroupStudent.find({
          group_id: group._id,
          status: 'active'
        }).populate('student_id', 'first_name last_name');

        groupStudents.forEach(gs => {
          if (gs.student_id) studentIds.push(gs.student_id._id);
        });
      }

      // Remove duplicates
      const uniqueStudentIds = [...new Set(studentIds)];

      if (uniqueStudentIds.length > 0) {
        // Get payments for the specific period
        const studentPayments = await Payment.find({
          student_id: { $in: uniqueStudentIds },
          status: 'completed',
          payment_date: {
            $gte: startDate,
            $lte: endDate
          }
        }).populate('student_id', 'first_name last_name');

        // Calculate percentage amount
        percentageAmount = studentPayments.reduce((sum, payment) => {
          return sum + (payment.amount * config.student_percentage / 100);
        }, 0);
      }
    }

    const totalAmount = baseAmount + percentageAmount;

    const calculation = {
      employee_id,
      month: startDate,
      base_amount: baseAmount,
      percentage_amount: percentageAmount,
      total_amount: totalAmount
    };

    res.json({
      success: true,
      data: calculation
    });
  } catch (error) {
    console.error('Error calculating salary:', error);
    res.status(500).json({
      success: false,
      message: 'Oylikni hisoblashda xatolik yuz berdi'
    });
  }
};

// Create salary
exports.createSalary = async (req, res) => {
  try {
    const { employee_id, month, base_amount, percentage_amount, bonus_amount, note } = req.body;

    // Validate employee
    const employee = await Employee.findById(employee_id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Xodim topilmadi'
      });
    }

    // Check if salary already exists for this month
    const existingSalary = await Salary.findOne({
        employee_id,
        month: {
        $gte: new Date(month).setDate(1),
        $lte: new Date(new Date(month).setMonth(new Date(month).getMonth() + 1))
      }
    });

    if (existingSalary) {
      return res.status(400).json({
        success: false,
        message: 'Bu oy uchun oylik allaqachon mavjud'
      });
    }

    // Convert amounts to numbers or use defaults
    const baseAmountNum = base_amount !== undefined ? Number(base_amount) : 0;
    const percentageAmountNum = percentage_amount !== undefined ? Number(percentage_amount) : 0;
    const bonusAmountNum = bonus_amount !== undefined ? Number(bonus_amount) : 0;

    // Calculate total - using actual numbers to avoid string concatenation
    const total_amount = baseAmountNum + percentageAmountNum + bonusAmountNum;

    // Create salary record with validated amounts
    const salary = await Salary.create({
      employee_id,
      month,
      base_amount: baseAmountNum,
      percentage_amount: percentageAmountNum,
      bonus_amount: bonusAmountNum,
      total_amount,
      note: note || '',
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      message: 'Oylik muvaffaqiyatli saqlandi',
      data: salary
    });
  } catch (error) {
    console.error('Error creating salary:', error);
    res.status(500).json({
      success: false,
      message: 'Oylikni saqlashda xatolik yuz berdi'
    });
  }
};

// Update salary status
exports.updateSalaryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    if (!['pending', 'paid', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Noto\'g\'ri status'
      });
    }

    const salary = await Salary.findById(id);
    if (!salary) {
      return res.status(404).json({
        success: false,
        message: 'Oylik topilmadi'
      });
    }

    salary.status = status;
    await salary.save();

    res.json({
      success: true,
      message: 'Oylik statusi yangilandi',
      data: salary
    });
  } catch (error) {
    console.error('Error updating salary status:', error);
    res.status(500).json({
      success: false,
      message: 'Oylik statusini yangilashda xatolik yuz berdi'
    });
  }
};

// Delete salary (soft delete by setting status to cancelled)
exports.deleteSalary = async (req, res) => {
  try {
    const { id } = req.params;

    const salary = await Salary.findById(id);
    if (!salary) {
      return res.status(404).json({
        success: false,
        message: 'Oylik topilmadi'
        });
      }

    if (salary.status === 'paid') {
        return res.status(400).json({
        success: false,
        message: 'To\'langan oylikni o\'chirib bo\'lmaydi'
      });
    }

    salary.status = 'cancelled';
    await salary.save();

    res.json({
      success: true,
      message: 'Oylik o\'chirildi'
    });
  } catch (error) {
    console.error('Error deleting salary:', error);
    res.status(500).json({
      success: false,
      message: 'Oylikni o\'chirishda xatolik yuz berdi'
    });
  }
};

module.exports = exports; 