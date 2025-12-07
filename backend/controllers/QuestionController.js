const { Question, TestOption, Term, Topic } = require('../models');
const Employee = require('../models/Employee');

class QuestionController {
  // Get all questions with pagination and filters
  static async getAllQuestions(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const query = {};
      if (req.query.topic_id) query.topic_id = req.query.topic_id;
      if (req.query.created_by) query.created_by = req.query.created_by;
      if (req.query.type) query.type = req.query.type;
      if (req.query.status) query.status = req.query.status;
      if (req.query.search) {
        query.$or = [
          { text: { $regex: req.query.search, $options: 'i' } }
        ];
      }

      const questions = await Question.find(query)
        .populate('topic_id', 'name')
        .populate('created_by', 'first_name last_name')
        .populate({
          path: 'options',
          select: req.user.role === 'student' ? 'content' : 'content is_correct'
        })
        .skip(skip)
        .limit(limit)
        .sort({ created_at: -1 });

      const total = await Question.countDocuments(query);

      res.json({
        success: true,
        data: questions,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Error fetching questions:', error);
      res.status(500).json({
        success: false,
        message: 'Savollarni olishda xatolik yuz berdi'
      });
    }
  }

  // Get question by ID
  static async getQuestionById(req, res) {
    try {
      const question = await Question.findById(req.params.id)
        .populate('topic_id', 'name')
        .populate('created_by', 'first_name last_name')
        .populate({
          path: 'options',
          select: req.user.role === 'student' ? 'content' : 'content is_correct'
        });

      if (!question) {
        return res.status(404).json({
          success: false,
          message: 'Savol topilmadi'
        });
      }

      res.json({
        success: true,
        data: question
      });
    } catch (error) {
      console.error('Error fetching question:', error);
      res.status(500).json({
        success: false,
        message: 'Savolni olishda xatolik yuz berdi'
      });
    }
  }

  // Written Questions
  static async getAllWrittenQuestions(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const query = { type: 'text' };
      if (req.query.topic_id) query.topic_id = req.query.topic_id;
      if (req.query.created_by) query.created_by = req.query.created_by;
      if (req.query.status) query.status = req.query.status;
      if (req.query.search) {
        query.$or = [
          { text: { $regex: req.query.search, $options: 'i' } }
        ];
      }

      const questions = await Question.find(query)
        .populate('topic_id', 'name')
        .populate('created_by', 'first_name last_name')
        .lean()
        .skip(skip)
        .limit(limit)
        .sort({ created_at: -1 });

      const total = await Question.countDocuments(query);

      res.json({
        success: true,
        data: questions,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Error fetching written questions:', error);
      res.status(500).json({
        success: false,
        message: 'Yozma savollarni olishda xatolik yuz berdi'
      });
    }
  }

  static async getWrittenQuestionById(req, res) {
    try {
      const question = await Question.findOne({
        _id: req.params.id,
        type: 'text'
      }).populate('topic_id', 'name')
        .populate('created_by', 'first_name last_name');

      if (!question) {
        return res.status(404).json({
          success: false,
          message: 'Yozma savol topilmadi'
        });
      }

      res.json({
        success: true,
        data: question
      });
    } catch (error) {
      console.error('Error fetching written question:', error);
      res.status(500).json({
        success: false,
        message: 'Yozma savolni olishda xatolik yuz berdi'
      });
    }
  }

  static async createWrittenQuestion(req, res) {
    try {
      const { topic_id, content, correct_answer, points = 1 } = req.body;

      // Validate input
      if (!topic_id || !content || !correct_answer) {
        return res.status(400).json({
          success: false,
          message: 'Barcha maydonlarni to\'ldiring'
        });
      }

      // Check if topic exists
      const topic = await Topic.findById(topic_id);
      if (!topic) {
        return res.status(404).json({
          success: false,
          message: 'Mavzu topilmadi'
        });
      }

      // Create question
      const question = await Question.create({
        topic_id,
        created_by: req.user._id,
        type: 'text',
        text: content,
        correct_answer,
        points
      });

      res.status(201).json({
        success: true,
        data: question
      });
    } catch (error) {
      console.error('Error creating written question:', error);
      res.status(500).json({
        success: false,
        message: 'Yozma savol yaratishda xatolik yuz berdi'
      });
    }
  }

  static async updateWrittenQuestion(req, res) {
    try {
      const { id } = req.params;
      const { content, correct_answer, points, status } = req.body;

      const question = await Question.findOne({
        _id: id,
        type: 'text'
      });

      if (!question) {
        return res.status(404).json({
          success: false,
          message: 'Yozma savol topilmadi'
        });
      }

      // Update question fields
      if (content) question.text = content;
      if (correct_answer) question.correct_answer = correct_answer;
      if (points) question.points = points;
      if (status !== undefined) question.status = status;

      await question.save();

      res.json({
        success: true,
        data: question
      });
    } catch (error) {
      console.error('Error updating written question:', error);
      res.status(500).json({
        success: false,
        message: 'Yozma savolni yangilashda xatolik yuz berdi'
      });
    }
  }

  static async deleteWrittenQuestion(req, res) {
    try {
      const { id } = req.params;

      const question = await Question.findOne({
        _id: id,
        type: 'text'
      });

      if (!question) {
        return res.status(404).json({
          success: false,
          message: 'Yozma savol topilmadi'
        });
      }

      await Question.findByIdAndDelete(id);

      res.json({
        success: true,
        message: 'Yozma savol muvaffaqiyatli o\'chirildi'
      });
    } catch (error) {
      console.error('Error deleting written question:', error);
      res.status(500).json({
        success: false,
        message: 'Yozma savolni o\'chirishda xatolik yuz berdi'
      });
    }
  }

  // Test Questions
  static async getAllTestQuestions(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const query = { type: 'single' };
      if (req.query.topic_id) query.topic_id = req.query.topic_id;
      if (req.query.created_by) query.created_by = req.query.created_by;
      if (req.query.status) query.status = req.query.status;
      if (req.query.search) {
        query.$or = [
          { text: { $regex: req.query.search, $options: 'i' } }
        ];
      }

      const questions = await Question.find(query)
        .populate('topic_id', 'name')
        .populate('created_by', 'first_name last_name')
        .populate({
          path: 'options',
          select: req.user.role === 'student' ? 'content' : 'content is_correct'
        })
        .lean()
        .skip(skip)
        .limit(limit)
        .sort({ created_at: -1 });

      const total = await Question.countDocuments(query);

      res.json({
        success: true,
        data: questions,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Error fetching test questions:', error);
      res.status(500).json({
        success: false,
        message: 'Test savollarni olishda xatolik yuz berdi'
      });
    }
  }

  static async getTestQuestionById(req, res) {
    try {
      const question = await Question.findOne({
        _id: req.params.id,
        type: 'single'
      }).populate('topic_id', 'name')
        .populate('created_by', 'first_name last_name')
        .populate({
          path: 'options',
          select: req.user.role === 'student' ? 'content' : 'content is_correct'
        });

      if (!question) {
        return res.status(404).json({
          success: false,
          message: 'Test savol topilmadi'
        });
      }

      res.json({
        success: true,
        data: question
      });
    } catch (error) {
      console.error('Error fetching test question:', error);
      res.status(500).json({
        success: false,
        message: 'Test savolni olishda xatolik yuz berdi'
      });
    }
  }

  static async createTestQuestion(req, res) {
    try {
      const { topic_id, content, options, points = 1 } = req.body;

      // Validate input
      if (!topic_id || !content || !options || !Array.isArray(options) || options.length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Barcha maydonlarni to\'g\'ri to\'ldiring'
        });
      }

      // Check if topic exists
      const topic = await Topic.findById(topic_id);
      if (!topic) {
        return res.status(404).json({
          success: false,
          message: 'Mavzu topilmadi'
        });
      }

      // Check if there is exactly one correct answer
      const correctCount = options.filter(opt => opt.is_correct).length;
      if (correctCount !== 1) {
        return res.status(400).json({
          success: false,
          message: 'Bitta to\'g\'ri javob bo\'lishi kerak'
        });
      }

        // Create question
        const question = await Question.create({
          topic_id,
        created_by: req.user._id,
        type: 'single',
        text: content,
          points
      });

        // Create options
      const testOptions = await TestOption.create(
          options.map(opt => ({
          question_id: question._id,
            content: opt.content,
            is_correct: opt.is_correct
        }))
        );

      res.status(201).json({
        success: true,
        data: { question, options: testOptions }
      });
    } catch (error) {
      console.error('Error creating test question:', error);
      res.status(500).json({
        success: false,
        message: 'Test savolini yaratishda xatolik yuz berdi'
      });
    }
  }

  static async updateTestQuestion(req, res) {
    try {
      const { id } = req.params;
      const { content, points, status, options } = req.body;

      const question = await Question.findOne({
        _id: id,
        type: 'single'
      });

      if (!question) {
        return res.status(404).json({
          success: false,
          message: 'Test savol topilmadi'
        });
      }

      // Update question fields
      if (content) question.text = content;
      if (points) question.points = points;
      if (status !== undefined) question.status = status;

      await question.save();

      // Update test options if provided
      if (options) {
        // Validate options
        if (!Array.isArray(options) || options.length < 2) {
          return res.status(400).json({
            success: false,
            message: 'Test savoli uchun kamida 2ta variant bo\'lishi kerak'
          });
        }

        const correctCount = options.filter(opt => opt.is_correct).length;
        if (correctCount !== 1) {
          return res.status(400).json({
            success: false,
            message: 'Bitta to\'g\'ri javob bo\'lishi kerak'
          });
        }

        // Delete old options
        await TestOption.deleteMany({ question_id: id });

        // Create new options
        await TestOption.create(
          options.map(opt => ({
            question_id: id,
            content: opt.content,
            is_correct: opt.is_correct
          }))
        );
      }

      // Get updated question with options
      const updatedQuestion = await Question.findById(id)
        .populate('topic_id', 'name')
        .populate('created_by', 'first_name last_name')
        .populate({
          path: 'options',
          select: req.user.role === 'student' ? 'content' : 'content is_correct'
        });

      res.json({
        success: true,
        data: updatedQuestion
      });
    } catch (error) {
      console.error('Error updating test question:', error);
      res.status(500).json({
        success: false,
        message: 'Test savolni yangilashda xatolik yuz berdi'
      });
    }
  }

  static async deleteTestQuestion(req, res) {
    try {
      const { id } = req.params;

      const question = await Question.findOne({
        _id: id,
        type: 'single'
      });

      if (!question) {
        return res.status(404).json({
          success: false,
          message: 'Test savol topilmadi'
        });
      }

      // Delete question and its options
      await Promise.all([
        Question.findByIdAndDelete(id),
        TestOption.deleteMany({ question_id: id })
      ]);

      res.json({
        success: true,
        message: 'Test savol muvaffaqiyatli o\'chirildi'
      });
    } catch (error) {
      console.error('Error deleting test question:', error);
      res.status(500).json({
        success: false,
        message: 'Test savolni o\'chirishda xatolik yuz berdi'
      });
    }
  }

  // Terms
  static async getAllTerms(req, res) {
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
        .populate('topic_id', 'name')
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
      console.error('Error fetching terms:', error);
      res.status(500).json({
        success: false,
        message: 'Terminlarni olishda xatolik yuz berdi'
      });
    }
  }

