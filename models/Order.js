const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  tableNumber: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'served', 'completed', 'cancelled'],
    default: 'pending',
    index: true
  },
  orderType: {
    type: String,
    enum: ['dine-in', 'takeaway', 'delivery'],
    default: 'dine-in'
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  tax: {
    type: Number,
    default: 0,
    min: 0
  },
  discount: {
    type: Number,
    default: 0,
    min: 0
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    default: 'fixed'
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  outletId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  clientRef: {
    type: String,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  kotGenerated: {
    type: Boolean,
    default: false
  },
  kotGeneratedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Generate order number before saving
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments({ outletId: this.outletId });
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    this.orderNumber = `ORD-${dateStr}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

// Indexes
orderSchema.index({ outletId: 1, createdAt: -1 });
orderSchema.index({ outletId: 1, status: 1 });
orderSchema.index({ tableNumber: 1, status: 1 });

module.exports = mongoose.model('Order', orderSchema);

