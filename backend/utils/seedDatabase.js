const bcrypt = require("bcryptjs");
const User = require("../model/user");
const Shop = require("../model/shop");
const Product = require("../model/product");
const Event = require("../model/event");

// Sample categories for products
const categories = [
  "Electronics",
  "Clothing & Accessories", 
  "Home & Garden",
  "Sports & Outdoor",
  "Books & Media",
  "Health & Beauty",
  "Toys & Games",
  "Food & Beverages"
];

// Sample product data
const sampleProducts = [
  {
    name: "Wireless Bluetooth Headphones",
    description: "High-quality wireless headphones with noise cancellation and 20-hour battery life. Perfect for music lovers and professionals.",
    category: "Electronics",
    originalPrice: 120,
    discountPrice: 89,
    tags: "headphones,wireless,bluetooth,music",
    stock: 45
  },
  {
    name: "Organic Cotton T-Shirt",
    description: "Comfortable and sustainable organic cotton t-shirt. Available in multiple colors and sizes.",
    category: "Clothing & Accessories",
    originalPrice: 35,
    discountPrice: 25,
    tags: "tshirt,cotton,organic,clothing",
    stock: 100
  },
  {
    name: "Smart LED Bulb Set (4 Pack)",
    description: "Energy-efficient smart LED bulbs with WiFi connectivity. Control via smartphone app with color changing options.",
    category: "Home & Garden",
    originalPrice: 60,
    discountPrice: 45,
    tags: "led,smart,bulb,home,lighting",
    stock: 30
  },
  {
    name: "Yoga Mat Premium",
    description: "Non-slip premium yoga mat with extra cushioning. Perfect for yoga, pilates, and fitness exercises.",
    category: "Sports & Outdoor",
    originalPrice: 50,
    discountPrice: 35,
    tags: "yoga,mat,fitness,exercise",
    stock: 25
  },
  {
    name: "Coffee Maker Deluxe",
    description: "Professional-grade coffee maker with programmable timer and thermal carafe. Makes perfect coffee every time.",
    category: "Home & Garden",
    originalPrice: 150,
    discountPrice: 120,
    tags: "coffee,maker,kitchen,appliance",
    stock: 15
  }
];

// Sample shop data
const sampleShops = [
  {
    name: "TechWorld Electronics",
    email: "contact@techworld.com",
    phoneNumber: "9876543210",
    address: "123 Tech Street, Electronics District, Mumbai, Maharashtra",
    zipCode: "400001",
    description: "Your one-stop shop for all electronic gadgets and accessories. We offer the latest technology at competitive prices."
  },
  {
    name: "Fashion Forward",
    email: "hello@fashionforward.com", 
    phoneNumber: "9876543211",
    address: "456 Fashion Avenue, Style District, Delhi, Delhi",
    zipCode: "110001",
    description: "Trendy clothing and accessories for modern lifestyle. Quality fashion at affordable prices."
  },
  {
    name: "Home Essentials",
    email: "info@homeessentials.com",
    phoneNumber: "9876543212", 
    address: "789 Home Street, Garden District, Bangalore, Karnataka",
    zipCode: "560001",
    description: "Everything you need for your home and garden. From furniture to decor, we have it all."
  }
];

// Sample user data
const sampleUsers = [
  {
    name: "John Doe",
    email: "john.doe@example.com",
    password: "password123",
    phoneNumber: "9876543220",
    addresses: [
      {
        country: "India",
        city: "Mumbai",
        address1: "123 Sample Street",
        address2: "Near Sample Mall",
        zipCode: "400001",
        addressType: "Home"
      }
    ]
  },
  {
    name: "Jane Smith", 
    email: "jane.smith@example.com",
    password: "password123",
    phoneNumber: "9876543221",
    addresses: [
      {
        country: "India",
        city: "Delhi",
        address1: "456 Example Road",
        address2: "Near Example Park",
        zipCode: "110001", 
        addressType: "Home"
      }
    ]
  }
];

