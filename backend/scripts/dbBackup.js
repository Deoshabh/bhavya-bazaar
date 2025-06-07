#!/usr/bin/env node

/**
 * Database Backup and Restore Script
 * Creates backups of the MongoDB database and provides restore functionality
 * 
 * Usage:
 *   node scripts/dbBackup.js backup                     # Create backup
 *   node scripts/dbBackup.js restore [backupFile]      # Restore from backup
 *   node scripts/dbBackup.js list                       # List available backups
 *   node scripts/dbBackup.js cleanup [days]             # Clean old backups
 */

const mongoose = require('mongoose');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

// Import models
const User = require('../model/user');
const Shop = require('../model/shop');
const Product = require('../model/product');
const Order = require('../model/order');
const Event = require('../model/event');
const CoupounCode = require('../model/coupounCode');

console.log('💾 Bhavya Bazaar - Database Backup Script');
console.log('=========================================\n');

// Backup directory
const BACKUP_DIR = path.join(__dirname, '..', 'backups');

// Connect to database
const connectDatabase = async () => {
  try {
    const dbUri = process.env.DB_URI;
    
    if (!dbUri) {
      throw new Error('DB_URI environment variable is not set');
    }
    
    console.log('🔗 Connecting to database...');
    
    await mongoose.connect(dbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Database connected successfully\n');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
};

// Ensure backup directory exists
const ensureBackupDir = async () => {
  try {
    await fs.access(BACKUP_DIR);
  } catch (error) {
    console.log('📁 Creating backup directory...');
    await fs.mkdir(BACKUP_DIR, { recursive: true });
  }
};

// Create backup
const createBackup = async () => {
  try {
    await ensureBackupDir();
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileName = `bhavya_bazaar_backup_${timestamp}.json`;
    const backupPath = path.join(BACKUP_DIR, backupFileName);
    
    console.log('💾 Creating database backup...');
    console.log(`📁 Backup file: ${backupFileName}\n`);
    
    // Collect data from all collections
    console.log('🔄 Exporting collections...');
    
    const users = await User.find({});
    console.log(`👥 Users: ${users.length} records`);
    
    const shops = await Shop.find({});
    console.log(`🏪 Shops: ${shops.length} records`);
    
    const products = await Product.find({});
    console.log(`📦 Products: ${products.length} records`);
    
    const orders = await Order.find({});
    console.log(`🛒 Orders: ${orders.length} records`);
    
    const events = await Event.find({});
    console.log(`🎉 Events: ${events.length} records`);
    
    const coupons = await CoupounCode.find({});
    console.log(`🎫 Coupons: ${coupons.length} records`);
    
    // Create backup object
    const backupData = {
      metadata: {
        created: new Date().toISOString(),
        version: '1.0',
        source: 'Bhavya Bazaar Database',
        totalRecords: users.length + shops.length + products.length + orders.length + events.length + coupons.length
      },
      collections: {
        users,
        shops,
        products,
        orders,
        events,
        coupons
      }
    };
    
    // Write backup file
    console.log('\n💾 Writing backup file...');
    await fs.writeFile(backupPath, JSON.stringify(backupData, null, 2));
    
    // Get file size
    const stats = await fs.stat(backupPath);
    const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    
    console.log('✅ Backup created successfully!');
    console.log('━'.repeat(50));
    console.log(`📁 File: ${backupFileName}`);
    console.log(`📊 Size: ${fileSizeMB} MB`);
    console.log(`📈 Total Records: ${backupData.metadata.totalRecords}`);
    console.log(`🕒 Created: ${backupData.metadata.created}`);
    console.log('━'.repeat(50));
    
    return backupPath;
    
  } catch (error) {
    console.error('❌ Error creating backup:', error.message);
    return null;
  }
};

// List available backups
const listBackups = async () => {
  try {
    await ensureBackupDir();
    
    console.log('📋 Available backups:\n');
    
    const files = await fs.readdir(BACKUP_DIR);
    const backupFiles = files.filter(file => file.endsWith('.json') && file.includes('backup'));
    
    if (backupFiles.length === 0) {
      console.log('❌ No backup files found');
      console.log('💡 Create a backup with: node scripts/dbBackup.js backup\n');
      return;
    }
    
    console.log('━'.repeat(80));
    console.log('Filename'.padEnd(40) + 'Size'.padEnd(15) + 'Created');
    console.log('━'.repeat(80));
    
    for (const file of backupFiles.sort().reverse()) {
      const filePath = path.join(BACKUP_DIR, file);
      const stats = await fs.stat(filePath);
      const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
      const created = stats.birthtime.toLocaleString();
      
      console.log(`${file.padEnd(40)}${(sizeMB + ' MB').padEnd(15)}${created}`);
    }
    
    console.log('━'.repeat(80));
    console.log(`Total: ${backupFiles.length} backup files\n`);
    
  } catch (error) {
    console.error('❌ Error listing backups:', error.message);
  }
};

// Cleanup old backups
const cleanupBackups = async (daysToKeep = 30) => {
  try {
    await ensureBackupDir();
    
    console.log(`🧹 Cleaning up backups older than ${daysToKeep} days...\n`);
    
    const files = await fs.readdir(BACKUP_DIR);
    const backupFiles = files.filter(file => file.endsWith('.json') && file.includes('backup'));
    
    if (backupFiles.length === 0) {
      console.log('❌ No backup files found to cleanup');
      return;
    }
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    let deletedCount = 0;
    let totalSizeDeleted = 0;
    
    for (const file of backupFiles) {
      const filePath = path.join(BACKUP_DIR, file);
      const stats = await fs.stat(filePath);
      
      if (stats.birthtime < cutoffDate) {
        totalSizeDeleted += stats.size;
        await fs.unlink(filePath);
        deletedCount++;
        console.log(`🗑️  Deleted: ${file}`);
      }
    }
    
    if (deletedCount === 0) {
      console.log('✅ No old backups found to delete');
    } else {
      const sizeMB = (totalSizeDeleted / (1024 * 1024)).toFixed(2);
      console.log(`\n✅ Cleanup complete!`);
      console.log(`🗑️  Deleted: ${deletedCount} files`);
      console.log(`💾 Space freed: ${sizeMB} MB`);
    }
    
  } catch (error) {
    console.error('❌ Error cleaning up backups:', error.message);
  }
};

// Restore from backup (placeholder - requires careful implementation)
const restoreFromBackup = async (backupFile) => {
  try {
    console.log(`🔄 Restore functionality for: ${backupFile}\n`);
    
    console.log('⚠️  WARNING: Database restore is a dangerous operation!');
    console.log('❌ This feature is disabled for safety');
    console.log('\n💡 To enable restore functionality:');
    console.log('   1. Implement proper backup validation');
    console.log('   2. Add confirmation prompts');
    console.log('   3. Test thoroughly in development');
    console.log('   4. Consider using MongoDB tools (mongorestore) instead\n');
    
    return false;
    
  } catch (error) {
    console.error('❌ Error restoring backup:', error.message);
    return false;
  }
};

// Main execution
const main = async () => {
  try {
    const command = process.argv[2];
    const parameter = process.argv[3];
    
    // Connect to database for backup/restore operations
    if (command === 'backup' || command === 'restore') {
      const connected = await connectDatabase();
      if (!connected) {
        process.exit(1);
      }
    }
    
    // Execute command
    switch (command) {
      case 'backup':
        await createBackup();
        break;
        
      case 'restore':
        if (!parameter) {
          console.log('❌ Backup file required for restore');
          console.log('Usage: node scripts/dbBackup.js restore [backupFile]');
          break;
        }
        await restoreFromBackup(parameter);
        break;
        
      case 'list':
        await listBackups();
        break;
        
      case 'cleanup':
        const days = parameter ? parseInt(parameter) : 30;
        if (isNaN(days) || days < 1) {
          console.log('❌ Invalid number of days. Using default: 30');
          await cleanupBackups(30);
        } else {
          await cleanupBackups(days);
        }
        break;
        
      default:
        console.log('📋 Available commands:');
        console.log('  backup              - Create a database backup');
        console.log('  restore [file]      - Restore from backup (disabled for safety)');
        console.log('  list                - List available backup files');
        console.log('  cleanup [days]      - Delete backups older than N days (default: 30)');
        console.log('\nExamples:');
        console.log('  node scripts/dbBackup.js backup');
        console.log('  node scripts/dbBackup.js list');
        console.log('  node scripts/dbBackup.js cleanup 14');
        break;
    }
    
  } catch (error) {
    console.error('\n💥 Script execution failed:', error.message);
    process.exit(1);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('🔌 Database connection closed');
    }
    process.exit(0);
  }
};

// Handle script termination
process.on('SIGINT', async () => {
  console.log('\n\n⚠️  Script interrupted by user');
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.close();
  }
  process.exit(0);
});

// Run the script
main();
