import React from 'react';

const CATEGORIES = [
  { id: 'all', label: 'All Sights', icon: '✨' },
  { id: 'museum', label: 'Museums', icon: '🏛️' },
  { id: 'monument', label: 'Landmarks & Forts', icon: '🏰' },
  { id: 'temple', label: 'Temples & Sacred', icon: '🛕' },
  { id: 'park', label: 'Parks & Nature', icon: '🌳' },
  { id: 'viewpoint', label: 'Viewpoints', icon: '🔭' }
];

export default function CategoryFilter({ activeCategory, onSelectCategory, counts = {} }) {
  return (
    <div className="te-categories-bar" role="tablist" aria-label="Attraction categories">
      {CATEGORIES.map(cat => {
        const isActive = (activeCategory || 'all') === cat.id;
        const count = counts[cat.id];

        return (
          <button
            key={cat.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={`te-cat-pill ${isActive ? 'active' : ''}`}
            onClick={() => onSelectCategory(cat.id === 'all' ? null : cat.id)}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
            {count !== undefined && count > 0 && (
              <span style={{ opacity: 0.7, fontSize: '11px' }}>({count})</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
