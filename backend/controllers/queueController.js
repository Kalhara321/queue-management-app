const Queue = require('../models/Queue');

exports.createQueue = async (req, res) => {
  try {
    const { name, details } = req.body;
    console.log(`Creating queue: ${name} by user: ${req.user.id}`);
    
    if (!name || !details) {
      return res.status(400).json({ message: 'Name and details are required' });
    }

    const queue = new Queue({
      name,
      details,
      createdBy: req.user.id,
    });
    await queue.save();
    console.log('Queue created ✅');
    res.status(201).json(queue);
  } catch (error) {
    console.error('Queue Creation Error ❌:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.updateQueue = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, details, status } = req.body;
    
    const queue = await Queue.findByIdAndUpdate(
      id,
      { name, details, status },
      { new: true, runValidators: true }
    );

    if (!queue) {
      return res.status(404).json({ message: 'Queue not found' });
    }

    res.json(queue);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteQueue = async (req, res) => {
  try {
    const { id } = req.params;
    const queue = await Queue.findByIdAndDelete(id);

    if (!queue) {
      return res.status(404).json({ message: 'Queue not found' });
    }

    res.json({ message: 'Queue deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllQueues = async (req, res) => {
  try {
    const queues = await Queue.find().populate('createdBy', 'username');
    res.json(queues);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.joinQueue = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const queue = await Queue.findById(id);
    if (!queue) {
      return res.status(404).json({ message: 'Queue not found' });
    }

    if (queue.members.includes(userId)) {
      return res.status(400).json({ message: 'Already in queue' });
    }

    queue.members.push(userId);
    await queue.save();

    res.json({ message: 'Successfully joined the queue', queue });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
