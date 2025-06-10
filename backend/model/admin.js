const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter admin name"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Please enter admin email"],
    unique: true,
    lowercase: true,
    validate: {
      validator: function(email) {
        return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email);
      },
      message: "Please enter a valid email"
    }
  },
  password: {
    type: String,
    required: [true, "Please enter admin password"],
    minLength: [6, "Password should be greater than 6 characters"],
    select: false,
  },
  role: {
    type: String,
    default: "admin",
    enum: ["admin", "superadmin"],
  },
  permissions: [{
    type: String,
    enum: [
      "manage_users",
      "manage_sellers", 
      "manage_products",
      "manage_orders",
      "manage_system",
      "view_analytics",
      "manage_admins"
    ]
  }],
  avatar: {
    type: String,
    default: null,
  },
  lastLogin: {
    type: Date,
    default: null,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  loginAttempts: {
    type: Number,
    default: 0,
  },
  lockUntil: {
    type: Date,
    default: null,
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: "Admin",
    default: null,
  },
}, {
  timestamps: true,
});

// Hash password before saving
adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

// Compare password method
adminSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Check if account is locked
adminSchema.methods.isLocked = function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

// Increment login attempts
adminSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: {
        lockUntil: 1,
      },
      $set: {
        loginAttempts: 1,
      }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account after 5 failed attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked()) {
    updates.$set = {
      lockUntil: Date.now() + 2 * 60 * 60 * 1000, // 2 hours
    };
  }
  
  return this.updateOne(updates);
};

// Reset login attempts on successful login
adminSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: {
      loginAttempts: 1,
      lockUntil: 1,
    },
    $set: {
      lastLogin: new Date(),
    }
  });
};

// Default permissions for new admins
adminSchema.methods.setDefaultPermissions = function() {
  if (this.permissions.length === 0) {
    this.permissions = [
      "manage_users",
      "manage_sellers", 
      "manage_products",
      "manage_orders",
      "view_analytics"
    ];
  }
};

// Pre-save middleware to set default permissions
adminSchema.pre("save", function(next) {
  if (this.isNew) {
    this.setDefaultPermissions();
  }
  next();
});

module.exports = mongoose.model("Admin", adminSchema);
