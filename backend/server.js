const express = require('express');
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message, err.stack);
  process.exit(1);
});

const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});


// Test route
app.get('/', (req, res) => {
  res.send('Server is running!');
});

// TEMPORARY TEST ROUTE - remove later
app.post('/api/test-login', async (req, res) => {
  const jwt = require('jsonwebtoken');
  const token = jwt.sign({ id: '507f1f77bcf86cd799439011', role: 'admin' }, process.env.JWT_SECRET);
  res.json({ token });
});

// Auth routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// Notification routes
const notificationRoutes = require('./routes/notificationRoutes');
app.use('/api/notifications', notificationRoutes);

// Queue routes
const queueRoutes = require('./routes/queueRoutes');
app.use('/api/queues', queueRoutes);

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 10000,
  family: 4
})
  .then(() => {
    console.log('MongoDB Connected ✅');
    app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT} ✅`);
    });
  })
  .catch((err) => console.log('MongoDB Error:', err));