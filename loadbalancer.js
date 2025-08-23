const express = require("express");
const { roundRobinLoadBalancer } = require("./loadbalancing-algorithms");
const { rateLimiter } = require("./rate-limiter");

const app = express();

const startPort = parseInt(process.argv[2], 10) || 4012;
const serverCount = parseInt(process.argv[3], 10) || 3;

// Generate the list of server URLs
const servers = Array.from(
  { length: serverCount },
  (_, i) => `http://localhost:${startPort + i}`
);
console.log("Available servers: ", servers);

// Apply rate limiter middleware before the load balancer
app.get("/", rateLimiter, roundRobinLoadBalancer(servers));

const port = 5001;
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