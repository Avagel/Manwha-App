const { getCollection } = require("./mongo");
require()

// Add this to your mongo.js and run once, then remove it
async function dropAllIndexes() {
  try {
    const usersCollection = getCollection("users");
    const libraryCollection = getCollection("library");
    const historyCollection = getCollection("history");

    // Drop all indexes except _id_
    await usersCollection.dropIndexes();
    await libraryCollection.dropIndexes();
    await historyCollection.dropIndexes();

    console.log(
      "✅ All indexes dropped from users, library, and history collections"
    );
  } catch (error) {
    console.log("Index drop completed:", error.message);
  }
}

// Run once then remove
dropAllIndexes();
