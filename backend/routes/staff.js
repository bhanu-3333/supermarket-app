const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/staff/dashboard
// @desc    Get staff dashboard data
// @access  Private (Staff)
router.get('/dashboard', protect, authorize('staff'), async (req, res) => {
  try {
    const totalStock = await Product.countDocuments({ storeId: req.user.storeId });
    const lowStock = await Product.countDocuments({ 
      storeId: req.user.storeId, 
      stockQuantity: { $lt: 10, $gt: 0 } 
    });
    
    const recentProducts = await Product.find({ storeId: req.user.storeId })
      .sort({ createdAt: -1 })
      .limit(5);
    
    res.json({ 
      success: true, 
      data: { 
        totalStock, 
        lowStock, 
        recentProducts 
      } 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/staff/profile
// @desc    Get staff profile
// @access  Private (Staff)
router.get('/profile', protect, authorize('staff'), async (req, res) => {
  try {
    res.json({ 
      success: true, 
      data: {
        name: req.user.name,
        email: req.user.email,
        storeName: req.user.storeName,
        role: req.user.role
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
