const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/products/barcode/:barcode
// @desc    Get product by barcode
// @access  Private (All authenticated users)
router.get('/barcode/:barcode', protect, async (req, res) => {
  try {
    const barcode = req.params.barcode.trim();
    console.log('[BARCODE] Looking up barcode:', barcode, '| length:', barcode.length);
    console.log('[BARCODE] User storeId:', req.user.storeId, '| storeCode:', req.user.storeCode, '| role:', req.user.role);

    // Primary lookup: by barcode + storeId
    let product = await Product.findOne({ 
      barcode,
      storeId: req.user.storeId 
    });

    // Fallback: if customer's storeId doesn't match, try finding by storeCode
    // This handles cases where storeId was saved differently
    if (!product && req.user.storeCode) {
      const admin = await User.findOne({ 
        storeCode: req.user.storeCode, 
        role: 'admin' 
      });
      if (admin && admin._id.toString() !== req.user.storeId?.toString()) {
        console.log('[BARCODE] Trying fallback with admin storeId:', admin._id);
        product = await Product.findOne({ 
          barcode,
          storeId: admin._id
        });
        if (product) {
          // Fix the user's storeId to match admin's _id going forward
          console.log('[BARCODE] Found via fallback — fixing storeId mismatch for user:', req.user._id);
          await User.updateOne({ _id: req.user._id }, { storeId: admin._id });
        }
      }
    }

    if (!product) {
      const anyProduct = await Product.findOne({ barcode });
      if (anyProduct) {
        console.log('[BARCODE] Mismatch! Product storeId:', anyProduct.storeId, '| User storeId:', req.user.storeId);
        return res.status(404).json({ 
          success: false, 
          message: 'Product not found in your store',
          debug: { productStoreId: anyProduct.storeId, userStoreId: req.user.storeId }
        });
      }
      console.log('[BARCODE] Product does not exist in DB at all');
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    console.log('[BARCODE] Product found:', product.name);
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
    const { barcode: rawBarcode, name, price, stockQuantity, weight, weightUnit, category, description } = req.body;
    const barcode = rawBarcode?.toString().trim();
    
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

    console.log('[PRODUCT] Created barcode:', product.barcode, '| length:', product.barcode.length, '| storeId:', product.storeId);
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
