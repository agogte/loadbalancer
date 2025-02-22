const express = require("express");
const app = express();

const startPort = parseInt(process.argv[2], 10) || 3000;
const serverCount = parseInt(process.argv[3], 10) || 1;

for (let i = 0; i < serverCount; i++) {
  const app = express();
  const port = startPort + i;

  app.get("/", (req, res) => {
    res.send(`<h1>Server ${i + 1} - Port: ${port}</h1>`);
  });

  const server = app.listen(port, () => {
    const addr = server.address();
    const host = addr.address === "::" ? "localhost" : addr.address;
    console.log(`Server running on http://${host}:${addr.port}`);
    console.log('Press "0" to exit.');
  });

  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.on("data", (d) => {
    if (d.toString().trim() === "0") {
      console.log("Exiting...");
      server.close(() => process.exit(0));
    }
  });
}
