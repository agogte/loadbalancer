const express = require("express");
const httpProxy = require("http-proxy");

const app = express();
const proxy = httpProxy.createProxyServer();

const startPort = parseInt(process.argv[2], 10) || 4012;
const serverCount = parseInt(process.argv[3], 10) || 3;

// Generate the list of server URLs
const servers = Array.from(
  { length: serverCount },
  (_, i) => `http://localhost:${startPort + i}`
);
console.log("Available servers: ", servers);

let current = 0;

const roundRobinLoadBalancer = (req, res) => {
  const target = servers[current];
  current = (current + 1) % servers.length;
  console.log(`Round Robin: Redirecting to ${target}`);
  proxy.web(req, res, { target });
};

const randomLoadBalancer = (req, res) => {
  const randomIndex = Math.floor(Math.random() * servers.length);
  const target = servers[randomIndex];
  console.log(`Random: Redirecting to ${target}`);
  proxy.web(req, res, { target });
};

app.get("/", randomLoadBalancer);

const port = 5001;
app.listen(port, () => {
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
