/**
 * Tourism Explorer Backend API Server
 * Keeps Geoapify API key secure on the server side.
 * Filters out restaurants, hotels, and shops.
 * Enriches results with Wikipedia snippets and Open-Meteo weather.
 */

import http from 'node:http';
import https from 'node:https';
import url from 'node:url';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const PORT = process.env.PORT || 3001;
const GEOAPIFY_API_KEY = process.env.GEOAPIFY_API_KEY || '';

// In-memory cache to reduce external API requests
const cache = new Map();
const CACHE_TTL_MS = 1000 * 60 * 30; // 30 minutes

function getCached(key) {
  const item = cache.get(key);
  if (item && Date.now() - item.timestamp < CACHE_TTL_MS) {
    return item.data;
  }
  cache.delete(key);
  return null;
}

function setCache(key, data) {
  cache.set(key, { timestamp: Date.now(), data });
}

// Map user query intents to Geoapify categories
function mapIntentToGeoapifyCategories(categoryIntent) {
  if (!categoryIntent) {
    return 'tourism.sights,tourism.attraction,entertainment.culture';
  }

  const intent = categoryIntent.toLowerCase().trim();

  if (intent.includes('museum')) {
    return 'entertainment.museum';
  }
  if (intent.includes('monument') || intent.includes('fort') || intent.includes('castle')) {
    return 'tourism.sights.memorial,tourism.sights.castle,tourism.sights.archaeological,tourism.sights';
  }
  if (intent.includes('temple') || intent.includes('church') || intent.includes('mosque') || intent.includes('worship')) {
    return 'building.place_of_worship,religion.place_of_worship';
  }
  if (intent.includes('park') || intent.includes('garden')) {
    return 'leisure.park,tourism.attraction';
  }
  if (intent.includes('viewpoint') || intent.includes('scenic')) {
    return 'tourism.attraction.viewpoint';
  }
  if (intent.includes('historic')) {
    return 'tourism.sights,tourism.sights.castle,tourism.sights.archaeological';
  }

  return 'tourism.sights,tourism.attraction,entertainment.culture';
}

// Strictly exclude restaurants, hotels, and shops as per hackathon requirement
function isExcludedCategory(cat) {
  if (!cat) return false;
  const c = cat.toLowerCase();
  return (
    c.startsWith('catering') ||
    c.includes('restaurant') ||
    c.includes('fast_food') ||
    c.includes('cafe') ||
    c.includes('bar') ||
    c.includes('pub') ||
    c.startsWith('accommodation') ||
    c.includes('hotel') ||
    c.includes('motel') ||
    c.includes('hostel') ||
    c.startsWith('commercial') ||
    c.includes('supermarket') ||
    c.includes('department_store') ||
    c.includes('mall') ||
    c.includes('convenience') ||
    c.includes('clothes')
  );
}

// Fetch helper with timeout
function fetchJson(targetUrl, headers = {}) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(targetUrl);
    const client = parsed.protocol === 'https:' ? https : http;

    const req = client.get(
      targetUrl,
      {
        headers: {
          'User-Agent': 'HyperDartTourismExplorer/1.0',
          Accept: 'application/json',
          ...headers
        },
        timeout: 7000
      },
      res => {
        let body = '';
        res.on('data', chunk => (body += chunk));
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              resolve(JSON.parse(body));
            } catch (err) {
              reject(new Error(`Failed to parse response: ${err.message}`));
            }
          } else {
            reject(new Error(`HTTP Error ${res.statusCode}: ${body}`));
          }
        });
      }
    );

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timed out'));
    });

    req.on('error', reject);
  });
}

// Fetch Wikipedia snippet for a landmark
async function getWikiDescription(title, cityName) {
  const cacheKey = `wiki:${title}:${cityName}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
      `${title} ${cityName}`
    )}&utf8=&format=json&srlimit=1`;
    const searchData = await fetchJson(searchUrl);
    const snippet = searchData?.query?.search?.[0]?.snippet;
    if (snippet) {
      // Strip HTML tags from snippet
      const clean = snippet.replace(/<[^>]*>/g, '').trim();
      setCache(cacheKey, clean);
      return clean;
    }
  } catch {
    // Wikipedia fetch is optional enrichment
  }
  return null;
}

