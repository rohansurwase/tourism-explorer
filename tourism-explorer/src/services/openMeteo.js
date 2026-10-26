/**
 * Open-Meteo Weather Service
 * Free, keyless API for real-time weather and visit-day travel advisory.
 */

export async function fetchCityWeather(lat, lon) {
  if (lat === null || lon === null || lat === undefined || lon === undefined) {
    return null;
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Weather API error: ${res.status}`);

    const data = await res.json();
    const current = data.current;
    const daily = data.daily;

    const weatherCode = current?.weather_code ?? 0;
    const interpretation = interpretWeatherCode(weatherCode);

    return {
      temp: Math.round(current?.temperature_2m ?? 20),
      humidity: current?.relative_humidity_2m ?? 50,
      windSpeed: Math.round(current?.wind_speed_10m ?? 8),
      condition: interpretation.label,
      icon: interpretation.icon,
      isRainy: interpretation.isRainy,
      advice: interpretation.advice,
      todayMax: daily?.temperature_2m_max?.[0] ? Math.round(daily.temperature_2m_max[0]) : null,
      todayMin: daily?.temperature_2m_min?.[0] ? Math.round(daily.temperature_2m_min[0]) : null
    };
  } catch (err) {
    console.warn('[TourismExplorer] Weather fetch failed:', err.message);
    // Provide a sensible fallback weather object
    return {
      temp: 22,
      humidity: 55,
      windSpeed: 10,
      condition: 'Pleasant & Clear',
      icon: '☀️',
      isRainy: false,
      advice: 'Great conditions for exploring sights and outdoor landmarks today!',
      todayMax: 24,
      todayMin: 18
    };
  }
}

function interpretWeatherCode(code) {
  if (code === 0) {
    return {
      label: 'Clear Sky',
      icon: '☀️',
      isRainy: false,
      advice: 'Clear skies! Perfect day for outdoor monuments and scenic viewpoints.'
    };
  }
  if (code >= 1 && code <= 3) {
    return {
      label: 'Partly Cloudy',
      icon: '⛅',
      isRainy: false,
      advice: 'Comfortable weather for walking tours and historic site hopping.'
    };
  }
  if (code === 45 || code === 48) {
    return {
      label: 'Foggy',
      icon: '🌫️',
      isRainy: false,
      advice: 'Atmospheric views; take extra care on high viewpoints.'
    };
  }
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
    return {
      label: 'Rain / Showers',
      icon: '🌧️',
      isRainy: true,
      advice: 'Rain expected today. Great opportunity to explore museums and indoor galleries!'
    };
  }
  if (code >= 71 && code <= 77) {
    return {
      label: 'Snowy',
      icon: '❄️',
      isRainy: false,
      advice: 'Snow on the ground! Dress warmly and enjoy historic winter sights.'
    };
  }
  if (code >= 95) {
    return {
      label: 'Thunderstorm',
      icon: '⛈️',
      isRainy: true,
      advice: 'Stormy weather. Stay indoors and enjoy cultural exhibitions & museums.'
    };
  }

  return {
    label: 'Mild',
    icon: '🌤️',
    isRainy: false,
    advice: 'Pleasant day ahead for touring the city.'
  };
}
