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
    required: [true, 'Please add a category'],
    enum: [
      'Grocery', 'Fruits', 'Vegetables', 'Dairy',
      'Beverages', 'Snacks', 'Household', 'Personal Care'
    ]
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
  },
  stockQuantity: {
    type: Number,
    required: [true, 'Please add a stock quantity'],
    min: [0, 'Stock cannot be negative']
  },
  weight: {
    type: Number,
    required: [true, 'Please add weight'],
  },
  weightUnit: {
    type: String,
    required: [true, 'Please add weight unit (e.g., kg, g, l, ml)'],
    enum: ['kg', 'g', 'l', 'ml', 'unit']
  },
  productImage: {
    type: String,
    default: 'no-photo.jpg'
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Product', ProductSchema);
