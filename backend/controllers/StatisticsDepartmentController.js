const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');
const moment = require('moment');
const Payment = require('../models/Payment');
const Group = require('../models/Group');
const Course = require('../models/Course');
const Student = require('../models/Student');
const Reception = require('../models/Reception');

// Get date range based on period and custom date
const getDateRange = (period, customDate) => {
    let startDate, endDate;
    
    // Ensure customDate is in ISO format
    const date = customDate ? moment(customDate, 'YYYY-MM-DD') : moment();

    switch(period) {
        case 'daily':
            startDate = date.clone().startOf('day');
            endDate = date.clone().endOf('day');
            break;
        case 'weekly':
            startDate = date.clone().startOf('week');
            endDate = date.clone().endOf('week');
            break;
        case 'monthly':
            startDate = date.clone().startOf('month');
            endDate = date.clone().endOf('month');
            break;
        case 'yearly':
            startDate = date.clone().startOf('year');
            endDate = date.clone().endOf('year');
            break;
        default:
            startDate = date.clone().startOf('day');
            endDate = date.clone().endOf('day');
    }

    return { startDate, endDate };
};

// Get detailed attendance statistics
exports.getAttendanceStats = async (req, res) => {
    try {
        const { period = 'monthly', customDate } = req.query;
        
        // Validate customDate format if provided
        if (customDate && !moment(customDate, 'YYYY-MM-DD', true).isValid()) {
            return res.status(400).json({
                success: false,
                message: 'Noto\'g\'ri sana formati. Sana YYYY-MM-DD formatida bo\'lishi kerak'
            });
        }

        const { startDate, endDate } = getDateRange(period, customDate);

        // Get all attendance records for the period
        const attendances = await Attendance.find({
            date: { $gte: startDate.toDate(), $lte: endDate.toDate() }
        }).populate('employee_id');

        // Get total employees
        const totalEmployees = await Employee.countDocuments();

        // Initialize statistics object
        const stats = {
            period: {
                type: period,
                start: startDate.toISOString(),
                end: endDate.toISOString()
            },
            total_employees: totalEmployees,
            total_attendance_records: attendances.length,
            by_status: {
                present: 0,
                absent: 0,
                late: 0,
                on_leave: 0,
                half_day: 0
            },
            by_employee: {},
            by_date: {},
            attendance_rate: 0,
            late_rate: 0,
            absence_rate: 0,
            average_checkin_time: null,
            average_checkout_time: null,
            most_common_status: null,
            status_distribution: {},
            daily_trends: {},
            weekly_trends: {},
            monthly_trends: {}
        };

        // Calculate statistics
        let totalPresent = 0;
        let totalLate = 0;
        let totalAbsent = 0;
        let checkinTimes = [];
        let checkoutTimes = [];

        attendances.forEach(attendance => {
            const date = moment(attendance.date).format('YYYY-MM-DD');
            const employeeId = attendance.employee_id._id.toString();

            // Update status counts
            stats.by_status[attendance.status]++;
            if (attendance.status === 'present') totalPresent++;
            if (attendance.status === 'late') totalLate++;
            if (attendance.status === 'absent') totalAbsent++;

            // Update employee statistics
            if (!stats.by_employee[employeeId]) {
                stats.by_employee[employeeId] = {
                    employee_name: attendance.employee_id.name,
                    total_days: 0,
                    present_days: 0,
                    absent_days: 0,
                    late_days: 0,
                    on_leave_days: 0,
                    half_day_days: 0,
                    attendance_rate: 0,
                    checkin_times: [],
                    checkout_times: []
                };
            }

            stats.by_employee[employeeId].total_days++;
            stats.by_employee[employeeId][`${attendance.status}_days`]++;

            // Update date statistics
            if (!stats.by_date[date]) {
                stats.by_date[date] = {
                    total: 0,
                    present: 0,
                    absent: 0,
                    late: 0,
                    on_leave: 0,
                    half_day: 0
                };
            }
            stats.by_date[date].total++;
            stats.by_date[date][attendance.status]++;

            // Collect check-in/out times
            if (attendance.checkin_time) {
                checkinTimes.push(attendance.checkin_time);
                stats.by_employee[employeeId].checkin_times.push(attendance.checkin_time);
            }
            if (attendance.checkout_time) {
                checkoutTimes.push(attendance.checkout_time);
                stats.by_employee[employeeId].checkout_times.push(attendance.checkout_time);
            }

            // Update trends
            const week = moment(attendance.date).format('YYYY-[W]WW');
            const month = moment(attendance.date).format('YYYY-MM');

            if (!stats.weekly_trends[week]) {
                stats.weekly_trends[week] = {
                    total: 0,
                    present: 0,
                    absent: 0,
                    late: 0
                };
            }
            if (!stats.monthly_trends[month]) {
                stats.monthly_trends[month] = {
                    total: 0,
                    present: 0,
                    absent: 0,
                    late: 0
                };
            }

            stats.weekly_trends[week].total++;
            stats.weekly_trends[week][attendance.status]++;
            stats.monthly_trends[month].total++;
            stats.monthly_trends[month][attendance.status]++;
        });

        // Calculate rates
        const totalDays = attendances.length;
        stats.attendance_rate = totalDays ? (totalPresent / totalDays * 100).toFixed(2) : 0;
        stats.late_rate = totalDays ? (totalLate / totalDays * 100).toFixed(2) : 0;
        stats.absence_rate = totalDays ? (totalAbsent / totalDays * 100).toFixed(2) : 0;

        // Calculate average check-in/out times
        if (checkinTimes.length > 0) {
            const avgCheckin = moment(checkinTimes.reduce((sum, time) => {
                const [hours, minutes] = time.split(':');
                return sum + (parseInt(hours) * 60 + parseInt(minutes));
            }, 0) / checkinTimes.length, 'minutes').format('HH:mm');
            stats.average_checkin_time = avgCheckin;
        }

        if (checkoutTimes.length > 0) {
            const avgCheckout = moment(checkoutTimes.reduce((sum, time) => {
                const [hours, minutes] = time.split(':');
                return sum + (parseInt(hours) * 60 + parseInt(minutes));
            }, 0) / checkoutTimes.length, 'minutes').format('HH:mm');
            stats.average_checkout_time = avgCheckout;
        }

        // Calculate most common status
        const statusCounts = Object.entries(stats.by_status);
        stats.most_common_status = statusCounts.reduce((a, b) => a[1] > b[1] ? a : b)[0];

        // Calculate employee attendance rates
        Object.keys(stats.by_employee).forEach(employeeId => {
            const employee = stats.by_employee[employeeId];
            employee.attendance_rate = employee.total_days ? 
                (employee.present_days / employee.total_days * 100).toFixed(2) : 0;
        });

        // Calculate status distribution
        const totalStatuses = Object.values(stats.by_status).reduce((a, b) => a + b, 0);
        Object.keys(stats.by_status).forEach(status => {
            stats.status_distribution[status] = totalStatuses ? 
                (stats.by_status[status] / totalStatuses * 100).toFixed(2) : 0;
        });

        res.json({
            success: true,
            data: stats
        });

    } catch (error) {
        console.error('Error getting attendance statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Davomat statistikasini olishda xatolik yuz berdi'
        });
    }
};

