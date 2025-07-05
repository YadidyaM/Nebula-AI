import React, { useEffect, useState } from 'react';
import { Shield, Battery, Wifi, Cpu, Timer, AlertTriangle, TrendingUp, TrendingDown, Satellite, Globe, Activity, Sun, Wind, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DataService } from '../services/dataService';
import { NASAAPIClient } from '../services/NASAAPIClient';
import SatelliteVisualization3D from './SatelliteVisualization3D';
import TelemetryGraphs from './visualizations/TelemetryGraphs';
import MissionTimeline from './visualizations/MissionTimeline';
import ResourceHeatmap from './visualizations/ResourceHeatmap';
import SolarActivityChart from './visualizations/SolarActivityChart';
import NEOScatterPlot from './visualizations/NEOScatterPlot';
import SpaceWeatherGauge from './visualizations/SpaceWeatherGauge';
import FlipCard from './FlipCard';
import ISSLiveStream from './ISSLiveStream';

const dataService = new DataService();
const nasaClient = new NASAAPIClient(import.meta.env.VITE_NASA_API_KEY || 'DEMO_KEY');

interface DashboardProps {
  realTimeData?: any;
  systemHealth?: any;
  isLive?: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  realTimeData, 
  systemHealth, 
  isLive = false 
}) => {
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [issMissions, setIssMissions] = useState<any[]>([]);
  const [trends, setTrends] = useState<any>({
    power: 0,
    battery: 0,
    storage: 0
  });
  const [resourceHeatmapData, setResourceHeatmapData] = useState<any[]>([]);
  const [issPosition, setIssPosition] = useState<any>(null);
  const [activeSatellites, setActiveSatellites] = useState<any[]>([]);
  const [spaceWeather, setSpaceWeather] = useState<any>(null);
  const [solarFlares, setSolarFlares] = useState<any[]>([]);
  const [nearEarthObjects, setNearEarthObjects] = useState<any[]>([]);
  const [peopleInSpace, setPeopleInSpace] = useState<any>(null);
  const [issPassTimes, setIssPassTimes] = useState<any[]>([]);

  // Mock data for visualizations
  const solarActivityData = [
    { time: '2025-06-04T23:06Z', intensity: 0.8, classType: 'M1.1' },
    { time: '2025-06-13T20:49Z', intensity: 1.2, classType: 'M1.2' },
    { time: '2025-06-14T14:34Z', intensity: 4.9, classType: 'C4.9' },
    { time: '2025-06-14T17:52Z', intensity: 1.0, classType: 'M1.0' },
    { time: '2025-06-14T22:51Z', intensity: 6.8, classType: 'M6.8' },
  ];

  const neoData = [
    { name: '433 Eros', size: 16900, distance: 47112732, velocity: 20.083, isHazardous: false },
    { name: '719 Albert', size: 2900, distance: 255628984, velocity: 12.405, isHazardous: false },
    { name: '887 Alinda', size: 4000, distance: 20461808, velocity: 25.545, isHazardous: false },
    { name: '1036 Ganymed', size: 31700, distance: 292651826, velocity: 22.693, isHazardous: false },
  ];

  useEffect(() => {
    const initializeData = async () => {
      await dataService.loadData();
      updateData();
      generateHeatmapData();
      fetchSpaceWeatherData();
      fetchNearEarthObjects();
      fetchSpaceStationData();
      
      // Load ISS missions
      const missions = dataService.getIssMissions();
      setIssMissions(missions);
    };

    const updateData = () => {
      const status = dataService.getLatestSystemStatus();
      const performance = dataService.getSystemPerformanceData();
      const activeTasks = dataService.getActiveTasks();

      setSystemStatus(status);
      setPerformanceData(performance);
      setTasks(activeTasks);

      if (performance.length >= 2) {
        const latest = performance[0];
        const previous = performance[1];
        setTrends({
          power: latest.power - previous.power,
          battery: latest.battery - previous.battery,
          storage: latest.storage - previous.storage
        });
      }
    };

    const fetchSpaceWeatherData = async () => {
      try {
        const [weatherData, flaresData] = await Promise.all([
          nasaClient.getSpaceWeatherNotifications(),
          nasaClient.getSolarFlares()
        ]);

        if (weatherData.success) {
          setSpaceWeather(weatherData.data[0] || null);
        }

        if (flaresData.success) {
          setSolarFlares(flaresData.data.slice(0, 5));
        }
      } catch (error) {
        console.error('Failed to fetch space weather data:', error);
      }
    };

    const fetchNearEarthObjects = async () => {
      try {
        const neoData = await nasaClient.getNearEarthObjects();
        if (neoData.success) {
          setNearEarthObjects(neoData.data.near_earth_objects.slice(0, 5));
        }
      } catch (error) {
        console.error('Failed to fetch NEO data:', error);
      }
    };

    const fetchSpaceStationData = async () => {
      try {
        const [position, crew, passTimes] = await Promise.all([
          nasaClient.getISSPosition(),
          nasaClient.getPeopleInSpace(),
          nasaClient.getISSPassTimes(51.5074, -0.1278) // Example: London coordinates
        ]);

        if (position.success) {
          setIssPosition(position.data);
        }

        if (crew.success) {
          setPeopleInSpace(crew.data);
        }

        if (passTimes.success) {
          setIssPassTimes(passTimes.data);
        }
      } catch (error) {
        console.error('Failed to fetch ISS data:', error);
      }
    };

    const generateHeatmapData = () => {
      const data = [];
      for (let day = 0; day < 7; day++) {
        for (let hour = 0; hour < 24; hour++) {
          data.push({
            day,
            hour,
            value: 30 + Math.random() * 70
          });
        }
      }
      setResourceHeatmapData(data);
    };

    initializeData();
    
    if (!isLive) {
      const refreshInterval = setInterval(() => {
        updateData();
        fetchSpaceWeatherData();
        fetchNearEarthObjects();
        fetchSpaceStationData();
      }, 300000); // Update every 5 minutes
      return () => clearInterval(refreshInterval);
    }
  }, [isLive]);

  // Update data when real-time data changes
  useEffect(() => {
    if (realTimeData) {
      // Update ISS position if available
      if (realTimeData.issPosition) {
        setIssPosition(realTimeData.issPosition);
      }

      // Update active satellites if available
      if (realTimeData.satellites) {
        setActiveSatellites(realTimeData.satellites);
      }

      // Update telemetry data if available
      if (realTimeData.telemetry) {
        setPerformanceData(prev => [realTimeData.telemetry, ...prev.slice(0, 49)]);
      }

      // Update system health trends
      if (realTimeData.systemHealth) {
        setTrends({
          power: Math.random() * 10 - 5, // Simulated trend
          battery: Math.random() * 10 - 5,
          storage: Math.random() * 10 - 5
        });
      }

      // Update ISS missions
      const missions = dataService.getIssMissions();
      setIssMissions(missions);
    }
  }, [realTimeData]);

  if (!systemStatus && !isLive) return <div>Loading...</div>;

  const handleTasksReorder = (newTasks: any[]) => {
    setTasks(newTasks);
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  const pulseAnimation = {
    initial: { scale: 1 },
    animate: { 
      scale: [1, 1.02, 1],
      transition: { 
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const renderSolarActivityDetails = () => (
    <div className="space-y-4 h-full overflow-y-auto text-gray-300">
      {solarActivityData.map((flare, index) => (
        <div key={index} className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
          <div className="text-sm text-gray-400">Class {flare.classType}</div>
          <div className="text-lg font-semibold">{flare.time}</div>
          <div className={`text-sm ${
            flare.intensity > 5 ? 'text-red-400' :
            flare.intensity > 2 ? 'text-orange-400' :
            'text-yellow-400'
          }`}>
            Intensity: {flare.intensity}
          </div>
        </div>
      ))}
    </div>
  );

  const renderSpaceWeatherDetails = () => (
    <div className="space-y-4 text-gray-300">
      <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
        <h3 className="text-lg font-semibold mb-2">Current Conditions</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-sm text-gray-400">Solar Wind</div>
            <div className="text-lg font-semibold">487 km/s</div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Density</div>
            <div className="text-lg font-semibold">5.2 p/cm³</div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Temperature</div>
            <div className="text-lg font-semibold">124,000 K</div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Bt</div>
            <div className="text-lg font-semibold">4.2 nT</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNEODetails = () => (
    <div className="space-y-4 h-full overflow-y-auto text-gray-300">
      {neoData.map((neo, index) => (
        <div key={index} className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">{neo.name}</div>
            <div className={`text-xs px-2 py-1 rounded-full ${
              neo.isHazardous
                ? 'bg-red-900/50 text-red-300 border border-red-700/30'
                : 'bg-green-900/50 text-green-300 border border-green-700/30'
            }`}>
              {neo.isHazardous ? 'Hazardous' : 'Safe'}
            </div>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
            <div>
              <div className="text-gray-400">Size</div>
              <div>{neo.size.toLocaleString()}m</div>
            </div>
            <div>
              <div className="text-gray-400">Velocity</div>
              <div>{neo.velocity.toFixed(3)} km/h</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6 min-h-screen p-6 bg-[conic-gradient(at_top,_var(--tw-gradient-stops))] from-gray-900 via-purple-900 to-blue-900">
      {/* Live Status Header */}
      <AnimatePresence>
        {isLive && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gray-800/30 backdrop-blur-md border border-blue-500/30 rounded-2xl p-6 mb-6 shadow-lg shadow-blue-500/10"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <div className="absolute inset-0 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
                    NASA Mission Control - Live Dashboard
                  </h2>
                  <p className="text-blue-300/80 text-sm">Real-time data from NASA and N2YO APIs</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-green-400 font-semibold tracking-wide">LIVE</div>
                <div className="text-xs text-gray-400">{new Date().toLocaleTimeString()}</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Space Weather and NEO Tracking */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {/* Solar Activity Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="col-span-1 h-[400px]"
        >
          <FlipCard
            title="Solar Activity"
            titleColor="bg-gradient-to-r from-yellow-400 to-orange-500"
            frontContent={<SolarActivityChart data={solarActivityData} />}
            backContent={renderSolarActivityDetails()}
          />
        </motion.div>

        {/* Space Weather Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="col-span-1 h-[400px]"
        >
          <FlipCard
            title="Space Weather"
            titleColor="bg-gradient-to-r from-blue-400 to-cyan-500"
            frontContent={<SpaceWeatherGauge kpIndex={3} impact="Minimal" />}
            backContent={renderSpaceWeatherDetails()}
          />
        </motion.div>

        {/* Near-Earth Objects Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="col-span-1 md:col-span-2 lg:col-span-1 h-[400px]"
        >
          <FlipCard
            title="Near-Earth Objects"
            titleColor="bg-gradient-to-r from-green-400 to-emerald-500"
            frontContent={
              <>
                <div className="flex items-center justify-end mb-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-900 text-red-200">
                    50 active alert(s)
                  </span>
                </div>
                <NEOScatterPlot data={neoData} />
              </>
            }
            backContent={renderNEODetails()}
          />
        </motion.div>
      </div>

      {/* ISS Section */}
      <div className="space-y-6 w-full max-w-[1200px] mx-auto">
        {/* ISS Data */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-pink-400 flex items-center gap-2">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 13V8C21 7.45 20.55 7 20 7H4C3.45 7 3 7.45 3 8V13C3 13.55 3.45 14 4 14H20C20.55 14 21 13.55 21 13ZM12 17C10.9 17 10 16.1 10 15H14C14 16.1 13.1 17 12 17Z" fill="currentColor"/>
            </svg>
            ISS Live Tracking
          </h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#1a1b26] rounded-lg p-4">
              <div className="text-gray-400 text-sm">Latitude</div>
              <div className="text-xl font-semibold text-white">32.4829°</div>
            </div>
            <div className="bg-[#1a1b26] rounded-lg p-4">
              <div className="text-gray-400 text-sm">Longitude</div>
              <div className="text-xl font-semibold text-white">-91.5234°</div>
            </div>
            <div className="bg-[#1a1b26] rounded-lg p-4">
              <div className="text-gray-400 text-sm">Altitude</div>
              <div className="text-xl font-semibold text-white">408.00 km</div>
            </div>
            <div className="bg-[#1a1b26] rounded-lg p-4">
              <div className="text-gray-400 text-sm">Velocity</div>
              <div className="text-xl font-semibold text-white">7.66 km/s</div>
            </div>
          </div>

          <div className="bg-[#1a1b26] rounded-lg p-4">
            <div className="text-gray-400 text-sm">Next Pass Times</div>
          </div>
        </div>

        {/* ISS Live Stream */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <ISSLiveStream />
        </motion.div>
      </div>

      {/* 3D Visualization and Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          {...fadeInUp}
          transition={{ delay: 1.0 }}
          className="bg-gradient-to-br from-gray-800/30 via-gray-800/20 to-gray-800/10 backdrop-blur-md border border-blue-500/20 rounded-2xl p-6 shadow-lg shadow-blue-500/5"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Satellite Orbit Visualization</h3>
          <SatelliteVisualization3D showOrbit={true} autoRotate={true} />
        </motion.div>
        <motion.div
          {...fadeInUp}
          transition={{ delay: 1.2 }}
        >
          <TelemetryGraphs data={performanceData} />
        </motion.div>
      </div>

      {/* Mission Timeline and Resource Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          {...fadeInUp}
          transition={{ delay: 1.4 }}
        >
          <MissionTimeline 
            tasks={issMissions} 
            onTasksReorder={handleTasksReorder}
            title="ISS Mission Schedule"
            description="Upcoming and ongoing missions to the International Space Station"
          />
        </motion.div>
        <motion.div
          {...fadeInUp}
          transition={{ delay: 1.6 }}
        >
          <ResourceHeatmap
            data={resourceHeatmapData}
            title="NASA Resource Usage Pattern"
            colorScale={['#1e3a8a', '#3b82f6', '#60a5fa', '#93c5fd', '#dbeafe', '#fef3c7', '#fbbf24', '#f59e0b']}
          />
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;