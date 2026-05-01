const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  queue: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Queue',
    required: true,
  },
  tokenNumber: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['waiting', 'served', 'cancelled'],
    default: 'waiting',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Booking', bookingSchema);
