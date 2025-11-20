const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { auth, requirePermission } = require('../middleware/auth');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const MenuItem = require('../models/MenuItem');
const Payment = require('../models/Payment');

// POST /api/orders - Create new order
router.post('/', 
  auth,
  requirePermission('orders:create'),
  [
    body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
    body('items.*.itemId').notEmpty().withMessage('Item ID is required'),
    body('items.*.qty').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    body('tableNumber').optional().trim(),
    body('orderType').optional().isIn(['dine-in', 'takeaway', 'delivery']),
    body('clientRef').optional().trim()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false,
          errors: errors.array() 
        });
      }

      const { items, tableNumber, orderType = 'dine-in', clientRef, notes, discount = 0, discountType = 'fixed', taxRate = 0 } = req.body;

      // Verify all items exist and get current prices
      const itemIds = items.map(item => item.itemId);
      const menuItems = await MenuItem.find({ 
        _id: { $in: itemIds },
        outletId: req.user._id,
        isActive: true
      });

      if (menuItems.length !== itemIds.length) {
        return res.status(400).json({
          success: false,
          error: 'One or more menu items not found or inactive'
        });
      }

      // Calculate totals with server-verified prices
      let subtotal = 0;
      const orderItemsData = [];

      for (const item of items) {
        const menuItem = menuItems.find(mi => mi._id.toString() === item.itemId);
        if (!menuItem) {
          return res.status(400).json({
            success: false,
            error: `Menu item ${item.itemId} not found`
          });
        }

        // Calculate item total including modifiers
        let itemPrice = menuItem.price;
        if (item.modifiers && typeof item.modifiers === 'object') {
          Object.values(item.modifiers).forEach((modifierArray) => {
            if (Array.isArray(modifierArray)) {
              modifierArray.forEach((mod) => {
                if (mod.price) itemPrice += mod.price;
              });
            }
          });
        }

        const itemTotal = itemPrice * item.qty;
        subtotal += itemTotal;

        orderItemsData.push({
          itemId: menuItem._id,
          itemName: menuItem.name,
          qty: item.qty,
          price: itemPrice,
          modifiers: item.modifiers || {},
          notes: item.notes || ''
        });
      }

      // Calculate discount
      let discountAmount = 0;
      if (discountType === 'percentage') {
        discountAmount = (subtotal * discount) / 100;
      } else {
        discountAmount = discount;
      }
      discountAmount = Math.min(discountAmount, subtotal);

      // Calculate tax
      const tax = (subtotal - discountAmount) * (taxRate / 100);

      // Calculate total
      const totalAmount = subtotal - discountAmount + tax;

      // Create order
      const order = new Order({
        tableNumber: tableNumber || null,
        orderType,
        subtotal,
        discount: discountAmount,
        discountType,
        tax,
        totalAmount,
        notes,
        outletId: req.user._id,
        clientRef,
        createdBy: req.user._id,
        status: 'pending'
      });

      await order.save();

      // Create order items
      const orderItems = orderItemsData.map(itemData => ({
        ...itemData,
        orderId: order._id
      }));

      await OrderItem.insertMany(orderItems);

      // Populate order with items
      const populatedOrder = await Order.findById(order._id)
        .populate('createdBy', 'firstName lastName')
        .lean();

      const orderItemsPopulated = await OrderItem.find({ orderId: order._id })
        .populate('itemId', 'name price image')
        .lean();

      // Emit Socket.IO event for kitchen
      const io = req.app.get('io');
      if (io) {
        io.to(`kitchen-${req.user._id}`).emit('order:created', {
          order: { ...populatedOrder, items: orderItemsPopulated }
        });
      }

      res.status(201).json({
        success: true,
        data: {
          ...populatedOrder,
          items: orderItemsPopulated
        }
      });
    } catch (error) {
      console.error('Error creating order:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to create order' 
      });
    }
  }
);

