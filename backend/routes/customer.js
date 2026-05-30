const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/customer/products
// @desc    Get all products for customer
// @access  Private (Customer)
router.get('/products', protect, authorize('customer'), async (req, res) => {
  try {
    const products = await Product.find({ 
      storeId: req.user.storeId,
      stockQuantity: { $gt: 0 }
    }).select('-createdBy');
    
    res.json({ success: true, data: products });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/customer/products/barcode/:barcode
// @desc    Get product by barcode
// @access  Private (Customer)
router.get('/products/barcode/:barcode', protect, authorize('customer'), async (req, res) => {
  try {
    const product = await Product.findOne({ 
      barcode: req.params.barcode,
      storeId: req.user.storeId 
    });
    
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    if (product.stockQuantity < 1) {
      return res.status(400).json({ success: false, message: 'Product out of stock' });
    }
    
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
