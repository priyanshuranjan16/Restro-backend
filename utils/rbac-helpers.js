/**
 * RBAC Helper Utilities
 * Utility functions for working with roles and permissions
 */

const { getRolePermissions, hasPermission, getAvailableRoles } = require('../config/permissions');

/**
 * Get user permissions based on their role
 * @param {Object} user - User object
 * @returns {string[]} Array of permission strings
 */
const getUserPermissions = (user) => {
  if (!user || !user.role) {
    return [];
  }
  return getRolePermissions(user.role);
};

/**
 * Check if user has a specific permission
 * @param {Object} user - User object
 * @param {string} permission - Permission to check
 * @returns {boolean} True if user has permission
 */
const userHasPermission = (user, permission) => {
  if (!user || !user.role) {
    return false;
  }
  return hasPermission(user.role, permission);
};

/**
 * Get role hierarchy level (for comparison)
 * Higher number = more privileges
 * @param {string} role - User role
 * @returns {number} Hierarchy level
 */
const getRoleLevel = (role) => {
  const levels = {
    waiter: 1,
    cashier: 2,
    admin: 3
  };
  return levels[role] || 0;
};

/**
 * Check if user role is at least as high as required role
 * @param {Object} user - User object
 * @param {string} minRole - Minimum required role
 * @returns {boolean} True if user role is sufficient
 */
const hasMinimumRole = (user, minRole) => {
  if (!user || !user.role) {
    return false;
  }
  return getRoleLevel(user.role) >= getRoleLevel(minRole);
};

/**
 * Filter data based on user role
 * @param {Object} user - User object
 * @param {Object} data - Data to filter
 * @returns {Object} Filtered data
 */
const filterDataByRole = (user, data) => {
  if (!user || !user.role) {
    return {};
  }

  // Admins see everything
  if (user.role === 'admin') {
    return data;
  }

  // Cashiers see limited data
  if (user.role === 'cashier') {
    return {
      ...data,
      // Remove sensitive fields
      sensitiveInfo: undefined
    };
  }

  // Waiters see minimal data
  if (user.role === 'waiter') {
    return {
      id: data.id,
      // Only include non-sensitive fields
      publicInfo: data.publicInfo
    };
  }

  return {};
};

module.exports = {
  getUserPermissions,
  userHasPermission,
  getRoleLevel,
  hasMinimumRole,
  filterDataByRole,
  getAvailableRoles,
};

