const mongoose = require('mongoose');

const attendanceStudentSchema = new mongoose.Schema({
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  group_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late'],
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
attendanceStudentSchema.index({ student_id: 1, group_id: 1, date: 1 }, { unique: true });

// Virtuals
attendanceStudentSchema.virtual('student', {
  ref: 'Student',
  localField: 'student_id',
  foreignField: '_id',
  justOne: true
});

attendanceStudentSchema.virtual('group', {
  ref: 'Group',
  localField: 'group_id',
  foreignField: '_id',
  justOne: true
});

// Set virtuals to be included in JSON
attendanceStudentSchema.set('toJSON', { virtuals: true });
attendanceStudentSchema.set('toObject', { virtuals: true });

const AttendanceStudent = mongoose.model('AttendanceStudent', attendanceStudentSchema);

module.exports = AttendanceStudent; 