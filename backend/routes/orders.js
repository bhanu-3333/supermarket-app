const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/orders/recent
// @desc    Get recent orders
// @access  Private (Admin)
router.get('/recent', protect, authorize('admin'), async (req, res) => {
  try {
    const orders = await Order.find({ storeId: req.user.storeId })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('user', 'name email');
    
    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/orders
// @desc    Get all orders
// @access  Private (Admin)
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const orders = await Order.find({ storeId: req.user.storeId })
      .sort({ createdAt: -1 })
      .populate('user', 'name email');
    
    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/orders
// @desc    Create new order
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { orderItems, totalWeight, taxPrice, totalPrice, paymentMethod } = req.body;
    
    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ success: false, message: 'No order items' });
    }
    
    const order = await Order.create({
      user: req.user._id,
      storeId: req.user.storeId,
      orderItems,
      totalWeight,
      taxPrice,
      totalPrice,
      paymentMethod,
      isPaid: paymentMethod !== 'Razorpay',
      paidAt: paymentMethod !== 'Razorpay' ? Date.now() : undefined,
    });
    
    res.status(201).json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
