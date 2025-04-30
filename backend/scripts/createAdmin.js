const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Hardcode the MongoDB connection string directly to avoid .env loading issues
const DB_URL = "mongodb://127.0.0.1:27017/multi-vendor";

console.log("Attempting to connect to MongoDB database:", DB_URL);

// Connect to the database
mongoose.connect(DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log("MongoDB connected for admin creation");
  createAdmin();
})
.catch(err => {
  console.error("MongoDB connection error:", err);
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
    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: "Admin" });
    if (existingAdmin) {
      console.log("Admin user already exists:");
      console.log(`Phone: ${existingAdmin.phoneNumber}`);
      console.log(`Name: ${existingAdmin.name}`);
      console.log("Please use this account to log in to the admin dashboard");
    } else {
      // Get admin details from command line arguments
      const phoneNumber = process.argv[2] || "1234567890";
      const password = process.argv[3] || "admin123";
      const name = process.argv[4] || "Admin User";

      // Check if any user with this phone number exists
      const existingUser = await User.findOne({ phoneNumber });
      if (existingUser) {
        console.log("A user with this phone number already exists.");
        console.log("Please use a different phone number or update the existing user to an admin role.");
      } else {
        // Create new admin user
        const admin = new User({
          name,
          phoneNumber,
          password, // will be hashed by pre-save hook
          role: "Admin",
          avatar: "defaultAvatar.png", // Using default avatar
        });

        await admin.save();
        console.log("✅ Admin user created successfully!");
        console.log(`Phone: ${phoneNumber}`);
        console.log(`Name: ${name}`);
        console.log(`Password: ${password} (stored encrypted)`);
        console.log("You can now log in to the admin dashboard with these credentials.");
      }
    }
  } catch (error) {
    console.error("Error creating admin user:", error);
  } finally {
    mongoose.disconnect();
    console.log("Database connection closed.");
  }
}

// No need to execute the function here as it's called after successful connection
