const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

// @route   GET /api/cart
// @desc    Get customer cart
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id, storeId: req.user.storeId });
    
    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        storeId: req.user.storeId,
        items: [],
        totalPrice: 0,
        totalWeight: 0
      });
    }
    
    res.json({ success: true, data: cart });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/cart/add
// @desc    Add product to cart by barcode
// @access  Private
router.post('/add', protect, async (req, res) => {
  try {
    const { barcode } = req.body;
    
    const product = await Product.findOne({ barcode, storeId: req.user.storeId });
    
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    if (product.stockQuantity < 1) {
      return res.status(400).json({ success: false, message: 'Product out of stock' });
    }
    
    let cart = await Cart.findOne({ user: req.user._id, storeId: req.user.storeId });
    
    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        storeId: req.user.storeId,
        items: []
      });
    }
    
    const existingItem = cart.items.find(item => item.product.toString() === product._id.toString());
    
    if (existingItem) {
      if (product.stockQuantity < existingItem.quantity + 1) {
        return res.status(400).json({ success: false, message: 'Not enough stock' });
      }
      existingItem.quantity += 1;
    } else {
      cart.items.push({
        product: product._id,
        name: product.name,
        barcode: product.barcode,
        price: product.price,
        weight: product.weight,
        weightUnit: product.weightUnit,
        quantity: 1
      });
    }
    
    // Recalculate totals
    cart.totalPrice = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cart.totalWeight = cart.items.reduce((sum, item) => sum + (item.weight * item.quantity), 0);
    cart.updatedAt = Date.now();
    
    await cart.save();
    
    res.json({ success: true, data: cart });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/cart/update
// @desc    Update item quantity
// @access  Private
router.put('/update', protect, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    
    const cart = await Cart.findOne({ user: req.user._id, storeId: req.user.storeId });
    
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }
    
    const item = cart.items.find(i => i.product.toString() === productId);
    
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found in cart' });
    }
    
    if (quantity <= 0) {
      cart.items = cart.items.filter(i => i.product.toString() !== productId);
    } else {
      const product = await Product.findById(productId);
      if (product.stockQuantity < quantity) {
        return res.status(400).json({ success: false, message: 'Not enough stock' });
      }
      item.quantity = quantity;
    }
    
    cart.totalPrice = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cart.totalWeight = cart.items.reduce((sum, item) => sum + (item.weight * item.quantity), 0);
    cart.updatedAt = Date.now();
    
    await cart.save();
    
    res.json({ success: true, data: cart });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/cart/remove
// @desc    Remove item from cart
// @access  Private
router.delete('/remove', protect, async (req, res) => {
  try {
    const { productId } = req.body;
    
    const cart = await Cart.findOne({ user: req.user._id, storeId: req.user.storeId });
    
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }
    
    cart.items = cart.items.filter(i => i.product.toString() !== productId);
    
    cart.totalPrice = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cart.totalWeight = cart.items.reduce((sum, item) => sum + (item.weight * item.quantity), 0);
    cart.updatedAt = Date.now();
    
    await cart.save();
    
    res.json({ success: true, data: cart });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/cart/clear
// @desc    Clear cart
// @access  Private
router.delete('/clear', protect, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id, storeId: req.user.storeId });
    
    if (cart) {
      cart.items = [];
      cart.totalPrice = 0;
      cart.totalWeight = 0;
      cart.updatedAt = Date.now();
      await cart.save();
    }
    
    res.json({ success: true, data: cart });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
