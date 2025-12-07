const mongoose = require('mongoose');

// Import all models
const Admin = require('./Admin');
const UserType = require('./UserType');
const Department = require('./Department');
const Employee = require('./Employee');
const Position = require('./Position');
const Resume = require('./Resume');
const Attendance = require('./Attendance');
const Course = require('./Course');
const Group = require('./Group');
const Student = require('./Student');
const GroupStudent = require('./GroupStudent');
const Topic = require('./Topic');
const Payment = require('./Payment');
const AttendanceStudent = require('./AttendanceStudent');
const Term = require('./Term');
const Question = require('./Question');
const TestOption = require('./TestOption');
const Transaction = require('./Transaction');
const Salary = require('./Salary');
const SalaryConfig = require('./SalaryConfig');
const Schedule = require('./Schedule');

// Export all models
module.exports = {
  mongoose,
  Admin,
  UserType,
  Department,
  Employee,
  Position,
  Resume,
  Attendance,
  Course,
  Group,
  Student,
  GroupStudent,
  Topic,
  Payment,
  AttendanceStudent,
  Term,
  Question,
  TestOption,
  Transaction,
  Salary,
  SalaryConfig,
  Schedule
}; 