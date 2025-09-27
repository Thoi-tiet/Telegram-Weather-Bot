const axios = require('axios');

// Get environment variables directly to avoid circular dependency
const OWM_KEY = process.env.OWM_API_KEY;
const TIMEOUT_MS = parseInt(process.env.TIMEOUT_MS || '10000', 10);

async function fetchWeatherByCity(city) {
  const url = `https://api.openweathermap.org/data/2.5/weather`;
  try {
    const res = await axios.get(url, {
      params: { q: city, appid: OWM_KEY, units: 'metric', lang: 'en' },
      timeout: TIMEOUT_MS
    });
    return { ok: true, data: res.data };
  } catch (err) {
    return { ok: false, data: err };
  }
}
// helper: fetch current weather by coords
async function fetchWeatherByCoords(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/weather`;
  try {
    const res = await axios.get(url, {
      params: { lat: lat, lon: lon, appid: OWM_KEY, units: 'metric', lang: 'en' },
      timeout: TIMEOUT_MS
    });
    return { ok: true, data: res.data };
  } catch (err) {
    return { ok: false, data: err };
  }
}

// helper: fetch 5-day/3h forecast by city or coords
async function fetchForecastByCity(city) {
  const url = `https://api.openweathermap.org/data/2.5/forecast`;
  try {
    const res = await axios.get(url, {
      params: { q: city, appid: OWM_KEY, units: 'metric', lang: 'en' },
      timeout: TIMEOUT_MS
    });
    return { ok: true, data: res.data };
  } catch (err) {
    return { ok: false, data: err };
  }
}
async function fetchForecastByCoords(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/forecast`;
  try {
    const res = await axios.get(url, {
      params: { lat: lat, lon: lon, appid: OWM_KEY, units: 'metric', lang: 'en' },
      timeout: TIMEOUT_MS
    });
    return { ok: true, data: res.data };
  } catch (err) {
    return { ok: false, data: err };
  }
}
module.exports = {
    fetchWeatherByCity,
    fetchForecastByCoords,
    fetchForecastByCity,
    fetchWeatherByCoords
}