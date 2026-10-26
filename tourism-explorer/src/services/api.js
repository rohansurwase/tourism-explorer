/**
 * Tourism Explorer Data Service
 * Calls the secure backend proxy (/api/places) or falls back smoothly
 * if the backend server is offline during standalone client preview.
 */

import { calculateDistanceKm } from '../utils/distance.js';

const BACKEND_BASE = (typeof window !== 'undefined' && window.__BACKEND_URL__) || 'http://localhost:3001';

export async function fetchAttractions({ lat, lon, city, category, radius = 7000, userLocation = null }) {
  if (lat === null || lon === null || lat === undefined || lon === undefined) {
    return [];
  }

  try {
    const params = new URLSearchParams({
      lat: String(lat),
      lon: String(lon),
      city: city || '',
      category: category || '',
      radius: String(radius),
      limit: '20'
    });

    const res = await fetch(`${BACKEND_BASE}/api/places?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      const places = data.places || [];

      return enrichPlacesWithDistances(places, lat, lon, userLocation);
    }
  } catch (err) {
    console.info('[TourismExplorer] Backend proxy not reached, activating client-side provider:', err.message);
  }

  // Fallback: If backend is not running, provide rich client-side curated data
  return getClientFallbackAttractions(lat, lon, city, category, userLocation);
}

function enrichPlacesWithDistances(places, centerLat, centerLon, userLocation) {
  return places.map(p => {
    const distFromCenter = p.distanceMeters
      ? p.distanceMeters / 1000
      : calculateDistanceKm(centerLat, centerLon, p.lat, p.lon);

    const distFromUser = userLocation?.lat && userLocation?.lon
      ? calculateDistanceKm(userLocation.lat, userLocation.lon, p.lat, p.lon)
      : null;

    return {
      ...p,
      distanceKm: distFromCenter,
      distFromUserKm: distFromUser
    };
  });
}

function getClientFallbackAttractions(lat, lon, city = '', category = '', userLocation = null) {
  const normCity = city.toLowerCase();
  const normCat = (category || '').toLowerCase();

  const mockDatabase = {
    paris: [
      { id: 'p1', name: 'Eiffel Tower', category: 'Historic Landmark', lat: 48.8584, lon: 2.2945, address: 'Champ de Mars, 5 Av. Anatole France, 75007 Paris', description: 'Iconic wrought-iron lattice tower on the Champ de Mars, offering panoramic 360-degree city views.' },
      { id: 'p2', name: 'Louvre Museum', category: 'Museum', lat: 48.8606, lon: 2.3376, address: 'Rue de Rivoli, 75001 Paris', description: 'World largest art museum and historic royal palace housing the Mona Lisa, Winged Victory, and Venus de Milo.' },
      { id: 'p3', name: 'Cathédrale Notre-Dame de Paris', category: 'Temple / Sacred Site', lat: 48.8530, lon: 2.3499, address: '6 Parvis Notre-Dame - Pl. Jean-Paul II, 75004 Paris', description: 'Gothic architectural masterpiece on the Île de la Cité dating back to the 12th century.' },
      { id: 'p4', name: 'Arc de Triomphe', category: 'Monument', lat: 48.8738, lon: 2.2950, address: 'Pl. Charles de Gaulle, 75008 Paris', description: 'Grand triumphal monument honouring those who fought for France, standing at the summit of the Champs-Élysées.' },
      { id: 'p5', name: 'Musée d\'Orsay', category: 'Museum', lat: 48.8599, lon: 2.3266, address: '1 Rue de la Légion d\'Honneur, 75007 Paris', description: 'Former Beaux-Arts railway station holding the world greatest collection of Impressionist and Post-Impressionist masterworks.' },
      { id: 'p6', name: 'Sainte-Chapelle', category: 'Temple / Sacred Site', lat: 48.8554, lon: 2.3450, address: '10 Bd du Palais, 75001 Paris', description: 'Royal chapel famed for having one of the most extensive 13th-century stained glass collections in the world.' },
      { id: 'p7', name: 'Jardin du Luxembourg', category: 'Park & Nature', lat: 48.8462, lon: 2.3372, address: '75006 Paris, France', description: 'Classic Parisian public gardens featuring tree-lined promenades, the Medici Fountain, and vintage pond sailboats.' }
    ],
    nyc: [
      { id: 'n1', name: 'Central Park', category: 'Park & Nature', lat: 40.785091, lon: -73.968285, address: 'New York, NY 10022', description: 'World famous 843-acre urban oasis featuring lakes, Belvedere Castle, and peaceful walking pathways.' },
      { id: 'n2', name: 'The Metropolitan Museum of Art', category: 'Museum', lat: 40.7794, lon: -73.9632, address: '1000 5th Ave, New York, NY 10028', description: 'Premier cultural institution showcasing over 5,000 years of global artistic achievements.' },
      { id: 'n3', name: 'Empire State Building', category: 'Scenic Viewpoint', lat: 40.7488, lon: -73.9857, address: '20 W 34th St, New York, NY 10001', description: 'Legendary 102-story Art Deco skyscraper boasting celebrated open-air observatories.' },
      { id: 'n4', name: 'Statue of Liberty & Ellis Island', category: 'Monument', lat: 40.6892, lon: -74.0445, address: 'New York Harbor, NY 10004', description: 'Universal symbol of freedom and democracy gifted to the United States by France in 1886.' },
      { id: 'n5', name: 'Brooklyn Bridge', category: 'Historic Landmark', lat: 40.7061, lon: -73.9969, address: 'Brooklyn Bridge, New York, NY 10038', description: 'Historic limestone and granite suspension bridge offering scenic walks between Manhattan and Brooklyn.' },
      { id: 'n6', name: 'Solomon R. Guggenheim Museum', category: 'Museum', lat: 40.7829, lon: -73.9590, address: '1071 5th Ave, New York, NY 10128', description: 'Frank Lloyd Wright designed cylindrical museum showcasing modern and contemporary masterworks.' }
    ],
    delhi: [
      { id: 'd1', name: 'National Museum New Delhi', category: 'Museum', lat: 28.6118, lon: 77.2193, address: 'Janpath, New Delhi, Delhi 110011', description: 'India premier national institution holding 200,000 works of art spanning over 5,000 years.' },
      { id: 'd2', name: 'Red Fort (Lal Qila)', category: 'Historic Landmark', lat: 28.6562, lon: 77.2410, address: 'Netaji Subhash Marg, Chandni Chowk, Delhi 110006', description: 'UNESCO World Heritage red sandstone fortress and seat of Mughal Emperors for nearly 200 years.' },
      { id: 'd3', name: 'Qutub Minar', category: 'Monument', lat: 28.5245, lon: 77.1855, address: 'Seth Sarai, Mehrauli, New Delhi 110030', description: 'Towering 72.5m victory minaret constructed in 1192 amidst ancient architectural ruins.' },
      { id: 'd4', name: 'Lotus Temple', category: 'Temple / Sacred Site', lat: 28.5535, lon: 77.2588, address: 'Lotus Temple Rd, Bahapur, New Delhi 110019', description: 'Architectural wonder shaped like a blossoming lotus flower open to all religions for meditation.' },
      { id: 'd5', name: 'Humayun\'s Tomb', category: 'Monument', lat: 28.5933, lon: 77.2507, address: 'Mathura Road, Nizamuddin East, New Delhi 110013', description: 'Magnificent garden tomb built in 1570 that served as architectural inspiration for the Taj Mahal.' }
    ],
    rome: [
      { id: 'r1', name: 'Colosseum', category: 'Historic Landmark', lat: 41.8902, lon: 12.4922, address: 'Piazza del Colosseo, 1, 00184 Roma RM, Italy', description: 'Largest ancient amphitheater ever built, staging gladiatorial contests in imperial Rome.' },
      { id: 'r2', name: 'Pantheon', category: 'Temple / Sacred Site', lat: 41.8986, lon: 12.4769, address: 'Piazza della Rotonda, 00186 Roma RM, Italy', description: 'Best preserved Roman monument featuring the world largest unreinforced concrete dome.' },
      { id: 'r3', name: 'Vatican Museums', category: 'Museum', lat: 41.9067, lon: 12.4536, address: '00120 Vatican City', description: 'Vast art collections curated by the Catholic Church culminating in Michelangelo Sistine Chapel.' },
      { id: 'r4', name: 'Trevi Fountain', category: 'Monument', lat: 41.9009, lon: 12.4833, address: 'Piazza di Trevi, 00187 Roma RM, Italy', description: 'Breathtaking Baroque fountain carved by Nicola Salvi where legends promise returning travellers.' }
    ],
    kurukshetra: [
      { id: 'k1', name: 'Brahma Sarovar', category: 'Temple / Sacred Site', lat: 29.9657, lon: 76.8370, address: 'Thanesar, Kurukshetra, Haryana 136118', description: 'Ancient sacred water reservoir revered as the cradle of civilization and site of the solar eclipse bath.' },
      { id: 'k2', name: 'Jyotisar Birthplace of Gita', category: 'Historic Landmark', lat: 29.9610, lon: 76.7680, address: 'Jyotisar, Kurukshetra, Haryana 136119', description: 'Sacred spot under an immortal Banyan tree where Lord Krishna imparted the Bhagavad Gita to Arjuna.' },
      { id: 'k3', name: 'Kurukshetra Panorama and Science Centre', category: 'Museum', lat: 29.9678, lon: 76.8421, address: 'Pehowa Road, Thanesar, Kurukshetra 136118', description: 'Dramatic cylindrical hall with 3D lifelike battle dioramas illustrating the Mahabharata War.' },
      { id: 'k4', name: 'Sheikh Chilli\'s Tomb', category: 'Monument', lat: 29.9790, lon: 76.8285, address: 'Thanesar, Kurukshetra, Haryana 136118', description: 'Striking Mughal architectural complex built in memory of the great Sufi master Abd-ur-Rahim.' }
    ]
  };

  let list = [];
  if (normCity.includes('paris')) list = mockDatabase.paris;
  else if (normCity.includes('nyc') || normCity.includes('new york')) list = mockDatabase.nyc;
  else if (normCity.includes('delhi')) list = mockDatabase.delhi;
  else if (normCity.includes('rome')) list = mockDatabase.rome;
  else if (normCity.includes('kuru')) list = mockDatabase.kurukshetra;
  else {
    list = [
      { id: 'g1', name: `${city || 'City'} Historic Center`, category: 'Historic Landmark', lat: lat + 0.003, lon: lon + 0.002, address: `Old Quarter, ${city}`, description: `The historic heart of ${city} with preserved architecture, cultural heritage, and vibrant plazas.` },
      { id: 'g2', name: `${city || 'City'} Museum of Fine Arts`, category: 'Museum', lat: lat - 0.002, lon: lon + 0.004, address: `Arts Avenue, ${city}`, description: `Showcasing premier fine art, regional artifacts, and temporary cultural exhibitions.` },
      { id: 'g3', name: `${city || 'City'} Grand Memorial`, category: 'Monument', lat: lat + 0.005, lon: lon - 0.003, address: `Victory Square, ${city}`, description: `A prominent monument celebrating local history and foundational figures of the region.` },
      { id: 'g4', name: `${city || 'City'} Central Park & Gardens`, category: 'Park & Nature', lat: lat - 0.004, lon: lon - 0.003, address: `Parkway Blvd, ${city}`, description: `Extensive green park featuring walking paths, tranquil ponds, and shaded resting spots.` }
    ];
  }

  // Filter if specific category was requested
  if (normCat) {
    const filtered = list.filter(item => {
      const c = item.category.toLowerCase();
      if (normCat.includes('museum')) return c.includes('museum');
      if (normCat.includes('temple')) return c.includes('temple') || c.includes('sacred');
      if (normCat.includes('monument')) return c.includes('monument');
      if (normCat.includes('fort') || normCat.includes('landmark')) return c.includes('landmark') || c.includes('fort');
      if (normCat.includes('park')) return c.includes('park') || c.includes('nature');
      if (normCat.includes('viewpoint')) return c.includes('viewpoint');
      return true;
    });
    if (filtered.length > 0) list = filtered;
  }

  return enrichPlacesWithDistances(list, lat, lon, userLocation);
}