  static async getTermById(req, res) {
    try {
      const term = await Term.findById(req.params.id)
        .populate('topic_id', 'name')
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
      console.error('Error fetching term:', error);
      res.status(500).json({
        success: false,
        message: 'Terminni olishda xatolik yuz berdi'
      });
    }
  }

  static async createTerm(req, res) {
    try {
      const { topic_id, term, definition } = req.body;

      // Validate input
      if (!topic_id || !term || !definition) {
        return res.status(400).json({
          success: false,
          message: 'Barcha maydonlarni to\'ldiring'
        });
      }

      // Check if topic exists
      const topic = await Topic.findById(topic_id);
      if (!topic) {
        return res.status(404).json({
          success: false,
          message: 'Mavzu topilmadi'
        });
      }

      // Create term
      const newTerm = await Term.create({
        topic_id,
        created_by: req.user._id,
        term,
        definition
      });

      res.status(201).json({
        success: true,
        data: newTerm
      });
    } catch (error) {
      console.error('Error creating term:', error);
      res.status(500).json({
        success: false,
        message: 'Termin yaratishda xatolik yuz berdi'
      });
    }
  }

  static async updateTerm(req, res) {
    try {
      const { id } = req.params;
      const { term, definition, status } = req.body;

      const termDoc = await Term.findById(id);
      if (!termDoc) {
        return res.status(404).json({
          success: false,
          message: 'Termin topilmadi'
        });
      }

      // Update fields
      if (term) termDoc.term = term;
      if (definition) termDoc.definition = definition;
      if (status) termDoc.status = status;

      await termDoc.save();

      res.json({
        success: true,
        data: termDoc
      });
    } catch (error) {
      console.error('Error updating term:', error);
      res.status(500).json({
        success: false,
        message: 'Terminni yangilashda xatolik yuz berdi'
      });
    }
  }

