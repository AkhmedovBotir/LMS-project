const mongoose = require('mongoose');

const testOptionSchema = new mongoose.Schema({
  question_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  is_correct: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  paranoid: true,
  deletedAt: 'deleted_at'
});

// Virtual for question reference
testOptionSchema.virtual('question', {
  ref: 'Question',
  localField: 'question_id',
  foreignField: '_id',
  justOne: true
});

// Configure virtuals to be included in JSON and Object
testOptionSchema.set('toJSON', { virtuals: true });
testOptionSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('TestOption', testOptionSchema); 