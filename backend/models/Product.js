const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a product name'],
    trim: true,
  },
  barcode: {
    type: String,
    required: [true, 'Please add a barcode'],
    unique: true,
  },
  category: {
    type: String,
    default: 'Grocery',
    enum: [
      'Grocery', 'Fruits', 'Vegetables', 'Dairy',
      'Beverages', 'Snacks', 'Household', 'Personal Care'
    ]
  },
  description: {
    type: String,
    default: '',
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
    min: [0, 'Price cannot be negative']
  },
  stockQuantity: {
    type: Number,
    required: [true, 'Please add a stock quantity'],
    min: [0, 'Stock cannot be negative']
  },
  weight: {
    type: Number,
    required: [true, 'Please add weight'],
    min: [0, 'Weight cannot be negative']
  },
  weightUnit: {
    type: String,
    required: [true, 'Please add weight unit'],
    enum: ['Kg', 'g', 'L', 'ml', 'unit']
  },
  productImage: {
    type: String,
    default: 'no-photo.jpg'
  },
  storeId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', ProductSchema);
