const mongoose = require('mongoose');
const Queue = require('./models/Queue');
const User = require('./models/User');
require('dotenv').config();

const createQueue = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const admin = await User.findOne({ role: 'admin' });
  if (admin) {
    const queue = new Queue({
      name: 'Test Queue',
      details: 'This is a test queue for feedback testing.',
      createdBy: admin._id
    });
    await queue.save();
    console.log('Test queue created successfully');
  }
  process.exit(0);
};

createQueue();
