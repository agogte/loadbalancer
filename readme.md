# Load Balancer
###### Author: Advait Gogte
This is a custom implementation of a load balancer in JavaScript, designed to distribute incoming traffic across multiple servers using either a **Round-Robin** or **Random** algorithm.

## Features

- **Round-Robin Load Balancing**: Distributes traffic evenly across all available servers in a cyclical manner.
- **Random Load Balancing**: Distributes traffic randomly among the servers.
- **Graceful Shutdown**: Allows you to gracefully exit the process by pressing the "0" key.

## Prerequisites

Ensure you have **Node.js** installed on your machine before proceeding. You can download it from the official website: [https://nodejs.org/](https://nodejs.org/).

## How to Use

### 1. **server.js**

This script sets up multiple backend servers to handle requests. Each server is assigned a port starting from a given base port number.

#### Steps to Run:
1. Open a terminal window.
2. Navigate to the project directory.
3. Execute the following command with the desired **base-port-number** and **server-count**:
   ```bash
   node server.js <base-port-number> <server-count>

### 2. **loadbalancer.js**

This script implements the load balancer that distributes incoming traffic between the servers. You can choose between the **Round-Robin** and **Random** load balancing algorithms.

#### Steps to Run:
1. Open a new terminal window.
2. Navigate to the project directory.
3. Execute the following command with the desired **base-port-number** and **server-count**:
   ```bash
   node loadbalancer.js <base-port-number> <server-count>


