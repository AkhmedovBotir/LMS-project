const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const employeeSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: [true, 'Ism talab qilinadi'],
    trim: true,
    maxlength: [50, 'Ism 50 ta belgidan oshmasligi kerak']
  },
  last_name: {
    type: String,
    required: [true, 'Familiya talab qilinadi'],
    trim: true,
    maxlength: [50, 'Familiya 50 ta belgidan oshmasligi kerak']
  },
  phone: {
    type: String,
    required: [true, 'Telefon raqami talab qilinadi'],
    trim: true,
    maxlength: [20, 'Telefon raqami 20 ta belgidan oshmasligi kerak']
  },
  username: {
    type: String,
    required: [true, 'Login talab qilinadi'],
    trim: true,
    maxlength: [50, 'Login 50 ta belgidan oshmasligi kerak']
  },
  password: {
    type: String,
    required: [true, 'Parol talab qilinadi'],
    minlength: [6, 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak']
  },
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserType',
    required: [true, 'Foydalanuvchi turi talab qilinadi']
  },
  id_number: {
    type: String,
    required: [true, 'Passport yoki tug\'ilganlik guvohnomasi raqami talab qilinadi'],
    trim: true,
    maxlength: [20, 'ID raqami 20 ta belgidan oshmasligi kerak']
  },
  birth_date: {
    type: Date,
    required: [true, 'Tug\'ilgan sana talab qilinadi']
  },
  hire_date: {
    type: Date,
    required: [true, 'Ishga qabul qilingan sana talab qilinadi']
  },
  address: {
    type: String,
    required: [true, 'Manzil talab qilinadi'],
    trim: true
  },
  department_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: [true, 'Bo\'lim talab qilinadi']
  },
  position_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Position',
    required: [true, 'Lavozim talab qilinadi']
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual fields
employeeSchema.virtual('resumes', {
  ref: 'Resume',
  localField: '_id',
  foreignField: 'employee_id'
});

employeeSchema.virtual('attendances', {
  ref: 'Attendance',
  localField: '_id',
  foreignField: 'employee_id'
});

// Indexes
employeeSchema.index({ username: 1 }, { unique: true });
employeeSchema.index({ phone: 1 }, { unique: true });
employeeSchema.index({ id_number: 1 }, { unique: true });
employeeSchema.index({ department_id: 1 });
employeeSchema.index({ position_id: 1 });
employeeSchema.index({ role: 1 });
employeeSchema.index({ status: 1 });

// Hash password before saving
employeeSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
employeeSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

const Employee = mongoose.model('Employee', employeeSchema);

module.exports = Employee; 