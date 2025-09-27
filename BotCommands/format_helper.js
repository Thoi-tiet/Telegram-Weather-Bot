const {
    fetchWeatherByCity,
    fetchForecastByCoords,
    fetchForecastByCity,
    fetchWeatherByCoords
} = require('./functions');

// format helpers
function formatWeather(data) {
  const name = data.name || `${data.coord.lat},${data.coord.lon}`;
  const desc = data.weather && data.weather[0] ? data.weather[0].description : 'N/A';
  const temp = data.main?.temp;
  const feels = data.main?.feels_like;
  const hum = data.main?.humidity;
  const wind = data.wind ? `${data.wind.speed} m/s` : 'N/A';
  return `🌍 *${escapeMarkdown(name)}*\n` +
         `📝 ${escapeMarkdown(desc)}\n` +
         `🌡️ Temp: *${temp}°C* (feels like ${feels}°C)\n` +
         `💧 Humidity: *${hum}%*\n` +
         `💨 Wind: *${wind}*\n` +
         `📍 Lat: ${data.coord.lat}, Lon: ${data.coord.lon}`;
}

function escapeMarkdown(text) {
  if (!text) return '';
  return String(text).replace(/([\_\*\[\]\(\)\~\`\>\#\+\-\=\|\{\}\.\!])/g, '\\$1');
}

module.exports = {
    formatWeather,
    escapeMarkdown,
}