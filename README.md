# Telegram Weather Bot

A Telegram bot that provides weather information and forecasts using the OpenWeatherMap API.

## Features
- 🌍 Get current weather by city name
- 📍 Get weather by coordinates (latitude/longitude)
- 📅 Get weather forecast for specified hours
- 🤖 Interactive Telegram bot interface

## Setup Instructions

### 1. Required API Keys
You need two API keys to run this bot:

**Telegram Bot Token:**
1. Message @BotFather on Telegram
2. Create a new bot with `/newbot` command
3. Copy the API token provided

**OpenWeatherMap API Key:**
1. Visit https://openweathermap.org/api
2. Sign up for a free account
3. Get your API key from the dashboard

### 2. Configure Environment Variables in Replit
Add these secrets in your Replit environment:
- `TELEGRAM_API` - Your Telegram bot token
- `OWM_API_KEY` - Your OpenWeatherMap API key

### 3. Run the Bot
The bot will automatically start when you run the project. It includes:
- Telegram bot for weather commands
- Keepalive server on port 5000 to prevent sleeping

## Bot Commands
- `/start` - Show welcome message and available commands
- `/weather <city>` - Get current weather for a city
- `/weather_coord <lat> <lon>` - Get weather by coordinates
- `/forecast <city> [hours]` - Get forecast (default 3 hours, max 72)

## Examples
```
/weather London
/weather Ho Chi Minh
/weather_coord 40.7128 -74.0060
/forecast Tokyo 12
```