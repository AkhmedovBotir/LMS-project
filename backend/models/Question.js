const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  topic_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic',
    required: true
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['single', 'multiple', 'text']
  },
  correct_answer: {
    type: String,
    required: function() {
      return this.type === 'text';
    }
  },
  points: {
    type: Number,
    required: true,
    default: 1
  },
  status: {
    type: Boolean,
    default: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for topic reference
questionSchema.virtual('topic', {
  ref: 'Topic',
  localField: 'topic_id',
  foreignField: '_id',
  justOne: true
});

// Virtual for creator reference
questionSchema.virtual('creator', {
  ref: 'Employee',
  localField: 'created_by',
  foreignField: '_id',
  justOne: true
});

// Virtual for options reference
questionSchema.virtual('options', {
  ref: 'TestOption',
  localField: '_id',
  foreignField: 'question_id'
});

module.exports = mongoose.model('Question', questionSchema); 