const telegraf = require('telegraf');
require('dotenv').config();
const axios = require('axios');

const bot = new telegraf.Telegraf(process.env.TELEGRAM_API);