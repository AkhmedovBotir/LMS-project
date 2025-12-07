const TestOption = require('../models/TestOption');
const Question = require('../models/Question');

// Get all test options with pagination and filters
exports.getAllTestOptions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.question_id) query.question_id = req.query.question_id;
    if (req.query.is_correct !== undefined) query.is_correct = req.query.is_correct;
    if (req.query.search) {
      query.content = { $regex: req.query.search, $options: 'i' };
    }

    const options = await TestOption.find(query)
      .populate('question_id', 'question_text')
      .skip(skip)
      .limit(limit)
      .sort({ created_at: -1 });

    const total = await TestOption.countDocuments(query);

    res.json({
      success: true,
      data: options,
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

// Get test option by ID
exports.getTestOptionById = async (req, res) => {
  try {
    const option = await TestOption.findById(req.params.id)
      .populate('question_id', 'question_text');

    if (!option) {
      return res.status(404).json({
        success: false,
        message: 'Test variant topilmadi'
      });
    }

    res.json({
      success: true,
      data: option
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Xatolik yuz berdi',
      error: error.message
    });
  }
};

// Create new test option
exports.createTestOption = async (req, res) => {
  try {
    const { question_id } = req.body;

    // Check if question exists
    const question = await Question.findById(question_id);
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Savol topilmadi'
      });
    }

    // Check if question is a test question
    if (question.question_type !== 'test') {
      return res.status(400).json({
        success: false,
        message: 'Bu savol test savoli emas'
      });
    }

    const option = await TestOption.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Test variant muvaffaqiyatli yaratildi',
      data: option
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Xatolik yuz berdi',
      error: error.message
    });
  }
};

// Update test option
exports.updateTestOption = async (req, res) => {
  try {
    const { question_id } = req.body;

    // Check if option exists
    const option = await TestOption.findById(req.params.id);
    if (!option) {
      return res.status(404).json({
        success: false,
        message: 'Test variant topilmadi'
      });
    }

    // Check if question exists if being updated
    if (question_id) {
      const question = await Question.findById(question_id);
      if (!question) {
        return res.status(404).json({
          success: false,
          message: 'Savol topilmadi'
        });
      }

      // Check if question is a test question
      if (question.question_type !== 'test') {
        return res.status(400).json({
          success: false,
          message: 'Bu savol test savoli emas'
        });
      }
    }

    const updatedOption = await TestOption.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json({
      success: true,
      message: 'Test variant muvaffaqiyatli yangilandi',
      data: updatedOption
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Xatolik yuz berdi',
      error: error.message
    });
  }
};

// Delete test option
exports.deleteTestOption = async (req, res) => {
  try {
    const option = await TestOption.findById(req.params.id);
    if (!option) {
      return res.status(404).json({
        success: false,
        message: 'Test variant topilmadi'
      });
    }

    await option.deleteOne();

    res.json({
      success: true,
      message: 'Test variant muvaffaqiyatli o\'chirildi'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Xatolik yuz berdi',
      error: error.message
    });
  }
}; 