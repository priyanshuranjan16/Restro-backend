/**
 * Migration Script: Update User Roles
 * 
 * This script migrates existing users from old roles (owner, manager, staff)
 * to new roles (waiter, cashier, admin)
 * 
 * Usage: node scripts/migrate-roles.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

// Role mapping from old to new
const ROLE_MAPPING = {
  'owner': 'admin',
  'manager': 'cashier',
  'staff': 'waiter'
};

const migrateRoles = async () => {
  try {
    // Connect to database
    await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/restrosphere',
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );

    console.log('✅ Connected to MongoDB');

    // Find all users with old roles
    const usersToMigrate = await User.find({
      role: { $in: Object.keys(ROLE_MAPPING) }
    });

    console.log(`📊 Found ${usersToMigrate.length} users to migrate`);

    if (usersToMigrate.length === 0) {
      console.log('✅ No users need migration');
      await mongoose.connection.close();
      return;
    }

    // Migrate each user
    let migrated = 0;
    for (const user of usersToMigrate) {
      const oldRole = user.role;
      const newRole = ROLE_MAPPING[oldRole];
      
      user.role = newRole;
      await user.save();
      
      console.log(`✅ Migrated user ${user.email}: ${oldRole} → ${newRole}`);
      migrated++;
    }

    console.log(`\n✅ Migration complete! Migrated ${migrated} users`);

    // Close connection
    await mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error('❌ Migration error:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Run migration
migrateRoles();

