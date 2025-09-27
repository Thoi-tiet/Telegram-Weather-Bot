const http = require('http');

const PORT = process.env.PORT || 3000;

http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Keepalive running\n');
}).listen(PORT, () => {
    console.log(`Keepalive server listening on port ${PORT}`);
});

// Optional: Ping itself every 5 minutes to prevent sleep
setInterval(() => {
    http.get(`http://localhost:${PORT}`);
}, 5 * 60 * 1000);