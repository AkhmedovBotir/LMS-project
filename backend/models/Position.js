const mongoose = require('mongoose');

const positionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Lavozim nomi talab qilinadi'],
    trim: true,
    maxlength: [100, 'Lavozim nomi 100 ta belgidan oshmasligi kerak'],
    unique: true
  },
  description: {
    type: String,
    trim: true
  },
  department_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
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

// Virtual field for department
positionSchema.virtual('department', {
  ref: 'Department',
  localField: 'department_id',
  foreignField: '_id',
  justOne: true
});

// Indexes
positionSchema.index({ name: 1 }, { unique: true });
positionSchema.index({ status: 1 });
positionSchema.index({ department_id: 1 });

const Position = mongoose.model('Position', positionSchema);

module.exports = Position; 