// GET /api/orders/:id - Get order by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      outletId: req.user._id
    })
      .populate('createdBy', 'firstName lastName')
      .lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    const items = await OrderItem.find({ orderId: order._id })
      .populate('itemId', 'name price image')
      .lean();

    const payments = await Payment.find({ orderId: order._id })
      .populate('processedBy', 'firstName lastName')
      .lean();

    res.json({
      success: true,
      data: {
        ...order,
        items,
        payments
      }
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch order' 
    });
  }
});

// GET /api/orders - Get all orders (with filters)
router.get('/', auth, async (req, res) => {
  try {
    const { status, tableNumber, startDate, endDate, limit = 50, page = 1 } = req.query;
    
    const query = { outletId: req.user._id };
    
    if (status) {
      query.status = status;
    }
    
    if (tableNumber) {
      query.tableNumber = tableNumber;
    }
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const orders = await Order.find(query)
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .lean();

    const total = await Order.countDocuments(query);

    // Get items for each order
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const items = await OrderItem.find({ orderId: order._id })
          .populate('itemId', 'name price image')
          .lean();
        return { ...order, items };
      })
    );

    res.json({
      success: true,
      data: ordersWithItems,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch orders' 
    });
  }
});

// PUT /api/orders/:id/status - Update order status
router.put('/:id/status',
  auth,
  requirePermission('orders:update'),
  [
    body('status').isIn(['pending', 'confirmed', 'preparing', 'ready', 'served', 'completed', 'cancelled'])
      .withMessage('Invalid status')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false,
          errors: errors.array() 
        });
      }

      const { status } = req.body;

      const order = await Order.findOneAndUpdate(
        { _id: req.params.id, outletId: req.user._id },
        { status },
        { new: true }
      )
        .populate('createdBy', 'firstName lastName')
        .lean();

      if (!order) {
        return res.status(404).json({
          success: false,
          error: 'Order not found'
        });
      }

      // Emit Socket.IO event
      const io = req.app.get('io');
      if (io) {
        io.to(`kitchen-${req.user._id}`).emit('order:updated', {
          orderId: order._id,
          status: order.status
        });
      }

      res.json({
        success: true,
        data: order
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to update order status' 
      });
    }
  }
);

// POST /api/orders/:id/payment - Process payment
router.post('/:id/payment',
  auth,
  requirePermission('payments:process'),
  [
    body('method').isIn(['card', 'upi', 'cash', 'wallet']).withMessage('Invalid payment method'),
    body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
    body('transactionId').optional().trim()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false,
          errors: errors.array() 
        });
      }

      const order = await Order.findOne({
        _id: req.params.id,
        outletId: req.user._id
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          error: 'Order not found'
        });
      }

      const { method, amount, transactionId, notes } = req.body;

      // Check if payment amount matches order total
      const existingPayments = await Payment.find({ 
        orderId: order._id,
        status: { $in: ['completed', 'processing'] }
      });
      
      const paidAmount = existingPayments.reduce((sum, p) => sum + p.amount, 0);
      const remainingAmount = order.totalAmount - paidAmount;

      if (amount > remainingAmount) {
        return res.status(400).json({
          success: false,
          error: `Payment amount exceeds remaining balance. Remaining: ${remainingAmount.toFixed(2)}`
        });
      }

      // Create payment
      const payment = new Payment({
        orderId: order._id,
        method,
        amount,
        transactionId,
        notes,
        processedBy: req.user._id,
        status: 'completed',
        paidAt: new Date()
      });

      await payment.save();

      // Update order status if fully paid
      const newPaidAmount = paidAmount + amount;
      if (newPaidAmount >= order.totalAmount) {
        await Order.findByIdAndUpdate(order._id, { status: 'completed' });
      }

      const populatedPayment = await Payment.findById(payment._id)
        .populate('processedBy', 'firstName lastName')
        .lean();

      res.status(201).json({
        success: true,
        data: populatedPayment
      });
    } catch (error) {
      console.error('Error processing payment:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to process payment' 
      });
    }
  }
);

module.exports = router;

