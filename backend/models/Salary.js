const mongoose = require('mongoose');

const salarySchema = new mongoose.Schema({
  employee_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  month: {
    type: Date,
    required: true,
    comment: "Oylik to'lanadigan oy"
  },
  base_amount: {
    type: Number,
    default: 0,
    comment: "Asosiy oylik summasi"
  },
  percentage_amount: {
    type: Number,
    default: 0,
    comment: "Foizdan hisoblangan summa"
  },
  bonus_amount: {
    type: Number,
    default: 0,
    comment: "Qo'shimcha bonus summasi"
  },
  total_amount: {
    type: Number,
    required: true,
    comment: "Jami to'lanadigan summa"
  },
  note: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'cancelled'],
    default: 'pending'
  }
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  },

});

// Virtual for employee reference
salarySchema.virtual('employee', {
  ref: 'Employee',
  localField: 'employee_id',
  foreignField: '_id',
  justOne: true
});

// Configure virtuals to be included in JSON and Object
salarySchema.set('toJSON', { virtuals: true });
salarySchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Salary', salarySchema); 