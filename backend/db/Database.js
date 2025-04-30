const mongoose = require("mongoose");

const connectDatabase = async () => {
  try {
    await mongoose.connect(process.env.DB_URL, {
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
    process.exit(1);
  }
};

module.exports = connectDatabase;
