const httpProxy = require("http-proxy");
const crypto = require("crypto");
const proxy = httpProxy.createProxyServer();

const LoadBalancerAlgorithm = Object.freeze({
  ROUND_ROBIN: 'round-robin',
  RANDOM: 'random',
  CONSISTENT_HASH: 'consistent-hash'
});

const VIRTUAL_NODES_PER_SERVER = 100;

class LoadBalancerBuilder{

  constructor() {
    this.servers = [];
    this.current = 0;
    this.strategy = LoadBalancerAlgorithm.ROUND_ROBIN;
    this.loggingEnabled = true;
  }

  setServers = (servers) => {
    if(!Array.isArray(servers) || servers.length === 0)
        throw new Error("Servers list cannot be enpty");

    this.servers = servers;
    this.ring = this._buildRing(servers);
    return this;
  }

  setLogging = (enabled) => {
    this.loggingEnabled = !!enabled;
    return this;
  }
  setStrategy = (strategy) => {
    if (!Object.values(LoadBalancerAlgorithm).includes(strategy)) {
      throw new Error("Unknown loadbalancer algorithm.");
    }
    this.strategy = strategy;
    return this;
  }

  randomLoadBalancer = (servers) => (req, res) => {
    const randomIndex = Math.floor(Math.random() * servers.length);
    const target = servers[randomIndex];
    console.log(`Random: Redirecting to ${target}`);
    proxy.web(req, res, { target });
  };

  roundRobinLoadBalancer = (servers, current) => (req, res) => {
    const target = servers[current];
    current = (current + 1) % servers.length;
    console.log(`Round Robin: Redirecting to ${target}`);
    proxy.web(req, res, { target });
  };

  _hash = (key) => {
    return parseInt(crypto.createHash("md5").update(key).digest("hex").substring(0, 8), 16);
  }

  _buildRing = (servers) => {
    const ring = [];
    servers.forEach((server) => {
      for (let i = 0; i < VIRTUAL_NODES_PER_SERVER; i++) {
        ring.push({ hash: this._hash(`${server}#${i}`), server });
      }
    });
    ring.sort((a, b) => a.hash - b.hash);
    return ring;
  }

  consistentHashLoadBalancer = (ring) => (req, res) => {
    const key = req.ip || req.socket.remoteAddress || "";
    const keyHash = this._hash(key);
    const node = ring.find((n) => n.hash >= keyHash) ?? ring[0];
    console.log(`Consistent Hash: ${key} → ${node.server}`);
    proxy.web(req, res, { target: node.server });
  };

  build = () => {
    const { servers, strategy } = this;

    if(servers.length === 0)
        throw new Error("No Servers configured");

    let handler;
    if (strategy === LoadBalancerAlgorithm.ROUND_ROBIN) {
      handler = this.roundRobinLoadBalancer(servers, this.current);
    } else if (strategy === LoadBalancerAlgorithm.CONSISTENT_HASH) {
      handler = this.consistentHashLoadBalancer(this.ring);
    } else {
      handler = this.randomLoadBalancer(servers);
    }

    return (req, res) => handler(req, res);
  }
}



module.exports = {
  LoadBalancerBuilder,
  LoadBalancerAlgorithm
};