// Handle /api/places
async function handlePlaces(req, res, queryParams) {
  const lat = parseFloat(queryParams.lat);
  const lon = parseFloat(queryParams.lon);
  const categoryIntent = queryParams.category || '';
  const cityName = queryParams.city || '';
  const radius = parseInt(queryParams.radius || '7000', 10);
  const limit = Math.min(parseInt(queryParams.limit || '20', 10), 20);

  if (Number.isNaN(lat) || Number.isNaN(lon)) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Valid lat and lon query parameters are required.' }));
    return;
  }

  const cacheKey = `places:${lat}:${lon}:${categoryIntent}:${radius}:${limit}`;
  const cached = getCached(cacheKey);
  if (cached) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(cached));
    return;
  }

  const categories = mapIntentToGeoapifyCategories(categoryIntent);

  // If no API key is provided, return structured fallback data with notice
  if (!GEOAPIFY_API_KEY) {
    console.warn('[TourismExplorer] GEOAPIFY_API_KEY is not set. Returning fallback data.');
    const fallbackResponse = {
      source: 'fallback',
      warning: 'GEOAPIFY_API_KEY is not configured on server. Showing curated demo data.',
      places: getCuratedFallbackPlaces(lat, lon, cityName, categoryIntent)
    };
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(fallbackResponse));
    return;
  }

  try {
    // Note: Geoapify filter format is filter=circle:longitude,latitude,radius
    const geoapifyUrl = `https://api.geoapify.com/v2/places?categories=${encodeURIComponent(
      categories
    )}&filter=circle:${lon},${lat},${radius}&bias=proximity:${lon},${lat}&limit=${limit}&apiKey=${GEOAPIFY_API_KEY}`;

    const geoData = await fetchJson(geoapifyUrl);
    const features = geoData.features || [];

    // Filter out catering (restaurants, cafes), accommodation (hotels), and shops
    const filteredFeatures = features.filter(f => {
      const cats = f.properties?.categories || [];
      const hasExcluded = cats.some(isExcludedCategory);
      if (hasExcluded) return false;

      // Must have a meaningful name
      const name = f.properties?.name?.trim();
      return Boolean(name && name.length > 2);
    });

    // Transform and normalize features
    const places = await Promise.all(
      filteredFeatures.slice(0, limit).map(async (feat, index) => {
        const p = feat.properties;
        const name = p.name;
        const latCoord = p.lat || feat.geometry?.coordinates?.[1];
        const lonCoord = p.lon || feat.geometry?.coordinates?.[0];

        // Enrich first 5 places with Wikipedia description
        let description = p.description || p.details?.description || '';
        if (!description && index < 5 && name) {
          const wikiSnippet = await getWikiDescription(name, cityName || p.city || '');
          if (wikiSnippet) {
            description = `${wikiSnippet}...`;
          }
        }

        return {
          id: p.place_id || `place_${index}_${Date.now()}`,
          name,
          category: formatCategoryLabel(p.categories),
          categories: p.categories || [],
          address: p.formatted || [p.address_line1, p.address_line2].filter(Boolean).join(', ') || `${p.city || ''}, ${p.country || ''}`,
          city: p.city || cityName,
          country: p.country || '',
          lat: latCoord,
          lon: lonCoord,
          distanceMeters: p.distance || 0,
          description: description || `Popular ${formatCategoryLabel(p.categories).toLowerCase()} in ${p.city || cityName || 'the area'}.`,
          website: p.datasource?.raw?.website || p.website || null,
          wikipedia: p.wiki_and_media?.wikipedia || null
        };
      })
    );

    const result = {
      source: 'geoapify',
      categoryUsed: categories,
      count: places.length,
      places
    };

    setCache(cacheKey, result);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(result));
  } catch (error) {
    console.error('[TourismExplorer] Geoapify API request failed:', error.message);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        source: 'fallback_on_error',
        error: error.message,
        places: getCuratedFallbackPlaces(lat, lon, cityName, categoryIntent)
      })
    );
  }
}

