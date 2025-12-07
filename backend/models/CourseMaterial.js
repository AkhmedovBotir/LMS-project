const mongoose = require('mongoose');

const courseMaterialSchema = new mongoose.Schema({
  course_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Kurs talab qilinadi']
  },
  topic_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic',
    required: [true, 'Mavzu talab qilinadi']
  },
  type: {
    type: String,
    enum: ['pdf', 'video', 'image'],
    required: [true, 'Material turini tanlang']
  },
  file: {
    type: String,
    required: [true, 'Fayl manzili talab qilinadi']
  },
  description: {
    type: String,
    trim: true
  },
  order: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: [true, 'Yaratuvchi talab qilinadi']
  },
  updated_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  }
}, {
  timestamps: true
});

// Virtual for topic reference
courseMaterialSchema.virtual('topic', {
  ref: 'Topic',
  localField: 'topic_id',
  foreignField: '_id',
  justOne: true
});

courseMaterialSchema.set('toJSON', { virtuals: true });
courseMaterialSchema.set('toObject', { virtuals: true });

const CourseMaterial = mongoose.model('CourseMaterial', courseMaterialSchema);

module.exports = CourseMaterial;
