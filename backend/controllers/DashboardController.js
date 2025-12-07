const { Payment, Salary, Employee, Student, Course, Group, AttendanceStudent } = require('../models');
const moment = require('moment');

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
    try {
        const { period = 'monthly' } = req.query;
        
        // Calculate date range based on period
        let startDate, endDate;
        const now = moment();
        
        switch(period) {
            case 'daily':
                startDate = moment().startOf('day');
                endDate = moment().endOf('day');
                break;
            case 'weekly':
                startDate = moment().startOf('week');
                endDate = moment().endOf('week');
                break;
            case 'monthly':
                startDate = moment().startOf('month');
                endDate = moment().endOf('month');
                break;
            case 'yearly':
                startDate = moment().startOf('year');
                endDate = moment().endOf('year');
                break;
            default:
                startDate = moment().startOf('month');
                endDate = moment().endOf('month');
        }

        // 1. Financial Statistics
        const financialStats = await getFinancialStats(startDate, endDate);

        // 2. Payment Statistics
        const paymentStats = await getPaymentStats(startDate, endDate);

        // 3. Salary Statistics
        const salaryStats = await getSalaryStats(startDate, endDate);

        // 4. Group Payment Statistics
        const groupStats = await getGroupStats(startDate, endDate);

        // 5. Marketing Statistics
        const marketingStats = await getMarketingStats(startDate, endDate);

        // 6. Transaction Statistics
        const transactionStats = await getTransactionStats(startDate, endDate);

        // 7. Attendance Statistics
        const attendanceStats = await getAttendanceStats(startDate, endDate);

        res.json({
            success: true,
            data: {
                period: {
                    type: period,
                    start: startDate.toDate(),
                    end: endDate.toDate()
                },
                financial: financialStats,
                payments: paymentStats,
                salaries: salaryStats,
                groups: groupStats,
                marketing: marketingStats,
                transactions: transactionStats,
                attendance: attendanceStats
            }
        });

    } catch (error) {
        console.error('Error getting dashboard statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Statistikani olishda xatolik yuz berdi'
        });
    }
};

// Get financial statistics
exports.getFinancialStats = async (req, res) => {
    try {
        const { period = 'monthly' } = req.query;
        const { startDate, endDate } = getDateRange(period);
        const stats = await getFinancialStats(startDate, endDate);
        
        res.json({
            success: true,
            data: {
                period: {
                    type: period,
                    start: startDate.toDate(),
                    end: endDate.toDate()
                },
                ...stats
            }
        });
    } catch (error) {
        console.error('Error getting financial statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Moliyaviy statistikani olishda xatolik yuz berdi'
        });
    }
};

// Get payment statistics
exports.getPaymentStats = async (req, res) => {
    try {
        const { period = 'monthly' } = req.query;
        const { startDate, endDate } = getDateRange(period);
        const stats = await getPaymentStats(startDate, endDate);
        
        res.json({
            success: true,
            data: {
                period: {
                    type: period,
                    start: startDate.toDate(),
                    end: endDate.toDate()
                },
                ...stats
            }
        });
    } catch (error) {
        console.error('Error getting payment statistics:', error);
        res.status(500).json({
            success: false,
            message: 'To\'lov statistikani olishda xatolik yuz berdi'
        });
    }
};

// Get salary statistics
exports.getSalaryStats = async (req, res) => {
    try {
        const { period = 'monthly' } = req.query;
        const { startDate, endDate } = getDateRange(period);
        const stats = await getSalaryStats(startDate, endDate);
        
        res.json({
            success: true,
            data: {
                period: {
                    type: period,
                    start: startDate.toDate(),
                    end: endDate.toDate()
                },
                ...stats
            }
        });
    } catch (error) {
        console.error('Error getting salary statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Maosh statistikani olishda xatolik yuz berdi'
        });
    }
};

// Get group statistics
exports.getGroupStats = async (req, res) => {
    try {
        const { period = 'monthly' } = req.query;
        const { startDate, endDate } = getDateRange(period);
        const stats = await getGroupStats(startDate, endDate);
        
        res.json({
            success: true,
            data: {
                period: {
                    type: period,
                    start: startDate.toDate(),
                    end: endDate.toDate()
                },
                ...stats
            }
        });
    } catch (error) {
        console.error('Error getting group statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Guruh statistikani olishda xatolik yuz berdi'
        });
    }
};

