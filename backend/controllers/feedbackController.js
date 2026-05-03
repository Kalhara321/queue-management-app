const Feedback = require('../models/Feedback');
const Queue = require('../models/Queue');

// @desc    Create new feedback
// @route   POST /api/feedbacks
// @access  Private
exports.createFeedback = async (req, res) => {
  try {
    const { queueId, rating, quickSelect, comment } = req.body;

    const queue = await Queue.findById(queueId);
    if (!queue) {
      return res.status(404).json({ message: 'Queue not found' });
    }

    const feedback = new Feedback({
      queue: queueId,
      user: req.user.id,
      rating,
      quickSelect,
      comment,
    });

    await feedback.save();

    res.status(201).json(feedback);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @desc    Get feedbacks
// @route   GET /api/feedbacks
// @access  Private
exports.getFeedbacks = async (req, res) => {
  try {
    const { queueId } = req.query;
    
    let query = {};
    if (queueId) {
      query.queue = queueId;
    }

    const feedbacks = await Feedback.find(query)
      .populate('user', 'username name email')
      .populate('queue', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json(feedbacks);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @desc    Update feedback
// @route   PUT /api/feedbacks/:id
// @access  Private
exports.updateFeedback = async (req, res) => {
  try {
    const { rating, quickSelect, comment } = req.body;

    let feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    // Optional: Check if user is the owner or admin
    if (feedback.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this feedback' });
    }

    feedback.rating = rating || feedback.rating;
    feedback.quickSelect = quickSelect || feedback.quickSelect;
    feedback.comment = comment !== undefined ? comment : feedback.comment;

    await feedback.save();

    res.status(200).json(feedback);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @desc    Delete feedback
// @route   DELETE /api/feedbacks/:id
// @access  Private
exports.deleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    // Check if user is owner or admin
    if (feedback.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this feedback' });
    }

    await feedback.deleteOne();

    res.status(200).json({ message: 'Feedback removed' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
