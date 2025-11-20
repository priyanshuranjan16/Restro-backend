const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
    index: true
  },
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem',
    required: true
  },
  itemName: {
    type: String,
    required: true
  },
  qty: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  modifiers: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [200, 'Item notes cannot exceed 200 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'preparing', 'ready', 'served'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Indexes
orderItemSchema.index({ orderId: 1 });
orderItemSchema.index({ itemId: 1 });

module.exports = mongoose.model('OrderItem', orderItemSchema);

