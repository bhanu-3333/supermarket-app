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
// @desc    Get all orders for admin
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

// @route   GET /api/orders/date/:date
// @desc    Get orders by specific date
// @access  Private (Admin)
router.get('/date/:date', protect, authorize('admin'), async (req, res) => {
  try {
    const selectedDate = new Date(req.params.date);
    const startOfDay = new Date(selectedDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(selectedDate.setHours(23, 59, 59, 999));
    
    const orders = await Order.find({
      storeId: req.user.storeId,
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    })
    .sort({ createdAt: -1 })
    .populate('user', 'name email');
    
    const totalSales = orders.reduce((sum, order) => sum + order.totalPrice, 0);
    
    res.json({ success: true, data: { orders, totalSales } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/orders/customer
// @desc    Get customer's order history
// @access  Private (Customer)
router.get('/customer', protect, authorize('customer'), async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 });
    
    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/orders/:id
// @desc    Get single order details
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    // Check authorization - customer can only see their own orders, admin/staff can see store orders
    if (req.user.role === 'customer' && order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    if ((req.user.role === 'admin' || req.user.role === 'staff') && order.storeId.toString() !== req.user.storeId.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    res.json({ success: true, data: order });
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
