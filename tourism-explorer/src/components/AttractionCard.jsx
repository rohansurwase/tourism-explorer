import React from 'react';
import { formatDistance, estimateTravelTime } from '../utils/distance.js';

export default function AttractionCard({
  place,
  index,
  isActive,
  onSelect,
  onOpenDetails
}) {
  const travelEst = place.distanceKm ? estimateTravelTime(place.distanceKm) : null;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${place.name} ${place.address || ''}`
  )}`;

  return (
    <article
      className={`te-card ${isActive ? 'active-marker' : ''}`}
      onClick={() => onSelect(place)}
      role="button"
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          onSelect(place);
        }
      }}
    >
      <div className="te-card-header">
        <h3 className="te-card-title">
          <span style={{ color: 'var(--te-primary)', marginRight: '6px' }}>#{index + 1}</span>
          {place.name}
        </h3>
        <span className="te-category-badge">{place.category || 'Sight'}</span>
      </div>

      {place.address && (
        <div className="te-card-address">
          <span>📍</span>
          <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
            {place.address}
          </span>
        </div>
      )}

      {place.description && (
        <p className="te-card-desc">{place.description}</p>
      )}

      <div className="te-card-footer">
        <div className="te-distances">
          {place.distanceKm !== undefined && place.distanceKm !== null && (
            <span className="te-dist-tag" title="Distance from center">
              🎯 {formatDistance(place.distanceKm)}
            </span>
          )}

          {travelEst && (
            <span className="te-dist-tag" title="Estimated transit time">
              {travelEst.mode === 'walk' ? '🚶' : '🚗'} {travelEst.text}
            </span>
          )}

          {place.distFromUserKm && (
            <span className="te-dist-tag" title="Distance from your current position" style={{ color: 'var(--te-accent)' }}>
              🧭 {formatDistance(place.distFromUserKm)} from you
            </span>
          )}
        </div>

        <div className="te-card-actions" onClick={e => e.stopPropagation()}>
          <button
            type="button"
            className="te-action-link"
            style={{ border: 'none', cursor: 'pointer' }}
            onClick={() => onOpenDetails(place)}
          >
            Details
          </button>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="te-action-link"
            title="Open in Google Maps"
          >
            Directions ↗
          </a>
        </div>
      </div>
    </article>
  );
}
