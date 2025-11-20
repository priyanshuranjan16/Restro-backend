const mongoose = require('mongoose');

const modifierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  isRequired: {
    type: Boolean,
    default: false
  }
}, { _id: false });

const modifierGroupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  minSelection: {
    type: Number,
    default: 0,
    min: 0
  },
  maxSelection: {
    type: Number,
    default: 1
  },
  modifiers: [modifierSchema]
}, { _id: false });

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Menu item name is required'],
    trim: true,
    maxlength: [200, 'Menu item name cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  image: {
    type: String,
    trim: true
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  modifierGroups: [modifierGroupSchema],
  sku: {
    type: String,
    trim: true,
    unique: true,
    sparse: true
  },
  outletId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
menuItemSchema.index({ outletId: 1, isActive: 1 });
menuItemSchema.index({ categoryId: 1, isActive: 1 });
menuItemSchema.index({ outletId: 1, categoryId: 1 });

module.exports = mongoose.model('MenuItem', menuItemSchema);

