const Booking = require('../models/Booking');
const Queue = require('../models/Queue');

exports.createBooking = async (req, res) => {
  try {
    const { queueId } = req.body;
    const userId = req.user.id;

    const queue = await Queue.findById(queueId);
    if (!queue) {
      return res.status(404).json({ message: 'Queue not found' });
    }

    if (queue.status === 'closed') {
      return res.status(400).json({ message: 'Queue is currently closed' });
    }

    // Daily reset logic: count bookings for this queue created today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const countToday = await Booking.countDocuments({
      queue: queueId,
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });

    const booking = new Booking({
      user: userId,
      queue: queueId,
      tokenNumber: countToday + 1,
    });

    await booking.save();

    // Sync with Queue model
    if (!queue.members.includes(userId)) {
      queue.members.push(userId);
      await queue.save();
    }

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getBookings = async (req, res) => {
  try {
    const { queueId, userId } = req.query;
    let query = {};
    if (queueId) query.queue = queueId;
    if (userId) query.user = userId;

    const bookings = await Booking.find(query)
      .populate('user', 'username email')
      .populate('queue', 'name')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'username email')
      .populate('queue', 'name');
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateBooking = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id).populate('queue');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Permission check: Admin creator or queue member
    const isCreator = booking.queue.createdBy.toString() === req.user.id;
    const isMember = booking.queue.members.some(memberId => memberId.toString() === req.user.id);

    if (!isCreator && !isMember && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this booking' });
    }

    booking.status = status || booking.status;
    await booking.save();

    // If served or cancelled, remove from Queue.members
    if (status === 'served' || status === 'cancelled') {
      const queue = await Queue.findById(booking.queue._id);
      if (queue) {
        queue.members = queue.members.filter(m => m.toString() !== booking.user.toString());
        await queue.save();

        // BROADCAST: Find the next person in line and notify them
        const nextBooking = await Booking.findOne({
          queue: queue._id,
          status: 'waiting',
          tokenNumber: { $gt: booking.tokenNumber }
        }).sort({ tokenNumber: 1 });

        if (nextBooking) {
          console.log(`Notifying user ${nextBooking.user.toString()} they are next in line...`);
          const io = req.app.get('socketio');
          io.to(nextBooking.user.toString()).emit('next-in-line', {
            queueName: queue.name,
            tokenNumber: nextBooking.tokenNumber
          });
        } else {
          console.log('No more people waiting in this queue.');
        }
      }
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('queue');
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Only creator or the user themselves can delete? 
    // Usually admin/creator manages bookings.
    console.log('Delete logic - User ID from token:', req.user.id);
    console.log('Delete logic - Booking User ID:', booking.user.toString());
    
    const isCreator = booking.queue.createdBy.toString() === req.user.id;
    const isOwner = booking.user.toString() === req.user.id;

    if (!isCreator && !isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this booking' });
    }

    const queueId = booking.queue._id;
    const bookingUserId = booking.user.toString();

    await Booking.findByIdAndDelete(req.params.id);

    // Remove from Queue.members if no other "waiting" bookings for this user in this queue
    const otherBookings = await Booking.find({ 
      user: bookingUserId, 
      queue: queueId, 
      status: 'waiting' 
    });
    
    if (otherBookings.length === 0) {
      const queue = await Queue.findById(queueId);
      if (queue) {
        queue.members = queue.members.filter(m => m.toString() !== bookingUserId);
        await queue.save();
      }
    }

    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
