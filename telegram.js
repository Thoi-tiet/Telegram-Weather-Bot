const telegraf = require('telegraf');
require('dotenv').config();
const axios = require('axios');
const {
    fetchWeatherByCity,
    fetchForecastByCoords,
    fetchForecastByCity,
    fetchWeatherByCoords
} = require('./BotCommands/functions');
const { formatWeather, escapeMarkdown } = require('./BotCommands/format_helper');

// load env vars

const BOT_TOKEN = process.env.TELEGRAM_API;
const OWM_KEY = process.env.OWM_API_KEY;
const TIMEOUT_MS = parseInt(process.env.TIMEOUT_MS || '10000', 10);

if (!BOT_TOKEN) {
    console.error('❌ Missing TELEGRAM_API in environment variables');
    console.error('Please add your Telegram Bot API token from @BotFather');
    console.error('The bot will not function without this token.');
    process.exit(1);
}
if (!OWM_KEY) {
    console.error('❌ Missing OWM_API_KEY in environment variables');
    console.error('Please add your OpenWeatherMap API key from https://openweathermap.org/api');
    console.error('The bot will not function without this API key.');
    process.exit(1);
}

const bot = new telegraf.Telegraf(BOT_TOKEN);

// command: /start
bot.start((ctx) => {
    const name = ctx.from?.first_name || ctx.from?.username || 'friend';
    return ctx.replyWithMarkdownV2(
        `👋 Hi **${escapeMarkdown(name)}**! I'm a Weather bot.\n\n` +
        `Commands:\n` +
        `/weather <city> - Get current weather by city name\n` +
        `/weather_coord <lat> <lon> - Get weather by coordinates\n` +
        `/forecast <city> <hours> - Forecast (hours e.g. 3,6,12) using 3h data\n\n` +
        `Example: /weather Ho Chi Minh`
    );
});

// /weather <location>
bot.command('weather', async (ctx) => {
    const args = ctx.message.text.split(' ').slice(1);
    if (args.length === 0) return ctx.reply('❗ Please provide a city name. Example: /weather London');

    const location = args.join(' ');
    const sent = await ctx.reply(`🔎 Looking up weather for "${location}"...`);
    try {
        const r = await fetchWeatherByCity(location);
        if (!r.ok) {
            console.error('fetchWeather error', r.err?.message || r.err);
            return ctx.telegram.editMessageText(ctx.chat.id, sent.message_id, null, '❌ Could not fetch weather. Please check the city name or try again later.');
        }
        const text = formatWeather(r.data);
        return ctx.telegram.editMessageText(ctx.chat.id, sent.message_id, null, text, { parse_mode: 'MarkdownV2' });
    } catch (err) {
        console.error(err);
        return ctx.reply('❌ Unexpected error while fetching weather.');
    }
});

// /weather_coord <lat> <lon>
bot.command('weather_coord', async (ctx) => {
    const args = ctx.message.text.split(' ').slice(1);
    if (args.length < 2) return ctx.reply('❗ Usage: /weather_coord <lat> <lon>  e.g. /weather_coord 10.7626 106.6602');
    const lat = parseFloat(args[0]), lon = parseFloat(args[1]);
    if (Number.isNaN(lat) || Number.isNaN(lon)) return ctx.reply('❗ Lat and Lon must be numbers.');

    const sent = await ctx.reply(`🔎 Looking up weather for ${lat}, ${lon}...`);
    try {
        const r = await fetchWeatherByCoords(lat, lon);
        if (!r.ok) {
            console.error('fetchWeatherByCoords error', r.err?.message || r.err);
            return ctx.telegram.editMessageText(ctx.chat.id, sent.message_id, null, '❌ Could not fetch weather for these coordinates.');
        }
        const text = formatWeather(r.data);
        return ctx.telegram.editMessageText(ctx.chat.id, sent.message_id, null, text, { parse_mode: 'MarkdownV2' });
    } catch (err) {
        console.error(err);
        return ctx.reply('❌ Unexpected error while fetching weather.');
    }
});

