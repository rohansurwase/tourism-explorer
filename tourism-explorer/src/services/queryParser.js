/**
 * Natural Language Query & searchData Parser
 * Extracts target city, coordinates, user location, and category intent.
 */

export function parseSearchData(searchData) {
  // Handle both array or single object structure
  const root = Array.isArray(searchData) ? searchData[0] : searchData;
  if (!root) {
    return {
      query: '',
      city: 'Unknown City',
      country: '',
      lat: null,
      lon: null,
      categoryIntent: null,
      userLocation: null
    };
  }

  const query = root.query || root.genericQuery || '';

  // Extract primary entity
  const entity = root.entities?.[0];
  const geo = entity?.entityInfo?.geo;

  let city = geo?.city || entity?.word || extractCityFallback(query) || 'Unknown Location';
  let country = geo?.country || '';
  let lat = geo?.lat ?? null;
  let lon = geo?.long ?? null;

  // Fallback to known city coordinates if missing from entity
  if ((lat === null || lon === null) && city) {
    const knownCoords = getKnownCityCoordinates(city);
    if (knownCoords) {
      lat = knownCoords.lat;
      lon = knownCoords.lon;
      if (!country) country = knownCoords.country;
    }
  }

  // Extract user location if provided
  let userLocation = null;
  if (root.userLocation?.position?.coords) {
    userLocation = {
      lat: root.userLocation.position.coords.latitude,
      lon: root.userLocation.position.coords.longitude,
      city: root.userLocation.position.city || '',
      countryCode: root.userLocation.position.countryCode || ''
    };
  }

  // Work out category intent from query
  const categoryIntent = detectCategoryIntent(query);

  return {
    raw: root,
    query,
    city,
    country,
    lat,
    lon,
    categoryIntent,
    userLocation,
    suggestedPlace: root.suggestedPlace || 'sidebar'
  };
}

export function detectCategoryIntent(query = '') {
  if (!query) return null;
  const q = query.toLowerCase();

  if (/\b(museums?|art galleries|gallery|exhibition)\b/.test(q)) {
    return 'museum';
  }
  if (/\b(temples?|churches|church|mosques?|cathedrals?|shrines?|gurudwaras?|pagodas?|worship)\b/.test(q)) {
    return 'temple';
  }
  if (/\b(monuments?|forts?|castles?|palaces?|ruins|memorials?|tombs?)\b/.test(q)) {
    return 'monument';
  }
  if (/\b(viewpoints?|views?|lookouts?|scenic|skyline)\b/.test(q)) {
    return 'viewpoint';
  }
  if (/\b(parks?|gardens?|botanical|nature|zoos?|sanctuary)\b/.test(q)) {
    return 'park';
  }
  if (/\b(landmarks?|historic(al)?(\s+sites?)?|heritage)\b/.test(q)) {
    return 'landmark';
  }

  return null;
}

export function getCategoryDisplayTitle(categoryIntent, cityName) {
  switch (categoryIntent) {
    case 'museum':
      return `Museums in ${cityName}`;
    case 'temple':
      return `Temples & Sacred Sites in ${cityName}`;
    case 'monument':
      return `Monuments & Forts in ${cityName}`;
    case 'viewpoint':
      return `Scenic Viewpoints in ${cityName}`;
    case 'park':
      return `Parks & Gardens in ${cityName}`;
    case 'landmark':
      return `Landmarks & Historic Sites in ${cityName}`;
    default:
      return `Top Sights & Things to Do in ${cityName}`;
  }
}

function extractCityFallback(query) {
  if (!query) return '';
  const match = query.match(/\b(in|near|around)\s+([A-Za-z\s]+)$/i);
  if (match?.[2]) {
    return match[2].trim();
  }
  return '';
}

function getKnownCityCoordinates(city) {
  const c = city.toLowerCase();
  const db = {
    paris: { lat: 48.8566, lon: 2.3522, country: 'France' },
    nyc: { lat: 40.7128, lon: -74.0060, country: 'United States' },
    'new york': { lat: 40.7128, lon: -74.0060, country: 'United States' },
    'new york city': { lat: 40.7128, lon: -74.0060, country: 'United States' },
    rome: { lat: 41.9028, lon: 12.4964, country: 'Italy' },
    delhi: { lat: 28.6139, lon: 77.2090, country: 'India' },
    'new delhi': { lat: 28.6139, lon: 77.2090, country: 'India' },
    tokyo: { lat: 35.6762, lon: 139.6503, country: 'Japan' },
    kyoto: { lat: 35.0116, lon: 135.7681, country: 'Japan' },
    kurukshetra: { lat: 29.9695, lon: 76.8783, country: 'India' },
    london: { lat: 51.5074, lon: -0.1278, country: 'United Kingdom' },
    barcelona: { lat: 41.3851, lon: 2.1734, country: 'Spain' },
    amsterdam: { lat: 52.3676, lon: 4.9041, country: 'Netherlands' },
    dubai: { lat: 25.2048, lon: 55.2708, country: 'United Arab Emirates' }
  };

  for (const [key, value] of Object.entries(db)) {
    if (c.includes(key)) return value;
  }
  return null;
}
