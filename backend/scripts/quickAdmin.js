#!/usr/bin/env node

/**
 * Quick Admin Creation for Coolify - Emergency Script
 * This script has the production DB connection hardcoded for immediate use
 */

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

console.log("🚀 COOLIFY ADMIN CREATOR - Emergency Version");
console.log("🔗 Connecting to production database...");

// Production MongoDB connection for Coolify
mongoose.connect("mongodb://root:jmU9RAj8gDoz794KNPk1f7GkIKjX0bnqLZ1DSnylnnsTjuJG5CStX1IuTD4ZA9BO@hk0w48gckcgcwggkgwg04wgo:27017/bhavya-bazar?authSource=admin", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log("✅ Connected to production database!");
  createAdmin();
})
.catch(err => {
  console.error("❌ Connection failed:", err.message);
  process.exit(1);
});

// User schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phoneNumber: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "user" },
  avatar: { type: String, default: "defaultAvatar.png" },
  createdAt: { type: Date, default: Date.now }
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const User = mongoose.model("User", userSchema);

async function createAdmin() {
  try {
    const phoneNumber = process.argv[2] || "9999999999";
    const password = process.argv[3] || "admin123456";
    const name = process.argv[4] || "Super Admin";

    console.log(`\n👤 Creating admin: ${name}`);
    console.log(`📱 Phone: ${phoneNumber}`);
    console.log(`🔒 Password: ${'*'.repeat(password.length)}`);

    // Check if admin exists
    const existing = await User.findOne({ phoneNumber });
    if (existing) {
      if (existing.role === "Admin") {
        console.log("✅ Admin already exists with this phone number!");
      } else {
        existing.role = "Admin";
        await existing.save();
        console.log("✅ User upgraded to Admin!");
      }
    } else {
      await new User({ name, phoneNumber, password, role: "Admin" }).save();
      console.log("✅ New admin created successfully!");
    }

    console.log("\n🎉 ADMIN SETUP COMPLETE!");
    console.log("🌐 Login at: https://bhavyabazaar.com/login");
    console.log(`📱 Phone: ${phoneNumber}`);
    console.log(`🔑 Password: ${password}`);
    console.log("🏠 Admin Dashboard: https://bhavyabazaar.com/admin/dashboard");

  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    mongoose.disconnect();
  }
}
