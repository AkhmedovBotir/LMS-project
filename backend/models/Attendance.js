const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employee_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  checkin_time: {
    type: String,
    required: false
  },
  checkout_time: {
    type: String,
    required: false
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'on_leave', 'half_day'],
    default: 'present',
    required: true
  },
  notes: {
    type: String,
    required: false
  }
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

// Indexes
attendanceSchema.index({ employee_id: 1, date: 1 }, { unique: true });

// Virtual for employee
attendanceSchema.virtual('employee', {
  ref: 'Employee',
  localField: 'employee_id',
  foreignField: '_id',
  justOne: true
});

// Set virtuals to be included in JSON
attendanceSchema.set('toJSON', { virtuals: true });
attendanceSchema.set('toObject', { virtuals: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance; 