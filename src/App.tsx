import React, { useState, useEffect, useRef } from 'react';
import { useAuth0 } from "@auth0/auth0-react";
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import SatelliteTracking from './components/SatelliteTracking';
import MissionControlCenter from './components/MissionControlCenter';
import AdvancedTrainingDashboard from './components/AdvancedTrainingDashboard';
import ResourceManager from './components/ResourceManager';
import MissionBriefing from './components/MissionBriefing';
import AuthButtons from './components/AuthButtons';
import LoginPage from './components/LoginPage';

// NASA-Grade Dynamic System Imports
import { RealTimeAPIOrchestrator } from './services/RealTimeAPIOrchestrator';
import { DynamicTabManager } from './services/DynamicTabManager';

// Real-time System Health Component
const SystemHealthIndicator: React.FC<{ systemHealth: any }> = ({ systemHealth }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'text-green-400';
      case 'degraded': return 'text-yellow-400';
      case 'critical': return 'text-red-400';
      case 'offline': return 'text-gray-400';
      default: return 'text-blue-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational': return '🟢';
      case 'degraded': return '🟡';
      case 'critical': return '🔴';
      case 'offline': return '⚫';
      default: return '🔵';
    }
  };

  return (
    <div className="fixed top-4 right-4 bg-gray-900/80 backdrop-blur-sm border border-blue-500/30 rounded-lg p-3 z-50">
      <div className="flex items-center space-x-2">
        <span className="text-xs">{getStatusIcon(systemHealth?.status)}</span>
        <div>
          <div className={`text-sm font-semibold ${getStatusColor(systemHealth?.status)}`}>
            SYSTEM {systemHealth?.status?.toUpperCase() || 'UNKNOWN'}
          </div>
          <div className="text-xs text-gray-400">
            Uptime: {Math.floor((systemHealth?.uptime || 0) / 1000)}s
          </div>
        </div>
      </div>
      
      {/* API Status Indicators */}
      <div className="flex space-x-2 mt-2">
        <div className={`text-xs px-2 py-1 rounded ${
          systemHealth?.apiStatuses?.nasa?.isOnline ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'
        }`}>
          NASA API
        </div>
        <div className={`text-xs px-2 py-1 rounded ${
          systemHealth?.apiStatuses?.n2yo?.isOnline ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'
        }`}>
          N2YO API
        </div>
      </div>

      {/* Active Alerts */}
      {systemHealth?.alerts?.length > 0 && (
        <div className="mt-2 text-xs text-red-300">
          🚨 {systemHealth.alerts.length} active alert(s)
        </div>
      )}
    </div>
  );
};

