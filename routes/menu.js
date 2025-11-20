const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { auth, requirePermission } = require('../middleware/auth');
const MenuItem = require('../models/MenuItem');
const Category = require('../models/Category');

// GET /api/menu - Get all active menu items
router.get('/', auth, async (req, res) => {
  try {
    const { categoryId } = req.query;
    const query = { 
      outletId: req.user._id, 
      isActive: true 
    };
    
    if (categoryId) {
      query.categoryId = categoryId;
    }

    const menuItems = await MenuItem.find(query)
      .populate('categoryId', 'name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: menuItems
    });
  } catch (error) {
    console.error('Error fetching menu:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch menu items' 
    });
  }
});

// GET /api/menu/categories - Get all categories
router.get('/categories', auth, async (req, res) => {
  try {
    const categories = await Category.find({ 
      outletId: req.user._id, 
      isActive: true 
    }).sort({ displayOrder: 1, name: 1 });

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch categories' 
    });
  }
});

// POST /api/menu - Create menu item (admin only)
router.post('/', 
  auth,
  requirePermission('menu:create'),
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('categoryId').notEmpty().withMessage('Category is required')
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

      const menuItem = new MenuItem({
        ...req.body,
        outletId: req.user._id
      });

      await menuItem.save();
      await menuItem.populate('categoryId', 'name');

      res.status(201).json({
        success: true,
        data: menuItem
      });
    } catch (error) {
      console.error('Error creating menu item:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to create menu item' 
      });
    }
  }
);

module.exports = router;

