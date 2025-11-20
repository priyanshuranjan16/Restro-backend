/**
 * Example RBAC Route File
 * This file demonstrates how to use RBAC middleware in your routes
 * 
 * You can use this as a reference when creating new routes
 */

const express = require('express');
const router = express.Router();
const { auth, authorize, requirePermission } = require('../middleware/auth');
const { PERMISSIONS } = require('../config/permissions');

// Example: Route accessible by all authenticated users
router.get('/profile', auth, async (req, res) => {
  res.json({ message: 'Profile data', user: req.user.getPublicProfile() });
});

// Example: Route accessible only by specific roles
router.get('/orders', auth, authorize('waiter', 'cashier', 'admin'), async (req, res) => {
  // Only waiters, cashiers, and admins can access
  res.json({ message: 'Orders data' });
});

// Example: Route accessible only by admin
router.get('/admin/users', auth, authorize('admin'), async (req, res) => {
  // Only admins can access
  res.json({ message: 'Users management' });
});

// Example: Route using permission-based authorization
router.post('/orders', auth, requirePermission(PERMISSIONS.ORDERS_CREATE), async (req, res) => {
  // Only users with orders:create permission can access
  // This includes: waiters and admins
  res.json({ message: 'Order created' });
});

// Example: Route for cashier to process payments
router.post('/payments/process', 
  auth, 
  requirePermission(PERMISSIONS.PAYMENTS_PROCESS), 
  async (req, res) => {
    // Only users with payments:process permission can access
    // This includes: cashiers and admins
    res.json({ message: 'Payment processed' });
  }
);

// Example: Route for admin-only operations
router.delete('/users/:id', 
  auth, 
  requirePermission(PERMISSIONS.USERS_DELETE), 
  async (req, res) => {
    // Only admins can delete users
    res.json({ message: 'User deleted' });
  }
);

module.exports = router;

