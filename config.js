const startPort = parseInt(process.argv[2], 10) || 4012;
const serverCount = parseInt(process.argv[3], 10) || 3;

const port = 5001;

module.exports = {
    startPort,
    serverCount,
    port
}