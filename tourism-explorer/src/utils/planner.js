/**
 * Day Planner Utility
 * Groups nearby attractions and suggests a sensible visiting order
 * using a Nearest-Neighbor TSP optimization heuristic.
 */

import { calculateDistanceKm } from './distance.js';

export function createDayPlan(places, startLat, startLon) {
  if (!places || places.length === 0) return [];

  // Clone places to avoid mutating original array
  const pool = [...places];
  const ordered = [];

  let currentLat = startLat || pool[0].lat;
  let currentLon = startLon || pool[0].lon;

  // Nearest-neighbor sort
  while (pool.length > 0) {
    let nearestIndex = 0;
    let shortestDist = Number.POSITIVE_INFINITY;

    for (let i = 0; i < pool.length; i++) {
      const p = pool[i];
      const dist = calculateDistanceKm(currentLat, currentLon, p.lat, p.lon) ?? 9999;
      if (dist < shortestDist) {
        shortestDist = dist;
        nearestIndex = i;
      }
    }

    const [chosen] = pool.splice(nearestIndex, 1);
    ordered.push(chosen);
    currentLat = chosen.lat;
    currentLon = chosen.lon;
  }

  // Assign sensible time-of-day slots
  const timeSlots = [
    { slot: 'Morning', label: '09:30 AM – 12:00 PM', icon: '🌅', tip: 'Best light & fewer crowds' },
    { slot: 'Midday', label: '12:30 PM – 02:30 PM', icon: '☀️', tip: 'Indoor sights & lunch break' },
    { slot: 'Afternoon', label: '03:00 PM – 05:30 PM', icon: '🏛️', tip: 'Prime exploration time' },
    { slot: 'Golden Hour & Evening', label: '06:00 PM – 08:30 PM', icon: '🌇', tip: 'Sunset views & illuminated sights' }
  ];

  return ordered.map((place, index) => {
    const slotInfo = timeSlots[Math.min(index, timeSlots.length - 1)];
    const prevPlace = index > 0 ? ordered[index - 1] : null;
    const legDistance = prevPlace
      ? calculateDistanceKm(prevPlace.lat, prevPlace.lon, place.lat, place.lon)
      : null;

    return {
      stepNumber: index + 1,
      place,
      slot: slotInfo.slot,
      timeWindow: slotInfo.label,
      slotIcon: slotInfo.icon,
      slotTip: slotInfo.tip,
      legDistanceKm: legDistance,
      duration: place.category?.includes('Museum') ? '1.5 - 2 hrs' : '45 - 60 mins'
    };
  });
}
