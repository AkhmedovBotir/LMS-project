const Student = require('../models/Student');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Student login
exports.login = async (req, res) => {
    try {
        const { phone, password } = req.body;

        // Format phone number to ensure consistency
        const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;

        // Debug log
        console.log('Login attempt:', { originalPhone: phone, formattedPhone, password });

        // Validate required fields
        if (!phone || !password) {
            return res.status(400).json({
                success: false,
                message: 'Telefon raqam va parol majburiy'
            });
        }

        // Find student by phone
        const student = await Student.findOne({ phone: formattedPhone });
        
        // Debug log
        console.log('Found student:', student);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'O\'quvchi topilmadi'
            });
        }

        // Check if student is active
        if (student.status !== 'active') {
            return res.status(403).json({
                success: false,
                message: 'O\'quvchi faol emas'
            });
        }

        // Check payment status
        if (!['trial', 'paid'].includes(student.payment_status)) {
            return res.status(403).json({
                success: false,
                message: 'To\'lov muddati tugagan yoki to\'lov qilinmagan'
            });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, student.password);
        
        // Debug log
        console.log('Password match:', isMatch);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Noto\'g\'ri parol'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { 
                id: student._id,
                role: 'student'
            },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        // Return student data and token
        res.status(200).json({
            success: true,
            data: {
                token,
                student: {
                    id: student._id,
                    first_name: student.first_name,
                    last_name: student.last_name,
                    phone: student.phone,
                    birth_date: student.birth_date,
                    gender: student.gender,
                    status: student.status,
                    payment_status: student.payment_status,
                    trial_lesson_date: student.trial_lesson_date,
                    last_payment_date: student.last_payment_date,
                    next_payment_due: student.next_payment_due
                }
            }
        });
    } catch (error) {
        console.error('Error in student login:', error);
        res.status(500).json({
            success: false,
            message: 'Kirishda xatolik yuz berdi'
        });
    }
};
