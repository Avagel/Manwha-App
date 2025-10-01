// redisClient.js
const { createClient } = require("redis");
REDIS_URI = {
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
};

const redisClient = createClient(REDIS_URI);
redisClient.on("error", (err) => console.error("Redis Client Error", err));

exports.redisClient = redisClient;
