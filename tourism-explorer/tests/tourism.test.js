/**
 * Unit Test Suite for Tourism Explorer
 * Tests query parsing, category detection, TSP day planning, distance math, and exclusion filters.
 */

import assert from 'node:assert';
import { parseSearchData, detectCategoryIntent, getCategoryDisplayTitle } from '../src/services/queryParser.js';
import { calculateDistanceKm, formatDistance, estimateTravelTime } from '../src/utils/distance.js';
import { createDayPlan } from '../src/utils/planner.js';

console.log('🧪 Starting Tourism Explorer Unit Tests...\n');

// Test 1: parseSearchData with array input
{
  const arrayInput = [
    {
      query: 'Tourist attractions in NYC',
      entities: [
        {
          word: 'NYC',
          entityInfo: {
            geo: { lat: 40.7128, long: -74.0060, city: 'New York City', country: 'United States' }
          }
        }
      ],
      suggestedPlace: 'sidebar'
    }
  ];

  const parsed = parseSearchData(arrayInput);
  assert.strictEqual(parsed.city, 'New York City', 'Should parse city from array searchData');
  assert.strictEqual(parsed.lat, 40.7128, 'Should extract latitude');
  assert.strictEqual(parsed.lon, -74.0060, 'Should extract longitude');
  assert.strictEqual(parsed.suggestedPlace, 'sidebar');
  console.log('✔ Test 1 Passed: Array searchData parsing');
}

// Test 2: Category intent detection from natural language queries
{
  assert.strictEqual(detectCategoryIntent('museums in Delhi'), 'museum');
  assert.strictEqual(detectCategoryIntent('best art galleries in Paris'), 'museum');
  assert.strictEqual(detectCategoryIntent('ancient temples near Kyoto'), 'temple');
  assert.strictEqual(detectCategoryIntent('famous forts and monuments in Jaipur'), 'monument');
  assert.strictEqual(detectCategoryIntent('best viewpoints in Tokyo'), 'viewpoint');
  assert.strictEqual(detectCategoryIntent('peaceful parks in London'), 'park');
  assert.strictEqual(detectCategoryIntent('historic sites in Athens'), 'landmark');
  assert.strictEqual(detectCategoryIntent('things to do in Paris'), null); // general sights
  assert.strictEqual(detectCategoryIntent('tourist attractions in NYC'), null); // general sights
  console.log('✔ Test 2 Passed: Natural language category intent extraction');
}

// Test 3: Haversine distance and transit estimations
{
  // Paris Eiffel Tower (48.8584, 2.2945) to Louvre Museum (48.8606, 2.3376)
  const dist = calculateDistanceKm(48.8584, 2.2945, 48.8606, 2.3376);
  assert.ok(dist > 3.0 && dist < 3.5, `Distance should be ~3.16 km, got ${dist}`);

  const formattedKm = formatDistance(dist);
  assert.ok(formattedKm.includes('km'), 'Should format with km');

  const walking = estimateTravelTime(0.8);
  assert.strictEqual(walking.mode, 'walk');

  const driving = estimateTravelTime(5.2);
  assert.strictEqual(driving.mode, 'transit');
  console.log('✔ Test 3 Passed: Distance & travel time calculations');
}

// Test 4: Nearest-Neighbor TSP Day Planner
{
  const mockPlaces = [
    { id: '1', name: 'Far Landmark', lat: 48.9000, lon: 2.4000, category: 'Monument' },
    { id: '2', name: 'Near Landmark', lat: 48.8590, lon: 2.2950, category: 'Historic' },
    { id: '3', name: 'Medium Landmark', lat: 48.8700, lon: 2.3100, category: 'Museum' }
  ];

  // Start from (48.8584, 2.2945)
  const plan = createDayPlan(mockPlaces, 48.8584, 2.2945);
  assert.strictEqual(plan.length, 3, 'Should plan all 3 places');
  assert.strictEqual(plan[0].place.id, '2', 'First stop should be closest landmark');
  assert.strictEqual(plan[0].stepNumber, 1);
  assert.strictEqual(plan[0].slot, 'Morning');
  console.log('✔ Test 4 Passed: AI Day Planner nearest-neighbor sequencing');
}

// Test 5: Category Display Title
{
  const title1 = getCategoryDisplayTitle('museum', 'Delhi');
  assert.strictEqual(title1, 'Museums in Delhi');

  const title2 = getCategoryDisplayTitle(null, 'Paris');
  assert.strictEqual(title2, 'Top Sights & Things to Do in Paris');
  console.log('✔ Test 5 Passed: Dynamic category title formatting');
}

console.log('\n🎉 ALL 5 UNIT TESTS PASSED SUCCESSFULLY!\n');
