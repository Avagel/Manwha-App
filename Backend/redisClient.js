// redisClient.js
const { createClient } = require("redis");
// REDIS_URI = {
//   username: process.env.REDIS_USERNAME,
//   password: process.env.REDIS_PASSWORD,
//   socket: {
//     host: process.env.REDIS_HOST,
//     port: process.env.REDIS_PORT,
//   },
// };

const redisClient = createClient(process.env.REDIS_URL);

redisClient.on("error", (err) => console.error("Redis Client Error", err));

async function connectRedis() {
  if (!redisClient.isOpen) {
    await redisClient.connect();
    console.log("✅ Connected to Redis");
  }
}

connectRedis();

module.exports = { redisClient };
