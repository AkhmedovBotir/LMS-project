const { Transaction } = require('../models');

// Create new transaction
exports.create = async (req, res) => {
  try {
    const { type, amount, description, date, payment_method } = req.body;
    
    // Validate required fields
    if (!type || !amount || !description || !payment_method) {
      return res.status(400).json({
        success: false,
        message: 'Barcha majburiy maydonlarni to\'ldiring'
      });
    }

    // Validate amount
    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Summa 0 dan katta bo\'lishi kerak'
      });
    }

    // Validate type
    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Noto\'g\'ri tranzaksiya turi'
      });
    }

    // Validate payment method
    if (!['cash', 'card', 'transfer'].includes(payment_method)) {
      return res.status(400).json({
        success: false,
        message: 'Noto\'g\'ri to\'lov usuli'
      });
    }

    const transaction = await Transaction.create({
      type,
      amount,
      description,
      date: date || new Date(),
      payment_method,
      status: 'active'
    });

    res.status(201).json({
      success: true,
      message: 'Tranzaksiya muvaffaqiyatli yaratildi',
      data: transaction
    });
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({
      success: false,
      message: 'Tranzaksiya yaratishda xatolik yuz berdi'
    });
  }
};

// Get all transactions with filters
exports.getAll = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      type,
      start_date,
      end_date,
      payment_method,
      min_amount,
      max_amount
    } = req.query;

    const query = { status: 'active' };
    if (type) query.type = type;
    if (payment_method) query.payment_method = payment_method;
    
    if (start_date || end_date) {
      query.date = {};
      if (start_date) query.date.$gte = new Date(start_date);
      if (end_date) query.date.$lte = new Date(end_date);
    }

    if (min_amount || max_amount) {
      query.amount = {};
      if (min_amount) query.amount.$gte = parseFloat(min_amount);
      if (max_amount) query.amount.$lte = parseFloat(max_amount);
    }

    const skip = (page - 1) * limit;

    const [transactions, count] = await Promise.all([
      Transaction.find(query)
        .sort({ date: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Transaction.countDocuments(query)
    ]);

    // Calculate totals using aggregation
    const totals = await Transaction.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' }
        }
      }
    ]);

    const summary = {
      income: 0,
      expense: 0
    };

    totals.forEach(total => {
      summary[total._id] = total.total;
    });

    summary.balance = summary.income - summary.expense;

    res.json({
      success: true,
      data: transactions,
      summary,
      pagination: {
        total: count,
        page: parseInt(page),
        total_pages: Math.ceil(count / limit),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error getting transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Tranzaksiyalarni olishda xatolik yuz berdi'
    });
  }
};

// Get transaction by ID
exports.getById = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      status: 'active'
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Tranzaksiya topilmadi'
      });
    }

    res.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    console.error('Error getting transaction:', error);
    res.status(500).json({
      success: false,
      message: 'Tranzaksiyani olishda xatolik yuz berdi'
    });
  }
};

// Update transaction
exports.update = async (req, res) => {
  try {
    const { description, date, payment_method } = req.body;
    
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      status: 'active'
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Tranzaksiya topilmadi'
      });
    }

    // Only allow updating certain fields
    if (description !== undefined) transaction.description = description;
    if (date !== undefined) transaction.date = date;
    if (payment_method !== undefined) transaction.payment_method = payment_method;

    await transaction.save();

    res.json({
      success: true,
      message: 'Tranzaksiya yangilandi',
      data: transaction
    });
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({
      success: false,
      message: 'Tranzaksiyani yangilashda xatolik yuz berdi'
    });
  }
};

// Get transactions summary
exports.getSummary = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    const match = { status: 'active' };
    
    if (start_date || end_date) {
      match.date = {};
      if (start_date) match.date.$gte = new Date(start_date);
      if (end_date) match.date.$lte = new Date(end_date);
    }

    // Get summary by type using aggregation
    const summary = await Transaction.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Format response
    const result = {
      total_income: 0,
      total_expense: 0,
      balance: 0,
      by_type: {}
    };

    summary.forEach(item => {
      result.by_type[item._id] = {
        total: item.total,
        count: item.count
      };
      
      if (item._id === 'income') {
        result.total_income = item.total;
      } else if (item._id === 'expense') {
        result.total_expense = item.total;
      }
    });

    result.balance = result.total_income - result.total_expense;

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error getting transactions summary:', error);
    res.status(500).json({
      success: false,
      message: 'Tranzaksiyalar statistikasini olishda xatolik yuz berdi'
    });
  }
};

// Delete transaction completely
exports.delete = async (req, res) => {
    try {
        const id = req.params.id;
        
        if (!id || id === 'undefined') {
            return res.status(400).json({
                success: false,
                message: 'Tranzaksiya ID si ko\'rsatilmagan'
            });
        }

        const transaction = await Transaction.findById(id);

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Tranzaksiya topilmadi'
            });
        }

        await Transaction.findByIdAndDelete(id);

        res.json({
            success: true,
            message: 'Tranzaksiya muvaffaqiyatli o\'chirildi'
        });
    } catch (error) {
        console.error('Error deleting transaction:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Noto\'g\'ri tranzaksiya ID si'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Tranzaksiyani o\'chirishda xatolik yuz berdi'
        });
    }
}; 