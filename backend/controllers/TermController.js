const Term = require('../models/Term');
const Topic = require('../models/Topic');
const Employee = require('../models/Employee');

// Get all terms with pagination and filters
exports.getAllTerms = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.topic_id) query.topic_id = req.query.topic_id;
    if (req.query.created_by) query.created_by = req.query.created_by;
    if (req.query.status) query.status = req.query.status;
    if (req.query.search) {
      query.$or = [
        { term: { $regex: req.query.search, $options: 'i' } },
        { definition: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const terms = await Term.find(query)
      .populate('topic_id', 'title')
      .populate('created_by', 'first_name last_name')
      .skip(skip)
      .limit(limit)
      .sort({ created_at: -1 });

    const total = await Term.countDocuments(query);

    res.json({
      success: true,
      data: terms,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Xatolik yuz berdi',
      error: error.message
    });
  }
};

// Get term by ID
exports.getTermById = async (req, res) => {
  try {
    const term = await Term.findById(req.params.id)
      .populate('topic_id', 'title')
      .populate('created_by', 'first_name last_name');

    if (!term) {
      return res.status(404).json({
        success: false,
        message: 'Termin topilmadi'
      });
    }

    res.json({
      success: true,
      data: term
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Xatolik yuz berdi',
      error: error.message
    });
  }
};

// Create new term
exports.createTerm = async (req, res) => {
  try {
    const { topic_id, created_by } = req.body;

    // Check if topic exists
    const topic = await Topic.findById(topic_id);
    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Mavzu topilmadi'
      });
    }

    // Check if creator exists
    const creator = await Employee.findById(created_by);
    if (!creator) {
      return res.status(404).json({
        success: false,
        message: 'Yaratuvchi topilmadi'
      });
    }

    const term = await Term.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Termin muvaffaqiyatli yaratildi',
      data: term
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Xatolik yuz berdi',
      error: error.message
    });
  }
};

// Update term
exports.updateTerm = async (req, res) => {
  try {
    const { topic_id, created_by } = req.body;

    // Check if term exists
    const term = await Term.findById(req.params.id);
    if (!term) {
      return res.status(404).json({
        success: false,
        message: 'Termin topilmadi'
      });
    }

    // Check if topic exists if being updated
    if (topic_id) {
      const topic = await Topic.findById(topic_id);
      if (!topic) {
        return res.status(404).json({
          success: false,
          message: 'Mavzu topilmadi'
        });
      }
    }

    // Check if creator exists if being updated
    if (created_by) {
      const creator = await Employee.findById(created_by);
      if (!creator) {
        return res.status(404).json({
          success: false,
          message: 'Yaratuvchi topilmadi'
        });
      }
    }

    const updatedTerm = await Term.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json({
      success: true,
      message: 'Termin muvaffaqiyatli yangilandi',
      data: updatedTerm
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Xatolik yuz berdi',
      error: error.message
    });
  }
};

// Delete term
exports.deleteTerm = async (req, res) => {
  try {
    const term = await Term.findById(req.params.id);
    if (!term) {
      return res.status(404).json({
        success: false,
        message: 'Termin topilmadi'
      });
    }

    await term.deleteOne();

    res.json({
      success: true,
      message: 'Termin muvaffaqiyatli o\'chirildi'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Xatolik yuz berdi',
      error: error.message
    });
  }
}; 