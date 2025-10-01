// redisClient.js
const { createClient } = require("redis");

// For debugging - check if Redis URL is loaded
console.log("Redis URL loaded:", process.env.REDIS_URL ? "Yes" : "No");

const redisClient = createClient({
  url:process.env.REDIS_URL
});

redisClient.on("error", (err) => {
  console.error("❌ Redis Client Error:", err);
});

redisClient.on("connect", () => {
  console.log("🔄 Connecting to Redis...");
});

redisClient.on("ready", () => {
  console.log("✅ Redis Client Connected and Ready");
});

redisClient.on("end", () => {
  console.log("🔴 Redis connection closed");
});

async function connectRedis() {
  try {
    if (!redisClient.isOpen) {
      console.log("Attempting to connect to Redis...");
      await redisClient.connect();
      console.log("✅ Successfully connected to Redis");
    }
  } catch (error) {
    console.error("❌ Failed to connect to Redis:", error);
    // Don't throw error - let application continue without Redis
  }
}

// Connect when module loads
connectRedis();

module.exports = { redisClient, connectRedis };