  static async deleteTerm(req, res) {
    try {
      const { id } = req.params;

      const term = await Term.findById(id);
      if (!term) {
        return res.status(404).json({
          success: false,
          message: 'Termin topilmadi'
        });
      }

      await Term.findByIdAndDelete(id);

      res.json({
        success: true,
        message: 'Termin muvaffaqiyatli o\'chirildi'
      });
    } catch (error) {
      console.error('Error deleting term:', error);
      res.status(500).json({
        success: false,
        message: 'Terminni o\'chirishda xatolik yuz berdi'
      });
    }
  }

  // Get all questions by topic
  static async getByTopic(req, res) {
    try {
      const { topic_id } = req.params;

      // Get topic with questions and terms
      const topic = await Topic.findById(topic_id)
        .populate({
          path: 'questions',
          match: { status: 'active' },
          populate: {
            path: 'options',
            select: req.user.role === 'student' ? 'content' : 'content is_correct'
          }
        })
        .populate({
          path: 'terms',
          match: { status: 'active' }
      });

      if (!topic) {
        return res.status(404).json({
          success: false,
          message: 'Mavzu topilmadi'
        });
      }

      // Check if topic has minimum required terms
      const termCount = topic.terms ? topic.terms.length : 0;
      const hasMinTerms = termCount >= 5;

      res.json({
        success: true,
        data: {
          ...topic.toObject(),
          has_min_terms: hasMinTerms
        }
      });
    } catch (error) {
      console.error('Error getting topic questions:', error);
      res.status(500).json({
        success: false,
        message: 'Savollarni olishda xatolik yuz berdi'
      });
    }
  }