// Get marketing statistics
exports.getMarketingStats = async (req, res) => {
    try {
        const { period = 'monthly' } = req.query;
        const { startDate, endDate } = getDateRange(period);
        const stats = await getMarketingStats(startDate, endDate);
        
        res.json({
            success: true,
            data: {
                period: {
                    type: period,
                    start: startDate.toDate(),
                    end: endDate.toDate()
                },
                ...stats
            }
        });
    } catch (error) {
        console.error('Error getting marketing statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Marketing statistikani olishda xatolik yuz berdi'
        });
    }
};

// Get transaction statistics
exports.getTransactionStats = async (req, res) => {
    try {
        const { period = 'monthly' } = req.query;
        const { startDate, endDate } = getDateRange(period);
        const stats = await getTransactionStats(startDate, endDate);
        
        res.json({
            success: true,
            data: {
                period: {
                    type: period,
                    start: startDate.toDate(),
                    end: endDate.toDate()
                },
                ...stats
            }
        });
    } catch (error) {
        console.error('Error getting transaction statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Tranzaksiya statistikani olishda xatolik yuz berdi'
        });
    }
};

// Get attendance statistics
exports.getAttendanceStats = async (req, res) => {
    try {
        const { period = 'monthly' } = req.query;
        const { startDate, endDate } = getDateRange(period);
        const stats = await getAttendanceStats(startDate, endDate);
        
        res.json({
            success: true,
            data: {
                period: {
                    type: period,
                    start: startDate.toDate(),
                    end: endDate.toDate()
                },
                ...stats
            }
        });
    } catch (error) {
        console.error('Error getting attendance statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Davomat statistikani olishda xatolik yuz berdi'
        });
    }
};

// Get student statistics
exports.getStudentStats = async (req, res) => {
    try {
        const { period = 'monthly' } = req.query;
        const { startDate, endDate } = getDateRange(period);
        
        const students = await Student.find({
            created_at: { $gte: startDate.toDate(), $lte: endDate.toDate() }
        });

        const stats = {
            total_students: students.length,
            active_students: students.filter(s => s.status === 'active').length,
            trial_students: students.filter(s => s.payment_status === 'trial').length,
            paid_students: students.filter(s => s.payment_status === 'paid').length,
            unpaid_students: students.filter(s => s.payment_status === 'unpaid').length,
            by_course: {},
            by_group: {},
            by_payment_status: {
                trial: students.filter(s => s.payment_status === 'trial').length,
                paid: students.filter(s => s.payment_status === 'paid').length,
                unpaid: students.filter(s => s.payment_status === 'unpaid').length,
                expired: students.filter(s => s.payment_status === 'expired').length
            }
        };

        // Calculate statistics by course and group
        for (const student of students) {
            if (student.course_id) {
                const course = await Course.findById(student.course_id);
                if (course) {
                    if (!stats.by_course[course.name]) {
                        stats.by_course[course.name] = 0;
                    }
                    stats.by_course[course.name]++;
                }
            }

            if (student.group_id) {
                const group = await Group.findById(student.group_id);
                if (group) {
                    if (!stats.by_group[group.name]) {
                        stats.by_group[group.name] = 0;
                    }
                    stats.by_group[group.name]++;
                }
            }
        }

        res.json({
            success: true,
            data: {
                period: {
                    type: period,
                    start: startDate.toDate(),
                    end: endDate.toDate()
                },
                ...stats
            }
        });
    } catch (error) {
        console.error('Error getting student statistics:', error);
        res.status(500).json({
            success: false,
            message: 'O\'quvchi statistikani olishda xatolik yuz berdi'
        });
    }
};

