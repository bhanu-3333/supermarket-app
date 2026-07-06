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
    console.log('[BARCODE] Looking up barcode:', barcode, '| User:', req.user.email, '| role:', req.user.role, '| storeId:', req.user.storeId, '| storeCode:', req.user.storeCode);

    // Step 1: Direct storeId match
    if (req.user.storeId) {
      const product = await Product.findOne({ barcode, storeId: req.user.storeId });
      if (product) {
        console.log('[BARCODE] Found via storeId match:', product.name);
        return res.json({ success: true, data: product });
      }
    }

    // Step 2: Match via storeCode → find admin → match product
    if (req.user.storeCode) {
      const admin = await User.findOne({ storeCode: req.user.storeCode, role: 'admin' });
      if (admin) {
        const product = await Product.findOne({ barcode, storeId: admin._id });
        if (product) {
          console.log('[BARCODE] Found via storeCode fallback, fixing storeId...');
          await User.updateOne({ _id: req.user._id }, { storeId: admin._id, storeName: admin.storeName });
          return res.json({ success: true, data: product });
        }
      }
    }

    // Step 3: Match via storeName
    if (req.user.storeName) {
      const admin = await User.findOne({ storeName: req.user.storeName, role: 'admin' });
      if (admin) {
        const product = await Product.findOne({ barcode, storeId: admin._id });
        if (product) {
          console.log('[BARCODE] Found via storeName fallback, fixing storeId...');
          await User.updateOne({ _id: req.user._id }, { storeId: admin._id, storeCode: admin.storeCode });
          return res.json({ success: true, data: product });
        }
      }
    }

    // Step 4: Last resort — product exists but user has wrong store association
    // Fix the user's storeId automatically if the product's admin storeCode/storeName matches user's
    const anyProduct = await Product.findOne({ barcode });
    if (anyProduct && anyProduct.storeId) {
      const productAdmin = await User.findById(anyProduct.storeId);
      if (productAdmin) {
        console.log('[BARCODE] Product found in store:', productAdmin.storeCode, '| User storeCode:', req.user.storeCode);
        
        // For customers: if their storeCode matches the product's store, auto-fix storeId
        if (req.user.role === 'customer' && req.user.storeCode === productAdmin.storeCode) {
          console.log('[BARCODE] Auto-fixing customer storeId mismatch...');
          await User.updateOne({ _id: req.user._id }, {
            storeId: productAdmin._id,
            storeCode: productAdmin.storeCode,
            storeName: productAdmin.storeName
          });
          return res.json({ success: true, data: anyProduct });
        }
        
        console.log('[BARCODE] Product belongs to a different store. Customer storeCode:', req.user.storeCode, '!= Product store storeCode:', productAdmin.storeCode);
        return res.status(404).json({
          success: false,
          message: 'This product belongs to a different store'
        });
      }
    }

    console.log('[BARCODE] Product not found in database');
    return res.status(404).json({ success: false, message: 'Product not found' });

  } catch (err) {
    console.error('Barcode lookup error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/products/debug/:barcode
// @desc    Debug barcode lookup (shows all products with this barcode)
// @access  Private (All authenticated users)
router.get('/debug/:barcode', protect, async (req, res) => {
  try {
    const barcode = req.params.barcode.trim();
    
    // Find all products with this barcode regardless of store
    const allProducts = await Product.find({ barcode });
    
    // Get user info
    const userInfo = {
      userId: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      storeId: req.user.storeId,
      storeCode: req.user.storeCode,
      storeName: req.user.storeName
    };
    
    // Get store admin info if available
    let adminInfo = null;
    if (req.user.storeCode) {
      const admin = await User.findOne({ storeCode: req.user.storeCode, role: 'admin' });
      if (admin) {
        adminInfo = {
          adminId: admin._id,
          name: admin.name,
          storeCode: admin.storeCode,
          storeName: admin.storeName
        };
      }
    }
    
    // Get all store admins for reference
    const allAdmins = await User.find({ role: 'admin' }, 'name storeCode storeName _id');
    
    res.json({
      success: true,
      debug: {
        barcode,
        userInfo,
        adminInfo,
        productsWithBarcode: allProducts.map(p => ({
          productId: p._id,
          name: p.name,
          storeId: p.storeId,
          createdBy: p.createdBy,
          price: p.price,
          stock: p.stockQuantity
        })),
        allStoreAdmins: allAdmins
      }
    });
  } catch (err) {
    console.error('Debug endpoint error:', err);
    res.status(500).json({ success: false, message: 'Debug error' });
  }
});

// @route   POST /api/products/fix-store-ids
// @desc    Fix storeId mismatches for customers (utility endpoint)
// @access  Private (Admin only)
router.post('/fix-store-ids', protect, authorize('admin'), async (req, res) => {
  try {
    console.log('[FIX] Starting storeId fix process...');
    
    // Find all customers with this admin's storeCode but different storeId
    const customersToFix = await User.find({
      role: 'customer',
      storeCode: req.user.storeCode,
      $or: [
        { storeId: { $ne: req.user._id } },
        { storeId: { $exists: false } }
      ]
    });
    
    console.log('[FIX] Found', customersToFix.length, 'customers to fix');
    
    const fixes = [];
    for (const customer of customersToFix) {
      const oldStoreId = customer.storeId;
      await User.updateOne(
        { _id: customer._id },
        { 
          storeId: req.user._id,
          storeCode: req.user.storeCode,
          storeName: req.user.storeName
        }
      );
      
      fixes.push({
        customerId: customer._id,
        customerName: customer.name,
        customerEmail: customer.email,
        oldStoreId: oldStoreId,
        newStoreId: req.user._id
      });
    }
    
    console.log('[FIX] Fixed', fixes.length, 'customer storeIds');
    
    res.json({
      success: true,
      message: `Fixed storeId for ${fixes.length} customers`,
      fixes: fixes
    });
    
  } catch (err) {
    console.error('[FIX] Error fixing storeIds:', err);
    res.status(500).json({ success: false, message: 'Error fixing storeIds' });
  }
});
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
    console.error('[PRODUCT] Error creating product:', err);
    console.error('[PRODUCT] Error details:', err.message);
    console.error('[PRODUCT] Stack trace:', err.stack);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
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
