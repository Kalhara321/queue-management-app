const express = require('express');
const router = express.Router();
const {
  createNotification,
  getAllNotifications,
  getNotificationById,
  updateNotification,
  deleteNotification,
  markAsRead
} = require('../controllers/notificationController');

const { protect } = require('../middleware/authMiddleware');
router.get('/test', (req, res) => {
  res.json({ message: 'Notification route working! ✅' });
});
router.post('/',           protect, createNotification);
router.get('/',            protect, getAllNotifications);
router.get('/:id',         protect, getNotificationById);
router.put('/:id',         protect, updateNotification);
router.delete('/:id',      protect, deleteNotification);
router.patch('/:id/read',  protect, markAsRead);

module.exports = router;