const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const seedAdmin = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error('MONGO_URI is not defined in .env');
      process.exit(1);
    }
    
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const adminEmail = 'admin@queue.com';
    const adminUsername = 'Admin';
    
    // Check if either exists
    const adminByEmail = await User.findOne({ email: adminEmail });
    const adminByUsername = await User.findOne({ username: adminUsername });
    
    if (adminByEmail || adminByUsername) {
      console.log('Admin user already exists (by email or username)');
    } else {
      // Pass PLAIN password, let pre-save hook hash it
      await User.create({
        username: adminUsername,
        email: adminEmail,
        password: 'Admin123', 
        role: 'admin'
      });
      console.log('Admin user created successfully: Admin / Admin123');
    }
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
