const express = require("express");
const { LoadBalancerBuilder, LoadBalancerAlgorithm } = require("./loadbalancing-algorithms");
const { rateLimiter, RateLimiterAlgorithm } = require("./rate-limiter");
const { startPort, serverCount, port } = require("./config");

const app = express();

// Generate the list of server URLs
const servers = Array.from(
  { length: serverCount },
  (_, i) => `http://localhost:${startPort + i}`
);
console.log("Available servers: ", servers);

const loadbalancer = new LoadBalancerBuilder()
                        .setServers(servers)
                        .setStrategy(LoadBalancerAlgorithm.ROUND_ROBIN)
                        .setLogging(true)
                        .build();

// Apply rate limiter middleware before the load balancer
app.get("/", rateLimiter(5, 60 * 1000, RateLimiterAlgorithm.TOKEN_BUCKET), loadbalancer);

const server = app.listen(port, () => {
  console.log(`Load balancer running on http://localhost:${port}`);
});

// Enable raw mode and listen for key presses
process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.on("data", (d) => {
  if (d.toString().trim() === "0") {
    console.log("Exiting...");
    server.close(() => process.exit(0));
  }
});