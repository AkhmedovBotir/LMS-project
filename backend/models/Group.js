const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Guruh nomi talab qilinadi'],
    trim: true,
    maxlength: [100, 'Guruh nomi 100 ta belgidan oshmasligi kerak']
  },
  time: {
    type: String,
    required: [true, 'Dars vaqti talab qilinadi'],
    trim: true,
    maxlength: [50, 'Dars vaqti 50 ta belgidan oshmasligi kerak']
  },
  days: {
    type: String,
    required: [true, 'Dars kunlari talab qilinadi'],
    trim: true,
    maxlength: [100, 'Dars kunlari 100 ta belgidan oshmasligi kerak']
  },
  course_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Kurs talab qilinadi']
  },
  teacher_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: [true, 'O\'qituvchi talab qilinadi']
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'completed'],
    default: 'active'
  },
  finished_at: {
    type: Date
  },
  start_date: {
    type: Date,
    required: [true, 'Boshlash sanasi talab qilinadi']
  },
  end_date: {
    type: Date,
    required: [true, 'Tugash sanasi talab qilinadi']
  },
  tarif_type: {
    type: String,
    enum: ['standart', 'intensive'],
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual fields
groupSchema.virtual('course', {
  ref: 'Course',
  localField: 'course_id',
  foreignField: '_id',
  justOne: true
});

groupSchema.virtual('teacher', {
  ref: 'Employee',
  localField: 'teacher_id',
  foreignField: '_id',
  justOne: true
});

groupSchema.virtual('students', {
  ref: 'Student',
  localField: '_id',
  foreignField: 'group_id'
});

groupSchema.virtual('group_students', {
  ref: 'GroupStudent',
  localField: '_id',
  foreignField: 'group_id'
});

// Indexes
groupSchema.index({ name: 1 }, { unique: true });
groupSchema.index({ course_id: 1 });
groupSchema.index({ teacher_id: 1 });
groupSchema.index({ status: 1 });
groupSchema.index({ start_date: 1 });
groupSchema.index({ end_date: 1 });

const Group = mongoose.model('Group', groupSchema);

module.exports = Group; 