# Telegram Weather Bot Project

## Overview
This is a Telegram bot that provides weather information and forecasts using the OpenWeatherMap API. The project was imported from GitHub and configured to run in the Replit environment.

## Project Architecture
- **Backend**: Node.js application using Telegraf library
- **APIs**: Telegram Bot API + OpenWeatherMap API
- **Server**: Combined bot + keepalive server on port 5000
- **Dependencies**: axios, dotenv, telegraf

## Project Structure
```
├── index.js              # Main entry point (bot + keepalive)
├── telegram.js           # Telegram bot implementation
├── keepalive.js          # HTTP server for keeping the app alive
├── BotCommands/
│   ├── functions.js      # Weather API functions
│   └── format_helper.js  # Message formatting utilities
├── package.json          # Node.js dependencies
└── .env.example          # Environment variables template
```

## Configuration
- **Workflow**: "Telegram Bot" running `npm start` on port 5000 with webview output
- **Required Secrets**: 
  - TELEGRAM_API (Telegram bot token)
  - OWM_API_KEY (OpenWeatherMap API key)

## Recent Changes (Setup)
- [2025-09-27] Project imported from GitHub
- [2025-09-27] Configured for Replit environment:
  - Updated keepalive server to bind to 0.0.0.0:5000
  - Created index.js as combined entry point
  - Updated package.json start script
  - Set up workflow with webview output type
  - Created comprehensive README with setup instructions
  - Fixed environment variable error messages

## Next Steps for User
1. Add required API keys as Replit secrets
2. Bot will automatically start working once keys are configured
3. Test bot functionality in Telegram
4. Optional: Configure deployment for production use

## User Preferences
- Clear documentation and setup instructions
- Minimal configuration required from user
- Proper error handling and informative messages