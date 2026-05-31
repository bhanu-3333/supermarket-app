const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard data
// @access  Private (Admin)
router.get('/dashboard', protect, authorize('admin'), async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments({ storeId: req.user.storeId });
    const lowStock = await Product.countDocuments({ 
      storeId: req.user.storeId, 
      stockQuantity: { $lt: 10, $gt: 0 } 
    });
    const outOfStock = await Product.countDocuments({ 
      storeId: req.user.storeId, 
      stockQuantity: 0 
    });
    
    const totalOrders = await Order.countDocuments({ storeId: req.user.storeId });
    const totalCustomers = await User.countDocuments({ 
      storeId: req.user.storeId, 
      role: 'customer' 
    });
    
    // Calculate total sales for the month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const monthOrders = await Order.find({
      storeId: req.user.storeId,
      createdAt: { $gte: startOfMonth }
    });
    
    const totalSalesMonth = monthOrders.reduce((sum, order) => sum + order.totalPrice, 0);
    
    // Calculate total sales for today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    
    const todayOrders = await Order.find({
      storeId: req.user.storeId,
      createdAt: { $gte: startOfDay }
    });
    
    const totalSalesToday = todayOrders.reduce((sum, order) => sum + order.totalPrice, 0);
    
    res.json({ 
      success: true, 
      data: {
        totalProducts,
        lowStock,
        outOfStock,
        totalOrders,
        totalCustomers,
        totalSalesMonth,
        totalSalesToday
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/admin/staff
// @desc    Get all staff members
// @access  Private (Admin)
router.get('/staff', protect, authorize('admin'), async (req, res) => {
  try {
    const staff = await User.find({ 
      storeId: req.user.storeId, 
      role: 'staff' 
    }).select('-password');
    
    res.json({ success: true, data: staff });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/admin/staff
// @desc    Create staff account
// @access  Private (Admin)
router.post('/staff', protect, authorize('admin'), async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    console.log('Creating staff - Request body:', { name, email, password: '***' });
    console.log('Admin user:', { id: req.user._id, storeId: req.user.storeId });
    
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all fields' });
    }
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('Email already exists:', email);
      return res.status(400).json({ success: false, message: 'Email already in use' });
    }
    
    const staff = await User.create({
      name,
      email,
      password,
      role: 'staff',
      storeId: req.user.storeId,
      storeName: req.user.storeName,
      storeCode: req.user.storeCode
    });
    
    console.log('Staff created successfully:', staff._id);
    
    res.status(201).json({ 
      success: true, 
      data: {
        _id: staff._id,
        name: staff.name,
        email: staff.email,
        role: staff.role
      }
    });
  } catch (err) {
    console.error('Error creating staff:', err);
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
});

// @route   DELETE /api/admin/staff/:id
// @desc    Delete staff account
// @access  Private (Admin)
router.delete('/staff/:id', protect, authorize('admin'), async (req, res) => {
  try {
    console.log('Deleting staff - ID:', req.params.id);
    console.log('Admin user:', { id: req.user._id, storeId: req.user.storeId });
    
    const staff = await User.findById(req.params.id);
    
    if (!staff) {
      console.log('Staff not found');
      return res.status(404).json({ success: false, message: 'Staff not found' });
    }
    
    console.log('Found staff:', { id: staff._id, storeId: staff.storeId, role: staff.role });
    
    if (staff.storeId.toString() !== req.user.storeId.toString()) {
      console.log('Store ID mismatch');
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    if (staff.role !== 'staff') {
      console.log('Not a staff account');
      return res.status(400).json({ success: false, message: 'Can only delete staff accounts' });
    }
    
    await staff.deleteOne();
    console.log('Staff deleted successfully');
    
    res.json({ success: true, message: 'Staff deleted' });
  } catch (err) {
    console.error('Error deleting staff:', err);
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
});

module.exports = router;
