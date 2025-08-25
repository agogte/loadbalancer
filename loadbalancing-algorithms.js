const httpProxy = require("http-proxy");
const proxy = httpProxy.createProxyServer();

const LoadBalancerAlgorithm = Object.freeze({
  ROUND_ROBIN: 'round-robin',
  RANDOM: 'random'
});

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

  build = () => {
    const {servers, strategy } = this;

    if(servers.length === 0)
        throw new Error("No Servers configured");
    
    return (req, res) => {
      let target;

      if(strategy === LoadBalancerAlgorithm.ROUND_ROBIN){
        return this.roundRobinLoadBalancer(servers, this.current)
      }
      else{
        return this.randomLoadBalancer(servers)
      }
    }
  }
}



module.exports = {
  LoadBalancerBuilder,
  LoadBalancerAlgorithm
};