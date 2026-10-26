import React, { useState, useMemo } from 'react';

export default function MapView({ places, centerLat, centerLon, selectedPlace, onSelectPlace }) {
  const [zoomLevel, setZoomLevel] = useState(1);

  // Compute bounding box and relative SVG coordinates
  const { points, centerPoint, bounds } = useMemo(() => {
    if (!places || places.length === 0) {
      return { points: [], centerPoint: { x: 200, y: 150 }, bounds: null };
    }

    const lats = places.map(p => p.lat).filter(Boolean);
    const lons = places.map(p => p.lon).filter(Boolean);

    if (centerLat) lats.push(centerLat);
    if (centerLon) lons.push(centerLon);

    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLon = Math.min(...lons);
    const maxLon = Math.max(...lons);

    const latSpan = Math.max(maxLat - minLat, 0.015);
    const lonSpan = Math.max(maxLon - minLon, 0.015);

    const width = 400;
    const height = 300;
    const padding = 45;

    // Projection helper
    const project = (lat, lon) => {
      const x = padding + ((lon - minLon) / lonSpan) * (width - padding * 2);
      // Invert Y so north is top
      const y = height - (padding + ((lat - minLat) / latSpan) * (height - padding * 2));
      return { x, y };
    };

    const projectedPoints = places.map((p, idx) => {
      const { x, y } = project(p.lat, p.lon);
      return { ...p, x, y, index: idx + 1 };
    });

    const cPoint = centerLat && centerLon ? project(centerLat, centerLon) : { x: width / 2, y: height / 2 };

    return {
      points: projectedPoints,
      centerPoint: cPoint,
      bounds: { minLat, maxLat, minLon, maxLon }
    };
  }, [places, centerLat, centerLon]);

  const getPinColor = category => {
    const c = (category || '').toLowerCase();
    if (c.includes('museum')) return '#8b5cf6'; // Purple
    if (c.includes('temple') || c.includes('sacred')) return '#f59e0b'; // Amber
    if (c.includes('park') || c.includes('nature')) return '#10b981'; // Green
    if (c.includes('monument')) return '#ec4899'; // Pink
    return '#2563eb'; // Blue
  };

  return (
    <div className="te-map-wrapper">
      <div className="te-map-controls">
        <button
          type="button"
          className="te-map-ctrl-btn"
          onClick={() => setZoomLevel(z => Math.min(z + 0.25, 2))}
          title="Zoom In"
        >
          +
        </button>
        <button
          type="button"
          className="te-map-ctrl-btn"
          onClick={() => setZoomLevel(z => Math.max(z - 0.25, 0.75))}
          title="Zoom Out"
        >
          −
        </button>
        <button
          type="button"
          className="te-map-ctrl-btn"
          onClick={() => setZoomLevel(1)}
          title="Reset View"
          style={{ fontSize: '11px' }}
        >
          ⟲
        </button>
      </div>

      <svg
        className="te-map-svg"
        viewBox="0 0 400 300"
        style={{
          transform: `scale(${zoomLevel})`,
          transformOrigin: `${centerPoint.x}px ${centerPoint.y}px`,
          transition: 'transform 0.2s ease'
        }}
      >
        <defs>
          {/* Subtle Grid Pattern */}
          <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="currentColor" strokeOpacity="0.08" strokeWidth="1" />
          </pattern>
          {/* Radar Waves */}
          <radialGradient id="radarPulse" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Map Background with Grid */}
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* City Center Proximity Rings */}
        <circle cx={centerPoint.x} cy={centerPoint.y} r="100" fill="none" stroke="#2563eb" strokeOpacity="0.12" strokeDasharray="3 3" />
        <circle cx={centerPoint.x} cy={centerPoint.y} r="50" fill="url(#radarPulse)" />
        <circle cx={centerPoint.x} cy={centerPoint.y} r="4" fill="#2563eb" />
        <text x={centerPoint.x + 8} y={centerPoint.y + 4} fontSize="10" fill="var(--te-text-muted)" fontWeight="bold">
          City Center
        </text>

        {/* Connecting route path */}
        {points.length > 1 && (
          <path
            d={`M ${points.map(p => `${p.x} ${p.y}`).join(' L ')}`}
            fill="none"
            stroke="var(--te-primary)"
            strokeWidth="1.5"
            strokeOpacity="0.35"
            strokeDasharray="4 4"
          />
        )}

        {/* Pins for each attraction */}
        {points.map(p => {
          const isSelected = selectedPlace?.id === p.id;
          const pinColor = getPinColor(p.category);

          return (
            <g
              key={p.id}
              className="te-map-marker-pin"
              transform={`translate(${p.x}, ${p.y})`}
              onClick={() => onSelectPlace(p)}
            >
              {isSelected && (
                <circle r="18" fill={pinColor} fillOpacity="0.25" className="pulse-ring" />
              )}
              {/* Pin base */}
              <circle r={isSelected ? '12' : '10'} fill={pinColor} stroke="#ffffff" strokeWidth="2" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.25))" />
              {/* Pin number */}
              <text textAnchor="middle" dy="3.5" fontSize={isSelected ? '10' : '9'} fill="#ffffff" fontWeight="bold">
                {p.index}
              </text>
              {/* Label */}
              <text
                textAnchor="middle"
                dy="20"
                fontSize="9"
                fill="var(--te-text)"
                fontWeight={isSelected ? 'bold' : 'normal'}
                style={{
                  paintOrder: 'stroke',
                  stroke: 'var(--te-bg)',
                  strokeWidth: '2px',
                  strokeLinejoin: 'round'
                }}
              >
                {p.name.length > 16 ? `${p.name.substring(0, 15)}…` : p.name}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Selected place overlay pill */}
      {selectedPlace && (
        <div
          style={{
            position: 'absolute',
            bottom: '10px',
            left: '10px',
            right: '10px',
            background: 'var(--te-card-bg)',
            border: '1px solid var(--te-card-border)',
            borderRadius: 'var(--te-radius-md)',
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            zIndex: 10
          }}
        >
          <div>
            <div style={{ fontSize: '13px', fontWeight: 'bold' }}>{selectedPlace.name}</div>
            <div style={{ fontSize: '11px', color: 'var(--te-text-muted)' }}>
              {selectedPlace.category} • {selectedPlace.address}
            </div>
          </div>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              `${selectedPlace.name} ${selectedPlace.address || ''}`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="te-action-link"
          >
            Open Maps ↗
          </a>
        </div>
      )}
    </div>
  );
}
