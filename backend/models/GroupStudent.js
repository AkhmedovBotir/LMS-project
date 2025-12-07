const mongoose = require('mongoose');

const groupStudentSchema = new mongoose.Schema({
  group_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: [true, 'Guruh talab qilinadi']
  },
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'O\'quvchi talab qilinadi']
  },
  joined_at: {
    type: Date,
    default: Date.now,
    required: [true, 'Qo\'shilgan sana talab qilinadi']
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'archived'],
    default: 'active'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual fields
groupStudentSchema.virtual('group', {
  ref: 'Group',
  localField: 'group_id',
  foreignField: '_id',
  justOne: true
});

groupStudentSchema.virtual('student', {
  ref: 'Student',
  localField: 'student_id',
  foreignField: '_id',
  justOne: true
});

// Indexes
groupStudentSchema.index({ group_id: 1, student_id: 1 }, { unique: true });
groupStudentSchema.index({ status: 1 });
groupStudentSchema.index({ joined_at: 1 });

const GroupStudent = mongoose.model('GroupStudent', groupStudentSchema);

module.exports = GroupStudent; 