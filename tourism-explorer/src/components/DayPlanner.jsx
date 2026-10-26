import React, { useMemo } from 'react';
import { createDayPlan } from '../utils/planner.js';
import { formatDistance } from '../utils/distance.js';

export default function DayPlanner({ places, centerLat, centerLon, onSelectPlace }) {
  const itinerary = useMemo(() => {
    return createDayPlan(places, centerLat, centerLon);
  }, [places, centerLat, centerLon]);

  if (itinerary.length === 0) {
    return null;
  }

  return (
    <div className="te-day-planner">
      <div style={{ marginBottom: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '15px', fontWeight: '700', margin: '0 0 2px 0' }}>
            📅 AI Smart Day Itinerary
          </h2>
          <p style={{ fontSize: '12px', color: 'var(--te-text-muted)', margin: 0 }}>
            Optimized route to minimize walking & travel time across {itinerary.length} top sights.
          </p>
        </div>
      </div>

      <div className="te-plan-list">
        {itinerary.map((item, idx) => {
          const isLast = idx === itinerary.length - 1;
          const { place } = item;

          return (
            <div key={place.id || idx} className="te-plan-item">
              <div className="te-plan-timeline">
                <div className="te-plan-step-num">{item.stepNumber}</div>
                {!isLast && <div className="te-plan-line" />}
              </div>

              <div
                className="te-plan-card"
                role="button"
                tabIndex={0}
                onClick={() => onSelectPlace(place)}
                onKeyDown={e => (e.key === 'Enter' ? onSelectPlace(place) : null)}
                style={{ cursor: 'pointer' }}
              >
                <div className="te-plan-slot-header">
                  <span>
                    {item.slotIcon} {item.slot} • {item.timeWindow}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--te-text-dim)' }}>
                    ⏱ Suggested: {item.duration}
                  </span>
                </div>

                <h3 className="te-plan-place-name">{place.name}</h3>

                <p style={{ fontSize: '12px', color: 'var(--te-text-muted)', margin: '0 0 6px 0', lineHeight: 1.4 }}>
                  {place.description}
                </p>

                <div className="te-plan-meta">
                  <span className="te-category-badge">{place.category}</span>
                  {item.legDistanceKm !== null && item.legDistanceKm !== undefined && (
                    <span style={{ color: 'var(--te-accent)', fontWeight: 500 }}>
                      🚶 {formatDistance(item.legDistanceKm)} from previous stop
                    </span>
                  )}
                  <span style={{ marginLeft: 'auto', fontStyle: 'italic', fontSize: '11px', color: 'var(--te-text-dim)' }}>
                    💡 {item.slotTip}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
