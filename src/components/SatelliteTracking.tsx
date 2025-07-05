import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Satellite, 
  Radio, 
  AlertTriangle, 
  Eye, 
  Globe, 
  Radar,
  Activity,
  MapPin,
  Clock,
  Zap,
  Target,
  Settings,
  Play,
  Pause,
  RotateCcw,
  Signal,
  Shield,
  AlertCircle,
  TrendingUp,
  Wifi,
  Database,
  Monitor,
  Layers,
  Navigation,
  ChevronRight,
  ChevronDown,
  BarChart3,
  LineChart,
  Map,
  Orbit
} from 'lucide-react';
import SatelliteTracker, { 
  SatellitePosition, 
  VisualPass, 
  CollisionAlert, 
  SATELLITE_CATEGORIES 
} from '../services/satelliteTracker';
import SatelliteOrbitVisualizer from './visualizations/SatelliteOrbitVisualizer';

interface SatelliteTrackingProps {
  apiKey?: string;
  onAlert?: (alert: CollisionAlert) => void;
}

interface TrackedSatellite {
  id: number;
  name: string;
  position: SatellitePosition | null;
  isTracking: boolean;
  category: string;
}

interface ObserverLocation {
  latitude: number;
  longitude: number;
  altitude: number;
  name: string;
}

interface TelemetryData {
  timestamp: number;
  altitude: number;
  velocity: number;
  temperature: number;
  signalStrength: number;
}

