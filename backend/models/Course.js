const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Kurs nomi talab qilinadi'],
    unique: true,
    trim: true,
    maxlength: [100, 'Kurs nomi 100 ta belgidan oshmasligi kerak']
  },
  description: {
    type: String,
    trim: true
  },
  // Standart va intensiv narx va muddatlar
  standart_price: {
    type: Number,
    required: true
  },
  standart_duration_months: {
    type: Number,
    required: true
  },
  intensive_price: {
    type: Number,
    required: true
  },
  intensive_duration_months: {
    type: Number,
    required: true
  },
  instructor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: [true, 'O\'qituvchi talab qilinadi']
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
courseSchema.virtual('groups', {
  ref: 'Group',
  localField: '_id',
  foreignField: 'course_id'
});

courseSchema.virtual('topics', {
  ref: 'Topic',
  localField: '_id',
  foreignField: 'course_id'
});

courseSchema.virtual('payments', {
  ref: 'Payment',
  localField: '_id',
  foreignField: 'course_id'
});

// Indexes
courseSchema.index({ name: 1 }, { unique: true });
courseSchema.index({ instructor_id: 1 });
courseSchema.index({ status: 1 });

const Course = mongoose.model('Course', courseSchema);

module.exports = Course; 