// Get course statistics
exports.getCourseStats = async (req, res) => {
    try {
        const { period = 'monthly' } = req.query;
        const { startDate, endDate } = getDateRange(period);
        
        const courses = await Course.find();
        const groups = await Group.find({
            created_at: { $gte: startDate.toDate(), $lte: endDate.toDate() }
        }).populate('course_id');

        const stats = {
            total_courses: courses.length,
            active_courses: courses.filter(c => c.status === 'active').length,
            total_groups: groups.length,
            total_students: await Student.countDocuments({ status: 'active' }),
            by_course: {}
        };

        // Calculate statistics by course
        for (const course of courses) {
            const courseGroups = groups.filter(g => g.course_id._id.toString() === course._id.toString());
            const courseStudents = await Student.countDocuments({
                course_id: course._id,
                status: 'active'
            });

            stats.by_course[course.name] = {
                groups: courseGroups.length,
                students: courseStudents,
                revenue: courseGroups.reduce((sum, g) => sum + (g.price * g.student_count), 0)
            };
        }

        res.json({
            success: true,
            data: {
                period: {
                    type: period,
                    start: startDate.toDate(),
                    end: endDate.toDate()
                },
                ...stats
            }
        });
    } catch (error) {
        console.error('Error getting course statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Kurs statistikani olishda xatolik yuz berdi'
        });
    }
};

// Get teacher statistics
exports.getTeacherStats = async (req, res) => {
    try {
        const { period = 'monthly' } = req.query;
        const { startDate, endDate } = getDateRange(period);
        
        const teachers = await Employee.find();
        const groups = await Group.find({
            created_at: { $gte: startDate.toDate(), $lte: endDate.toDate() }
        });

        const stats = {
            total_teachers: teachers.length,
            active_teachers: teachers.filter(t => t.status === 'active').length,
            total_groups: groups.length,
            total_students: await Student.countDocuments({ status: 'active' }),
            by_teacher: {}
        };

        // Calculate statistics by teacher
        for (const teacher of teachers) {
            const teacherGroups = groups.filter(g => g.teacher_id.toString() === teacher._id.toString());
            const teacherStudents = await Student.countDocuments({
                group_id: { $in: teacherGroups.map(g => g._id) },
                status: 'active'
            });

            stats.by_teacher[teacher.name] = {
                groups: teacherGroups.length,
                students: teacherStudents,
                salary: teacher.salary || 0
            };
        }

        res.json({
            success: true,
            data: {
                period: {
                    type: period,
                    start: startDate.toDate(),
                    end: endDate.toDate()
                },
                ...stats
            }
        });
    } catch (error) {
        console.error('Error getting teacher statistics:', error);
        res.status(500).json({
            success: false,
            message: 'O\'qituvchi statistikani olishda xatolik yuz berdi'
        });
    }
};

// Helper function to get date range
function getDateRange(period) {
    let startDate, endDate;
    const now = moment();
    
    switch(period) {
        case 'daily':
            startDate = moment().startOf('day');
            endDate = moment().endOf('day');
            break;
        case 'weekly':
            startDate = moment().startOf('week');
            endDate = moment().endOf('week');
            break;
        case 'monthly':
            startDate = moment().startOf('month');
            endDate = moment().endOf('month');
            break;
        case 'yearly':
            startDate = moment().startOf('year');
            endDate = moment().endOf('year');
            break;
        default:
            startDate = moment().startOf('month');
            endDate = moment().endOf('month');
    }

    return { startDate, endDate };
}

// Helper functions
async function getFinancialStats(startDate, endDate) {
    const payments = await Payment.find({
        payment_date: { $gte: startDate.toDate(), $lte: endDate.toDate() },
        status: 'completed'
    });

    const salaries = await Salary.find({
        month: { $gte: startDate.toDate(), $lte: endDate.toDate() },
        status: 'paid'
    });

    const totalIncome = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalExpenses = salaries.reduce((sum, s) => sum + s.total_amount, 0);

    return {
        total_income: totalIncome,
        total_expenses: totalExpenses,
        net_income: totalIncome - totalExpenses,
        profit_margin: totalIncome ? ((totalIncome - totalExpenses) / totalIncome * 100).toFixed(2) : 0
    };
}

async function getPaymentStats(startDate, endDate) {
    const payments = await Payment.find({
        payment_date: { $gte: startDate.toDate(), $lte: endDate.toDate() }
    });

    const stats = {
        total_payments: payments.length,
        total_amount: payments.reduce((sum, p) => sum + p.amount, 0),
        by_type: {
            cash: payments.filter(p => p.payment_type === 'cash').reduce((sum, p) => sum + p.amount, 0),
            card: payments.filter(p => p.payment_type === 'card').reduce((sum, p) => sum + p.amount, 0),
            transfer: payments.filter(p => p.payment_type === 'transfer').reduce((sum, p) => sum + p.amount, 0)
        },
        by_status: {
            completed: payments.filter(p => p.status === 'completed').length,
            pending: payments.filter(p => p.status === 'pending').length,
            cancelled: payments.filter(p => p.status === 'cancelled').length
        }
    };

    stats.average_payment = stats.total_payments ? stats.total_amount / stats.total_payments : 0;

    return stats;
}

