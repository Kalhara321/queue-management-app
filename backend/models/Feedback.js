const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  queue: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Queue',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  quickSelect: {
    type: String,
    enum: ['Too much waiting time', 'Good service', 'Queue moved fast', 'System error', 'Other'],
    default: 'Other'
  },
  comment: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Feedback', feedbackSchema);
