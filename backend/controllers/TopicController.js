const { Topic, Course } = require('../models');

// Create topic
exports.create = async (req, res) => {
  try {
    const {
      course_id,
      title
    } = req.body;

    // Validate input
    if (!course_id || !title) {
      return res.status(400).json({
        success: false,
        message: 'Kurs ID va mavzu nomi kiritilishi shart'
      });
    }

    // Check if course exists
    const course = await Course.findById(course_id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Kurs topilmadi'
      });
    }

    const topic = await Topic.create({
      course_id,
      title
    });

    res.status(201).json({
      success: true,
      data: topic
    });
  } catch (error) {
    console.error('Error creating topic:', error);
    res.status(500).json({
      success: false,
      message: 'Mavzu yaratishda xatolik yuz berdi',
      error: error.message
    });
  }
};

// Get topics by course
exports.getByCourse = async (req, res) => {
  try {
    const { course_id } = req.params;

    // Validate course_id
    if (!course_id || course_id === 'NaN') {
      return res.status(400).json({
        success: false,
        message: 'Noto\'g\'ri kurs ID'
      });
    }

    // Check if course exists
    const course = await Course.findById(course_id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Kurs topilmadi'
      });
    }

    const topics = await Topic.find({
      course_id,
      status: 'active'
    }).populate('course_id', 'name');

    res.json({
      success: true,
      data: topics
    });
  } catch (error) {
    console.error('Error fetching topics:', error);
    res.status(500).json({
      success: false,
      message: 'Mavzularni olishda xatolik yuz berdi',
      error: error.message
    });
  }
};

// Update topic
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      status
    } = req.body;

    const topic = await Topic.findById(id);
    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Mavzu topilmadi'
      });
    }

    if (title !== undefined) topic.title = title;
    if (status !== undefined) topic.status = status;
    await topic.save();

    res.json({
      success: true,
      data: topic
    });
  } catch (error) {
    console.error('Error updating topic:', error);
    res.status(500).json({
      success: false,
      message: 'Mavzuni yangilashda xatolik yuz berdi',
      error: error.message
    });
  }
};

// Delete topic
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if topic exists
    const topic = await Topic.findById(id);
    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Mavzu topilmadi'
      });
    }

    // Perform hard delete
    await Topic.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Mavzu o\'chirildi'
    });
  } catch (error) {
    console.error('Error deleting topic:', error);
    res.status(500).json({
      success: false,
      message: 'Mavzuni o\'chirishda xatolik yuz berdi',
      error: error.message
    });
  }
};

// Reorder topics
exports.reorder = async (req, res) => {
  try {
    const { topics } = req.body;

    if (!Array.isArray(topics)) {
      return res.status(400).json({
        success: false,
        message: 'Mavzular ro\'yxati array formatida bo\'lishi kerak'
      });
    }

    // Update order numbers
    const updatePromises = topics.map(item => 
      Topic.findByIdAndUpdate(
        item.id,
        { order_number: item.order_number },
        { new: true }
      )
    );

    await Promise.all(updatePromises);

    res.json({
      success: true,
      message: 'Mavzular tartibi yangilandi'
    });
  } catch (error) {
    console.error('Error reordering topics:', error);
    res.status(500).json({
      success: false,
      message: 'Mavzular tartibini yangilashda xatolik yuz berdi',
      error: error.message
    });
  }
}; 