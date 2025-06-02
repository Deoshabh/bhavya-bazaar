const mongoose = require("mongoose");

const connectDatabase = async () => {
  try {
    await mongoose.connect(process.env.DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connection is successful!");

    // Fix the duplicate key issue by dropping all problematic indexes
    const db = mongoose.connection;
    
    // Wait for the connection
    await new Promise((resolve) => {
      if (db.readyState === 1) {
        resolve();
      } else {
        db.once("open", resolve);
      }
    });
    
    console.log("Checking for and fixing problematic indexes...");
    
    try {
      // Check if collections exist and drop email indexes
      const collections = await db.db.listCollections().toArray();
      
      const collectionsToFix = [
        { name: 'users', indexName: 'email_1' },
        { name: 'shops', indexName: 'email_1' }
      ];
      
      for (const collection of collectionsToFix) {
        const collectionExists = collections.find(c => c.name === collection.name);
        
        if (collectionExists) {
          // Check if the index exists
          const indexes = await db.collection(collection.name).indexes();
          const indexExists = indexes.find(idx => idx.name === collection.indexName);
          
          if (indexExists) {
            // Drop the problematic index
            await db.collection(collection.name).dropIndex(collection.indexName);
            console.log(`Dropped problematic ${collection.indexName} index from ${collection.name}`);
          } else {
            console.log(`No problematic ${collection.indexName} index found in ${collection.name}`);
          }
        }
      }
    } catch (indexError) {
      console.error('Error handling indexes:', indexError);
      // Continue even if index dropping fails
    }
    
  } catch (error) {
    console.error("MongoDB connection error:", error);
    console.log("⚠️  Server starting without database connection for development");
    console.log("📝 Please set up MongoDB to enable full functionality:");
    console.log("   Option 1: Install MongoDB locally: https://www.mongodb.com/try/download/community");
    console.log("   Option 2: Use MongoDB Atlas (free): https://www.mongodb.com/atlas");
    console.log("   Option 3: Run MongoDB in Docker: docker run -d -p 27017:27017 mongo");
    // Don't exit in development mode, allow server to start
    if (process.env.NODE_ENV !== 'production') {
      return;
    }
    process.exit(1);
  }
};

module.exports = connectDatabase;
