const mongoose = require('mongoose');
require('dotenv').config();

async function fixDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const productsCollection = db.collection('products');

    // 1. Check existing indexes
    console.log('\n📋 Current indexes on products collection:');
    const indexes = await productsCollection.indexes();
    indexes.forEach((index, i) => {
      console.log(`${i + 1}. ${index.name}:`, JSON.stringify(index.key));
    });

    // 2. Drop old barcode unique index if it exists
    try {
      await productsCollection.dropIndex('barcode_1');
      console.log('✅ Dropped old barcode unique index');
    } catch (error) {
      console.log('ℹ️  No old barcode index to drop (this is fine)');
    }

    // 3. Create new compound unique index
    try {
      await productsCollection.createIndex(
        { barcode: 1, storeId: 1 }, 
        { unique: true, name: 'barcode_storeId_unique' }
      );
      console.log('✅ Created new compound unique index (barcode + storeId)');
    } catch (error) {
      console.log('ℹ️  Compound index already exists (this is fine)');
    }

    // 4. Check for duplicate products that might cause issues
    console.log('\n🔍 Checking for potential duplicate issues...');
    
    const duplicates = await productsCollection.aggregate([
      {
        $group: {
          _id: { barcode: '$barcode', storeId: '$storeId' },
          count: { $sum: 1 },
          docs: { $push: '$$ROOT' }
        }
      },
      { $match: { count: { $gt: 1 } } }
    ]).toArray();

    if (duplicates.length > 0) {
      console.log('⚠️  Found duplicate products (same barcode + storeId):');
      duplicates.forEach(dup => {
        console.log(`   Barcode: ${dup._id.barcode}, StoreId: ${dup._id.storeId}, Count: ${dup.count}`);
      });
      console.log('🛠️  You may need to manually clean these up');
    } else {
      console.log('✅ No duplicate products found');
    }

    // 5. Show final indexes
    console.log('\n📋 Final indexes on products collection:');
    const finalIndexes = await productsCollection.indexes();
    finalIndexes.forEach((index, i) => {
      console.log(`${i + 1}. ${index.name}:`, JSON.stringify(index.key));
    });

    console.log('\n🎉 Database fix completed successfully!');
    console.log('💡 You can now add products without index conflicts');

  } catch (error) {
    console.error('❌ Error fixing database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the fix
fixDatabase();