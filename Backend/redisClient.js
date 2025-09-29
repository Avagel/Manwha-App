// redisClient.js
const { createClient } = require("redis");

const redisClient = createClient();
redisClient.on("error", (err) => console.error("Redis Client Error", err));

exports.redisClient = redisClient;
