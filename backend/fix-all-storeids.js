const mongoose = require('mongoose');
require('dotenv').config();

async function fixAllStoreIds() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB\n');

  const User = require('./models/User');

  // Get all customers who have a storeCode but their storeId doesn't match the admin
  const customers = await User.find({ role: 'customer', storeCode: { $exists: true, $ne: null, $ne: '' } });
  console.log(`Found ${customers.length} customers with storeCode\n`);

  let fixed = 0;
  for (const customer of customers) {
    const admin = await User.findOne({ storeCode: customer.storeCode, role: 'admin' });
    if (!admin) {
      console.log(`  ⚠️  No admin found for storeCode: ${customer.storeCode} (customer: ${customer.name})`);
      continue;
    }

    const needsFix = !customer.storeId || customer.storeId.toString() !== admin._id.toString();
    if (needsFix) {
      await User.updateOne({ _id: customer._id }, {
        storeId: admin._id,
        storeName: admin.storeName
      });
      console.log(`  ✅ Fixed: ${customer.name} (${customer.email}) → storeId set to ${admin._id} (${admin.storeName})`);
      fixed++;
    } else {
      console.log(`  ✓ OK: ${customer.name} already linked to ${admin.name}`);
    }
  }

  // Also fix staff storeIds
  const staffList = await User.find({ role: 'staff', storeCode: { $exists: true, $ne: null, $ne: '' } });
  for (const staff of staffList) {
    const admin = await User.findOne({ storeCode: staff.storeCode, role: 'admin' });
    if (!admin) continue;
    const needsFix = !staff.storeId || staff.storeId.toString() !== admin._id.toString();
    if (needsFix) {
      await User.updateOne({ _id: staff._id }, {
        storeId: admin._id,
        storeName: admin.storeName
      });
      console.log(`  ✅ Fixed staff: ${staff.name} → storeId set to ${admin._id}`);
      fixed++;
    }
  }

  console.log(`\n🎉 Done. Fixed ${fixed} users.`);
  await mongoose.connection.close();
}

fixAllStoreIds().catch(console.error);
