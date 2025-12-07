const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
  course_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, {
  timestamps: true,
  paranoid: true,
  deletedAt: 'deleted_at'
});

// Virtual for course reference
topicSchema.virtual('course', {
  ref: 'Course',
  localField: 'course_id',
  foreignField: '_id',
  justOne: true
});

// Virtual for questions
topicSchema.virtual('questions', {
  ref: 'Question',
  localField: '_id',
  foreignField: 'topic_id'
});

// Virtual for terms
topicSchema.virtual('terms', {
  ref: 'Term',
  localField: '_id',
  foreignField: 'topic_id'
});

// Configure virtuals to be included in JSON and Object
topicSchema.set('toJSON', { virtuals: true });
topicSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Topic', topicSchema); 