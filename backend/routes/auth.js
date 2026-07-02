const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const QRCode = require('qrcode');
const { protect } = require('../middleware/auth');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallbacksecret', {
    expiresIn: '30d',
  });
};

// @route   POST /api/auth/register-admin
// @desc    Register a supermarket owner (Admin) and generate Store Code/QR
// @access  Public
router.post('/register-admin', async (req, res) => {
  try {
    const { storeName, ownerName, email, password } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Generate Store Code (e.g., first 3 letters of store name + random 4 digits)
    const storePrefix = storeName ? storeName.substring(0, 3).toUpperCase() : 'STO';
    const storeCode = `${storePrefix}${Math.floor(1000 + Math.random() * 9000)}`;

    // Generate QR Code data (returns base64 image data)
    const storeQR = await QRCode.toDataURL(storeCode);

    user = await User.create({
      name: ownerName,
      email,
      password,
      role: 'admin',
      storeName,
      storeCode,
      storeQR,
      storeId: null, // will be set below
    });

    // Set storeId to self — use updateOne to skip the pre-save password hook
    await User.updateOne({ _id: user._id }, { storeId: user._id });

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        storeName: user.storeName,
        storeCode: user.storeCode,
        storeQR: user.storeQR,
        token: generateToken(user._id),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Login attempt for:', email);

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.log('User not found');
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    console.log('User found:', { id: user._id, role: user.role, storeId: user.storeId });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      console.log('Password mismatch');
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    console.log('Login successful');

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        storeCode: user.storeCode,
        storeName: user.storeName,
        storeId: user.storeId,
        token: generateToken(user._id),
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/auth/register-customer
// @desc    Register a customer with store code
// @access  Public
router.post('/register-customer', async (req, res) => {
  try {
    const { name, email, password, storeCode } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Find the store by store code
    const store = await User.findOne({ storeCode, role: 'admin' });
    if (!store) {
      return res.status(400).json({ success: false, message: 'Invalid Store Code' });
    }

    user = await User.create({
      name,
      email,
      password,
      role: 'customer',
      storeId: store._id,
      storeName: store.storeName,
      storeCode: store.storeCode,
    });

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        storeName: user.storeName,
        storeCode: user.storeCode,
        token: generateToken(user._id),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/auth/validate
// @desc    Validate JWT token
// @access  Private
router.get('/validate', protect, async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        storeName: req.user.storeName,
        storeCode: req.user.storeCode,
        storeId: req.user.storeId,
      },
    });
  } catch (err) {
    console.error('Validate error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