exports.getPaymentStats = async (req, res) => {
    try {
        const { period = 'monthly', customDate, course_id } = req.query;
        const { startDate, endDate } = getDateRange(period, customDate);

        // Build query
        const query = {
            payment_date: { $gte: startDate.toDate(), $lte: endDate.toDate() }
        };

        // Add course filter if provided
        if (course_id) query.course_id = course_id;

        // Get all payments for the period
        const payments = await Payment.find(query)
            .populate('student_id', 'first_name last_name')
            .populate('course_id', 'name');

        // Calculate overall statistics
        const totalPayments = payments.length;
        const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
        const averagePayment = totalPayments ? totalAmount / totalPayments : 0;

        // Group by payment type
        const byPaymentType = {
            cash: payments.filter(p => p.payment_type === 'cash').reduce((sum, p) => sum + p.amount, 0),
            card: payments.filter(p => p.payment_type === 'card').reduce((sum, p) => sum + p.amount, 0),
            transfer: payments.filter(p => p.payment_type === 'transfer').reduce((sum, p) => sum + p.amount, 0)
        };

        // Group by status
        const byStatus = {
            completed: payments.filter(p => p.status === 'completed').length,
            pending: payments.filter(p => p.status === 'pending').length,
            cancelled: payments.filter(p => p.status === 'cancelled').length
        };

        // Group by course
        const byCourse = {};
        payments.forEach(payment => {
            if (payment.course_id) {
                const courseName = payment.course_id.name;
                if (!byCourse[courseName]) {
                    byCourse[courseName] = {
                        total_amount: 0,
                        payment_count: 0,
                        students: new Set()
                    };
                }
                byCourse[courseName].total_amount += payment.amount;
                byCourse[courseName].payment_count++;
                if (payment.student_id) {
                    byCourse[courseName].students.add(payment.student_id._id.toString());
                }
            }
        });

        // Convert student sets to counts
        Object.keys(byCourse).forEach(course => {
            byCourse[course].unique_students = byCourse[course].students.size;
            delete byCourse[course].students;
        });

        // Get daily payment trends
        const dailyTrends = {};
        payments.forEach(payment => {
            const date = moment(payment.payment_date).format('YYYY-MM-DD');
            if (!dailyTrends[date]) {
                dailyTrends[date] = {
                    amount: 0,
                    count: 0
                };
            }
            dailyTrends[date].amount += payment.amount;
            dailyTrends[date].count++;
        });

        res.json({
            success: true,
            data: {
                period: {
                    start: startDate.format('YYYY-MM-DD'),
                    end: endDate.format('YYYY-MM-DD')
                },
                summary: {
                    total_payments: totalPayments,
                    total_amount: totalAmount,
                    average_payment: averagePayment
                },
                by_payment_type: byPaymentType,
                by_status: byStatus,
                by_course: byCourse,
                daily_trends: dailyTrends
            }
        });
    } catch (error) {
        console.error('Error getting payment statistics:', error);
        res.status(500).json({
            success: false,
            message: 'To\'lov statistikasini olishda xatolik yuz berdi'
        });
    }
};