  // Update question
  static async updateQuestion(req, res) {
    try {
      const { id } = req.params;
      const { content, correct_answer, points, status, options } = req.body;

      const question = await Question.findById(id);
      if (!question) {
        return res.status(404).json({
          success: false,
          message: 'Savol topilmadi'
        });
      }

      // Update question fields
      if (content) question.text = content;
      if (correct_answer) question.correct_answer = correct_answer;
      if (points) question.points = points;
      if (status !== undefined) question.status = status;

      await question.save();

        // Update test options if provided
      if (question.type === 'single' && options) {
          // Validate options
          if (!Array.isArray(options) || options.length < 2) {
          return res.status(400).json({
            success: false,
            message: 'Test savoli uchun kamida 2ta variant bo\'lishi kerak'
          });
          }

          const correctCount = options.filter(opt => opt.is_correct).length;
          if (correctCount !== 1) {
          return res.status(400).json({
            success: false,
            message: 'Bitta to\'g\'ri javob bo\'lishi kerak'
          });
          }

          // Delete old options
        await TestOption.deleteMany({ question_id: id });

          // Create new options
        await TestOption.create(
            options.map(opt => ({
              question_id: id,
              content: opt.content,
              is_correct: opt.is_correct
          }))
          );
        }

      // Get updated question with options
      const updatedQuestion = await Question.findById(id)
        .populate('topic_id', 'name')
        .populate('created_by', 'first_name last_name')
        .populate({
          path: 'options',
          select: req.user.role === 'student' ? 'content' : 'content is_correct'
        });

      res.json({
        success: true,
        data: updatedQuestion
      });
    } catch (error) {
      console.error('Error updating question:', error);
      res.status(500).json({
        success: false,
        message: 'Savolni yangilashda xatolik yuz berdi'
      });
    }
  }

  // Delete question
  static async deleteQuestion(req, res) {
    try {
      const { id } = req.params;

      const question = await Question.findById(id);
      if (!question) {
        return res.status(404).json({
          success: false,
          message: 'Savol topilmadi'
        });
      }

      // Delete question and its options
      await Promise.all([
        Question.findByIdAndDelete(id),
        TestOption.deleteMany({ question_id: id })
      ]);

      res.json({
        success: true,
        message: 'Savol muvaffaqiyatli o\'chirildi'
      });
    } catch (error) {
      console.error('Error deleting question:', error);
      res.status(500).json({
        success: false,
        message: 'Savolni o\'chirishda xatolik yuz berdi'
      });
    }
  }

  // Create new question
  static async createQuestion(req, res) {
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

      const question = await Question.create(req.body);

      res.status(201).json({
        success: true,
        message: 'Savol muvaffaqiyatli yaratildi',
        data: question
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Xatolik yuz berdi',
        error: error.message
      });
    }
  }
}

module.exports = QuestionController; 