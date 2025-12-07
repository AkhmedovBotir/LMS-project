const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  course_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  group_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: false
  },
  period_type: {
    type: String,
    enum: ['monthly', 'full', 'custom'],
    default: 'monthly'
  },
  amounts: {
    cash: { type: Number, default: 0 },
    card: { type: Number, default: 0 },
    transfer: { type: Number, default: 0 }
  },
  amount: {
    type: Number,
    required: false
  },
  payment_date: {
    type: Date,
    required: true
  },
  payment_type: {
    type: String,
    enum: ['cash', 'card', 'transfer'],
    default: 'cash'
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'completed'
  },
  payment_period: {
    start_date: {
      type: Date,
      required: true
    },
    end_date: {
      type: Date,
      required: true
    },
    months_count: {
      type: Number,
      required: true
    }
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Update student payment status when payment is completed
paymentSchema.post('save', async function(doc) {
  if (doc.status === 'completed') {
    const Student = mongoose.model('Student');
    await Student.findByIdAndUpdate(doc.student_id, {
      payment_status: 'paid',
      last_payment_date: doc.payment_date,
      payment_period_end: doc.payment_period.end_date
    });
  }
});

// Update student payment status when payment is cancelled
paymentSchema.post('findOneAndUpdate', async function(doc) {
  if (doc.status === 'cancelled') {
    const Student = mongoose.model('Student');
    await Student.findByIdAndUpdate(doc.student_id, {
      payment_status: 'unpaid'
    });
  }
});

// Indexes
paymentSchema.index({ student_id: 1 });
paymentSchema.index({ course_id: 1 });
paymentSchema.index({ payment_date: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ payment_type: 1 });

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment; 