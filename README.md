# 🚀 Nebula AI - Advanced Space Mission Control Dashboard

A sophisticated **Space Mission Control Dashboard** built with React TypeScript and AI-powered backend services. Features real-time satellite tracking, collision detection, mission simulation, and intelligent space operations management.

## ✨ New Feature: Real-Time Satellite Tracking

🛰️ **Track 30,922+ satellites in real-time** with advanced collision detection and pass predictions!

### Key Features:
- **Real-time satellite position tracking** using N2YO API
- **ISS tracking** with live position and pass predictions  
- **Collision avoidance alerts** with risk assessment
- **Visual and radio pass predictions** for satellite observation
- **Multi-satellite tracking** with category filtering
- **3D orbital visualization** (coming soon)
- **Amateur radio support** with pass timing

## 🎯 Core Features

### 🛰️ **Satellite Tracking & Monitoring**
- Real-time tracking of 30,922+ satellites
- ISS live tracking with pass predictions
- Collision detection and avoidance alerts
- Visual/radio pass predictions
- Satellite categorization (Starlink, GPS, Weather, etc.)
- Ground station tracking capabilities

### 🎮 **Mission Control Dashboard**
- Real-time system monitoring with status cards
- AI-powered mission management with alerts  
- Advanced visualizations (3D orbits, telemetry graphs)
- Resource management and coordination
- Mission simulation environment

### 🤖 **AI Assistant Integration**
- GPT-3.5-turbo for mission analysis
- Intelligent recommendations and alerts
- Natural language mission queries
- Automated anomaly detection

### 🔧 **Advanced Capabilities**
- **3D Mission Simulation** - Interactive Saturn/Cassini visualization
- **Resource Management** - Satellite coordination and bandwidth optimization
- **Collaboration Tools** - Real-time chat, annotations, and playback
- **Data Analytics** - Comprehensive mission telemetry and reporting

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- API keys (see setup below)

### Installation

1. **Clone the repository**
```bash
git clone [repository-url]
cd Nebula-AI-/nebula
```

2. **Install dependencies**
```bash
npm install --legacy-peer-deps
```

3. **Set up environment variables**
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your API keys (see API Setup section)
```

4. **Start the development servers**

**Backend (Terminal 1):**
```bash
npm run server
```

**Frontend (Terminal 2):**
```bash
npm run dev
```

5. **Open your browser**
Navigate to `http://localhost:5173`

## 🔑 API Setup Guide

### Required APIs

#### 1. **N2YO Satellite Tracking API** (Free - Required for Satellite Tracking)
- Visit [n2yo.com](https://www.n2yo.com)
- Register for a free account
- Go to your profile and generate an API key
- Add to `.env`: `REACT_APP_N2YO_API_KEY=your-key-here`

**Free Limits:**
- TLE requests: 1000/hour
- Position requests: 1000/hour  
- Visual passes: 100/hour
- Radio passes: 100/hour
- Above requests: 100/hour

#### 2. **OpenAI API** (Paid - Required for AI Assistant)
- Visit [platform.openai.com](https://platform.openai.com/api-keys)
- Create an API key
- Add to `.env`: `OPENAI_API_KEY=sk-your-key-here`

### Optional APIs

#### 3. **OpenWeatherMap API** (Free tier available)
- Visit [openweathermap.org/api](https://openweathermap.org/api)
- Register and get API key
- Add to `.env`: `REACT_APP_OPENWEATHER_API_KEY=your-key-here`

#### 4. **NASA API** (Free)
- Visit [api.nasa.gov](https://api.nasa.gov/)
- Register for API key
- Add to `.env`: `REACT_APP_NASA_API_KEY=your-key-here`

## 🛰️ Satellite Tracking Usage

### Real-Time Tracking
1. Navigate to **"Satellite Tracking"** in the sidebar
2. Set your observer location (auto-detected by default)
3. Search for satellites by category or name
4. Add satellites to tracking list
5. Click **"Start Real-Time"** to begin live tracking

### ISS Tracking
- Click **"Track ISS"** for instant International Space Station tracking
- View current position, altitude, and next visible pass
- Get pass predictions with timing and direction

### Collision Detection
- Click **"Collision Check"** to scan for potential satellite collisions
- View risk levels: CRITICAL (<1km), HIGH (<3km), MEDIUM (<7km), LOW (<10km)
- Receive real-time alerts during active tracking

### Pass Predictions
- Select any tracked satellite and click the eye icon
- View upcoming visible passes with start/end times
- See elevation angles and optimal viewing conditions
- Perfect for amateur radio operators and satellite observers

## 🏗️ Architecture

### Frontend Stack
- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Lucide React** for icons
- **React Router** for navigation

### Backend Stack
- **Express.js** server
- **OpenAI integration** for AI capabilities
- **RESTful API** design
- **Real-time data processing**

### Satellite Tracking
- **N2YO API integration** for real-time data
- **Collision detection algorithms** with risk assessment
- **Caching system** for performance optimization
- **Real-time updates** with observer pattern

## 📱 Screenshots

### Real-Time Satellite Tracking
![Satellite Tracking Dashboard showing live positions, collision alerts, and pass predictions]

### ISS Live Tracking  
![ISS tracking with current position and next visible pass information]

### Mission Control Dashboard
![Mission control interface with system status and AI recommendations]

### 3D Mission Simulation
![3D visualization of Saturn/Cassini mission with orbital mechanics]

## 🎯 Use Cases

### For Space Companies
- **Mission Operations Centers** - Real-time satellite monitoring
- **Constellation Management** - Multi-satellite coordination  
- **Collision Avoidance** - Automated alert systems
- **Ground Station Operations** - Pass prediction and scheduling

### For Educational Institutions
- **Space Science Education** - Interactive learning platform
- **Research Projects** - Real satellite data analysis
- **Student Missions** - CubeSat tracking and operations

### For Amateur Radio & Enthusiasts
- **Satellite Tracking** - Real-time position data
- **Pass Predictions** - Optimal communication windows
- **ISS Tracking** - Live position and pass times
- **Multi-satellite Operations** - Coordinate multiple contacts

## 🔮 Roadmap

### Phase 1: Enhanced Satellite Tracking ✅
- ✅ Real-time satellite tracking
- ✅ ISS monitoring with pass predictions
- ✅ Collision detection and alerts
- ✅ Multi-category satellite support

### Phase 2: Advanced Visualization
- 🔄 3D orbital visualization with Three.js
- 🔄 Ground track plotting on world map
- 🔄 Satellite constellation views
- 🔄 Real-time orbital mechanics

### Phase 3: Professional Features
- 📋 TLE data management and updates
- 📋 Custom satellite database
- 📋 Automated conjunction analysis
- 📋 Historical tracking data

### Phase 4: Commercial Integration
- 📋 Professional API access
- 📋 Custom alerting systems
- 📋 Integration with mission systems
- 📋 White-label solutions

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check our [Wiki](wiki-link)
- **Issues**: Report bugs on [GitHub Issues](issues-link)
- **Discussions**: Join our [GitHub Discussions](discussions-link)
- **Email**: contact@nebula-ai.space

## 🌟 Acknowledgments

- **N2YO.com** for providing excellent satellite tracking APIs
- **NASA** for space data and resources  
- **OpenAI** for AI capabilities
- **Space community** for inspiration and feedback

---

**Built with ❤️ for the space community**

*Nebula AI - Making space accessible through intelligent software* 