const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Bo\'lim nomi talab qilinadi'],
    trim: true,
    maxlength: [100, 'Bo\'lim nomi 100 ta belgidan oshmasligi kerak'],
    unique: true
  },
  description: {
    type: String,
    trim: true
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
departmentSchema.virtual('employees', {
  ref: 'Employee',
  localField: '_id',
  foreignField: 'department_id'
});

departmentSchema.virtual('positions', {
  ref: 'Position',
  localField: '_id',
  foreignField: 'department_id'
});

// Indexes
departmentSchema.index({ status: 1 });

const Department = mongoose.model('Department', departmentSchema);

module.exports = Department; 