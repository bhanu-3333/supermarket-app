const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const QRCode = require('qrcode');

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

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        storeCode: user.storeCode,
        token: generateToken(user._id),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
