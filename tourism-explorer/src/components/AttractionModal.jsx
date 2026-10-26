import React from 'react';
import { formatDistance, estimateTravelTime } from '../utils/distance.js';

export default function AttractionModal({ place, onClose }) {
  if (!place) return null;

  const travelEst = place.distanceKm ? estimateTravelTime(place.distanceKm) : null;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${place.name} ${place.address || ''}`
  )}`;

  return (
    <div className="te-modal-overlay" onClick={onClose}>
      <div className="te-modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="te-modal-header">
          <div>
            <span className="te-category-badge" style={{ marginBottom: '6px', display: 'inline-block' }}>
              {place.category}
            </span>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>{place.name}</h2>
          </div>
          <button type="button" className="te-modal-close" onClick={onClose} aria-label="Close modal">
            ✕
          </button>
        </div>

        <div className="te-modal-body">
          {place.address && (
            <p style={{ fontSize: '13px', color: 'var(--te-text-muted)', margin: '0 0 12px 0' }}>
              📍 <strong>Location:</strong> {place.address}
            </p>
          )}

          <p style={{ fontSize: '14px', lineHeight: 1.5, margin: '0 0 16px 0', color: 'var(--te-text)' }}>
            {place.description}
          </p>

          <div
            style={{
              background: 'var(--te-bg-subtle)',
              border: '1px solid var(--te-border)',
              borderRadius: 'var(--te-radius-md)',
              padding: '12px',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '10px',
              fontSize: '12px'
            }}
          >
            <div>
              <div style={{ color: 'var(--te-text-dim)' }}>Distance from Center</div>
              <div style={{ fontWeight: 'bold', fontSize: '13px' }}>
                {place.distanceKm ? formatDistance(place.distanceKm) : 'Nearby'}
              </div>
            </div>

            <div>
              <div style={{ color: 'var(--te-text-dim)' }}>Transit Estimate</div>
              <div style={{ fontWeight: 'bold', fontSize: '13px' }}>
                {travelEst ? travelEst.text : 'Walking distance'}
              </div>
            </div>

            {place.lat && place.lon && (
              <div style={{ gridColumn: 'span 2' }}>
                <div style={{ color: 'var(--te-text-dim)' }}>Coordinates</div>
                <div style={{ fontFamily: 'monospace', fontSize: '11px' }}>
                  {place.lat.toFixed(5)}, {place.lon.toFixed(5)}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="te-modal-footer">
          <button
            type="button"
            className="te-empty-btn"
            style={{ background: 'var(--te-bg-subtle)', color: 'var(--te-text)', border: '1px solid var(--te-border)' }}
            onClick={onClose}
          >
            Close
          </button>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="te-empty-btn"
            style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
          >
            Open in Google Maps ↗
          </a>
        </div>
      </div>
    </div>
  );
}
