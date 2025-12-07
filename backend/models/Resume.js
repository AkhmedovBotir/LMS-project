const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  employee_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: [true, 'Xodim talab qilinadi']
  },
  education: {
    type: [{
      institution: String,
      degree: String,
      field: String,
      start_date: Date,
      end_date: Date,
      description: String
    }],
    default: []
  },
  experience: {
    type: [{
      company: String,
      position: String,
      start_date: Date,
      end_date: Date,
      description: String
    }],
    default: []
  },
  skills: {
    type: [String],
    default: []
  },
  languages: {
    type: [{
      name: String,
      level: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced', 'native']
      }
    }],
    default: []
  },
  certificates: {
    type: [{
      name: String,
      issuer: String,
      date: Date,
      description: String
    }],
    default: []
  },
  additional_info: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
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

// Virtual field for employee
resumeSchema.virtual('employee', {
  ref: 'Employee',
  localField: 'employee_id',
  foreignField: '_id',
  justOne: true
});

// Indexes
resumeSchema.index({ employee_id: 1 }, { unique: true });
resumeSchema.index({ status: 1 });

const Resume = mongoose.model('Resume', resumeSchema);

module.exports = Resume; 