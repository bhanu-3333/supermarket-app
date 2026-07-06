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

    if (product) {
      console.log('[BARCODE] Product found via primary lookup:', product.name);
      return res.json({ success: true, data: product });
    }

    // Fallback 1: if customer's storeId doesn't match, try finding by storeCode
    if (!product && req.user.storeCode) {
      console.log('[BARCODE] Primary lookup failed, trying fallback by storeCode:', req.user.storeCode);
      
      const admin = await User.findOne({ 
        storeCode: req.user.storeCode, 
        role: 'admin' 
      });
      
      if (admin) {
        console.log('[BARCODE] Found admin with storeId:', admin._id);
        product = await Product.findOne({ 
          barcode,
          storeId: admin._id
        });
        
        if (product) {
          console.log('[BARCODE] Product found via storeCode fallback:', product.name);
          // Fix the user's storeId to match admin's _id going forward
          if (admin._id.toString() !== req.user.storeId?.toString()) {
            console.log('[BARCODE] Fixing storeId mismatch for user:', req.user._id, 'from:', req.user.storeId, 'to:', admin._id);
            await User.updateOne({ _id: req.user._id }, { storeId: admin._id });
          }
          return res.json({ success: true, data: product });
        }
      } else {
        console.log('[BARCODE] No admin found with storeCode:', req.user.storeCode);
      }
    }

    // Fallback 2: For customers, try to find product by storeName if available
    if (!product && req.user.role === 'customer' && req.user.storeName) {
      console.log('[BARCODE] Trying storeName fallback:', req.user.storeName);
      
      const admin = await User.findOne({ 
        storeName: req.user.storeName, 
        role: 'admin' 
      });
      
      if (admin) {
        console.log('[BARCODE] Found admin by storeName with storeId:', admin._id);
        product = await Product.findOne({ 
          barcode,
          storeId: admin._id
        });
        
        if (product) {
          console.log('[BARCODE] Product found via storeName fallback:', product.name);
          // Fix the user's storeId and storeCode
          console.log('[BARCODE] Updating customer storeId and storeCode');
          await User.updateOne({ _id: req.user._id }, { 
            storeId: admin._id,
            storeCode: admin.storeCode 
          });
          return res.json({ success: true, data: product });
        }
      }
    }

    // Fallback 3: Check if product exists with any storeId (for debugging)
    const anyProduct = await Product.findOne({ barcode });
    if (anyProduct) {
      console.log('[BARCODE] MISMATCH DETECTED!');
      console.log('[BARCODE] Product exists but storeId mismatch:');
      console.log('[BARCODE] - Product storeId:', anyProduct.storeId);
      console.log('[BARCODE] - User storeId:', req.user.storeId);
      console.log('[BARCODE] - User storeCode:', req.user.storeCode);
      console.log('[BARCODE] - User storeName:', req.user.storeName);
      
      // Try to find the correct admin for this product
      const productAdmin = await User.findById(anyProduct.storeId);
      if (productAdmin) {
        console.log('[BARCODE] Product belongs to admin:', productAdmin.name, 'storeCode:', productAdmin.storeCode);
        
        // If customer belongs to this store, fix their storeId
        if (req.user.role === 'customer' && 
            (req.user.storeCode === productAdmin.storeCode || req.user.storeName === productAdmin.storeName)) {
          console.log('[BARCODE] Customer belongs to this store, fixing storeId...');
          await User.updateOne({ _id: req.user._id }, { 
            storeId: productAdmin._id,
            storeCode: productAdmin.storeCode,
            storeName: productAdmin.storeName
          });
          return res.json({ success: true, data: anyProduct });
        }
      }
      
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found in your store',
        debug: { 
          productStoreId: anyProduct.storeId, 
          userStoreId: req.user.storeId,
          userStoreCode: req.user.storeCode,
          suggestion: 'Contact admin - storeId mismatch detected'
        }
      });
    }
    
    console.log('[BARCODE] Product does not exist in database at all');
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