// Handle /api/weather
async function handleWeather(req, res, queryParams) {
  const lat = parseFloat(queryParams.lat);
  const lon = parseFloat(queryParams.lon);

  if (Number.isNaN(lat) || Number.isNaN(lon)) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Valid lat and lon are required' }));
    return;
  }

  const cacheKey = `weather:${lat}:${lon}`;
  const cached = getCached(cacheKey);
  if (cached) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(cached));
    return;
  }

  try {
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`;
    const weatherData = await fetchJson(weatherUrl);

    setCache(cacheKey, weatherData);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(weatherData));
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Failed to fetch weather', details: err.message }));
  }
}

function formatCategoryLabel(categories = []) {
  if (!categories || categories.length === 0) return 'Sight & Landmark';
  const str = categories.join(' ').toLowerCase();
  if (str.includes('museum')) return 'Museum';
  if (str.includes('castle') || str.includes('palace') || str.includes('fort')) return 'Historic Landmark';
  if (str.includes('monument') || str.includes('memorial')) return 'Monument';
  if (str.includes('temple') || str.includes('church') || str.includes('place_of_worship')) return 'Temple / Sacred Site';
  if (str.includes('viewpoint')) return 'Scenic Viewpoint';
  if (str.includes('park') || str.includes('garden')) return 'Park & Nature';
  if (str.includes('archaeological')) return 'Archaeological Site';
  return 'Tourist Sight';
}

// Curated fallback places for demo and offline reliability
function getCuratedFallbackPlaces(lat, lon, cityName, categoryIntent) {
  const normCity = (cityName || '').toLowerCase();
  const normCat = (categoryIntent || '').toLowerCase();

  const cityDemos = {
    paris: [
      { id: 'p1', name: 'Eiffel Tower', category: 'Historic Landmark', lat: 48.8584, lon: 2.2945, address: 'Champ de Mars, 5 Av. Anatole France, 75007 Paris', distanceMeters: 500, description: 'Iconic wrought-iron lattice tower on the Champ de Mars, offering panoramic city views.' },
      { id: 'p2', name: 'Louvre Museum', category: 'Museum', lat: 48.8606, lon: 2.3376, address: 'Rue de Rivoli, 75001 Paris', distanceMeters: 1200, description: 'World largest art museum and historic monument home to the Mona Lisa and Venus de Milo.' },
      { id: 'p3', name: 'Cathédrale Notre-Dame de Paris', category: 'Temple / Sacred Site', lat: 48.8530, lon: 2.3499, address: '6 Parvis Notre-Dame - Pl. Jean-Paul II, 75004 Paris', distanceMeters: 1800, description: 'Masterpiece of French Gothic architecture on the Île de la Cité.' },
      { id: 'p4', name: 'Arc de Triomphe', category: 'Monument', lat: 48.8738, lon: 2.2950, address: 'Pl. Charles de Gaulle, 75008 Paris', distanceMeters: 2200, description: 'Triumphal arch honouring those who fought and died for France, standing at the western end of Champs-Élysées.' },
      { id: 'p5', name: 'Musée d\'Orsay', category: 'Museum', lat: 48.8599, lon: 2.3266, address: '1 Rue de la Légion d\'Honneur, 75007 Paris', distanceMeters: 1500, description: 'Houses the largest collection of Impressionist and post-Impressionist masterpieces in the world.' },
      { id: 'p6', name: 'Jardin du Luxembourg', category: 'Park & Nature', lat: 48.8462, lon: 2.3372, address: '75006 Paris, France', distanceMeters: 2100, description: 'Lush tree-lined park with the Medici Fountain, flowerbeds, and model sailboats on the grand pond.' }
    ],
    nyc: [
      { id: 'n1', name: 'Central Park', category: 'Park & Nature', lat: 40.785091, lon: -73.968285, address: 'New York, NY 10022', distanceMeters: 800, description: 'Sprawling urban park featuring scenic lakes, walking paths, Strawberry Fields, and Belvedere Castle.' },
      { id: 'n2', name: 'The Metropolitan Museum of Art', category: 'Museum', lat: 40.7794, lon: -73.9632, address: '1000 5th Ave, New York, NY 10028', distanceMeters: 1100, description: 'One of the world greatest art centers spanning 5,000 years of global human history.' },
      { id: 'n3', name: 'Empire State Building', category: 'Scenic Viewpoint', lat: 40.7488, lon: -73.9857, address: '20 W 34th St, New York, NY 10001', distanceMeters: 1900, description: 'World-famous 102-story Art Deco skyscraper with world-class observation decks.' },
      { id: 'n4', name: 'Statue of Liberty', category: 'Monument', lat: 40.6892, lon: -74.0445, address: 'Liberty Island, New York, NY 10004', distanceMeters: 4500, description: 'Iconic colossal neoclassical sculpture on Liberty Island in New York Harbor.' },
      { id: 'n5', name: 'Brooklyn Bridge', category: 'Historic Landmark', lat: 40.7061, lon: -73.9969, address: 'Brooklyn Bridge, New York, NY 10038', distanceMeters: 2800, description: 'Historic suspension bridge connecting Manhattan and Brooklyn with pedestrian walking promenade.' }
    ],
    delhi: [
      { id: 'd1', name: 'National Museum Delhi', category: 'Museum', lat: 28.6118, lon: 77.2193, address: 'Janpath, New Delhi, Delhi 110011', distanceMeters: 900, description: 'Premier museum exhibiting rare artifacts from the Indus Valley Civilization to modern Indian art.' },
      { id: 'd2', name: 'Red Fort (Lal Qila)', category: 'Historic Landmark', lat: 28.6562, lon: 77.2410, address: 'Netaji Subhash Marg, Chandni Chowk, New Delhi', distanceMeters: 3200, description: 'Historic 17th-century Mughal red sandstone fortress and UNESCO World Heritage site.' },
      { id: 'd3', name: 'Qutub Minar', category: 'Monument', lat: 28.5245, lon: 77.1855, address: 'Mehrauli, New Delhi, Delhi 110030', distanceMeters: 6200, description: 'Soaring 73-meter minaret of victory built in 1192, surrounded by ancient Hindu and Jain temple ruins.' },
      { id: 'd4', name: 'Lotus Temple', category: 'Temple / Sacred Site', lat: 28.5535, lon: 77.2588, address: 'Lotus Temple Rd, Bahapur, New Delhi 110019', distanceMeters: 4800, description: 'Bahá\'í House of Worship notable for its flowerlike petal architecture open to all faiths.' },
      { id: 'd5', name: 'India Gate', category: 'Monument', lat: 28.6129, lon: 77.2295, address: 'Rajpath, India Gate, New Delhi 110001', distanceMeters: 1400, description: 'War memorial archway honoring Indian soldiers who fell during the First World War.' }
    ],
    rome: [
      { id: 'r1', name: 'Colosseum', category: 'Historic Landmark', lat: 41.8902, lon: 12.4922, address: 'Piazza del Colosseo, 1, 00184 Roma RM, Italy', distanceMeters: 400, description: 'Iconic ancient amphitheatre built under the Flavian emperors of the Roman Empire.' },
      { id: 'r2', name: 'Pantheon', category: 'Temple / Sacred Site', lat: 41.8986, lon: 12.4769, address: 'Piazza della Rotonda, 00186 Roma RM, Italy', distanceMeters: 900, description: 'Former Roman temple with magnificent unreinforced concrete dome and central oculus.' },
      { id: 'r3', name: 'Vatican Museums & Sistine Chapel', category: 'Museum', lat: 41.9067, lon: 12.4536, address: '00120 Vatican City', distanceMeters: 2600, description: 'Houses immense art collections amassed by the Popes, including Michelangelo Sistine Chapel ceiling.' },
      { id: 'r4', name: 'Trevi Fountain', category: 'Monument', lat: 41.9009, lon: 12.4833, address: 'Piazza di Trevi, 00187 Roma RM, Italy', distanceMeters: 1100, description: 'Spectacular Baroque fountain where visitors toss a coin to ensure their return to Rome.' }
    ],
    kurukshetra: [
      { id: 'k1', name: 'Brahma Sarovar', category: 'Temple / Sacred Site', lat: 29.9657, lon: 76.8370, address: 'Thanesar, Kurukshetra, Haryana 136118', distanceMeters: 500, description: 'Ancient sacred water tank associated with Lord Brahma and the solar eclipse pilgrimage.' },
      { id: 'k2', name: 'Jyotisar Birthplace of Gita', category: 'Historic Landmark', lat: 29.9610, lon: 76.7680, address: 'Jyotisar, Kurukshetra, Haryana 136119', distanceMeters: 5200, description: 'Revered site under the sacred Banyan tree where Lord Krishna delivered the Bhagavad Gita to Arjuna.' },
      { id: 'k3', name: 'Kurukshetra Panorama and Science Centre', category: 'Museum', lat: 29.9678, lon: 76.8421, address: 'Pehowa Road, Thanesar, Kurukshetra', distanceMeters: 800, description: 'Features a breathtaking cylindrical 3D depiction of the epic Mahabharata battle with audio-visuals.' },
      { id: 'k4', name: 'Sheikh Chilli\'s Tomb', category: 'Monument', lat: 29.9790, lon: 76.8285, address: 'Thanesar, Kurukshetra, Haryana 136118', distanceMeters: 1900, description: 'Mughal-era architectural complex housing the tomb of Sufi master Abd-ur-Rahim (Sheikh Chilli).' }
    ]
  };

  let list = [];
  if (normCity.includes('paris')) list = cityDemos.paris;
  else if (normCity.includes('nyc') || normCity.includes('new york')) list = cityDemos.nyc;
  else if (normCity.includes('delhi')) list = cityDemos.delhi;
  else if (normCity.includes('rome')) list = cityDemos.rome;
  else if (normCity.includes('kuru')) list = cityDemos.kurukshetra;
  else {
    // Generate intelligent dynamic places around coordinates
    list = [
      { id: 'gen1', name: `${cityName || 'City'} Central Landmark`, category: 'Historic Landmark', lat: lat + 0.004, lon: lon + 0.003, address: `Center, ${cityName}`, distanceMeters: 550, description: `The primary historical attraction and cultural landmark of ${cityName}.` },
      { id: 'gen2', name: `${cityName || 'City'} Heritage Museum`, category: 'Museum', lat: lat - 0.003, lon: lon + 0.005, address: `Museum Quarter, ${cityName}`, distanceMeters: 920, description: `Houses historical artifacts and exhibits dedicated to the rich heritage of ${cityName}.` },
      { id: 'gen3', name: `${cityName || 'City'} Memorial Monument`, category: 'Monument', lat: lat + 0.007, lon: lon - 0.002, address: `Grand Plaza, ${cityName}`, distanceMeters: 1400, description: `Majestic monument celebrating local heroes and regional history.` },
      { id: 'gen4', name: `${cityName || 'City'} Botanical Gardens`, category: 'Park & Nature', lat: lat - 0.006, lon: lon - 0.004, address: `Green Belt, ${cityName}`, distanceMeters: 1850, description: `Serene public park with diverse botanical flora, fountains, and walking tracks.` }
    ];
  }

  // Filter by category if user requested one specifically
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
    if (filtered.length > 0) return filtered;
  }

  return list;
}

// Start HTTP Server
const server = http.createServer((req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  if (pathname === '/' || pathname === '/index.html' || pathname === '/preview.html') {
    const previewPath = path.join(rootDir, 'preview.html');
    if (fs.existsSync(previewPath)) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      fs.createReadStream(previewPath).pipe(res);
      return;
    }
  }

  if (pathname === '/api/places') {
    handlePlaces(req, res, parsedUrl.query);
  } else if (pathname === '/api/weather') {
    handleWeather(req, res, parsedUrl.query);
  } else if (pathname === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', service: 'Tourism Explorer Backend', timestamp: new Date().toISOString() }));
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Endpoint not found' }));
  }
});

server.listen(PORT, () => {
  console.log(`[TourismExplorer] Backend server running at http://localhost:${PORT}`);
  console.log(`[TourismExplorer] Geoapify key configured: ${GEOAPIFY_API_KEY ? 'YES (Secure server-side)' : 'NO (Using fallback demo mode)'}`);
});
