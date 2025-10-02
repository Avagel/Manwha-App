const mongoose = require("mongoose");

let db = null;
let isConnected = false;

// Create a wrapper that mimics the MongoDB native driver interface
class MongooseDBWrapper {
  constructor() {
    this.connection = mongoose.connection;
  }

  collection(name) {
    return this.connection.collection(name);
  }

  listCollections() {
    return this.connection.db.listCollections();
  }

  createCollection(name) {
    return this.connection.db.createCollection(name);
  }

  command(cmd) {
    return this.connection.db.command(cmd);
  }

  // Add other methods you use from the native driver
  admin() {
    return this.connection.db.admin();
  }
}

async function connectDB() {
  if (isConnected) {
    console.log("✅ Using existing database connection");
    return { status: true, message: "Already connected" };
  }

  try {
    console.log("🔗 Attempting MongoDB connection with Mongoose...");

    const mongoURI = process.env.MONGO_URI;

    if (!mongoURI) {
      console.error("❌ MONGO_URI is not defined");
      return { status: false, message: "MONGO_URI not defined" };
    }

    // Mongoose connection with Render-compatible SSL settings
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
      // SSL settings that work on Render
      ssl: true,
      tls: true,
      tlsAllowInvalidCertificates: true,
      tlsAllowInvalidHostnames: true,
    });

    // Initialize the wrapper
    db = new MongooseDBWrapper();
    isConnected = true;

    console.log("✅ MongoDB connected successfully via Mongoose!");

    // Your existing collection setup code
    await ensureCollectionsExist();

    return { status: true, message: "Connected via Mongoose" };
  } catch (error) {
    console.error("❌ Mongoose connection error:", error.message);
    return { status: false, message: error.message };
  }
}

// YOUR EXISTING FUNCTIONS - NO CHANGES NEEDED
async function ensureCollectionsExist() {
  try {
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map((col) => col.name);

    const requiredCollections = ["users", "library", "history"];

    for (const collectionName of requiredCollections) {
      if (!collectionNames.includes(collectionName)) {
        await db.createCollection(collectionName);
        console.log(`✅ Created collection: ${collectionName}`);
        await setupCollectionIndexes(collectionName);
      } else {
        console.log(`✅ Collection exists: ${collectionName}`);
      }
    }

    console.log("🎉 All collections ready!");
  } catch (error) {
    console.error("❌ Error ensuring collections exist:", error);
  }
}

// YOUR EXISTING FUNCTION - NO CHANGES NEEDED
async function setupCollectionIndexes(collectionName) {
  try {
    const collection = db.collection(collectionName);

    switch (collectionName) {
      case "users":
        await collection.createIndex({ UUID: 1 }, { unique: true });
        break;
      case "library":
        await collection.createIndex({ UUID: 1 }, { unique: true });
        await collection.createIndex({ userId: 1 });
        break;
      case "history":
        await collection.createIndex({ UUID: 1 }, { unique: true });
        break;
    }
    console.log(`   📍 Indexes created for ${collectionName}`);
  } catch (error) {
    console.log(`   ℹ️  Indexes may already exist for ${collectionName}`);
  }
}

// YOUR EXISTING FUNCTIONS - NO CHANGES NEEDED
function getDB() {
  if (!db) throw new Error("Database not connected. Call connectDB() first.");
  return db;
}

function getCollection(collectionName) {
  if (!db) throw new Error("Database not connected. Call connectDB() first.");
  return db.collection(collectionName);
}

// Graceful shutdown
process.on("SIGINT", async () => {
  if (isConnected) {
    await mongoose.connection.close();
    console.log("🔌 MongoDB connection closed");
  }
  process.exit(0);
});


// Run once then remove


// SAME EXPORTS AS BEFORE - NO CHANGES NEEDED
module.exports = {
  connectDB,
  getDB,
  getCollection,
  
};
