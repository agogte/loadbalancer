const httpProxy = require("http-proxy");
const proxy = httpProxy.createProxyServer();
let current = 0;

const roundRobinLoadBalancer = (servers) => (req, res) => {
  const target = servers[current];
  current = (current + 1) % servers.length;
  console.log(`Round Robin: Redirecting to ${target}`);
  proxy.web(req, res, { target });
};

const randomLoadBalancer = (servers) => (req, res) => {
  const randomIndex = Math.floor(Math.random() * servers.length);
  const target = servers[randomIndex];
  console.log(`Random: Redirecting to ${target}`);
  proxy.web(req, res, { target });
};

module.exports = {
  roundRobinLoadBalancer,
  randomLoadBalancer,
};