exports.getReceptionStats = async (req, res) => {
    try {
        const { period = 'monthly', customDate } = req.query;
        const { startDate, endDate } = getDateRange(period, customDate);

        // Build query
        const query = {
            created_at: { $gte: startDate.toDate(), $lte: endDate.toDate() }
        };

        // Get all reception records for the period
        const receptions = await Reception.find(query);

        // Calculate overall statistics
        const totalReceptions = receptions.length;
        const convertedToStudents = receptions.filter(r => r.status === 'converted').length;
        const contacted = receptions.filter(r => r.status === 'contacted').length;
        const notContacted = receptions.filter(r => r.status === 'not_contacted').length;
        const conversionRate = totalReceptions ? (convertedToStudents / totalReceptions * 100).toFixed(2) : 0;

        // Group by source
        const bySource = {};
        receptions.forEach(reception => {
            const source = reception.source || 'unknown';
            if (!bySource[source]) {
                bySource[source] = {
                    total: 0,
                    converted: 0,
                    contacted: 0,
                    not_contacted: 0
                };
            }
            bySource[source].total++;
            if (reception.status === 'converted') bySource[source].converted++;
            if (reception.status === 'contacted') bySource[source].contacted++;
            if (reception.status === 'not_contacted') bySource[source].not_contacted++;
        });

        // Calculate conversion rates for each source
        Object.keys(bySource).forEach(source => {
            bySource[source].conversion_rate = bySource[source].total ? 
                (bySource[source].converted / bySource[source].total * 100).toFixed(2) : 0;
        });

        // Get daily trends
        const dailyTrends = {};
        receptions.forEach(reception => {
            const date = moment(reception.created_at).format('YYYY-MM-DD');
            if (!dailyTrends[date]) {
                dailyTrends[date] = {
                    total: 0,
                    converted: 0,
                    contacted: 0,
                    not_contacted: 0
                };
            }
            dailyTrends[date].total++;
            if (reception.status === 'converted') dailyTrends[date].converted++;
            if (reception.status === 'contacted') dailyTrends[date].contacted++;
            if (reception.status === 'not_contacted') dailyTrends[date].not_contacted++;
        });

        // Calculate conversion rates for each day
        Object.keys(dailyTrends).forEach(date => {
            dailyTrends[date].conversion_rate = dailyTrends[date].total ? 
                (dailyTrends[date].converted / dailyTrends[date].total * 100).toFixed(2) : 0;
        });

        res.json({
            success: true,
            data: {
                period: {
                    start: startDate.format('YYYY-MM-DD'),
                    end: endDate.format('YYYY-MM-DD')
                },
                summary: {
                    total_receptions: totalReceptions,
                    converted_to_students: convertedToStudents,
                    contacted: contacted,
                    not_contacted: notContacted,
                    conversion_rate: conversionRate
                },
                by_source: bySource,
                daily_trends: dailyTrends
            }
        });
    } catch (error) {
        console.error('Error getting reception statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Reception statistikasini olishda xatolik yuz berdi'
        });
    }
};