// /forecast <city> <hours>
bot.command('forecast', async (ctx) => {
    const parts = ctx.message.text.split(' ').slice(1);
    if (parts.length === 0) return ctx.reply('❗ Please provide a city name. Example: /forecast London 6');

    // last argument may be hours number
    let hours = 3;
    const last = parts[parts.length - 1];
    if (/^\d+$/.test(last)) {
        hours = Math.max(1, Math.min(72, parseInt(last, 10)));
        parts.pop();
    }
    const city = parts.join(' ');
    const sent = await ctx.reply(`🔎 Fetching forecast for "${city}" for next ${hours} hours...`);
    try {
        const r = await fetchForecastByCity(city);
        if (!r.ok) {
            console.error('fetchForecastByCity error', r.err?.message || r.err);
            return ctx.telegram.editMessageText(ctx.chat.id, sent.message_id, null, '❌ Could not fetch forecast. Please check city name or try later.');
        }
        // r.data.list => every 3 hours
        const list = r.data.list || [];
        if (list.length === 0) {
            return ctx.telegram.editMessageText(ctx.chat.id, sent.message_id, null, '❌ No forecast data available.');
        }

        // build message: gather entries until hours covered
        const nowTs = Math.floor(Date.now() / 1000);
        const endTs = nowTs + hours * 3600;
        const entries = list.filter(it => it.dt <= endTs); // dt is unix sec

        if (entries.length === 0) {
            return ctx.telegram.editMessageText(ctx.chat.id, sent.message_id, null, `No forecast entries within next ${hours} hours.`);
        }

        const lines = entries.map(it => {
            const dt = new Date(it.dt * 1000).toLocaleString();
            const desc = it.weather?.[0]?.description || 'N/A';
            const temp = it.main?.temp;
            const hum = it.main?.humidity;
            return `*${escapeMarkdown(dt)}*\n${escapeMarkdown(desc)} — ${temp}°C — Hum ${hum}%`;
        });

        const header = `📅 Forecast for *${escapeMarkdown(r.data.city.name)}* — next *${hours}h*\n\n`;
        const text = header + lines.join('\n\n');
        return ctx.telegram.editMessageText(ctx.chat.id, sent.message_id, null, text, { parse_mode: 'MarkdownV2' });
    } catch (err) {
        console.error(err);
        return ctx.reply('❌ Unexpected error while fetching forecast.');
    }
});

// graceful error logging
bot.catch((err, ctx) => {
    console.error('Telegram error', err);
});

// Clear any existing webhook and start polling with retry logic
async function startBot() {
    const maxRetries = 3;
    const baseDelay = 5000; // 5 seconds
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`🔄 Starting bot (attempt ${attempt}/${maxRetries})...`);
            
            // Clear any existing webhook first to avoid conflicts
            await bot.telegram.deleteWebhook();
            console.log('✅ Cleared any existing webhook');
            
            // Longer delay to ensure webhook is fully cleared
            const waitTime = baseDelay * attempt; // Increase wait time with each retry
            console.log(`⏳ Waiting ${waitTime/1000} seconds for Telegram API to release connection...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            
            // Start polling
            await bot.launch();
            console.log('✅ Telegram bot started successfully (polling mode)');
            return; // Success, exit the function
            
        } catch (err) {
            if (err.response && err.response.error_code === 409) {
                console.warn(`⚠️  Bot conflict detected (409) on attempt ${attempt}/${maxRetries}`);
                if (attempt === maxRetries) {
                    console.error('❌ Failed to start bot after all retries.');
                    console.error('💡 The bot token may be in use elsewhere. Please:');
                    console.error('   1. Wait 2-3 minutes and try again');
                    console.error('   2. Check if the bot is running in another environment');
                    console.error('   3. Consider using a different bot token for development');
                    process.exit(1);
                } else {
                    console.log(`🔄 Retrying in ${baseDelay * (attempt + 1) / 1000} seconds...`);
                }
            } else {
                console.error('❌ Failed to start bot:', err.message || err);
                process.exit(1);
            }
        }
    }
}

// Start the bot
startBot();

// enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

// No exports needed - this prevents circular dependency