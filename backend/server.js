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

// Enable CORS
app.use(cors());

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

app.listen(PORT, console.log(`Server running on port ${PORT}`));
