require('dotenv').config();

// Start the telegram bot
require('./telegram.js');

// Start the keepalive server on port 5000
require('./keepalive.js');

console.log('Telegram Weather Bot initialized with keepalive server');