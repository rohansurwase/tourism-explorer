import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import TourismExplorer from './TourismExplorer.jsx';

const SAMPLE_DATASETS = [
  {
    label: 'NYC (Tourist attractions in NYC)',
    data: {
      component: '@hyperdart/tourismexplorer',
      query: 'Tourist attractions in NYC',
      entities: [
        {
          word: 'NYC',
          collectionName: 'CITIES',
          collectionType: 'HD_LOCATION',
          entityInfo: {
            geo: {
              tz: 'America/New_York',
              lat: 40.71427,
              city: 'New York City',
              long: -74.00597,
              state: 'New York',
              country: 'United States',
              countryCode: 'US'
            }
          },
          entityType: 'LOCATION',
          description: 'largest city in the United States',
          relevanceScore: 100
        }
      ],
      keyword: [{ word: 'tourist attractions', description: '' }],
      genericQuery: 'tourist attractions in HD_LOCATION__CITIES',
      userLocation: {
        position: {
          coords: { latitude: 40.7306, longitude: -73.9352 },
          city: 'Brooklyn',
          countryCode: 'US'
        },
        source: 'ip'
      },
      suggestedPlace: 'sidebar'
    }
  },
  {
    label: 'Paris (Things to do in Paris)',
    data: {
      component: '@hyperdart/tourismexplorer',
      query: 'Things to do in Paris',
      entities: [
        {
          word: 'Paris',
          collectionName: 'CITIES',
          collectionType: 'HD_LOCATION',
          entityInfo: {
            geo: {
              tz: 'Europe/Paris',
              lat: 48.8566,
              city: 'Paris',
              long: 2.3522,
              state: 'Île-de-France',
              country: 'France',
              countryCode: 'FR'
            }
          },
          entityType: 'LOCATION',
          description: 'capital of France',
          relevanceScore: 100
        }
      ],
      keyword: [{ word: 'things to do', description: '' }],
      genericQuery: 'things to do in HD_LOCATION__CITIES',
      suggestedPlace: 'mainline'
    }
  },
  {
    label: 'Rome (Landmarks in Rome)',
    data: {
      component: '@hyperdart/tourismexplorer',
      query: 'Landmarks in Rome',
      entities: [
        {
          word: 'Rome',
          collectionName: 'CITIES',
          collectionType: 'HD_LOCATION',
          entityInfo: {
            geo: {
              tz: 'Europe/Rome',
              lat: 41.9028,
              city: 'Rome',
              long: 12.4964,
              country: 'Italy',
              countryCode: 'IT'
            }
          },
          entityType: 'LOCATION',
          description: 'capital of Italy',
          relevanceScore: 100
        }
      ],
      keyword: [{ word: 'landmarks', description: '' }],
      genericQuery: 'landmarks in HD_LOCATION__CITIES',
      suggestedPlace: 'sidebar'
    }
  },
  {
    label: 'Delhi (museums in Delhi)',
    data: {
      component: '@hyperdart/tourismexplorer',
      query: 'museums in Delhi',
      entities: [
        {
          word: 'Delhi',
          collectionName: 'CITIES',
          collectionType: 'HD_LOCATION',
          entityInfo: {
            geo: {
              tz: 'Asia/Kolkata',
              lat: 28.6139,
              city: 'Delhi',
              long: 77.2090,
              state: 'Delhi',
              country: 'India',
              countryCode: 'IN'
            }
          },
          entityType: 'LOCATION',
          description: 'national capital of India',
          relevanceScore: 100
        }
      ],
      keyword: [{ word: 'museums', description: '' }],
      genericQuery: 'museums in HD_LOCATION__CITIES',
      suggestedPlace: 'sidebar'
    }
  },
  {
    label: 'Kurukshetra (best places to visit in Kurukshetra)',
    data: {
      component: '@hyperdart/tourismexplorer',
      query: 'best places to visit in Kurukshetra',
      entities: [
        {
          word: 'Kurukshetra',
          collectionName: 'CITIES',
          collectionType: 'HD_LOCATION',
          entityInfo: {
            geo: {
              tz: 'Asia/Kolkata',
              lat: 29.9695,
              city: 'Kurukshetra',
              long: 76.8783,
              state: 'Haryana',
              country: 'India',
              countryCode: 'IN'
            }
          },
          entityType: 'LOCATION',
          description: 'historical holy city in Haryana, India',
          relevanceScore: 100
        }
      ],
      keyword: [{ word: 'places to visit', description: '' }],
      genericQuery: 'best places to visit in HD_LOCATION__CITIES',
      suggestedPlace: 'mainline'
    }
  }
];

function DevApp() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [viewMode, setViewMode] = useState('sidebar'); // 'sidebar' | 'mainline'
  const [customCity, setCustomCity] = useState('');

  const activeDataset = SAMPLE_DATASETS[selectedIdx];
  const searchData = activeDataset.data;

  return (
    <div>
      <div className="sandbox-toolbar">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ margin: '0 0 4px 0', fontSize: '18px' }}>
              🏖️ hyperDart — Tourism Explorer Dev Sandbox
            </h2>
            <div style={{ fontSize: '12px', color: '#64748b' }}>
              Test interactive travel queries across sidebar and mainline layouts
            </div>
          </div>

          <div className="layout-toggle">
            <button
              type="button"
              className={`layout-btn ${viewMode === 'sidebar' ? 'active' : ''}`}
              onClick={() => setViewMode('sidebar')}
            >
              📱 Sidebar (380px)
            </button>
            <button
              type="button"
              className={`layout-btn ${viewMode === 'mainline' ? 'active' : ''}`}
              onClick={() => setViewMode('mainline')}
            >
              💻 Mainline (Wide)
            </button>
          </div>
        </div>

        <div className="toolbar-row">
          <strong style={{ fontSize: '13px' }}>Example Queries:</strong>
          {SAMPLE_DATASETS.map((item, idx) => (
            <button
              key={item.label}
              type="button"
              className={`query-btn ${selectedIdx === idx ? 'active' : ''}`}
              onClick={() => setSelectedIdx(idx)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="sandbox-stage">
        <div className={viewMode === 'sidebar' ? 'stage-sidebar' : 'stage-mainline'}>
          <TourismExplorer searchData={searchData} viewMode={viewMode} />
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <DevApp />
  </React.StrictMode>
);
