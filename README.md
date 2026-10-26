# 🌍 Tourism Explorer

### Discover destinations. Explore attractions. Plan your journey.

Tourism Explorer is an interactive travel discovery application designed to help users explore destinations, discover nearby attractions, view location-based information, and organize their travel plans in one place.

The application combines a clean, responsive interface with location services, map visualization, and weather information to make travel planning more convenient and engaging.

---

## ✨ Key Features

- **Destination Discovery** — Search and explore tourist destinations.
- **Attraction Exploration** — Browse tourist attractions through interactive cards.
- **Category Filtering** — Filter attractions based on categories to find places that match your interests.
- **Interactive Map** — Visualize attractions geographically and understand where places are located.
- **Attraction Details** — View additional information about selected attractions.
- **Day Planner** — Organize selected attractions into a travel plan.
- **Weather Information** — Access weather information to help plan activities.
- **Responsive Interface** — Explore destinations through a user-friendly interface across different screen sizes.

> The exact availability of features depends on the destination and the data returned by the connected services.

---

## 🎯 Problem Statement

Planning a trip often requires switching between multiple platforms to discover tourist attractions, understand their locations, check weather conditions, and organize an itinerary.

This fragmented experience can make travel planning time-consuming and inconvenient.

Tourism Explorer aims to simplify this process by bringing destination discovery, attraction exploration, map visualization, weather information, and itinerary planning together in a single application.

## 💡 Our Solution

Tourism Explorer provides a centralized platform where users can:

1. Search for a destination.
2. Discover attractions available in that destination.
3. Explore places through cards and map visualization.
4. Check relevant weather information.
5. Select attractions and organize a day-wise travel plan.

The application focuses on making travel discovery intuitive, interactive, and accessible.

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| React.js | Building the interactive user interface |
| JavaScript | Application logic and data processing |
| JSX | Defining React components |
| CSS | Styling and responsive layouts |
| Node.js | Backend runtime |
| Express.js | Backend API and server |
| Geoapify | Location-related services, where configured |
| Open-Meteo | Weather information |
| Vite | Development server and build tooling |
| Git & GitHub | Version control and project collaboration |

---

## 🏗️ Project Architecture

The application follows a component-based architecture that separates the user interface, application logic, and external service integrations.

```text
Tourism Explorer
│
├── React Frontend
│   ├── TourismExplorer.jsx
│   ├── Header
│   ├── CategoryFilter
│   ├── AttractionCard
│   ├── AttractionModal
│   ├── MapView
│   ├── DayPlanner
│   └── EmptyState
│
├── Services
│   ├── api.js
│   ├── queryParser.js
│   └── openMeteo.js
│
├── Backend
│   └── server/
│       └── index.js
│
├── Styles
│   └── tourism.css
│
└── Development & Configuration
    ├── dev.jsx
    ├── package.json
    ├── vite.config.js
    └── hyperdart.config.js
```

### Architecture Overview

- **Frontend:** React components manage the interface and user interactions.
- **Application Logic:** The main Tourism Explorer component coordinates search, filtering, selected attractions, and planning state.
- **Service Layer:** API service files handle data retrieval and processing.
- **Backend:** The Node.js/Express server exposes the places endpoint at `/api/places`.
- **External Services:** Location and weather services provide relevant geographic and environmental information.

---

## 📂 Project Structure

```text
tourism-explorer/
├── src/
│   ├── TourismExplorer.jsx
│   ├── index.jsx
│   ├── dev.jsx
│   ├── components/
│   ├── services/
│   └── tourism.css
│
├── server/
│   └── index.js
│
├── scripts/
│   └── validate-publish.js
│
├── tests/
│   └── tourism.test.js
│
├── index.html
├── preview.html
├── package.json
├── vite.config.js
├── hyperdart.config.js
├── .env.example
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

Follow these steps to run Tourism Explorer locally.

### Prerequisites

Make sure you have the following installed:

- Node.js
- npm
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/rohansurwase/tourism-explorer.git
cd tourism-explorer
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a local environment file using the provided example:

```bash
cp .env.example .env
```

Add the required API credentials and configuration values to `.env` according to `.env.example`.

**Important:** Never commit API keys, access tokens, or other secrets to GitHub. Keep `.env` excluded through `.gitignore`.

### 4. Start the Development Server

```bash
npm run dev
```

Open the local URL displayed by Vite in your browser.

### 5. Start the Backend

If the project uses a separate backend process, start it using the relevant script defined in `package.json`.

For example, if a server script is configured:

```bash
npm run server
```

> Use the exact script names available in your `package.json`.

---

## 🧪 Testing

The project includes tests and a publish validation script.

Run the available test command:

```bash
npm test
```

Run the production build:

```bash
npm run build
```

Before publishing, verify that the application builds successfully and that the configured validation script passes.

> Replace these commands if your `package.json` defines different scripts.

---

## 📸 Screenshots

Add screenshots of the actual application here. Screenshots help reviewers understand the interface without having to run the project.

### Main Interface

![Tourism Explorer Main Interface](./screenshots/main-interface.png)

### Attraction Exploration

![Tourism Explorer Attractions](./screenshots/attractions.png)

### Map and Day Planner

![Tourism Explorer Map and Planner](./screenshots/map-planner.png)

> Add these screenshots to a `screenshots/` folder in the repository. Replace the sample image paths with the actual screenshot filenames.

---

## 🎥 Demo Video

Watch the project demonstration:

**[Tourism Explorer — Demo Video](YOUR_YOUTUBE_DEMO_URL)**

The demo covers:

- Searching for a destination
- Exploring tourist attractions
- Filtering attractions by category
- Viewing places on the map
- Opening attraction details
- Creating a travel plan
- Demonstrating the application workflow

---

## 🔮 Future Enhancements

Potential improvements include:

- Personalized attraction recommendations
- User accounts and saved itineraries
- Collaborative trip planning
- Estimated travel time between attractions
- Improved itinerary optimization
- Offline access to saved travel plans
- Additional destination data sources

---

## 👨‍💻 Author

**Rohan Surwase**

B.Tech — Mathematics and Computing  
National Institute of Technology, Kurukshetra

GitHub: [@rohansurwase](https://github.com/rohansurwase)

---

## 📄 License

This project is developed as part of a project submission. Refer to the repository's license file for usage and distribution terms.
