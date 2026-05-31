const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes
exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Set token from Bearer token in header
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure token exists
  if (!token) {
    console.log('No token provided');
    return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    console.log('Token decoded:', decoded);

    req.user = await User.findById(decoded.id);
    
    if (!req.user) {
      console.log('User not found for ID:', decoded.id);
      return res.status(401).json({ success: false, message: 'User not found' });
    }
    
    console.log('Authenticated user:', { id: req.user._id, role: req.user.role, storeId: req.user.storeId });

    next();
  } catch (err) {
    console.error('Auth error:', err);
    return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    console.log('Checking authorization - User role:', req.user?.role, 'Required roles:', roles);
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};
