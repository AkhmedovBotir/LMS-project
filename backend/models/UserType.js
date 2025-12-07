const mongoose = require('mongoose');

const userTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Foydalanuvchi turi nomi majburiy'],
    trim: true,
    maxlength: [50, 'Foydalanuvchi turi nomi 50 ta belgidan oshmasligi kerak'],
    unique: true
  },
  description: {
    type: String
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
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual field for admins
userTypeSchema.virtual('admins', {
  ref: 'Admin',
  localField: '_id',
  foreignField: 'user_type_id'
});

const UserType = mongoose.model('UserType', userTypeSchema);

module.exports = UserType; 