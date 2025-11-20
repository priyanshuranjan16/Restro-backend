/**
 * RBAC Permissions Configuration
 * Defines permissions for each role in the system
 */

// Permission constants
const PERMISSIONS = {
  // Order management
  ORDERS_VIEW: 'orders:view',
  ORDERS_CREATE: 'orders:create',
  ORDERS_UPDATE: 'orders:update',
  ORDERS_DELETE: 'orders:delete',
  ORDERS_MANAGE: 'orders:manage',
  
  // Payment management
  PAYMENTS_VIEW: 'payments:view',
  PAYMENTS_PROCESS: 'payments:process',
  PAYMENTS_REFUND: 'payments:refund',
  PAYMENTS_MANAGE: 'payments:manage',
  
  // Menu management
  MENU_VIEW: 'menu:view',
  MENU_CREATE: 'menu:create',
  MENU_UPDATE: 'menu:update',
  MENU_DELETE: 'menu:delete',
  
  // Inventory management
  INVENTORY_VIEW: 'inventory:view',
  INVENTORY_UPDATE: 'inventory:update',
  INVENTORY_MANAGE: 'inventory:manage',
  
  // User management
  USERS_VIEW: 'users:view',
  USERS_CREATE: 'users:create',
  USERS_UPDATE: 'users:update',
  USERS_DELETE: 'users:delete',
  
  // Reports and analytics
  REPORTS_VIEW: 'reports:view',
  REPORTS_EXPORT: 'reports:export',
  
  // Settings
  SETTINGS_VIEW: 'settings:view',
  SETTINGS_UPDATE: 'settings:update',
  
  // Invoicing
  INVOICES_VIEW: 'invoices:view',
  INVOICES_CREATE: 'invoices:create',
  INVOICES_UPDATE: 'invoices:update',
  INVOICES_DELETE: 'invoices:delete',
  
  // Dashboard
  DASHBOARD_VIEW: 'dashboard:view',
};

// Role-Permission mappings
const ROLE_PERMISSIONS = {
  waiter: [
    PERMISSIONS.ORDERS_VIEW,
    PERMISSIONS.ORDERS_CREATE,
    PERMISSIONS.ORDERS_UPDATE,
    PERMISSIONS.MENU_VIEW,
    PERMISSIONS.DASHBOARD_VIEW,
  ],
  
  cashier: [
    PERMISSIONS.ORDERS_VIEW,
    PERMISSIONS.PAYMENTS_VIEW,
    PERMISSIONS.PAYMENTS_PROCESS,
    PERMISSIONS.INVOICES_VIEW,
    PERMISSIONS.INVOICES_CREATE,
    PERMISSIONS.INVOICES_UPDATE,
    PERMISSIONS.MENU_VIEW,
    PERMISSIONS.DASHBOARD_VIEW,
  ],
  
  admin: [
    // Admin has all permissions
    ...Object.values(PERMISSIONS),
  ],
};

/**
 * Get all permissions for a role
 * @param {string} role - User role
 * @returns {string[]} Array of permission strings
 */
const getRolePermissions = (role) => {
  return ROLE_PERMISSIONS[role] || [];
};

/**
 * Check if a role has a specific permission
 * @param {string} role - User role
 * @param {string} permission - Permission to check
 * @returns {boolean} True if role has permission
 */
const hasPermission = (role, permission) => {
  const rolePerms = getRolePermissions(role);
  return rolePerms.includes(permission);
};

/**
 * Check if a role has any of the specified permissions
 * @param {string} role - User role
 * @param {string[]} permissions - Array of permissions to check
 * @returns {boolean} True if role has at least one permission
 */
const hasAnyPermission = (role, permissions) => {
  return permissions.some(permission => hasPermission(role, permission));
};

/**
 * Check if a role has all of the specified permissions
 * @param {string} role - User role
 * @param {string[]} permissions - Array of permissions to check
 * @returns {boolean} True if role has all permissions
 */
const hasAllPermissions = (role, permissions) => {
  return permissions.every(permission => hasPermission(role, permission));
};

/**
 * Get all available roles
 * @returns {string[]} Array of role strings
 */
const getAvailableRoles = () => {
  return Object.keys(ROLE_PERMISSIONS);
};

module.exports = {
  PERMISSIONS,
  ROLE_PERMISSIONS,
  getRolePermissions,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getAvailableRoles,
};