async function getSalaryStats(startDate, endDate) {
    const salaries = await Salary.find({
        month: { $gte: startDate.toDate(), $lte: endDate.toDate() }
    });

    return {
        total_salaries: salaries.length,
        total_amount: salaries.reduce((sum, s) => sum + s.total_amount, 0),
        by_status: {
            paid: salaries.filter(s => s.status === 'paid').length,
            pending: salaries.filter(s => s.status === 'pending').length
        },
        average_salary: salaries.length ? 
            salaries.reduce((sum, s) => sum + s.total_amount, 0) / salaries.length : 0
    };
}

async function getGroupStats(startDate, endDate) {
    try {
        const groups = await Group.find().populate('course_id');
        const payments = await Payment.find({
            payment_date: { $gte: startDate.toDate(), $lte: endDate.toDate() },
            status: 'completed'
        });

        const stats = {
            total_groups: groups.length,
            active_groups: groups.filter(g => g.status === 'active').length,
            total_students: await Student.countDocuments({ status: 'active' }),
            by_course: {}
        };

        // Calculate statistics by course
        groups.forEach(group => {
            if (!group || !group.course_id) return; // Skip if group or course_id is undefined
            
            const courseName = group.course_id.name || 'Unknown Course';
            if (!stats.by_course[courseName]) {
                stats.by_course[courseName] = {
                    groups: 0,
                    students: 0,
                    revenue: 0
                };
            }
            stats.by_course[courseName].groups++;
            stats.by_course[courseName].students += group.student_count || 0;
            
            // Calculate revenue for this course
            if (group._id) {
                const coursePayments = payments.filter(p => 
                    p.group_id && p.group_id.toString() === group._id.toString()
                );
                stats.by_course[courseName].revenue += coursePayments.reduce((sum, p) => sum + (p.amount || 0), 0);
            }
        });

        return stats;
    } catch (error) {
        console.error('Error in getGroupStats:', error);
        return {
            total_groups: 0,
            active_groups: 0,
            total_students: 0,
            by_course: {}
        };
    }
}

async function getMarketingStats(startDate, endDate) {
    try {
        // Since Marker model is not available, return empty marketing stats
        return {
            total_campaigns: 0,
            by_type: {},
            by_status: {},
            by_district: {}
        };
    } catch (error) {
        console.error('Error getting marketing stats:', error);
        return {
            total_campaigns: 0,
            by_type: {},
            by_status: {},
            by_district: {}
        };
    }
}

async function getTransactionStats(startDate, endDate) {
    const payments = await Payment.find({
        payment_date: { $gte: startDate.toDate(), $lte: endDate.toDate() }
    });

    const salaries = await Salary.find({
        month: { $gte: startDate.toDate(), $lte: endDate.toDate() }
    });

    return {
        total_transactions: payments.length + salaries.length,
        income_transactions: payments.length,
        expense_transactions: salaries.length,
        total_income: payments.reduce((sum, p) => sum + p.amount, 0),
        total_expenses: salaries.reduce((sum, s) => sum + s.total_amount, 0),
        net_amount: payments.reduce((sum, p) => sum + p.amount, 0) - 
                   salaries.reduce((sum, s) => sum + s.total_amount, 0)
    };
}

async function getAttendanceStats(startDate, endDate) {
    const attendances = await AttendanceStudent.find({
        date: { $gte: startDate.toDate(), $lte: endDate.toDate() }
    });

    const totalLessons = attendances.length;
    const presentLessons = attendances.filter(a => a.status === 'present').length;
    const absentLessons = attendances.filter(a => a.status === 'absent').length;
    const lateLessons = attendances.filter(a => a.status === 'late').length;

    return {
        total_lessons: totalLessons,
        present_lessons: presentLessons,
        absent_lessons: absentLessons,
        late_lessons: lateLessons,
        attendance_rate: totalLessons ? (presentLessons / totalLessons * 100).toFixed(2) : 0,
        by_status: {
            present: presentLessons,
            absent: absentLessons,
            late: lateLessons
        }
    };
} 