// Real-time Data Quality Indicator
const DataQualityIndicator: React.FC<{ tabData: any }> = ({ tabData }) => {
  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'text-green-400';
      case 'good': return 'text-blue-400';
      case 'poor': return 'text-yellow-400';
      case 'degraded': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  if (!tabData) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900/80 backdrop-blur-sm border border-blue-500/30 rounded-lg p-2 z-40">
      <div className="text-xs">
        <div className={`font-semibold ${getQualityColor(tabData.quality)}`}>
          Data Quality: {tabData.quality?.toUpperCase()}
        </div>
        <div className="text-gray-400">
          Status: {tabData.status} | Last: {new Date(tabData.lastUpdate).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

interface CommonProps {
  realTimeData?: any;
  systemHealth?: any;
  isLive?: boolean;
}

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const defaultMissionScenario = {
  id: 'default-mission',
  name: 'Standard Orbital Mission',
  description: 'A standard orbital mission scenario',
  difficulty: 'intermediate',
  duration: 4,
  missionType: 'orbital',
  spacecraft: 'ISS',
  objectives: [
    {
      id: 'obj-1',
      description: 'Establish stable orbit',
      type: 'primary',
      points: 100
    }
  ],
  criticalEvents: [
    {
      type: 'system-check',
      time: 0,
      probability: 100,
      severity: 'low',
      description: 'Initial systems check',
      requiredAction: 'Verify all systems'
    }
  ]
};

// NASA Mission Control App with Dynamic Real-Time System
function App() {
  const { isAuthenticated, isLoading } = useAuth0();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [currentTabData, setCurrentTabData] = useState<any>(null);
  const [isSystemInitialized, setIsSystemInitialized] = useState(false);
  const [initializationError, setInitializationError] = useState<string | null>(null);

  // Dynamic System References
  const apiOrchestratorRef = useRef<RealTimeAPIOrchestrator | null>(null);
  const tabManagerRef = useRef<DynamicTabManager | null>(null);

  // Initialize NASA-Grade Dynamic System
  useEffect(() => {
    const initializeNASASystem = async () => {
      try {
        console.log('🚀 Starting NASA-Grade Mission Control System...');
        
        // Initialize API Orchestrator
        apiOrchestratorRef.current = new RealTimeAPIOrchestrator();
        
        // Initialize Tab Manager
        tabManagerRef.current = new DynamicTabManager(apiOrchestratorRef.current);
        
        // Set up system health monitoring
        const healthInterval = setInterval(() => {
          if (apiOrchestratorRef.current) {
            const health = apiOrchestratorRef.current.getSystemHealth();
            setSystemHealth(health);
          }
        }, 1000);

        // Set up tab data monitoring
        tabManagerRef.current.on('tab-system-ready', () => {
          console.log('✅ NASA Tab System Ready');
          setIsSystemInitialized(true);
        });

        tabManagerRef.current.on('tab-updated:' + activeTab, (data) => {
          setCurrentTabData(data);
        });

        tabManagerRef.current.on('tab-switched', (event) => {
          console.log(`📋 Switched to tab: ${event.tabId}`);
        });

        // Initialize all systems
        await tabManagerRef.current.initializeAllTabs();

        // Cleanup function
        return () => {
          clearInterval(healthInterval);
          if (tabManagerRef.current) {
            tabManagerRef.current.cleanup();
          }
        };

      } catch (error) {
        console.error('❌ Failed to initialize NASA system:', error);
        setInitializationError(error instanceof Error ? error.message : 'Unknown error');
      }
    };

    initializeNASASystem();
  }, []);

  // Handle tab switching with dynamic system
  useEffect(() => {
    if (tabManagerRef.current && isSystemInitialized) {
      tabManagerRef.current.switchToTab(activeTab);
      
      // Update tab data listener
      const updateListener = (data: any) => setCurrentTabData(data);
      tabManagerRef.current.on(`tab-updated:${activeTab}`, updateListener);
      
      return () => {
        if (tabManagerRef.current) {
          tabManagerRef.current.off(`tab-updated:${activeTab}`, updateListener);
        }
      };
    }
  }, [activeTab, isSystemInitialized]);

  // Handle collision alerts
  const handleCollisionAlert = (alert: any) => {
    console.log('Collision Alert:', alert);
    // Add your collision alert handling logic here
  };

  // Render appropriate tab component with real-time data
  const renderActiveTab = () => {
    const commonProps: CommonProps = {
      realTimeData: currentTabData?.data,
      systemHealth: systemHealth,
      isLive: currentTabData?.status === 'live'
    };

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard {...commonProps} />;
      case 'satellite-tracking':
        return <SatelliteTracking 
          apiKey={import.meta.env.VITE_N2YO_API_KEY} 
          onAlert={handleCollisionAlert}
        />;
      case 'mission-control-center':
        return <MissionControlCenter />;
      case 'training-hub':
        return <AdvancedTrainingDashboard />;
      case 'resource-manager':
        return <ResourceManager />;
      case 'mission-briefing':
        return <MissionBriefing 
          scenario={defaultMissionScenario}
          onStartMission={() => console.log('Starting mission...')}
          onClose={() => setActiveTab('dashboard')}
        />;
      default:
        return <Dashboard {...commonProps} />;
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading Mission Control...</div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Show main application if authenticated
  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 relative">
        <div className="absolute top-4 left-4 z-50">
          <AuthButtons />
        </div>
        {systemHealth && <SystemHealthIndicator systemHealth={systemHealth} />}
        {currentTabData && <DataQualityIndicator tabData={currentTabData} />}
        {renderActiveTab()}
      </div>
    </div>
  );
}

export default App;