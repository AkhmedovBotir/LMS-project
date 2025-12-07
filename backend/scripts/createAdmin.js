require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const createAdmin = require('../utils/createAdmin');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    return createAdmin();
  })
  .then(() => {
    console.log('Admin creation process completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  }); 