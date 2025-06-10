const Admin = require("../model/admin");
const connectDatabase = require("../db/Database");
require("dotenv").config();

/**
 * Create initial admin account script
 * Run with: node scripts/createAdmin.js
 */

const createAdmin = async () => {
  try {
    // Connect to database
    await connectDatabase();
    console.log("📂 Connected to database");

    // Check if any admin exists
    const existingAdmin = await Admin.findOne({});
    if (existingAdmin) {
      console.log("⚠️ Admin account already exists:");
      console.log("📧 Email:", existingAdmin.email);
      console.log("👤 Name:", existingAdmin.name);
      console.log("🔐 Role:", existingAdmin.role);
      process.exit(0);
    }

    // Create default admin
    const adminData = {
      name: "Super Administrator",
      email: "admin@bhavyabazaar.com",
      password: "admin123456", // Will be hashed automatically
      role: "superadmin",
      permissions: [
        "manage_users",
        "manage_sellers", 
        "manage_products",
        "manage_orders",
        "manage_system",
        "view_analytics",
        "manage_admins"
      ]
    };

    const admin = await Admin.create(adminData);
    
    console.log("✅ Admin account created successfully!");
    console.log("📧 Email:", admin.email);
    console.log("👤 Name:", admin.name);
    console.log("🔐 Role:", admin.role);
    console.log("🎛️ Permissions:", admin.permissions);
    console.log("");
    console.log("🔑 Default Login Credentials:");
    console.log("   Email: admin@bhavyabazaar.com");
    console.log("   Password: admin123456");
    console.log("   Admin Secret Key:", process.env.ADMIN_SECRET_KEY || "bhavya_bazaar_admin_2025_secure_key");
    console.log("");
    console.log("⚠️ Please change the default password after first login!");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating admin:", error.message);
    process.exit(1);
  }
};

// Run the script
if (require.main === module) {
  createAdmin();
}

module.exports = createAdmin;
