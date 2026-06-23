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

// @route   GET /api/admin/sales/today
// @desc    Get today's sales analytics
// @access  Private (Admin)
router.get('/sales/today', protect, authorize('admin'), async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    
    const orders = await Order.find({
      storeId: req.user.storeId,
      createdAt: { $gte: startOfDay }
    }).populate('user', 'name email');
    
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);
    const totalOrders = orders.length;
    const uniqueCustomers = new Set(orders.map(o => o.user._id.toString())).size;
    
    res.json({ 
      success: true, 
      data: { 
        totalRevenue, 
        totalOrders, 
        totalCustomers: uniqueCustomers,
        orders 
      } 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/admin/sales/monthly
// @desc    Get monthly sales analytics
// @access  Private (Admin)
router.get('/sales/monthly', protect, authorize('admin'), async (req, res) => {
  try {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const orders = await Order.find({
      storeId: req.user.storeId,
      createdAt: { $gte: startOfMonth }
    }).populate('user', 'name email');
    
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);
    const totalOrders = orders.length;
    const uniqueCustomers = new Set(orders.map(o => o.user._id.toString())).size;
    
    res.json({ 
      success: true, 
      data: { 
        totalRevenue, 
        totalOrders, 
        totalCustomers: uniqueCustomers,
        orders 
      } 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/admin/sales/yearly
// @desc    Get yearly sales analytics
// @access  Private (Admin)
router.get('/sales/yearly', protect, authorize('admin'), async (req, res) => {
  try {
    const orders = await Order.find({ storeId: req.user.storeId })
      .populate('user', 'name email');
    
    const salesByYear = {};
    orders.forEach(order => {
      const year = new Date(order.createdAt).getFullYear();
      salesByYear[year] = (salesByYear[year] || 0) + order.totalPrice;
    });
    
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);
    const totalOrders = orders.length;
    const uniqueCustomers = new Set(orders.map(o => o.user._id.toString())).size;
    
    res.json({ 
      success: true, 
      data: { 
        totalRevenue, 
        totalOrders, 
        totalCustomers: uniqueCustomers,
        salesByYear,
        orders 
      } 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/admin/customers/today
// @desc    Get today's customer analytics
// @access  Private (Admin)
router.get('/customers/today', protect, authorize('admin'), async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    
    const orders = await Order.find({
      storeId: req.user.storeId,
      createdAt: { $gte: startOfDay }
    }).populate('user', 'name email');
    
    const customersMap = new Map();
    orders.forEach(order => {
      const customerId = order.user._id.toString();
      if (!customersMap.has(customerId)) {
        customersMap.set(customerId, {
          customer: order.user,
          totalSpent: 0,
          orderCount: 0
        });
      }
      const customerData = customersMap.get(customerId);
      customerData.totalSpent += order.totalPrice;
      customerData.orderCount += 1;
    });
    
    const customers = Array.from(customersMap.values());
    
    res.json({ success: true, data: { customers, orders } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/admin/customers/monthly
// @desc    Get monthly customer analytics
// @access  Private (Admin)
router.get('/customers/monthly', protect, authorize('admin'), async (req, res) => {
  try {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const orders = await Order.find({
      storeId: req.user.storeId,
      createdAt: { $gte: startOfMonth }
    }).populate('user', 'name email');
    
    const customersMap = new Map();
    orders.forEach(order => {
      const customerId = order.user._id.toString();
      if (!customersMap.has(customerId)) {
        customersMap.set(customerId, {
          customer: order.user,
          totalSpent: 0,
          orderCount: 0
        });
      }
      const customerData = customersMap.get(customerId);
      customerData.totalSpent += order.totalPrice;
      customerData.orderCount += 1;
    });
    
    const customers = Array.from(customersMap.values());
    
    res.json({ success: true, data: { customers, orders } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/admin/customers/yearly
// @desc    Get yearly customer analytics
// @access  Private (Admin)
router.get('/customers/yearly', protect, authorize('admin'), async (req, res) => {
  try {
    const orders = await Order.find({ storeId: req.user.storeId })
      .populate('user', 'name email');
    
    const customersByYear = {};
    orders.forEach(order => {
      const year = new Date(order.createdAt).getFullYear();
      if (!customersByYear[year]) {
        customersByYear[year] = new Set();
      }
      customersByYear[year].add(order.user._id.toString());
    });
    
    const customerGrowth = {};
    Object.keys(customersByYear).forEach(year => {
      customerGrowth[year] = customersByYear[year].size;
    });
    
    res.json({ success: true, data: { customerGrowth, orders } });
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
