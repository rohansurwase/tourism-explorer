import React from 'react';

export default function Header({
  city,
  country,
  categoryTitle,
  isDark,
  onToggleTheme,
  viewMode,
  weather
}) {
  return (
    <header className="te-header">
      <div className="te-header-top">
        <div className="te-title-group">
          <div className="te-icon-badge" aria-hidden="true">
            🧭
          </div>
          <div>
            <h1 className="te-title">{categoryTitle || `Discover ${city}`}</h1>
            <p className="te-subtitle">
              <span>📍 {city}{country ? `, ${country}` : ''}</span>
              <span>•</span>
              <span>{viewMode === 'sidebar' ? 'Sidebar View' : 'Mainline View'}</span>
            </p>
          </div>
        </div>

        <div className="te-header-actions">
          <button
            type="button"
            className="te-theme-btn"
            onClick={onToggleTheme}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle color theme"
          >
            {isDark ? '☀️' : '🌙'}
          </button>
        </div>
      </div>

      {weather && (
        <div className="te-weather-bar">
          <div className="te-weather-main">
            <span className="te-weather-icon" role="img" aria-label={weather.condition}>
              {weather.icon}
            </span>
            <span className="te-weather-temp">{weather.temp}°C</span>
            <span className="te-weather-condition">{weather.condition}</span>
          </div>
          {weather.advice && (
            <div className="te-weather-advice" title={weather.advice}>
              {weather.advice}
            </div>
          )}
        </div>
      )}
    </header>
  );
}
