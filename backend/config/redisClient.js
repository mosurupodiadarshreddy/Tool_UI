// Import Redis client creation function
const { createClient } = require("redis");

// Create Redis client instance
// Redis is running locally on port 6379 via Docker
const redisClient = createClient({
  url: "redis://localhost:6379",
});

// Listen for Redis connection errors
// This helps during debugging if Redis is down
redisClient.on("error", (err) => {
  console.log("Redis Error:", err);
});

// Immediately Invoked Async Function (IIFE)
// Used because connect() returns a Promise
(async () => {
  // Establish connection between Node.js application and Redis server
  await redisClient.connect();

  console.log("Redis Connected");
})();

// Export Redis client so it can be used
// in controllers, services, and other files
module.exports = redisClient;