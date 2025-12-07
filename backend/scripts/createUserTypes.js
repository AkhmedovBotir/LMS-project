require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const createUserTypes = require('../utils/createUserTypes');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    return createUserTypes();
  })
  .then(() => {
    console.log('User types creation process completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  }); 