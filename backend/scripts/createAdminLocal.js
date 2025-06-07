#!/usr/bin/env node

/**
 * Local Development Admin Creation Script
 * Creates admin user for local development environment
 */

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

// Use local MongoDB connection for development
const DB_URL = "mongodb://127.0.0.1:27017/multi-vendor";

console.log("🔗 Connecting to local MongoDB database...");
console.log("📊 Database: multi-vendor (localhost)");

// Connect to the database
mongoose.connect(DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log("✅ MongoDB connected successfully for local admin creation");
  createAdmin();
})
.catch(err => {
  console.error("❌ MongoDB connection error:", err.message);
  console.log("\n💡 Make sure MongoDB is running locally:");
  console.log("   1. Install MongoDB: https://www.mongodb.com/try/download/community");
  console.log("   2. Start MongoDB service");
  console.log("   3. Or run MongoDB in Docker: docker run -d -p 27017:27017 mongo");
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
      console.log("\n✅ Use this account to log in to the admin dashboard at: http://localhost:3000/admin/dashboard");
      
      // List all admin users
      const allAdmins = await User.find({ role: "Admin" });
      if (allAdmins.length > 1) {
        console.log(`\n📋 Found ${allAdmins.length} admin users total:`);
        allAdmins.forEach((admin, index) => {
          console.log(`   ${index + 1}. ${admin.name} (${admin.phoneNumber})`);
        });
      }
    } else {
      // Get admin details from command line arguments
      const phoneNumber = process.argv[2] || "1234567890";
      const password = process.argv[3] || "admin123";
      const name = process.argv[4] || "Local Admin";

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
      console.log("🌐 Local Development: http://localhost:3000/login");
      console.log("🏠 Admin Dashboard: http://localhost:3000/admin/dashboard");
      console.log("\n📋 Next Steps:");
      console.log("1. Start the frontend development server (npm run start in frontend folder)");
      console.log("2. Go to http://localhost:3000/login");
      console.log("3. Enter the phone number and password above");
      console.log("4. You'll be redirected to the admin dashboard");
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
