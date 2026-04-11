const express = require('express');
const router = express.Router();
const queueController = require('../controllers/queueController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.get('/', protect, queueController.getAllQueues);
router.post('/', protect, restrictTo('admin'), queueController.createQueue);
router.put('/:id', protect, restrictTo('admin'), queueController.updateQueue);
router.delete('/:id', protect, restrictTo('admin'), queueController.deleteQueue);
router.patch('/:id/join', protect, queueController.joinQueue);

module.exports = router;
