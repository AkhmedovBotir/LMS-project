const Reception = require('../models/Reception');
const Student = require('../models/Student');
const Group = require('../models/Group');
const GroupStudent = require('../models/GroupStudent');
const bcrypt = require('bcryptjs');

// Yangi mehmon qo'shish
exports.createReception = async (req, res) => {
    try {
        // Majburiy maydonlarni tekshirish
        const { first_name, last_name, phone } = req.body;
        if (!first_name || !last_name || !phone) {
            return res.status(400).json({
                success: false,
                message: 'Ism, familiya va telefon raqam kiritish majburiy'
            });
        }

        // Telefon raqamni tekshirish
        const existingReception = await Reception.findOne({ phone });
        if (existingReception) {
            return res.status(400).json({
                success: false,
                message: 'Bu telefon raqam allaqachon ro\'yxatdan o\'tgan'
            });
        }

        // Mehmon ma'lumotlarini tayyorlash
        const receptionData = {
            first_name,
            last_name,
            phone,
            parent_name: req.body.parent_name,
            parent_phone: req.body.parent_phone,
            how_came: req.body.how_came || 'other',
            how_came_other: req.body.how_came_other,
            status: 'kelgan',
            notes: '',
            contactInfo: {
                contacted: false
            },
            trialInfo: {
                trialResult: 'kutilmoqda'
            }
        };

        // Yangi mehmon yaratish
        const reception = await Reception.create(receptionData);

        res.status(201).json({
            success: true,
            message: 'Mehmon muvaffaqiyatli qo\'shildi',
            data: reception
        });
    } catch (error) {
        console.error('Error creating reception:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Barcha mehmonlarni olish
exports.getAllReceptions = async (req, res) => {
    try {
        const receptions = await Reception.find()
            .populate('student', 'first_name last_name phone')
            .populate('group', 'name')
            .sort({ created_at: -1 });
        
        res.status(200).json({
            success: true,
            data: receptions
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Bitta mehmonni olish
exports.getReceptionById = async (req, res) => {
    try {
        const reception = await Reception.findById(req.params.id)
            .populate('student', 'first_name last_name phone')
            .populate('group', 'name');
        
        if (!reception) {
            return res.status(404).json({
                success: false,
                message: 'Mehmon topilmadi'
            });
        }

        res.status(200).json({
            success: true,
            data: reception
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Aloqa qilish
exports.contactReception = async (req, res) => {
    try {
        const { contactNotes } = req.body;
        
        const reception = await Reception.findByIdAndUpdate(
            req.params.id,
            {
                status: 'aloqa',
                $push: {
                    contactInfo: {
                        contactDate: new Date(),
                        contactNotes: contactNotes
                    }
                }
            },
            { new: true }
        );

        if (!reception) {
            return res.status(404).json({
                success: false,
                message: 'Mehmon topilmadi'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Aloqa ma\'lumotlari yangilandi',
            data: reception
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Sinovga qo'shish
exports.addToTrial = async (req, res) => {
    try {
        const { trialNotes, trialDate } = req.body;
        
        const reception = await Reception.findByIdAndUpdate(
            req.params.id,
            {
                status: 'sinov',
                'trialInfo.trialDate': trialDate,
                'trialInfo.trialNotes': trialNotes
            },
            { new: true }
        );

        if (!reception) {
            return res.status(404).json({
                success: false,
                message: 'Mehmon topilmadi'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Sinov ma\'lumotlari yangilandi',
            data: reception
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// O'quvchiga aylantirish va guruhga qo'shish
exports.convertToStudent = async (req, res) => {
    try {
        const { 
            groupId,
            birth_date,
            address,
            gender,
            trial_lesson_date
        } = req.body;

        // Majburiy maydonlarni tekshirish
        if (!groupId) {
            return res.status(400).json({
                success: false,
                message: 'Guruh ID kiritish majburiy'
            });
        }

        if (!trial_lesson_date) {
            return res.status(400).json({
                success: false,
                message: 'Sinov darsi sanasi kiritish majburiy'
            });
        }

        // Guruhni tekshirish
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({
                success: false,
                message: 'Guruh topilmadi'
            });
        }

        // Receptionni tekshirish
        const reception = await Reception.findById(req.params.id);
        if (!reception) {
            return res.status(404).json({
                success: false,
                message: 'Mehmon topilmadi'
            });
        }

        // Parolni hash qilish
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash("123456", salt);

        // Reception ma'lumotlaridan Student ma'lumotlarini tayyorlash
        const now = new Date();
        const studentToCreate = {
            first_name: reception.first_name,
            last_name: reception.last_name,
            phone: reception.phone,
            password: hashedPassword, // Hash qilingan parol
            birth_date: birth_date || now,
            address: address || "Manzil kiritilmagan",
            gender: gender || "male",
            status: 'active',
            payment_status: 'trial',
            trial_lesson_date: new Date(trial_lesson_date),
            created_at: now,
            updated_at: now,
            joined_date: now
        };

        console.log('Creating student with data:', studentToCreate);

        // Yangi o'quvchi yaratish
        const student = await Student.create(studentToCreate);
        console.log('Student created:', student);

        // Guruhga qo'shish
        const groupStudent = await GroupStudent.create({
            group_id: groupId,
            student_id: student._id,
            status: 'active',
            joined_at: new Date()
        });
        console.log('Added to group:', groupStudent);

        // Guruhdagi o'quvchilar sonini yangilash
        await Group.findByIdAndUpdate(groupId, {
            $inc: { student_count: 1 }
        });

        // Reception ma'lumotlarini yangilash
        const updatedReception = await Reception.findByIdAndUpdate(
            req.params.id,
            {
                status: 'o\'quvchi',
                studentId: student._id,
                groupId: groupId,
                'trialInfo.trialResult': 'muvaffaqiyatli',
                'trialInfo.trialDate': new Date(trial_lesson_date)
            },
            { new: true }
        );
        console.log('Updated reception:', updatedReception);

        // O'quvchi va guruh ma'lumotlarini qaytarish
        const populatedStudent = await Student.findById(student._id)
            .populate({
                path: 'group_students',
                match: { status: 'active' },
                populate: {
                    path: 'group_id',
                    select: 'name',
                    populate: {
                        path: 'course_id',
                        select: 'name'
                    }
                }
            });

        const populatedGroup = await Group.findById(groupId)
            .populate('course_id', 'name');

        res.status(200).json({
            success: true,
            message: 'O\'quvchi muvaffaqiyatli yaratildi va guruhga qo\'shildi',
            data: {
                reception: updatedReception,
                student: populatedStudent,
                group: populatedGroup,
                groupStudent
            }
        });
    } catch (error) {
        console.error('Convert to student error:', error);
        
        // MongoDB xatolarini tekshirish
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => ({
                field: err.path,
                message: err.message
            }));
            
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: validationErrors
            });
        }

        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Noto\'g\'ri ID format',
                error: error.message
            });
        }

        res.status(500).json({
            success: false,
            message: 'O\'quvchiga aylantirishda xatolik yuz berdi',
            error: error.message,
            stack: error.stack
        });
    }
};

// Mehmon ma'lumotlarini yangilash
exports.updateReception = async (req, res) => {
    try {
        const reception = await Reception.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!reception) {
            return res.status(404).json({
                success: false,
                message: 'Mehmon topilmadi'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Mehmon ma\'lumotlari yangilandi',
            data: reception
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Mehmonni o'chirish
exports.deleteReception = async (req, res) => {
    try {
        const reception = await Reception.findByIdAndDelete(req.params.id);

        if (!reception) {
            return res.status(404).json({
                success: false,
                message: 'Mehmon topilmadi'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Mehmon muvaffaqiyatli o\'chirildi'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}; 