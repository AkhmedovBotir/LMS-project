const mongoose = require('mongoose');

const receptionSchema = new mongoose.Schema({
    first_name: {
        type: String,
        required: [true, 'Ism kiritish majburiy'],
        trim: true
    },
    last_name: {
        type: String,
        required: [true, 'Familiya kiritish majburiy'],
        trim: true
    },
    phone: {
        type: String,
        required: [true, 'Telefon raqam kiritish majburiy'],
        trim: true,
        unique: true
    },
    birth_date: {
        type: Date
    },
    address: {
        type: String,
        trim: true
    },
    parent_name: {
        type: String,
        maxlength: 100,
        trim: true
    },
    parent_phone: {
        type: String,
        maxlength: 20,
        trim: true
    },
    how_came: {
        type: String,
        enum: ['banner', 'flayer', 'friends', 'relatives', 'instagram', 'telegram', 'other'],
        default: 'other'
    },
    how_came_other: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['kelgan', 'aloqa', 'sinov', 'o\'quvchi'],
        default: 'kelgan'
    },
    notes: {
        type: String,
        trim: true
    },
    // Agar o'quvchiga aylantirilgan bo'lsa
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    },
    // Agar guruhga qo'shilgan bo'lsa
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group'
    },
    // Aloqa ma'lumotlari array sifatida
    contactInfo: [{
        contactDate: {
            type: Date,
            default: Date.now
        },
        contactNotes: {
            type: String,
            trim: true
        }
    }],
    // Sinov ma'lumotlari
    trialInfo: {
        trialDate: Date,
        trialNotes: String,
        trialResult: {
            type: String,
            enum: ['muvaffaqiyatli', 'muvaffaqiyatsiz', 'kutilmoqda'],
            default: 'kutilmoqda'
        }
    },
    gender: {
        type: String,
        enum: ['male', 'female'],
        default: 'male'
    },
    status: {
        type: String,
        enum: ['kelgan', 'aloqa', 'sinov', 'o\'quvchi'],
        default: 'kelgan'
    },
    notes: {
        type: String,
        trim: true
    },
    // Agar o'quvchiga aylantirilgan bo'lsa
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    },
    // Agar guruhga qo'shilgan bo'lsa
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group'
    },
    // Aloqa ma'lumotlari array sifatida
    contactInfo: [{
        contactDate: {
            type: Date,
            default: Date.now
        },
        contactNotes: {
            type: String,
            trim: true
        }
    }],
    // Sinov ma'lumotlari
    trialInfo: {
        trialDate: Date,
        trialNotes: String,
        trialResult: {
            type: String,
            enum: ['muvaffaqiyatli', 'muvaffaqiyatsiz', 'kutilmoqda'],
            default: 'kutilmoqda'
        }
    }
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

// Virtual for student
receptionSchema.virtual('student', {
    ref: 'Student',
    localField: 'studentId',
    foreignField: '_id',
    justOne: true
});

// Virtual for group
receptionSchema.virtual('group', {
    ref: 'Group',
    localField: 'groupId',
    foreignField: '_id',
    justOne: true
});

// Configure virtuals to be included in JSON and Object
receptionSchema.set('toJSON', { virtuals: true });
receptionSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Reception', receptionSchema); 