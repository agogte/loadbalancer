# Smart API Gateway with Express.js

This project demonstrates a simple load balancer implemented using Node.js and Express. The load balancer distributes incoming requests to multiple backend servers using round-robin, random, or consistent hash ring selection strategies. It also includes a rate limiter with two algorithm options: sliding window and token bucket.

![Load Balancer Diagram](loadbalancer-diagram.png)

---

## Project Structure

- `Api.js`: Main load balancer server. Proxies requests to backend servers using a load balancing algorithm and applies rate limiting.
- `server.js`: Spawns multiple backend servers for testing.
- `loadbalancing-algorithms.js`: Contains the `LoadBalancerBuilder` class and `LoadBalancerAlgorithm` enum for flexible load balancing.
- `rate-limiter.js`: Implements in-memory rate limiting middleware with sliding window and token bucket algorithms.

---

## Getting Started

### Prerequisites

- Node.js (v14+ recommended)

### Installation

No installation is required. Simply run the scripts with Node.js.

---

## Usage

### 1. Start the Backend Servers

```bash
node server.js <startPort> <serverCount>
```

- `startPort`: Starting port number (default: `3000`)
- `serverCount`: Number of servers to spin up (default: `1`)

Example:

```bash
node server.js 3000 3
```

This will start servers on ports 3000, 3001, and 3002.

### 2. Start the Load Balancer

```bash
node Api.js <startPort> <serverCount>
```

- `startPort`: Must match the `startPort` used when starting the servers (default: `4012`)
- `serverCount`: Must match the number of servers you started (default: `3`)

Example:

```bash
node Api.js 3000 3
```

This will proxy incoming requests to servers on ports 3000, 3001, and 3002.

### 3. Send Requests

Open your browser and navigate to:

```
http://localhost:5001
```

This will route the request to one of the backend servers using the **round-robin** strategy by default.

---

## Features

### Load Balancing Strategies

The load balancer uses the `LoadBalancerBuilder` class and `LoadBalancerAlgorithm` enum to configure its behavior.

- **Round Robin (Default):**  
  Cycles through the list of servers sequentially for each request.

- **Random:**  
  Selects a server randomly for each request.

- **Consistent Hash:**  
  Hashes the client IP onto a hash ring and routes it to the server owning the nearest point on the ring. Each server is placed at 100 virtual node positions to keep the distribution even. The same client IP always maps to the same server as long as the server list doesn't change, which makes this useful for sticky routing (e.g. in-memory caches or session affinity) without needing a session store.

To switch strategies, update the following lines in `Api.js`:

```js
const {
  LoadBalancerBuilder,
  LoadBalancerAlgorithm,
} = require("./loadbalancing-algorithms");

const loadbalancer = new LoadBalancerBuilder()
  .setServers(servers)
  .setStrategy(LoadBalancerAlgorithm.ROUND_ROBIN) // or RANDOM, CONSISTENT_HASH
  .setLogging(true)
  .build();

app.get(
  "/",
  rateLimiter(5, 60 * 1000, RateLimiterAlgorithm.TOKEN_BUCKET),
  loadbalancer,
);
```

### Rate Limiting

Each client IP is limited to a configurable number of requests per time window. Exceeding the limit returns a `429 Too Many Requests` response with a `retryAfter` value.

Two algorithms are available via `RateLimiterAlgorithm`:

- **Sliding Window (default):**  
  Tracks the exact timestamps of recent requests in a rolling window. A request is rejected if the number of requests in the last `windowSize` ms is at or above `rateLimit`.

- **Token Bucket:**  
  Each IP gets a bucket that starts full (`rateLimit` tokens) and refills continuously at a rate of `rateLimit / windowSize` tokens per ms. Each request consumes one token. Requests are rejected when the bucket is empty, and clients are told how long to wait until a token is available again. This allows short bursts up to the bucket capacity while smoothing out sustained traffic.

To switch algorithms, update the `rateLimiter` call in `Api.js`:

```js
const { rateLimiter, RateLimiterAlgorithm } = require("./rate-limiter");

// Sliding window (default)
app.get(
  "/",
  rateLimiter(5, 60 * 1000, RateLimiterAlgorithm.SLIDING_WINDOW),
  loadbalancer,
);

// Token bucket
app.get(
  "/",
  rateLimiter(5, 60 * 1000, RateLimiterAlgorithm.TOKEN_BUCKET),
  loadbalancer,
);
```

Parameters:
| Parameter | Default | Description |
|-----------|---------|-------------|
| `rateLimit` | `5` | Max requests (or bucket capacity for token bucket) |
| `windowSize` | `60000` | Time window in ms |
| `algorithm` | `SLIDING_WINDOW` | `RateLimiterAlgorithm.SLIDING_WINDOW` or `TOKEN_BUCKET` |

---

## Graceful Shutdown

Press `0` in the terminal running either the load balancer or any backend server to stop it gracefully.

---

## License

This project is for educational purposes only.
