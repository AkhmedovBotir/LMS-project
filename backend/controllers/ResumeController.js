const Resume = require('../models/Resume');
const Employee = require('../models/Employee');
const PDFDocument = require('pdfkit');

// Get all resumes with pagination and filters
exports.getAllResumes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.employee_id) query.employee_id = req.query.employee_id;
    if (req.query.status) query.status = req.query.status;

    const resumes = await Resume.find(query)
      .populate('employee', 'first_name last_name')
      .skip(skip)
      .limit(limit)
      .sort({ created_at: -1 });

    const total = await Resume.countDocuments(query);

    res.json({
      success: true,
      data: resumes,
      pagination: {
        total,
        page,
        limit,
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

// Get resume by ID
exports.getResumeById = async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id)
      .populate('employee', 'first_name last_name');

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Rezyume topilmadi'
      });
    }

    res.json({
      success: true,
      data: resume
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Xatolik yuz berdi',
      error: error.message
    });
  }
};

// Create new resume
exports.createResume = async (req, res) => {
  try {
    const {
      employee_id,
      education,
      experience,
      skills,
      languages,
      certificates,
      additional_info,
      status
    } = req.body;

    // Check if employee exists
    const employee = await Employee.findById(employee_id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Xodim topilmadi'
      });
    }

    // Check if resume already exists for employee
    const existingResume = await Resume.findOne({ employee_id });
    if (existingResume) {
      return res.status(400).json({
        success: false,
        message: 'Bu xodim uchun rezyume allaqachon mavjud'
      });
    }

    const resume = await Resume.create({
      employee_id,
      education,
      experience,
      skills,
      languages,
      certificates,
      additional_info,
      status
    });

    res.status(201).json({
      success: true,
      message: 'Rezyume muvaffaqiyatli yaratildi',
      data: resume
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Xatolik yuz berdi',
      error: error.message
    });
  }
};

// Update resume
exports.updateResume = async (req, res) => {
  try {
    const {
      education,
      experience,
      skills,
      languages,
      certificates,
      additional_info,
      status
    } = req.body;

    const resume = await Resume.findById(req.params.id);
    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Rezyume topilmadi'
      });
    }

    const updatedResume = await Resume.findByIdAndUpdate(
      req.params.id,
      {
        education,
        experience,
        skills,
        languages,
        certificates,
        additional_info,
        status
      },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Rezyume muvaffaqiyatli yangilandi',
      data: updatedResume
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Xatolik yuz berdi',
      error: error.message
    });
  }
};

// Delete resume
exports.deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Rezyume topilmadi'
      });
    }

    await resume.deleteOne();

    res.json({
      success: true,
      message: 'Rezyume muvaffaqiyatli o\'chirildi'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Xatolik yuz berdi',
      error: error.message
    });
  }
};

// Export resume to PDF
exports.exportToPDF = async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id)
      .populate('employee_id', 'first_name last_name phone');

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
      info: {
        Title: `${resume.employee_id.first_name} ${resume.employee_id.last_name}'s Resume`,
        Author: 'SARGET ERP',
        Subject: 'Professional Resume',
        Keywords: 'resume, professional, cv',
        CreationDate: new Date()
      }
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=resume_${resume._id}.pdf`);

    doc.pipe(res);

    // Modern header with gradient background
    const headerHeight = 120;
    doc.rect(0, 0, doc.page.width, headerHeight)
       .fill('#1a237e');
    
    doc.fillColor('#ffffff')
       .fontSize(32)
       .font('Helvetica-Bold')
       .text(`${resume.employee_id.first_name} ${resume.employee_id.last_name}`, {
         align: 'center',
         y: 40
       });
    
    doc.fillColor('#e8eaf6')
       .fontSize(14)
       .font('Helvetica')
       .text(`Phone: ${resume.employee_id.phone}`, {
         align: 'center',
         y: 80
       });

    // Add content sections
    doc.moveDown(2)
       .fillColor('#000000')
       .fontSize(18)
         .font('Helvetica-Bold')
       .text('Education', { underline: true });
      
      resume.education.forEach(edu => {
      doc.moveDown()
         .fontSize(14)
           .font('Helvetica-Bold')
         .text(edu.degree)
         .fontSize(12)
           .font('Helvetica')
         .text(`${edu.institution}, ${edu.year}`);
      });
      
    doc.moveDown(2)
       .fontSize(18)
         .font('Helvetica-Bold')
       .text('Experience', { underline: true });
      
      resume.experience.forEach(exp => {
      doc.moveDown()
         .fontSize(14)
         .font('Helvetica-Bold')
         .text(exp.position)
         .fontSize(12)
           .font('Helvetica')
         .text(`${exp.company}, ${exp.duration}`);
      });

    doc.moveDown(2)
       .fontSize(18)
         .font('Helvetica-Bold')
       .text('Skills', { underline: true });
      
    doc.moveDown()
       .fontSize(12)
       .font('Helvetica')
       .text(resume.skills.join(', '));

    doc.moveDown(2)
       .fontSize(18)
       .font('Helvetica-Bold')
       .text('Languages', { underline: true });
      
      resume.languages.forEach(lang => {
      doc.moveDown()
         .fontSize(12)
           .font('Helvetica')
         .text(`${lang.language}: ${lang.level}`);
    });

    if (resume.certificates && resume.certificates.length > 0) {
      doc.moveDown(2)
         .fontSize(18)
         .font('Helvetica-Bold')
         .text('Certificates', { underline: true });
      
      resume.certificates.forEach(cert => {
        doc.moveDown()
           .fontSize(12)
           .font('Helvetica')
           .text(`${cert.name} - ${cert.issuer} (${cert.year})`);
      });
    }

    if (resume.additional_info) {
      doc.moveDown(2)
         .fontSize(18)
         .font('Helvetica-Bold')
         .text('Additional Information', { underline: true });
      
      doc.moveDown()
         .fontSize(12)
         .font('Helvetica')
         .text(resume.additional_info);
    }

    doc.end();
  } catch (error) {
    console.error('Error exporting resume to PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Error exporting resume to PDF',
      error: error.message
    });
  }
}; 