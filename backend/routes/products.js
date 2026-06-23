const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/products/barcode/:barcode
// @desc    Get product by barcode
// @access  Private (All authenticated users)
router.get('/barcode/:barcode', protect, async (req, res) => {
  try {
    const product = await Product.findOne({ 
      barcode: req.params.barcode,
      storeId: req.user.storeId 
    });
    
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    res.json({ success: true, data: product });
  } catch (err) {
    console.error('Barcode lookup error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/products
// @desc    Get all products
// @access  Private (Staff/Admin)
router.get('/', protect, authorize('staff', 'admin'), async (req, res) => {
  try {
    const products = await Product.find({ storeId: req.user.storeId }).sort({ createdAt: -1 });
    res.json({ success: true, data: products });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/products/search
// @desc    Search products
// @access  Private (Staff/Admin)
router.get('/search', protect, authorize('staff', 'admin'), async (req, res) => {
  try {
    const { q } = req.query;
    const products = await Product.find({
      storeId: req.user.storeId,
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { barcode: { $regex: q, $options: 'i' } }
      ]
    });
    res.json({ success: true, data: products });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/products/filter
// @desc    Filter products
// @access  Private (Staff/Admin)
router.get('/filter', protect, authorize('staff', 'admin'), async (req, res) => {
  try {
    const { sortBy, stockFilter } = req.query;
    let query = { storeId: req.user.storeId };
    
    if (stockFilter === 'low') query.stockQuantity = { $lt: 10, $gt: 0 };
    if (stockFilter === 'out') query.stockQuantity = 0;
    
    let sort = {};
    if (sortBy === 'name-asc') sort.name = 1;
    if (sortBy === 'name-desc') sort.name = -1;
    if (sortBy === 'price-asc') sort.price = 1;
    if (sortBy === 'price-desc') sort.price = -1;
    
    const products = await Product.find(query).sort(sort);
    res.json({ success: true, data: products });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/products
// @desc    Add new product
// @access  Private (Staff/Admin)
router.post('/', protect, authorize('staff', 'admin'), async (req, res) => {
  try {
    const { barcode, name, price, stockQuantity, weight, weightUnit, category, description } = req.body;
    
    if (!barcode || !name || !price || !stockQuantity || !weight || !weightUnit) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }
    
    const existingProduct = await Product.findOne({ barcode, storeId: req.user.storeId });
    if (existingProduct) {
      return res.status(400).json({ success: false, message: 'Product with this barcode already exists' });
    }
    
    const product = await Product.create({
      barcode,
      name,
      price,
      stockQuantity,
      weight,
      weightUnit,
      category: category || 'Grocery',
      description: description || name,
      storeId: req.user.storeId,
      createdBy: req.user._id
    });
    
    res.status(201).json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/products/:id/restock
// @desc    Increase stock quantity
// @access  Private (Staff/Admin)
router.put('/:id/restock', protect, authorize('staff', 'admin'), async (req, res) => {
  try {
    const { quantity } = req.body;
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    product.stockQuantity += parseInt(quantity);
    await product.save();
    
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete product
// @access  Private (Staff/Admin)
router.delete('/:id', protect, authorize('staff', 'admin'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    await product.deleteOne();
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/products/stats
// @desc    Get product statistics
// @access  Private (Staff/Admin)
router.get('/stats', protect, authorize('staff', 'admin'), async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments({ storeId: req.user.storeId });
    const lowStock = await Product.countDocuments({ storeId: req.user.storeId, stockQuantity: { $lt: 10, $gt: 0 } });
    
    res.json({ success: true, data: { totalProducts, lowStock } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
