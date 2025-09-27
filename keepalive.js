const http = require('http');

const PORT = process.env.PORT || 5000;

http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Telegram Weather Bot - Keepalive running\n');
}).listen(PORT, '0.0.0.0', () => {
    console.log(`Keepalive server listening on port ${PORT}`);
});

// Optional: Ping itself every 5 minutes to prevent sleep
setInterval(() => {
    http.get(`http://localhost:${PORT}`);
}, 5 * 60 * 1000);