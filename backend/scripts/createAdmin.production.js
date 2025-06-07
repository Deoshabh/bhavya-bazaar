#!/usr/bin/env node

/**
 * Production Admin Creation Script for Coolify Deployment
 * Usage: node scripts/createAdmin.production.js [phoneNumber] [password] [name]
 */

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Production MongoDB connection string for Coolify
const DB_URL = "mongodb://root:jmU9RAj8gDoz794KNPk1f7GkIKjX0bnqLZ1DSnylnnsTjuJG5CStX1IuTD4ZA9BO@hk0w48gckcgcwggkgwg04wgo:27017/bhavya-bazar?authSource=admin";

console.log("🔗 Connecting to production MongoDB database...");
console.log("📊 Database: bhavya-bazar");

// Connect to the database
mongoose.connect(DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log("✅ MongoDB connected successfully for admin creation");
  createAdmin();
})
.catch(err => {
  console.error("❌ MongoDB connection error:", err.message);
  process.exit(1);
});

// Define a simplified User schema for admin creation
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: "user",
  },
  avatar: {
    type: String,
    default: "defaultAvatar.png",
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  }
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

const User = mongoose.model("User", userSchema);

// Function to create admin
async function createAdmin() {
  try {
    console.log("🔍 Checking for existing admin users...");
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: "Admin" });
    if (existingAdmin) {
      console.log("ℹ️  Admin user already exists:");
      console.log(`📱 Phone: ${existingAdmin.phoneNumber}`);
      console.log(`👤 Name: ${existingAdmin.name}`);
      console.log(`🕒 Created: ${existingAdmin.createdAt}`);
      console.log("\n✅ Use this account to log in to the admin dashboard at: https://bhavyabazaar.com/admin/dashboard");
      
      // List all admin users
      const allAdmins = await User.find({ role: "Admin" });
      if (allAdmins.length > 1) {
        console.log(`\n📋 Found ${allAdmins.length} admin users total:`);
        allAdmins.forEach((admin, index) => {
          console.log(`   ${index + 1}. ${admin.name} (${admin.phoneNumber})`);
        });
      }
    } else {      // Get admin details from command line arguments
      const phoneNumber = process.argv[2] || "7900601901";
      const password = process.argv[3] || "DevSum@123";
      const name = process.argv[4] || "DevSum Admin";

      console.log("\n🔧 Creating new admin user with details:");
      console.log(`📱 Phone: ${phoneNumber}`);
      console.log(`👤 Name: ${name}`);
      console.log(`🔒 Password: ${password.replace(/./g, '*')} (will be encrypted)`);

      // Check if any user with this phone number exists
      const existingUser = await User.findOne({ phoneNumber });
      if (existingUser) {
        console.log("\n⚠️  A user with this phone number already exists:");
        console.log(`👤 Name: ${existingUser.name}`);
        console.log(`🏷️  Role: ${existingUser.role}`);
        
        if (existingUser.role !== "Admin") {
          console.log("\n🔄 Upgrading existing user to Admin role...");
          existingUser.role = "Admin";
          await existingUser.save();
          console.log("✅ User successfully upgraded to Admin!");
        } else {
          console.log("ℹ️  User is already an Admin.");
        }
      } else {
        // Create new admin user
        console.log("\n👨‍💼 Creating new admin user...");
        const admin = new User({
          name,
          phoneNumber,
          password, // will be hashed by pre-save hook
          role: "Admin",
          avatar: "defaultAvatar.png",
        });

        await admin.save();
        console.log("✅ Admin user created successfully!");
      }
      
      console.log("\n🎉 Admin Setup Complete!");
      console.log("📱 Login Phone:", phoneNumber);
      console.log("🔑 Login Password:", password);
      console.log("🌐 Admin Dashboard: https://bhavyabazaar.com/admin/dashboard");
      console.log("\n📋 Next Steps:");
      console.log("1. Go to https://bhavyabazaar.com/login");
      console.log("2. Enter the phone number and password above");
      console.log("3. You'll be redirected to the admin dashboard");
    }
  } catch (error) {
    console.error("❌ Error creating admin user:", error.message);
    if (error.code === 11000) {
      console.log("💡 Tip: This phone number is already in use. Try a different phone number.");
    }
  } finally {
    mongoose.disconnect();
    console.log("\n🔌 Database connection closed.");
  }
}

// Handle script termination
process.on('SIGINT', () => {
  console.log('\n⚠️  Script interrupted. Closing database connection...');
  mongoose.disconnect();
  process.exit(0);
});