const seedDatabase = async () => {
  try {
    console.log("🌱 Starting database seeding...");

    // Create sample users
    console.log("👥 Creating sample users...");
    for (const userData of sampleUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const user = new User({
          ...userData,
          password: hashedPassword,
          avatar: {
            public_id: "sample_avatar",
            url: "https://via.placeholder.com/150/0891b2/ffffff?text=User"
          }
        });
        await user.save();
        console.log(`✅ Created user: ${userData.email}`);
      } else {
        console.log(`ℹ️ User already exists: ${userData.email}`);
      }
    }

    // Create sample shops
    console.log("🏪 Creating sample shops...");
    const shopIds = [];
    for (const shopData of sampleShops) {
      const existingShop = await Shop.findOne({ email: shopData.email });
      if (!existingShop) {
        const hashedPassword = await bcrypt.hash("password123", 10);
        const shop = new Shop({
          ...shopData,
          password: hashedPassword,
          avatar: {
            public_id: "sample_shop_avatar",
            url: "https://via.placeholder.com/150/059669/ffffff?text=Shop"
          }
        });
        const savedShop = await shop.save();
        shopIds.push(savedShop._id);
        console.log(`✅ Created shop: ${shopData.name}`);
      } else {
        console.log(`ℹ️ Shop already exists: ${shopData.name}`);
        shopIds.push(existingShop._id);
      }
    }

    // Create sample products
    console.log("📦 Creating sample products...");
    for (let i = 0; i < sampleProducts.length; i++) {
      const productData = sampleProducts[i];
      const shopId = shopIds[i % shopIds.length]; // Distribute products among shops
      
      const existingProduct = await Product.findOne({ name: productData.name });
      if (!existingProduct) {
        const product = new Product({
          ...productData,
          shopId: shopId,
          shop: shopId,
          images: [
            {
              public_id: `sample_product_${i}`,
              url: "https://via.placeholder.com/300/0891b2/ffffff?text=Product"
            }
          ],
          ratings: 4.5,
          reviews: []
        });
        await product.save();
        console.log(`✅ Created product: ${productData.name}`);
      } else {
        console.log(`ℹ️ Product already exists: ${productData.name}`);
      }
    }

    // Create sample events
    console.log("🎉 Creating sample events...");
    const eventStartDate = new Date();
    eventStartDate.setDate(eventStartDate.getDate() + 7); // Start in 7 days
    const eventEndDate = new Date();
    eventEndDate.setDate(eventEndDate.getDate() + 14); // End in 14 days

    const sampleEvent = {
      name: "Summer Sale 2024",
      description: "Huge discounts on all categories! Up to 50% off on selected items. Limited time offer.",
      category: "Electronics",
      start_Date: eventStartDate,
      Finish_Date: eventEndDate,
      status: "Running",
      originalPrice: 200,
      discountPrice: 100,
      stock: 50,
      sold_out: 0,
      tags: "sale,discount,electronics,summer",
      shopId: shopIds[0],
      shop: shopIds[0],
      images: [
        {
          public_id: "sample_event",
          url: "https://via.placeholder.com/400/dc2626/ffffff?text=SALE"
        }
      ]
    };

    const existingEvent = await Event.findOne({ name: sampleEvent.name });
    if (!existingEvent) {
      const event = new Event(sampleEvent);
      await event.save();
      console.log(`✅ Created event: ${sampleEvent.name}`);
    } else {
      console.log(`ℹ️ Event already exists: ${sampleEvent.name}`);
    }

    console.log("🎉 Database seeding completed successfully!");
    console.log("📊 Summary:");
    console.log(`👥 Users: ${sampleUsers.length}`);
    console.log(`🏪 Shops: ${sampleShops.length}`);
    console.log(`📦 Products: ${sampleProducts.length}`);
    console.log(`🎉 Events: 1`);
    console.log("");
    console.log("🔐 Login credentials:");
    console.log("Users:");
    sampleUsers.forEach(user => {
      console.log(`  📧 ${user.email} | 🔑 password123`);
    });
    console.log("Shops:");
    sampleShops.forEach(shop => {
      console.log(`  📧 ${shop.email} | 🔑 password123`);
    });

  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
};

module.exports = { seedDatabase };
