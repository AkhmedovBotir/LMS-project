const mongoose = require('mongoose');

const termSchema = new mongoose.Schema({
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
  term: {
    type: String,
    required: true
  },
  definition: {
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

// Virtual for topic reference
termSchema.virtual('topic', {
  ref: 'Topic',
  localField: 'topic_id',
  foreignField: '_id',
  justOne: true
});

// Virtual for creator reference
termSchema.virtual('creator', {
  ref: 'Employee',
  localField: 'created_by',
  foreignField: '_id',
  justOne: true
});

// Configure virtuals to be included in JSON and Object
termSchema.set('toJSON', { virtuals: true });
termSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Term', termSchema); 