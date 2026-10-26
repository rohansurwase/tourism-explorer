import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header.jsx';
import CategoryFilter from './components/CategoryFilter.jsx';
import AttractionCard from './components/AttractionCard.jsx';
import DayPlanner from './components/DayPlanner.jsx';
import MapView from './components/MapView.jsx';
import EmptyState from './components/EmptyState.jsx';
import AttractionModal from './components/AttractionModal.jsx';
import { parseSearchData, getCategoryDisplayTitle } from './services/queryParser.js';
import { fetchAttractions } from './services/api.js';
import { fetchCityWeather } from './services/openMeteo.js';
import './styles/tourism.css';

export default function TourismExplorer({ searchData, viewMode: propViewMode }) {
  // Parse searchData prop (handles both array and single object)
  const parsed = useMemo(() => parseSearchData(searchData), [searchData]);

  const viewMode = propViewMode || parsed.suggestedPlace || 'sidebar';
  const [isDark, setIsDark] = useState(false);
  const [activeTab, setActiveTab] = useState('sights'); // 'sights' | 'itinerary' | 'map'
  const [categoryFilter, setCategoryFilter] = useState(parsed.categoryIntent);
  const [radius, setRadius] = useState(7000);
  const [places, setPlaces] = useState([]);
  const [weather, setWeather] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [modalPlace, setModalPlace] = useState(null);

  // Sync category filter when searchData query changes
  useEffect(() => {
    setCategoryFilter(parsed.categoryIntent);
  }, [parsed.categoryIntent]);

  // Fetch attractions & weather whenever coordinates, city, or filter changes
  useEffect(() => {
    let isCancelled = false;

    async function loadData() {
      setIsLoading(true);

      const [placesData, weatherData] = await Promise.all([
        fetchAttractions({
          lat: parsed.lat,
          lon: parsed.lon,
          city: parsed.city,
          category: categoryFilter,
          radius,
          userLocation: parsed.userLocation
        }),
        fetchCityWeather(parsed.lat, parsed.lon)
      ]);

      if (!isCancelled) {
        setPlaces(placesData || []);
        if (weatherData) setWeather(weatherData);
        setIsLoading(false);
      }
    }

    if (parsed.lat !== null && parsed.lon !== null) {
      loadData();
    } else {
      setIsLoading(false);
    }

    return () => {
      isCancelled = true;
    };
  }, [parsed.lat, parsed.lon, parsed.city, categoryFilter, radius, parsed.userLocation]);

  // Category counts for badge indicators
  const categoryCounts = useMemo(() => {
    const counts = { all: places.length };
    for (const p of places) {
      const c = (p.category || '').toLowerCase();
      if (c.includes('museum')) counts.museum = (counts.museum || 0) + 1;
      else if (c.includes('temple') || c.includes('sacred')) counts.temple = (counts.temple || 0) + 1;
      else if (c.includes('monument') || c.includes('fort') || c.includes('landmark')) counts.monument = (counts.monument || 0) + 1;
      else if (c.includes('park') || c.includes('nature')) counts.park = (counts.park || 0) + 1;
      else if (c.includes('viewpoint')) counts.viewpoint = (counts.viewpoint || 0) + 1;
    }
    return counts;
  }, [places]);

  const displayTitle = useMemo(() => {
    return getCategoryDisplayTitle(categoryFilter, parsed.city);
  }, [categoryFilter, parsed.city]);

  return (
    <div className={`te-container te-${viewMode} ${isDark ? 'te-dark' : ''}`}>
      <Header
        city={parsed.city}
        country={parsed.country}
        categoryTitle={displayTitle}
        isDark={isDark}
        onToggleTheme={() => setIsDark(d => !d)}
        viewMode={viewMode}
        weather={weather}
      />

      {/* Tabs navigation */}
      <nav className="te-tabs" aria-label="Views">
        <button
          type="button"
          className={`te-tab-btn ${activeTab === 'sights' ? 'active' : ''}`}
          onClick={() => setActiveTab('sights')}
        >
          <span>🏛️</span>
          <span>Top Sights ({places.length})</span>
        </button>

        <button
          type="button"
          className={`te-tab-btn ${activeTab === 'itinerary' ? 'active' : ''}`}
          onClick={() => setActiveTab('itinerary')}
        >
          <span>📅</span>
          <span>Day Itinerary</span>
        </button>

        <button
          type="button"
          className={`te-tab-btn ${activeTab === 'map' ? 'active' : ''}`}
          onClick={() => setActiveTab('map')}
        >
          <span>🗺️</span>
          <span>Map View</span>
        </button>
      </nav>

      {/* Category Pills (available across tabs) */}
      <CategoryFilter
        activeCategory={categoryFilter}
        onSelectCategory={cat => setCategoryFilter(cat)}
        counts={categoryCounts}
      />

      {/* Content Area */}
      <main className="te-content">
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '40px 10px', color: 'var(--te-text-muted)' }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>🧭</div>
            <div style={{ fontSize: '14px', fontWeight: 600 }}>Discovering places in {parsed.city}…</div>
          </div>
        ) : places.length === 0 ? (
          <EmptyState
            category={categoryFilter}
            onResetFilter={() => setCategoryFilter(null)}
            onExpandRadius={() => setRadius(r => r + 8000)}
          />
        ) : activeTab === 'sights' ? (
          <div className="te-grid">
            {places.map((place, idx) => (
              <AttractionCard
                key={place.id || idx}
                place={place}
                index={idx}
                isActive={selectedPlace?.id === place.id}
                onSelect={p => setSelectedPlace(p)}
                onOpenDetails={p => setModalPlace(p)}
              />
            ))}
          </div>
        ) : activeTab === 'itinerary' ? (
          <DayPlanner
            places={places}
            centerLat={parsed.lat}
            centerLon={parsed.lon}
            onSelectPlace={p => setModalPlace(p)}
          />
        ) : (
          <MapView
            places={places}
            centerLat={parsed.lat}
            centerLon={parsed.lon}
            selectedPlace={selectedPlace}
            onSelectPlace={p => {
              setSelectedPlace(p);
              setModalPlace(p);
            }}
          />
        )}
      </main>

      {/* Deep-dive Details Modal */}
      {modalPlace && (
        <AttractionModal place={modalPlace} onClose={() => setModalPlace(null)} />
      )}
    </div>
  );
}
