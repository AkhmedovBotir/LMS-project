const { Payment, Salary, Employee, Student, Course, Group } = require('../models');

// Get financial statistics
exports.getFinancialStats = async (req, res) => {
    try {
        const { start_date, end_date } = req.query;
        const query = {};

        if (start_date && end_date) {
            query.payment_date = {
                $gte: new Date(start_date),
                $lte: new Date(end_date)
            };
        }

        const payments = await Payment.find(query)
            .populate('course_id', 'name')
            .populate('student_id', 'first_name last_name phone');

        // Calculate statistics
        const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);
        const completedPayments = payments.filter(p => p.status === 'completed');
        const cancelledPayments = payments.filter(p => p.status === 'cancelled');

        const stats = {
            total_payments: payments.length,
            total_amount: totalAmount,
            completed_payments: completedPayments.length,
            cancelled_payments: cancelledPayments.length,
            payments_by_course: {},
            payments_by_type: {}
        };

        // Group by course
        payments.forEach(payment => {
            const courseName = payment.course_id ? payment.course_id.name : 'Unknown';
            if (!stats.payments_by_course[courseName]) {
                stats.payments_by_course[courseName] = {
                    count: 0,
                    amount: 0
                };
            }
            stats.payments_by_course[courseName].count++;
            stats.payments_by_course[courseName].amount += payment.amount;
        });

        // Group by payment type
        payments.forEach(payment => {
            const type = payment.payment_type || 'unknown';
            if (!stats.payments_by_type[type]) {
                stats.payments_by_type[type] = {
                    count: 0,
                    amount: 0
                };
            }
            stats.payments_by_type[type].count++;
            stats.payments_by_type[type].amount += payment.amount;
        });

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Error getting statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Statistikani olishda xatolik yuz berdi'
        });
    }
};

// Get payment report
exports.getPaymentReport = async (req, res) => {
    try {
        const { start_date, end_date, course_id, status } = req.query;
        const query = {};
        
        if (start_date && end_date) {
            query.payment_date = {
                $gte: new Date(start_date),
                $lte: new Date(end_date)
            };
        }

        if (course_id) {
            query.course_id = course_id;
        }

        if (status) {
            query.status = status;
        }

        const payments = await Payment.find(query)
            .populate('course_id', 'name')
            .populate('student_id', 'first_name last_name phone')
            .sort({ payment_date: -1 });

        res.json({
            success: true,
            data: payments
        });
    } catch (error) {
        console.error('Error getting payment report:', error);
        res.status(500).json({
            success: false,
            message: 'To\'lov hisobotini olishda xatolik yuz berdi'
        });
    }
};

// Get detailed salary report
exports.getSalaryReport = async (req, res) => {
    try {
        const { start_date, end_date, employee_id, status } = req.query;

        const query = {};
        
        // Date filter
        if (start_date || end_date) {
            query.month = {};
            if (start_date) query.month.$gte = new Date(start_date);
            if (end_date) query.month.$lte = new Date(end_date);
        }

        // Other filters
        if (employee_id) query.employee_id = employee_id;
        if (status) query.status = status;

        const salaries = await Salary.find(query)
            .populate('employee_id', 'first_name last_name')
            .sort({ month: -1 });

        const total = salaries.reduce((sum, salary) => sum + Number(salary.total_amount), 0);

        res.json({
            success: true,
            data: {
                salaries,
                summary: {
                    total_amount: total,
                    count: salaries.length
                }
            }
        });

    } catch (error) {
        console.error('Error getting salary report:', error);
        res.status(500).json({
            success: false,
            message: 'Maosh hisobotini olishda xatolik yuz berdi'
        });
    }
}; 