
const { createClient } = require("redis");

let redisClient = null;
let isConnected = false;

async function initializeRedis() {
  // If Redis URL is not provided, skip Redis initialization
  if (!process.env.REDIS_URL) {
    console.log("⚠️ REDIS_URL not found. Running without Redis.");
    return null;
  }

  try {
    console.log("🔗 Initializing Redis connection...");
    console.log(
      "📡 Redis URL:",
      process.env.REDIS_URL.replace(/:[^:]*@/, ":****@")
    ); // Hide password

    // Validate Redis URL format
    if (
      !process.env.REDIS_URL.startsWith("redis://") &&
      !process.env.REDIS_URL.startsWith("rediss://")
    ) {
      console.log("⚠️ Adding redis:// protocol prefix");
      process.env.REDIS_URL = "redis://" + process.env.REDIS_URL;
    }

    redisClient = createClient({
      url: process.env.REDIS_URL,
      socket: {
        connectTimeout: 60000,
        lazyConnect: true,
      },
    });

    redisClient.on("error", (err) => {
      console.error("❌ Redis Client Error:", err.message);
      isConnected = false;
    });

    redisClient.on("connect", () => {
      console.log("🔗 Redis Client Connecting...");
    });

    redisClient.on("ready", () => {
      console.log("✅ Redis Client Ready");
      isConnected = true;
    });

    redisClient.on("end", () => {
      console.log("🔌 Redis Client Disconnected");
      isConnected = false;
    });

    await redisClient.connect();
    console.log("🎉 Redis Client Connected Successfully");
    return redisClient;
  } catch (error) {
    console.error("❌ Failed to connect to Redis:", error.message);
    console.log("⚠️ Application will run without Redis caching");
    return null;
  }
}

// Initialize Redis but don't block app startup
const redisClientPromise = initializeRedis().catch((err) => {
  console.log("⚠️ Redis initialization failed, continuing without Redis");
  return null;
});

// Safe Redis functions that work even if Redis is unavailable

module.exports = { redisClient };
