const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');
require('dotenv').config();

async function fixCustomerStore() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // 1. Find the customer with ID from the logs
    const customerId = '69b19a5e0e9cff669ec85155';
    const customer = await User.findById(customerId);
    
    if (!customer) {
      console.log('❌ Customer not found');
      return;
    }
    
    console.log('👤 Found customer:', {
      name: customer.name,
      email: customer.email,
      role: customer.role,
      storeId: customer.storeId,
      storeCode: customer.storeCode,
      storeName: customer.storeName
    });

    // 2. Find the product that was being scanned
    const productStoreId = '6a394ab86b012d21a0b0eac7';
    const admin = await User.findById(productStoreId);
    
    if (!admin) {
      console.log('❌ Admin/Store not found');
      return;
    }
    
    console.log('🏪 Found store admin:', {
      name: admin.name,
      email: admin.email,
      role: admin.role,
      storeId: admin._id,
      storeCode: admin.storeCode,
      storeName: admin.storeName
    });

    // 3. Update customer to belong to this store
    const updateResult = await User.updateOne(
      { _id: customerId },
      {
        storeId: admin._id,
        storeCode: admin.storeCode,
        storeName: admin.storeName
      }
    );

    console.log('🔧 Update result:', updateResult);

    // 4. Verify the update
    const updatedCustomer = await User.findById(customerId);
    console.log('✅ Updated customer:', {
      name: updatedCustomer.name,
      email: updatedCustomer.email,
      storeId: updatedCustomer.storeId,
      storeCode: updatedCustomer.storeCode,
      storeName: updatedCustomer.storeName
    });

    console.log('🎉 Customer store association fixed!');
    console.log('💡 The customer can now scan products from this store');

  } catch (error) {
    console.error('❌ Error fixing customer store:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the fix
fixCustomerStore();