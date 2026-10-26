import React from 'react';

export default function EmptyState({ category, onResetFilter, onExpandRadius }) {
  return (
    <div className="te-empty-state">
      <div className="te-empty-icon" role="img" aria-label="No results">
        🔍
      </div>
      <h3 className="te-empty-title">
        {category ? `No ${category}s Found Nearby` : 'No Attractions Found'}
      </h3>
      <p className="te-empty-desc">
        We couldn't find verified sights matching this criteria within the current search perimeter.
        Try broadening your category or expanding the exploration radius.
      </p>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {category && (
          <button type="button" className="te-empty-btn" onClick={onResetFilter}>
            Show All Attractions
          </button>
        )}
        <button
          type="button"
          className="te-empty-btn"
          style={{ background: 'var(--te-bg-subtle)', color: 'var(--te-text)', border: '1px solid var(--te-border)' }}
          onClick={onExpandRadius}
        >
          Expand Radius to 15 km
        </button>
      </div>
    </div>
  );
}
