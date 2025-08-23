const requestTimestamps = new Map();

const rateLimiter = (RATE_LIMIT = 5, WINDOW_SIZE = 60 * 1000) => {
  return (req, res, next) => {
    const clientIp = req.ip;
    const currentTime = Date.now();

    // Get or initialize timestamps array for this IP
    if (!requestTimestamps.has(clientIp)) {
      requestTimestamps.set(clientIp, []);
    }

    const timestamps = requestTimestamps.get(clientIp);
    
    // Remove timestamps older than the window
    while (timestamps.length && timestamps[0] <= currentTime - WINDOW_SIZE) {
      timestamps.shift();
    }

    if (timestamps.length >= RATE_LIMIT) {
      return res.status(429).json({
        error: "Rate limit exceeded. Please try again later.",
        retryAfter: `${Math.ceil((timestamps[0] + WINDOW_SIZE - currentTime) / 1000)} seconds`
      });
    }

    timestamps.push(currentTime);
    next();
  };
};

module.exports = { rateLimiter };