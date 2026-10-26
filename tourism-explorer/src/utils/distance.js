/**
 * Distance utilities for Tourism Explorer
 * Calculates Haversine spherical distance and walking/driving estimates.
 */

export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;

  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees) {
  return (degrees * Math.PI) / 180;
}

export function formatDistance(distanceKm) {
  if (distanceKm === null || distanceKm === undefined) return '';
  if (distanceKm < 1) {
    const meters = Math.round(distanceKm * 1000);
    return `${meters} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

export function formatDistanceMeters(meters) {
  if (!meters && meters !== 0) return '';
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

export function estimateTravelTime(distanceKm) {
  if (!distanceKm) return null;

  // Assume avg walking speed 4.5 km/h
  if (distanceKm <= 1.5) {
    const walkingMinutes = Math.round((distanceKm / 4.5) * 60);
    return {
      mode: 'walk',
      text: `${walkingMinutes} min walk`
    };
  }

  // Assume avg city transit/driving speed 22 km/h
  const driveMinutes = Math.max(5, Math.round((distanceKm / 22) * 60));
  return {
    mode: 'transit',
    text: `${driveMinutes} min drive`
  };
}
