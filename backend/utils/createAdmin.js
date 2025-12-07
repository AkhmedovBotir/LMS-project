const Admin = require('../models/Admin');
const UserType = require('../models/UserType');

const createAdmin = async () => {
  try {
    // Check if admin user type exists, if not create it
    let adminUserType = await UserType.findOne({ name: 'admin' });
    if (!adminUserType) {
      adminUserType = await UserType.create({
        name: 'admin'
      });
      console.log('Admin user type created');
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ username: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }

    // Create admin user
    const admin = await Admin.create({
      username: 'sarget',
      password: 'sarget123', // Password will be hashed by the model's pre-save hook
      first_name: 'Sarget',
      last_name: 'Admin',
      phone: '+998901234567',
      user_type_id: adminUserType._id,
      status: 'active'
    });

    console.log('Admin user created successfully');
    console.log('Username: admin');
    console.log('Password: admin123');
  } catch (error) {
    console.error('Error creating admin:', error);
  }
};

module.exports = createAdmin; 