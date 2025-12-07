const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const authRoutes = require('./routes/auth');
const departmentRoutes = require('./routes/department');
const positionRoutes = require('./routes/position');
const employeeRoutes = require('./routes/employee');
const employeeMobileRoutes = require('./routes/employeeMobile');
const resumeRoutes = require('./routes/resume');
const attendanceRoutes = require('./routes/attendance');
const courseRoutes = require('./routes/course');
const groupRoutes = require('./routes/group');
const studentRoutes = require('./routes/student');
const groupStudentRoutes = require('./routes/group-student');
const scheduleRoutes = require('./routes/schedule');
const topicRoutes = require('./routes/topic');
const paymentRoutes = require('./routes/payments');
const attendanceStudentRoutes = require('./routes/attendance-students');
const questionRoutes = require('./routes/question');
const transactionRoutes = require('./routes/transactions');
const salariesRoutes = require('./routes/salaries');
const statisticsRoutes = require('./routes/statistics');
const marketingRoutes = require('./routes/marketing');
const receptionRoutes = require('./routes/reception');
const dashboardRoutes = require('./routes/dashboard')
const statisticsDashboardRoutes = require('./routes/statistics-department')
const contactRoutes = require('./routes/contact');
const studentMobileRoutes = require('./routes/student-mobile');
const courseMaterialRoutes = require('./routes/course-material');

const path = require('path');

const app = express();

// Middleware
const allowedOrigins = ['http://localhost:3000', 'https://sizningfrontend.uz'];
app.use(cors({
  origin: function(origin, callback){
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/positions', positionRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/mobile/employees', employeeMobileRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/attendances', attendanceRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/group-students', groupStudentRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/attendance-students', attendanceStudentRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/salaries', salariesRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/marketing', marketingRoutes);
app.use('/api/reception', receptionRoutes);
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/statistics-department', statisticsDashboardRoutes)
app.use('/api/contact', contactRoutes);
app.use('/api/student-mobile', studentMobileRoutes);
app.use('/api/course-material', courseMaterialRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

// Database connection and server start
const PORT = process.env.PORT || 5000;

// Connect to MongoDB and start server
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  }); 