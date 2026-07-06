const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[API] ${req.method} ${req.url}`);
  next();
});

// Enable CORS for all origins (necessary for Expo Go and mobile development)
app.use(cors({
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Log all incoming requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - Origin: ${req.headers.origin || 'none'}`);
  next();
});

// Health check endpoint
app.get('/api', (req, res) => {
  res.json({ 
    success: true, 
    message: 'SmartCart API is running',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Mount routers
const authRouter = require('./routes/auth');
const productsRouter = require('./routes/products');
const staffRouter = require('./routes/staff');
const ordersRouter = require('./routes/orders');
const cartRouter = require('./routes/cart');
const customerRouter = require('./routes/customer');
const adminRouter = require('./routes/admin');

app.use('/api/auth', authRouter);
app.use('/api/products', productsRouter);
app.use('/api/staff', staffRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/cart', cartRouter);
app.use('/api/customer', customerRouter);
app.use('/api/admin', adminRouter);

const PORT = process.env.PORT || 5000;

// Listen on 0.0.0.0 to accept connections from any network interface
// This allows mobile devices on the same network to connect
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Local: http://localhost:${PORT}`);
  console.log(`Network: http://0.0.0.0:${PORT}`);
  console.log(`\nFor Expo Go, use your machine's IP address`);
  console.log(`Example: http://192.168.x.x:${PORT}/api`);
});
