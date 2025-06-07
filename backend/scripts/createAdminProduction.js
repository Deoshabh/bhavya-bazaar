const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import User model
const User = require('../model/user');

// Production database connection
const connectToProduction = async () => {
  try {
    // Use production database URI from environment
    const dbUri = process.env.DB_URI;
    console.log('Connecting to production database...');
    console.log('Database URI:', dbUri ? dbUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@') : 'Not set');
    
    await mongoose.connect(dbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to production database successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to connect to production database:', error.message);
    return false;
  }
};

// Create admin user
const createAdminUser = async () => {
  try {
    console.log('\n🔍 Checking for existing user with phone number 1234567890...');
    
    // Check if user already exists (any role)
    const existingUser = await User.findOne({ 
      phoneNumber: "1234567890"
    });
    
    if (existingUser) {
      console.log('📱 Found existing user:', {
        id: existingUser._id,
        phoneNumber: existingUser.phoneNumber,
        role: existingUser.role || 'undefined',
        name: existingUser.name
      });
      
      // Check if already admin
      if (existingUser.role === 'admin') {
        console.log('✅ User is already an admin');
        return existingUser;
      }
      
      // Update existing user to admin
      console.log('🔄 Converting existing user to admin...');
      
      // Hash new password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash('admin123', saltRounds);
      
      const updatedUser = await User.findByIdAndUpdate(
        existingUser._id,
        {
          role: 'admin',
          password: hashedPassword,
          name: 'Super Admin',
          isActive: true,
          isVerified: true,
          updatedAt: new Date()
        },
        { new: true }
      );
      
      console.log('✅ User converted to admin successfully:', {
        id: updatedUser._id,
        phoneNumber: updatedUser.phoneNumber,
        role: updatedUser.role,
        name: updatedUser.name
      });
      
      return updatedUser;
    }
    
    console.log('👤 Creating new admin user...');
    
    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash('admin123', saltRounds);
    
    // Create admin user data
    const adminData = {
      name: 'Super Admin',
      phoneNumber: '1234567890',
      password: hashedPassword,
      role: 'admin',
      isActive: true,
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Create the admin user
    const adminUser = new User(adminData);
    const savedAdmin = await adminUser.save();
    
    console.log('✅ Admin user created successfully:', {
      id: savedAdmin._id,
      phoneNumber: savedAdmin.phoneNumber,
      role: savedAdmin.role,
      name: savedAdmin.name
    });
    
    return savedAdmin;
  } catch (error) {
    console.error('❌ Failed to create admin user:', error.message);
    throw error;
  }
};

// Verify admin user login
const verifyAdminLogin = async () => {
  try {
    console.log('\n🔐 Verifying admin login credentials...');
    
    const admin = await User.findOne({ 
      phoneNumber: "1234567890",
      role: "admin" 
    }).select('+password'); // Explicitly select password field
    
    if (!admin) {
      console.log('❌ Admin user not found after creation');
      return false;
    }
    
    console.log('🔍 Admin found, checking password...');
    console.log('Password field exists:', !!admin.password);
    
    // Test password verification
    const isPasswordValid = await bcrypt.compare('admin123', admin.password);
    
    if (isPasswordValid) {
      console.log('✅ Admin login credentials verified successfully');
      console.log('📋 Admin details:', {
        id: admin._id,
        name: admin.name,
        phoneNumber: admin.phoneNumber,
        role: admin.role,
        isActive: admin.isActive,
        isVerified: admin.isVerified
      });
      return true;
    } else {
      console.log('❌ Password verification failed');
      return false;
    }
  } catch (error) {
    console.error('❌ Error verifying admin login:', error.message);
    return false;
  }
};

// Main execution
const main = async () => {
  console.log('🚀 Starting Production Admin User Creation Script');
  console.log('================================================\n');
  
  try {
    // Connect to production database
    const connected = await connectToProduction();
    if (!connected) {
      process.exit(1);
    }
    
    // Create admin user
    await createAdminUser();
    
    // Verify admin login
    const loginVerified = await verifyAdminLogin();
    
    if (loginVerified) {
      console.log('\n🎉 Production admin user setup completed successfully!');
      console.log('📞 Phone Number: 1234567890');
      console.log('🔑 Password: admin123');
      console.log('🔗 Login URL: https://bhavyabazaar.com/admin-login');
    } else {
      console.log('\n❌ Admin user creation completed but login verification failed');
    }
    
  } catch (error) {
    console.error('\n💥 Script execution failed:', error.message);
    process.exit(1);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
};

// Run the script
main();
