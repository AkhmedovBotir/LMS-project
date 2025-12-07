const mongoose = require('mongoose');

const salaryConfigSchema = new mongoose.Schema({
  employee_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  base_salary: {
    type: Number,
    comment: "Asosiy oylik (qo'lda kiritilgan)"
  },
  student_percentage: {
    type: Number,
    comment: "O'quvchilar to'lovidan foiz"
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

// Virtual for employee reference
salaryConfigSchema.virtual('employee', {
  ref: 'Employee',
  localField: 'employee_id',
  foreignField: '_id',
  justOne: true
});

// Configure virtuals to be included in JSON and Object
salaryConfigSchema.set('toJSON', { virtuals: true });
salaryConfigSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('SalaryConfig', salaryConfigSchema); 