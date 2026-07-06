require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const User = require('./models/User');

const barcode = process.argv[2] || '8904411811779';

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const product = await Product.findOne({ barcode });
  if (!product) {
    console.log('Product not found in database');
  } else {
    console.log('Product:', product.name);
    console.log('StoreId:', product.storeId);
    const admin = await User.findById(product.storeId);
    if (admin) {
      console.log('Store:', admin.storeName, '| StoreCode:', admin.storeCode);
    }
  }
  mongoose.connection.close();
}).catch(err => console.error(err));
