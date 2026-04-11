const mongoose = require('mongoose');
const User = require('./backend/models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: './backend/.env' });

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const adminExists = await User.findOne({ email: 'admin@test.com' });
    if (adminExists) {
      console.log('Admin already exists');
    } else {
      const hashedPassword = await bcrypt.hash('admin123', 12);
      await User.create({
        username: 'admin',
        email: 'admin@test.com',
        password: hashedPassword,
        role: 'admin'
      });
      console.log('Admin user created successfully');
    }
    process.exit();
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
