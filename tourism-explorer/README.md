# 🧭 Tourism Explorer — hyperDart Component

> A smart, standalone **hyperDart** component that turns natural-language travel queries into rich, actionable answers — uncovering what's truly worth seeing in any city while filtering out noise.

Built for the **hyperDart Hackathon: Tourism Explorer Challenge**.

---

## 🌟 1. The Idea & Vision

When people search broad travel queries like *"things to do in Paris"* or *"museums in Delhi"*, traditional search engines dump links to lengthy, ad-ridden blog posts.

**Tourism Explorer** answers the query instantly inside hyperDart:
1. **Understands Intent & Location:** Parses natural-language search queries, identifies target places from `HD_LOCATION`, and resolves category intent (museums, monuments, temples, viewpoints, parks).
2. **Filters Noise:** Strictly eliminates restaurants, hotels, cafes, and shops, surfacing genuine sights, monuments, and points of interest.
3. **Answers at a Glance, Then Lets You Dig Deeper:**
   - **Quick Look:** Ranked sights with category badges, distances, and walking/driving estimates.
   - **Smart Day Planner:** Automatically organizes attractions into a logical chronological itinerary (Morning ➔ Midday ➔ Afternoon ➔ Sunset) using a nearest-neighbor route optimization algorithm.
   - **Visit-Day Weather:** Live weather from Open-Meteo with contextual travel advice (*"Clear skies! Ideal for outdoor viewpoints"* or *"Rain expected — visit indoor museums"*).
   - **Responsive Map View:** Custom vector map engineered specifically to fit narrow sidebars (320px–380px) and wide mainline views.

---

## 🏗️ 2. Architecture & Data Flow

```
User Query (e.g., "museums in Delhi")
       │
       ▼
hyperDart Engine (Matches keywords & HD_LOCATION regexes in hyperdart.config.js)
       │
       ▼ Passes `searchData` prop
TourismExplorer React Component
       │
       ├─► queryParser.js (Extracts city, coordinates, user location & category intent)
       ├─► Open-Meteo API (Live weather & travel conditions)
       │
       ▼ Calls Backend Proxy (/api/places)
Backend Server (server/index.js)  ◄── GEOAPIFY_API_KEY kept secure here
       │
       ├─► Geoapify Places API (v2) (filter=circle:lon,lat,7000)
       ├─► Exclusion Filter (Purges catering, accommodation, commercial shops)
       ├─► Wikipedia API (Enriches top sights with summary snippets)
       └─► In-Memory TTL Cache (Fast repeated queries)
       │
       ▼
Interactive UI (Sidebar or Mainline View)
       ├─ Top Sights Grid / Cards
       ├─ Smart Day Itinerary (Greedy TSP route)
       ├─ Responsive Interactive Vector Map
       └─ Deep-Dive Attraction Modal & Google Maps Directions
```

---

## 🎨 3. Design Decisions

### A. Sidebar & Mainline Adaptability
HyperDart components must look exceptional both in a narrow 320px–380px sidebar and a full 900px+ mainline view:
- **Sidebar Mode:** Single-column layout, compact badges, horizontal scrolling category pills, and an SVG radar map optimized for narrow viewports.
- **Mainline Mode:** Multi-column grid, expanded travel estimates, and side-by-side day planner cards.

### B. Dark & Light Theme Support
Built with pure CSS custom property tokens (`--te-bg`, `--te-card-bg`, `--te-primary`, etc.). Supports an instant one-click toggle or inheriting system preference.

### C. Filtering Out Distractions
Per the hackathon guidelines, primary results must be real tourist sights. Our backend exclusion filter rejects:
- `catering.*` (Restaurants, cafes, bars, fast food)
- `accommodation.*` (Hotels, hostels, motels)
- `commercial.*` (Shops, malls, supermarkets)

### D. Smart Day Planner Algorithm
Rather than showing an arbitrary list, the Day Planner implements a **Nearest-Neighbor Travelling Salesperson (TSP)** heuristic. Starting from the city center, each subsequent stop is chosen to minimize walking distance from the previous one, and allocated to sensible day intervals (Morning, Midday, Afternoon, Golden Hour).

---

## 🌐 4. Data Sources

| Source | Purpose | Key Required? | Security Note |
|---|---|---|---|
| **Geoapify Places API** | Points of interest, coordinates, addresses, and categories | Yes (Free tier) | Kept exclusively on backend server (`server/index.js`). Never exposed in frontend bundle. |
| **Open-Meteo API** | Live temperature, weather codes, and visit-day advisory | No (Free / Keyless) | Directly fetched or proxied. |
| **Wikipedia REST API** | Accurate summaries and historical background for attractions | No (Keyless) | Fetched server-side to enrich landmarks. |

---

## 📦 5. Libraries & Dependencies

- **React 18:** Modern functional component architecture with hooks (`useState`, `useEffect`, `useMemo`).
- **Vite:** Blazing-fast development server and library build bundler.
- **Native SVG & CSS:** Custom interactive map and fluid responsive layout built with zero heavyweight map tile dependencies, guaranteeing instant loading and no broken iframe scripts in the sidebar.

---

## 🤖 6. How It Was Built & AI Usage Disclosure

- **AI Tools Used:** Assisted in scaffolding the regex patterns, testing multiple edge cases in query parsing, and structuring the pre-publish validation script.
- **Authored & Customized:**
  - Designed the end-to-end component structure, reactive state management, and props normalization.
  - Implemented the natural-language category detector (`queryParser.js`).
  - Wrote the TSP nearest-neighbor algorithm for the Day Itinerary (`planner.js`).
  - Created the SVG radar map projection system (`MapView.jsx`).
  - Implemented the secure backend server with restaurant/hotel/shop filtering (`server/index.js`).
  - Built the interactive dev sandbox (`dev.jsx` & `index.html`) supporting all problem statement test cases.

---

## 🚀 7. Getting Started Locally

### 1. Installation
```bash
git clone https://github.com/<your-username>/tourism-explorer.git
cd tourism-explorer
npm install
```

### 2. Configure Geoapify API Key
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Open `.env` and add your free Geoapify API key:
```env
GEOAPIFY_API_KEY=your_actual_key_here
PORT=3001
```
*(Note: If you run without an API key, the component automatically falls back to curated offline datasets for NYC, Paris, Delhi, Rome, and Kurukshetra so it can still be evaluated seamlessly!)*

### 3. Run Backend Server & Frontend Dev Sandbox
In one terminal, start the backend server:
```bash
npm run start
```

In a second terminal, start Vite:
```bash
npm run dev
```

Visit `http://localhost:5173` to test the component with all sample queries from the hackathon problem statement!

---

## 🧪 8. Validation & Publishing to hyperDart Dev Registry

### Step 1: Pre-publish Validation
Run the validation script required by the competition:
```bash
npm run validate
```
This automatically verifies:
- All required `keywords` are in `hyperdart.config.js`.
- All `HD_LOCATION` trigger `regex` patterns are present.
- `github` and `demovideo` links are configured and valid.
- Build artifacts exist in `dist/`.
- `package.json` has `"private": false` and correct `publishConfig`.

### Step 2: Build the Library
```bash
npm run build
```

### Step 3: Publish to hyperDart Registry
Ensure your token is set from the hyperDart Partner Portal, then publish:
```bash
npm publish
```

---

## 📄 License
MIT © 2026 Tourism Explorer Team
