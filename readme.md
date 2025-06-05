# 🌀 Node.js Load Balancer

This project implements a simple HTTP load balancer using **Express.js** and **http-proxy**. It demonstrates **Round Robin** and **Random** load balancing strategies across multiple backend servers.

## 📸 Architecture Diagram

![Load Balancer Diagram](./loadbalancer-diagram.png)

---

## 🚀 Features

- Proxy incoming requests to multiple backend servers.
- Supports:
  - 🔁 **Round Robin**
  - 🎲 **Random Selection**
- Easily configurable number of backend servers and ports.

---

## 📦 Files

### 1. `loadbalancer.js`

Handles incoming traffic and distributes it to backend servers.

**Usage:**
```bash
node loadbalancer.js [START_PORT] [SERVER_COUNT]