const SatelliteTracking: React.FC<SatelliteTrackingProps> = ({ 
  apiKey = import.meta.env.VITE_N2YO_API_KEY,
  onAlert 
}) => {
  const [tracker] = useState(() => new SatelliteTracker(apiKey || ''));
  const [trackedSatellites, setTrackedSatellites] = useState<TrackedSatellite[]>([]);
  const [issData, setIssData] = useState<any>(null);
  const [collisionAlerts, setCollisionAlerts] = useState<CollisionAlert[]>([]);
  const [observerLocation, setObserverLocation] = useState<ObserverLocation>({
    latitude: 41.702,
    longitude: -76.014,
    altitude: 0,
    name: 'Mission Control'
  });
  const [selectedCategory, setSelectedCategory] = useState(SATELLITE_CATEGORIES.STARLINK);
  const [isRealTimeActive, setIsRealTimeActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [nextPasses, setNextPasses] = useState<VisualPass[]>([]);
  const [trackingStats, setTrackingStats] = useState({ cacheSize: 0, activeObservers: 0, apiCalls: 0 });
  const [selectedSatellite, setSelectedSatellite] = useState<TrackedSatellite | null>(null);
  const [systemStatus, setSystemStatus] = useState('OPERATIONAL');
  const [missionTime, setMissionTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState<'overview' | '3d' | 'telemetry' | 'timeline'>('overview');
  const [telemetryData, setTelemetryData] = useState<TelemetryData[]>([]);
  const [showAdvancedControls, setShowAdvancedControls] = useState(false);
  const stopTrackingRef = useRef<(() => void) | null>(null);

  // Update mission time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setMissionTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Generate telemetry data (mock for demonstration)
  useEffect(() => {
    if (isRealTimeActive) {
      const interval = setInterval(() => {
        const newData: TelemetryData = {
          timestamp: Date.now(),
          altitude: 400 + Math.random() * 50,
          velocity: 27000 + Math.random() * 1000,
          temperature: -100 + Math.random() * 200,
          signalStrength: 70 + Math.random() * 30
        };
        setTelemetryData(prev => [...prev.slice(-29), newData]);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isRealTimeActive]);

  // Get user's location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setObserverLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            altitude: position.coords.altitude || 0,
            name: 'Ground Station'
          });
        },
        (error) => {
          console.warn('Geolocation error:', error);
        }
      );
    }
  }, []);

  // Subscribe to tracker updates
  useEffect(() => {
    const unsubscribe = tracker.subscribe((update) => {
      switch (update.type) {
        case 'positions':
          handlePositionUpdate(update.data);
          break;
        case 'collisionAlerts':
          handleCollisionAlerts(update.data);
          break;
        case 'issTracking':
          setIssData(update.data);
          break;
        case 'visualPasses':
          setNextPasses(update.data.passes || []);
          break;
      }
    });

    return unsubscribe;
  }, [tracker]);

  // Update tracking stats
  useEffect(() => {
    const interval = setInterval(() => {
      setTrackingStats(tracker.getTrackingStats());
    }, 5000);

    return () => clearInterval(interval);
  }, [tracker]);

  const handlePositionUpdate = (data: any) => {
    if (data.positions && data.positions.length > 0) {
      const position = data.positions[0];
      setTrackedSatellites(prev => 
        prev.map(sat => 
          sat.name === data.info.satname 
            ? { ...sat, position } 
            : sat
        )
      );
    }
  };

  const handleCollisionAlerts = (alerts: CollisionAlert[]) => {
    setCollisionAlerts(alerts);
    alerts.forEach(alert => {
      if (onAlert) onAlert(alert);
    });
  };

  const startRealTimeTracking = async () => {
    if (trackedSatellites.length === 0) {
      // Add ISS by default if no satellites are tracked
      const issSatellite: TrackedSatellite = {
        id: 25544,
        name: 'International Space Station',
        position: null,
        isTracking: true,
        category: 'ISS'
      };
      setTrackedSatellites([issSatellite]);
    }

    try {
      const satelliteIds = trackedSatellites.length > 0 ? 
        trackedSatellites.map(sat => sat.id) : [25544];
      const stopFunction = await tracker.startRealTimeTracking(
        satelliteIds,
        observerLocation.latitude,
        observerLocation.longitude,
        observerLocation.altitude
      );
      
      stopTrackingRef.current = stopFunction;
      setIsRealTimeActive(true);
      setSystemStatus('TRACKING');
    } catch (error) {
      console.error('Failed to start real-time tracking:', error);
      setSystemStatus('ERROR');
    }
  };

  const stopRealTimeTracking = () => {
    if (stopTrackingRef.current) {
      stopTrackingRef.current();
      stopTrackingRef.current = null;
    }
    setIsRealTimeActive(false);
    setSystemStatus('STANDBY');
    setTelemetryData([]);
  };

  const trackISS = async () => {
    try {
      await tracker.trackISS(
        observerLocation.latitude,
        observerLocation.longitude,
        observerLocation.altitude
      );
      setSystemStatus('ISS_TRACKING');
      
      // Add ISS to tracked satellites if not already there
      if (!trackedSatellites.some(sat => sat.id === 25544)) {
        const issSatellite: TrackedSatellite = {
          id: 25544,
          name: 'International Space Station',
          position: null,
          isTracking: true,
          category: 'ISS'
        };
        setTrackedSatellites(prev => [...prev, issSatellite]);
      }
    } catch (error) {
      console.error('Failed to track ISS:', error);
      setSystemStatus('ERROR');
    }
  };

  const performCollisionCheck = async () => {
    try {
      setSystemStatus('SCANNING');
      await tracker.detectCollisions(
        observerLocation.latitude,
        observerLocation.longitude,
        observerLocation.altitude
      );
      setSystemStatus('OPERATIONAL');
    } catch (error) {
      console.error('Collision detection failed:', error);
      setSystemStatus('ERROR');
    }
  };

  const formatMissionTime = (date: Date) => {
    return {
      date: date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }),
      utc: date.toISOString().split('T')[1].split('.')[0] + ' UTC'
    };
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'CRITICAL': return 'bg-red-500/20 border-red-500 text-red-300';
      case 'HIGH': return 'bg-orange-500/20 border-orange-500 text-orange-300';
      case 'MEDIUM': return 'bg-yellow-500/20 border-yellow-500 text-yellow-300';
      case 'LOW': return 'bg-green-500/20 border-green-500 text-green-300';
      default: return 'bg-gray-500/20 border-gray-500 text-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPERATIONAL': return 'text-green-400';
      case 'TRACKING': return 'text-blue-400';
      case 'ISS_TRACKING': return 'text-cyan-400';
      case 'SCANNING': return 'text-yellow-400';
      case 'STANDBY': return 'text-gray-400';
      case 'ERROR': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case 'overview': return <Monitor className="w-4 h-4" />;
      case '3d': return <Orbit className="w-4 h-4" />;
      case 'telemetry': return <BarChart3 className="w-4 h-4" />;
      case 'timeline': return <Clock className="w-4 h-4" />;
      default: return <Monitor className="w-4 h-4" />;
    }
  };

  const missionTimeFormatted = formatMissionTime(missionTime);

  // Prepare satellites for 3D visualization
  const satellitesFor3D = trackedSatellites
    .filter(sat => sat.position)
    .map(sat => ({
      id: sat.id,
      name: sat.name,
      position: {
        satlatitude: sat.position!.satlatitude,
        satlongitude: sat.position!.satlongitude,
        sataltitude: sat.position!.sataltitude
      },
      category: sat.category
    }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <div className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Radar className="w-8 h-8 text-cyan-400" />
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    MISSION CONTROL
                  </h1>
                  <p className="text-sm text-slate-400">Satellite Tracking & Space Situational Awareness</p>
                </div>
              </div>
              
              <div className="h-8 w-px bg-slate-600"></div>
              
              <div className="text-sm">
                <div className="text-slate-300">{missionTimeFormatted.date}</div>
                <div className="font-mono text-cyan-400">{missionTimeFormatted.time}</div>
                <div className="text-xs text-slate-500">{missionTimeFormatted.utc}</div>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <div className="text-right">
                <div className="text-xs text-slate-400">SYSTEM STATUS</div>
                <div className={`font-mono font-bold ${getStatusColor(systemStatus)}`}>
                  {systemStatus}
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-xs text-slate-400">TRACKED OBJECTS</div>
                <div className="font-mono font-bold text-cyan-400">
                  {trackedSatellites.length}
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-xs text-slate-400">COLLISION ALERTS</div>
                <div className="font-mono font-bold text-red-400">
                  {collisionAlerts.length}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-1 mt-4">
            {(['overview', '3d', 'telemetry', 'timeline'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  activeTab === tab
                    ? 'bg-cyan-600 text-white shadow-lg'
                    : 'hover:bg-slate-700 text-slate-300'
                }`}
              >
                {getTabIcon(tab)}
                <span className="capitalize">{tab}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-12 gap-6">
            {/* Left Panel - Mission Control */}
            <div className="col-span-4 space-y-6">
              {/* Observer Location */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-5 h-5 text-cyan-400" />
                    <h3 className="text-lg font-semibold">Ground Station</h3>
                  </div>
                  <button
                    onClick={() => setShowAdvancedControls(!showAdvancedControls)}
                    className="text-slate-400 hover:text-slate-200"
                  >
                    {showAdvancedControls ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">LATITUDE</label>
                    <input
                      type="number"
                      value={observerLocation.latitude}
                      onChange={(e) => setObserverLocation(prev => ({ 
                        ...prev, 
                        latitude: parseFloat(e.target.value) || 0 
                      }))}
                      className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-cyan-400 font-mono text-sm"
                      step="0.000001"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">LONGITUDE</label>
                    <input
                      type="number"
                      value={observerLocation.longitude}
                      onChange={(e) => setObserverLocation(prev => ({ 
                        ...prev, 
                        longitude: parseFloat(e.target.value) || 0 
                      }))}
                      className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-cyan-400 font-mono text-sm"
                      step="0.000001"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">ALTITUDE (m)</label>
                    <input
                      type="number"
                      value={observerLocation.altitude}
                      onChange={(e) => setObserverLocation(prev => ({ 
                        ...prev, 
                        altitude: parseFloat(e.target.value) || 0 
                      }))}
                      className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-cyan-400 font-mono text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">STATION NAME</label>
                    <input
                      type="text"
                      value={observerLocation.name}
                      onChange={(e) => setObserverLocation(prev => ({ 
                        ...prev, 
                        name: e.target.value 
                      }))}
                      className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white text-sm"
                    />
                  </div>
                </div>

                {showAdvancedControls && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4 pt-4 border-t border-slate-600 space-y-3"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">ELEVATION MASK</label>
                        <input
                          type="number"
                          defaultValue={10}
                          className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-cyan-400 font-mono text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">TIME ZONE</label>
                        <select className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white text-sm">
                          <option>UTC</option>
                          <option>Local</option>
                        </select>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>

              {/* Mission Control Panel */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-6"
              >
                <div className="flex items-center space-x-2 mb-6">
                  <Shield className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-lg font-semibold">Mission Control</h3>
                </div>
                
                <div className="grid grid-cols-1 gap-3">
                  <button
                    onClick={trackISS}
                    className="flex items-center justify-center space-x-3 p-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-lg transition-all duration-300 transform hover:scale-105"
                  >
                    <Globe className="w-5 h-5" />
                    <div className="text-left">
                      <div className="font-semibold">TRACK ISS</div>
                      <div className="text-xs text-blue-100">International Space Station</div>
                    </div>
                  </button>
                  
                  <button
                    onClick={performCollisionCheck}
                    className="flex items-center justify-center space-x-3 p-4 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 rounded-lg transition-all duration-300 transform hover:scale-105"
                  >
                    <AlertTriangle className="w-5 h-5" />
                    <div className="text-left">
                      <div className="font-semibold">COLLISION SCAN</div>
                      <div className="text-xs text-orange-100">Threat Assessment</div>
                    </div>
                  </button>
                  
                  <button
                    onClick={isRealTimeActive ? stopRealTimeTracking : startRealTimeTracking}
                    className={`flex items-center justify-center space-x-3 p-4 rounded-lg transition-all duration-300 transform hover:scale-105 ${
                      isRealTimeActive 
                        ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600' 
                        : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500'
                    }`}
                  >
                    {isRealTimeActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    <div className="text-left">
                      <div className="font-semibold">
                        {isRealTimeActive ? 'STOP TRACKING' : 'START TRACKING'}
                      </div>
                      <div className="text-xs opacity-75">
                        {isRealTimeActive ? 'Cease Operations' : 'Begin Real-Time Monitor'}
                      </div>
                    </div>
                  </button>
                </div>
              </motion.div>

              {/* System Diagnostics */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-6"
              >
                <div className="flex items-center space-x-2 mb-4">
                  <Monitor className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-lg font-semibold">System Diagnostics</h3>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">Cache Entries</span>
                    <span className="font-mono text-cyan-400">{trackingStats.cacheSize}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">Active Observers</span>
                    <span className="font-mono text-green-400">{trackingStats.activeObservers}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">API Calls</span>
                    <span className="font-mono text-blue-400">{trackingStats.apiCalls}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">Connection Status</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="font-mono text-green-400 text-sm">ONLINE</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">Telemetry Rate</span>
                    <span className="font-mono text-yellow-400">{isRealTimeActive ? '2 Hz' : '0 Hz'}</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Center Panel - ISS & Live Data */}
            <div className="col-span-4 space-y-6">
              {/* ISS Live Tracking */}
              {issData && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gradient-to-br from-blue-900/50 to-cyan-900/50 backdrop-blur border border-blue-500/30 rounded-xl p-6"
                >
                  <div className="flex items-center space-x-2 mb-4">
                    <Globe className="w-6 h-6 text-cyan-400" />
                    <h3 className="text-xl font-bold">ISS LIVE TRACKING</h3>
                    <div className="flex-1"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                  
                  {issData.currentPosition && (
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-slate-900/50 rounded-lg p-4">
                        <div className="text-xs text-slate-400 mb-1">POSITION</div>
                        <div className="font-mono text-cyan-400">
                          {issData.currentPosition.satlatitude.toFixed(4)}°
                        </div>
                        <div className="font-mono text-cyan-400">
                          {issData.currentPosition.satlongitude.toFixed(4)}°
                        </div>
                      </div>
                      <div className="bg-slate-900/50 rounded-lg p-4">
                        <div className="text-xs text-slate-400 mb-1">ALTITUDE</div>
                        <div className="font-mono text-cyan-400 text-lg">
                          {issData.currentPosition.sataltitude.toFixed(1)} km
                        </div>
                      </div>
                      <div className="bg-slate-900/50 rounded-lg p-4">
                        <div className="text-xs text-slate-400 mb-1">ELEVATION</div>
                        <div className="font-mono text-green-400">
                          {issData.currentPosition.elevation.toFixed(1)}°
                        </div>
                      </div>
                      <div className="bg-slate-900/50 rounded-lg p-4">
                        <div className="text-xs text-slate-400 mb-1">AZIMUTH</div>
                        <div className="font-mono text-green-400">
                          {issData.currentPosition.azimuth.toFixed(1)}°
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {issData.nextPass && (
                    <div className="bg-slate-900/50 rounded-lg p-4">
                      <div className="text-sm text-slate-400 mb-2">NEXT VISIBLE PASS</div>
                      <div className="text-sm">
                        <div>Start: {new Date(issData.nextPass.startUTC * 1000).toLocaleString()}</div>
                        <div>Max Elevation: {issData.nextPass.maxEl.toFixed(1)}°</div>
                        <div>Duration: {Math.floor(issData.nextPass.duration / 60)}m {issData.nextPass.duration % 60}s</div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Real-time Status */}
              {isRealTimeActive && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-green-900/50 to-emerald-900/50 backdrop-blur border border-green-500/30 rounded-xl p-6"
                >
                  <div className="flex items-center space-x-2 mb-4">
                    <Activity className="w-5 h-5 text-green-400 animate-pulse" />
                    <h3 className="text-lg font-semibold">REAL-TIME OPERATIONS</h3>
                  </div>
                  
                  <div className="text-sm text-green-300 space-y-1">
                    <div>• Live satellite position updates</div>
                    <div>• Continuous collision monitoring</div>
                    <div>• Automated threat assessment</div>
                    <div>• Mission-critical alert system</div>
                    <div>• Telemetry data acquisition</div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Right Panel - Collision Alerts */}
            <div className="col-span-4 space-y-6">
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-6 h-6 text-red-400" />
                    <h3 className="text-xl font-bold">COLLISION ALERTS</h3>
                  </div>
                  <div className="bg-red-500/20 px-3 py-1 rounded-full">
                    <span className="font-mono text-red-400 text-sm">{collisionAlerts.length}</span>
                  </div>
                </div>
                
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  <AnimatePresence>
                    {collisionAlerts.map((alert, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className={`p-4 rounded-lg border ${getRiskColor(alert.riskLevel)}`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="font-mono text-sm">
                            {alert.satellite1} ↔ {alert.satellite2}
                          </div>
                          <div className={`px-2 py-1 rounded text-xs font-bold ${getRiskColor(alert.riskLevel)}`}>
                            {alert.riskLevel}
                          </div>
                        </div>
                        
                        <div className="text-xs space-y-1">
                          <div>Distance: {alert.distance.toFixed(2)} km</div>
                          <div>Closest Approach: {alert.closestApproach.toFixed(2)} km</div>
                          <div>Time: {new Date(alert.timestamp).toLocaleTimeString()}</div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  {collisionAlerts.length === 0 && (
                    <div className="text-center py-8 text-slate-400">
                      <Shield className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <div>No collision threats detected</div>
                      <div className="text-xs">All satellites operating safely</div>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        )}

        {activeTab === '3d' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Orbit className="w-6 h-6 text-cyan-400" />
                <h3 className="text-xl font-bold">3D ORBITAL VISUALIZATION</h3>
              </div>
              
              {satellitesFor3D.length > 0 ? (
                <SatelliteOrbitVisualizer 
                  satellites={satellitesFor3D}
                  centerSatellite={selectedSatellite?.id}
                />
              ) : (
                <div className="h-96 flex items-center justify-center bg-slate-900/50 rounded-xl border border-slate-700/50">
                  <div className="text-center text-slate-400">
                    <Orbit className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <h4 className="text-lg font-semibold mb-2">No Active Satellites</h4>
                    <p>Start tracking satellites to see them in 3D orbit visualization</p>
                    <button
                      onClick={trackISS}
                      className="mt-4 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg transition-colors"
                    >
                      Track ISS
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'telemetry' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-6">
              <div className="flex items-center space-x-2 mb-4">
                <BarChart3 className="w-6 h-6 text-cyan-400" />
                <h3 className="text-xl font-bold">TELEMETRY DATA</h3>
              </div>
              
              {telemetryData.length > 0 ? (
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-slate-900/50 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-slate-400 mb-2">ALTITUDE TREND</h4>
                    <div className="h-32 flex items-end space-x-2">
                      {telemetryData.slice(-15).map((data, index) => (
                        <div
                          key={index}
                          className="bg-cyan-500 min-w-[4px] rounded-t"
                          style={{
                            height: `${(data.altitude - 400) * 2}px`
                          }}
                        />
                      ))}
                    </div>
                    <div className="text-xs text-slate-400 mt-2">
                      Current: {telemetryData[telemetryData.length - 1]?.altitude.toFixed(1)} km
                    </div>
                  </div>
                  
                  <div className="bg-slate-900/50 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-slate-400 mb-2">VELOCITY</h4>
                    <div className="h-32 flex items-end space-x-2">
                      {telemetryData.slice(-15).map((data, index) => (
                        <div
                          key={index}
                          className="bg-green-500 min-w-[4px] rounded-t"
                          style={{
                            height: `${(data.velocity - 27000) / 20}px`
                          }}
                        />
                      ))}
                    </div>
                    <div className="text-xs text-slate-400 mt-2">
                      Current: {telemetryData[telemetryData.length - 1]?.velocity.toFixed(0)} km/h
                    </div>
                  </div>
                  
                  <div className="bg-slate-900/50 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-slate-400 mb-2">TEMPERATURE</h4>
                    <div className="h-32 flex items-end justify-center">
                      <div className="text-3xl font-mono text-orange-400">
                        {telemetryData[telemetryData.length - 1]?.temperature.toFixed(1)}°C
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-slate-900/50 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-slate-400 mb-2">SIGNAL STRENGTH</h4>
                    <div className="h-32 flex items-end justify-center">
                      <div className="text-3xl font-mono text-blue-400">
                        {telemetryData[telemetryData.length - 1]?.signalStrength.toFixed(0)}%
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400">
                  <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h4 className="text-lg font-semibold mb-2">No Telemetry Data</h4>
                  <p>Start real-time tracking to collect telemetry data</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'timeline' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Clock className="w-6 h-6 text-cyan-400" />
                <h3 className="text-xl font-bold">MISSION TIMELINE</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-4 bg-slate-900/50 rounded-lg border-l-4 border-green-400">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold">System Initialization</div>
                    <div className="text-xs text-slate-400">Mission Control Online</div>
                  </div>
                  <div className="text-xs text-slate-400">{missionTimeFormatted.time}</div>
                </div>
                
                {collisionAlerts.map((alert, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 bg-slate-900/50 rounded-lg border-l-4 border-red-400">
                    <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold">Collision Alert</div>
                      <div className="text-xs text-slate-400">{alert.satellite1} ↔ {alert.satellite2}</div>
                    </div>
                    <div className="text-xs text-slate-400">{new Date(alert.timestamp).toLocaleTimeString()}</div>
                  </div>
                ))}
                
                {trackedSatellites.map((sat, index) => (
                  <div key={sat.id} className="flex items-center space-x-4 p-4 bg-slate-900/50 rounded-lg border-l-4 border-cyan-400">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold">Satellite Acquired</div>
                      <div className="text-xs text-slate-400">{sat.name}</div>
                    </div>
                    <div className="text-xs text-slate-400">Active</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Setup Instructions */}
      {!apiKey && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 right-6 bg-yellow-900/90 backdrop-blur border border-yellow-500/50 rounded-xl p-6 max-w-md"
        >
          <div className="flex items-center space-x-2 mb-3">
            <Settings className="w-5 h-5 text-yellow-400" />
            <h3 className="font-semibold text-yellow-400">System Configuration Required</h3>
          </div>
          <p className="text-yellow-200 text-sm mb-3">
            N2YO API key required for satellite tracking operations.
          </p>
          <div className="text-xs text-yellow-300 space-y-1">
            <div>1. Visit n2yo.com and register</div>
            <div>2. Generate API key in profile</div>
            <div>3. Add to .env: VITE_N2YO_API_KEY=your-key</div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default SatelliteTracking; 