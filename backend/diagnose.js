const mongoose = require('mongoose');
require('dotenv').config();

async function diagnose() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB\n');

  const User = require('./models/User');
  const Product = require('./models/Product');

  const admins = await User.find({ role: 'admin' }, 'name email storeCode storeName _id');
  console.log('=== ADMINS ===');
  admins.forEach(a => console.log(`  [${a._id}] ${a.name} | storeCode: ${a.storeCode} | storeName: ${a.storeName}`));

  const staff = await User.find({ role: 'staff' }, 'name email storeCode storeName storeId _id');
  console.log('\n=== STAFF ===');
  staff.forEach(s => console.log(`  [${s._id}] ${s.name} | storeCode: ${s.storeCode} | storeId: ${s.storeId}`));

  const customers = await User.find({ role: 'customer' }, 'name email storeCode storeName storeId _id');
  console.log('\n=== CUSTOMERS ===');
  customers.forEach(c => console.log(`  [${c._id}] ${c.name} | storeCode: ${c.storeCode} | storeId: ${c.storeId}`));

  const products = await Product.find({}, 'name barcode storeId');
  console.log('\n=== PRODUCTS ===');
  products.forEach(p => console.log(`  [${p._id}] ${p.name} | barcode: ${p.barcode} | storeId: ${p.storeId}`));

  console.log('\n=== MISMATCH CHECK ===');
  for (const customer of customers) {
    const admin = admins.find(a => a._id.toString() === customer.storeId?.toString());
    if (!admin) {
      console.log(`  ❌ Customer "${customer.name}" storeId ${customer.storeId} does NOT match any admin`);
    } else {
      console.log(`  ✅ Customer "${customer.name}" → Admin "${admin.name}" (${admin.storeCode})`);
    }
  }

  await mongoose.connection.close();
}

diagnose().catch(console.error);
