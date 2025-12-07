const UserType = require('../models/UserType');

const userTypes = [
  { name: 'general' },
  { name: 'admin' },
  { name: 'manager' },
  { name: 'hr' },
  { name: 'reception' },
  { name: 'finance_admin' },
  { name: 'marketing' },
  { name: 'reports_admin' },
  { name: 'teacher' }
];

const createUserTypes = async () => {
  try {
    // Get existing user types
    const existingTypes = await UserType.find();
    const existingNames = existingTypes.map(type => type.name);

    // Filter out types that already exist
    const newTypes = userTypes.filter(type => !existingNames.includes(type.name));

    if (newTypes.length === 0) {
      console.log('All user types already exist');
      return;
    }

    // Create new user types
    const createdTypes = await UserType.insertMany(newTypes);

    console.log(`Created ${createdTypes.length} new user types:`);
    createdTypes.forEach(type => {
      console.log(`- ${type.name}`);
    });
  } catch (error) {
    console.error('Error creating user types:', error);
  }
};

module.exports = createUserTypes; 