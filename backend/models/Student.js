const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: true
  },
  last_name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String
  },
  birth_date: {
    type: Date
  },
  address: {
    type: String
  },
  parent_name: {
    type: String,
    maxlength: 100
  },
  parent_phone: {
    type: String,
    maxlength: 20
  },
  gender: {
    type: String,
    enum: ['male', 'female'],
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  payment_status: {
    type: String,
    enum: ['trial', 'paid', 'expired', 'unpaid'],
    default: 'trial'
  },
  trial_lesson_date: {
    type: Date
  },
  last_payment_date: {
    type: Date
  },
  next_payment_due: {
    type: Date
  },
  joined_date: {
    type: Date,
    required: true
  },
  created_at: {
    type: Date,
    required: true
  },
  updated_at: {
    type: Date,
    required: true
  }
}, {
  paranoid: true,
  deletedAt: 'deleted_at'
});

// Virtual for payments
studentSchema.virtual('payments', {
  ref: 'Payment',
  localField: '_id',
  foreignField: 'student_id'
});

// Virtual for groups
studentSchema.virtual('groups', {
  ref: 'Group',
  localField: '_id',
  foreignField: 'students'
});

// Virtual for group_students
studentSchema.virtual('group_students', {
  ref: 'GroupStudent',
  localField: '_id',
  foreignField: 'student_id'
});

// Virtual for attendances
studentSchema.virtual('attendances', {
  ref: 'AttendanceStudent',
  localField: '_id',
  foreignField: 'student_id'
});

// Configure virtuals to be included in JSON and Object
studentSchema.set('toJSON', { virtuals: true });
studentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Student', studentSchema); 