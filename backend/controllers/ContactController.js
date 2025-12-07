const Contact = require('../models/Contact');
const Student = require('../models/Student');
const Group = require('../models/Group');
const Grade = require('../models/Grade');
const Attendance = require('../models/Attendance');

// Get students with issues (low grades and attendance)
exports.getStudentsWithIssues = async (req, res) => {
    try {
        const { group_id, start_date, end_date } = req.query;

        // Validate required fields
        if (!group_id) {
            return res.status(400).json({
                success: false,
                message: 'Guruh ID majburiy'
            });
        }

        // Check if group exists
        const group = await Group.findById(group_id);
        if (!group) {
            return res.status(404).json({
                success: false,
                message: 'Guruh topilmadi'
            });
        }

        // Build date filter
        const dateFilter = {};
        if (start_date && end_date) {
            dateFilter.date = {
                $gte: new Date(start_date),
                $lte: new Date(end_date)
            };
        }

        // Get students with low grades (3 and below)
        const lowGradeStudents = await Grade.aggregate([
            {
                $match: {
                    group_id: group._id,
                    ...dateFilter
                }
            },
            {
                $group: {
                    _id: '$student_id',
                    averageGrade: { $avg: '$mark' }
                }
            },
            {
                $match: {
                    averageGrade: { $lte: 3 }
                }
            }
        ]);

        // Get students with attendance issues
        const attendanceIssues = await Attendance.aggregate([
            {
                $match: {
                    group_id: group._id,
                    ...dateFilter,
                    status: 'absent'
                }
            },
            {
                $group: {
                    _id: '$student_id',
                    absences: { $sum: 1 }
                }
            },
            {
                $match: {
                    absences: { $gte: 3 }
                }
            }
        ]);

        // Get student IDs with issues
        const studentIds = [...new Set([
            ...lowGradeStudents.map(s => s._id),
            ...attendanceIssues.map(s => s._id)
        ])];

        // Get last contact date for each student
        const lastContacts = await Contact.aggregate([
            {
                $match: {
                    student_id: { $in: studentIds }
                }
            },
            {
                $sort: { created_at: -1 }
            },
            {
                $group: {
                    _id: '$student_id',
                    lastContactDate: { $first: '$created_at' }
                }
            }
        ]);

        // Create a map of last contact dates
        const lastContactMap = lastContacts.reduce((acc, contact) => {
            acc[contact._id.toString()] = contact.lastContactDate;
            return acc;
        }, {});

        // Filter students based on their last contact date
        const filteredStudentIds = studentIds.filter(id => {
            const lastContactDate = lastContactMap[id.toString()];
            if (!lastContactDate) return true; // No previous contacts

            // Check if there are new issues after the last contact
            const hasNewLowGrade = lowGradeStudents.some(grade => 
                grade._id.toString() === id.toString() && 
                new Date(grade.date) > lastContactDate
            );

            const hasNewAttendance = attendanceIssues.some(attendance => 
                attendance._id.toString() === id.toString() && 
                new Date(attendance.date) > lastContactDate
            );

            return hasNewLowGrade || hasNewAttendance;
        });

        // Get student details
        const students = await Student.find({
            _id: { $in: filteredStudentIds }
        }).select('first_name last_name phone');

        // Format response
        const response = students.map(student => {
            const lowGrade = lowGradeStudents.find(s => s._id.toString() === student._id.toString());
            const attendance = attendanceIssues.find(s => s._id.toString() === student._id.toString());

            return {
                student_id: student._id,
                first_name: student.first_name,
                last_name: student.last_name,
                phone: student.phone,
                issues: {
                    low_grade: lowGrade ? {
                        average_grade: lowGrade.averageGrade.toFixed(1)
                    } : null,
                    attendance: attendance ? {
                        absences: attendance.absences
                    } : null
                }
            };
        });

        res.status(200).json({
            success: true,
            data: response
        });
    } catch (error) {
        console.error('Error getting students with issues:', error);
        res.status(500).json({
            success: false,
            message: 'Ma\'lumotlarni olishda xatolik yuz berdi'
        });
    }
};

// Create contact record
exports.createContact = async (req, res) => {
    try {
        const { student_id, group_id, issue_type, description } = req.body;

        // Validate required fields
        if (!student_id || !group_id || !issue_type || !description) {
            return res.status(400).json({
                success: false,
                message: 'Barcha majburiy maydonlarni to\'ldiring'
            });
        }

        // Check if student exists
        const student = await Student.findById(student_id);
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'O\'quvchi topilmadi'
            });
        }

        // Create contact record
        const contact = await Contact.create({
            student_id,
            group_id,
            issue_type,
            description,
            created_by: req.user.id
        });

        res.status(201).json({
            success: true,
            data: contact
        });
    } catch (error) {
        console.error('Error creating contact:', error);
        res.status(500).json({
            success: false,
            message: 'Aloqa yozuvini yaratishda xatolik yuz berdi'
        });
    }
};

// Update contact status
exports.updateContactStatus = async (req, res) => {
    try {
        const { contact_id } = req.params;
        const { status, contact_method, contact_result } = req.body;

        // Validate required fields
        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'Status majburiy'
            });
        }

        // Check if contact exists
        const contact = await Contact.findById(contact_id);
        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Aloqa yozuvi topilmadi'
            });
        }

        // Update contact
        contact.status = status;
        if (status === 'contacted' || status === 'resolved') {
            contact.contact_date = new Date();
            contact.contact_method = contact_method;
            contact.contact_result = contact_result;
        }

        await contact.save();

        res.status(200).json({
            success: true,
            data: contact
        });
    } catch (error) {
        console.error('Error updating contact status:', error);
        res.status(500).json({
            success: false,
            message: 'Aloqa statusini yangilashda xatolik yuz berdi'
        });
    }
};

// Get contact history
exports.getContactHistory = async (req, res) => {
    try {
        const { student_id, group_id, status } = req.query;

        // Build filter
        const filter = {};
        if (student_id) filter.student_id = student_id;
        if (group_id) filter.group_id = group_id;
        if (status) filter.status = status;

        // Get contacts
        const contacts = await Contact.find(filter)
            .populate('student_id', 'first_name last_name phone')
            .populate('group_id', 'name')
            .populate('created_by', 'first_name last_name phone')
            .sort({ created_at: -1 });

        res.status(200).json({
            success: true,
            data: contacts
        });
    } catch (error) {
        console.error('Error getting contact history:', error);
        res.status(500).json({
            success: false,
            message: 'Aloqa tarixini olishda xatolik yuz berdi'
        });
    }
};
