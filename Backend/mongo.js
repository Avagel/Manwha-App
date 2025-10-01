const { MongoClient } = require("mongodb");

let db;
async function connectDB() {
  try {
    const client = await MongoClient.connect(process.env.MONGO_URI);
    db = client.db("ManwhaApp"); // Explicitly use ManwhaApp database
    console.log("✅ MongoDB Connected to ManwhaApp database");

    // Ensure collections exist
    await ensureCollectionsExist();

    return { status: true, message: "Connected to ManwhaApp database" };
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err);
    return { status: false, message: err };
  }
}

async function ensureCollectionsExist() {
  try {
    // Get list of existing collections
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map((col) => col.name);

    // Collections to create if they don't exist
    const requiredCollections = ["users", "library", "history"];

    for (const collectionName of requiredCollections) {
      if (!collectionNames.includes(collectionName)) {
        await db.createCollection(collectionName);
        console.log(`✅ Created collection: ${collectionName}`);

        // Add basic validation/indexes for each collection
        await setupCollectionIndexes(collectionName);
      }
    }

    console.log("✅ All required collections are available");
  } catch (error) {
    console.error("❌ Error ensuring collections exist:", error);
  }
}

async function setupCollectionIndexes(collectionName) {
  const collection = db.collection(collectionName);

  switch (collectionName) {
    case "users":
      await collection.createIndex({ email: 1 }, { unique: true });
      await collection.createIndex({ username: 1 }, { unique: true });
      console.log("✅ Created indexes for users collection");
      break;

    case "library":
      await collection.createIndex(
        { userId: 1, manwhaId: 1 },
        { unique: true }
      );
      await collection.createIndex({ userId: 1 });
      console.log("✅ Created indexes for library collection");
      break;

    case "history":
      await collection.createIndex(
        { userId: 1, manwhaId: 1, chapterId: 1 },
        { unique: true }
      );
      await collection.createIndex({ userId: 1, readAt: -1 });
      console.log("✅ Created indexes for history collection");
      break;
  }
}

// Function to get the database instance
function getDB() {
  if (!db) {
    throw new Error("Database not initialized. Call connectDB() first.");
  }
  return db;
}

// Function to get specific collections
function getCollection(collectionName) {
  if (!db) {
    throw new Error("Database not initialized. Call connectDB() first.");
  }
  return db.collection(collectionName);
}

exports.connectDB = connectDB;
exports.db = db;
