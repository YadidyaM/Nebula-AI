import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import SatelliteTracking from './components/SatelliteTracking';
import MissionControlCenter from './components/MissionControlCenter';
import AdvancedTrainingDashboard from './components/AdvancedTrainingDashboard';
import ResourceManager from './components/ResourceManager';
import MissionBriefing from './components/MissionBriefing';

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

// NASA Mission Control App with Dynamic Real-Time System
function App() {
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

  // Render appropriate tab component with real-time data
  const renderActiveTab = () => {
    const commonProps = {
      realTimeData: currentTabData?.data,
      systemHealth: systemHealth,
      isLive: currentTabData?.status === 'live'
    };

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard {...commonProps} />;
      case 'satellite-tracking':
        return <SatelliteTracking {...commonProps} />;
      case 'mission-control-center':
        return <MissionControlCenter {...commonProps} />;
      case 'training-hub':
        return <AdvancedTrainingDashboard {...commonProps} />;
      case 'resource-manager':
        return <ResourceManager {...commonProps} />;
      case 'team-coordination':
        return <MissionBriefing {...commonProps} title="Team Coordination" />;
      case 'certification':
        return <MissionBriefing {...commonProps} title="Certification Hub" />;
      case 'analytics':
        return <MissionBriefing {...commonProps} title="Advanced Analytics" />;
      default:
        return <Dashboard {...commonProps} />;
    }
  };

  // Loading screen for system initialization
  if (!isSystemInitialized && !initializationError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🚀</div>
          <h1 className="text-3xl font-bold text-white mb-4">
            Initializing NASA Mission Control
          </h1>
          <div className="text-blue-300 mb-6">
            Starting real-time API connections...
          </div>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
          </div>
          <div className="mt-4 text-sm text-gray-400">
            • Connecting to NASA APIs<br/>
            • Establishing satellite tracking<br/>
            • Initializing telemetry streams<br/>
            • Configuring mission control systems
          </div>
        </div>
      </div>
    );
  }

  // Error screen for initialization failures
  if (initializationError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-purple-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🚨</div>
          <h1 className="text-3xl font-bold text-white mb-4">
            System Initialization Failed
          </h1>
          <div className="text-red-300 mb-6">
            {initializationError}
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Retry Initialization
          </button>
          <div className="mt-4 text-sm text-gray-400">
            This may be due to API connectivity issues or configuration problems.
          </div>
        </div>
      </div>
    );
  }

  // Main application interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* NASA-Grade System Health Monitoring */}
      <SystemHealthIndicator systemHealth={systemHealth} />
      
      {/* Real-time Data Quality Indicator */}
      <DataQualityIndicator tabData={currentTabData} />

      {/* Mission Control Header */}
      <header className="bg-gray-900/50 backdrop-blur-sm border-b border-blue-500/30 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-2xl">🚀</div>
            <div>
              <h1 className="text-xl font-bold text-white">
                NEBULA AI Mission Control
              </h1>
              <p className="text-blue-300 text-sm">
                NASA-Grade Real-Time Operations Dashboard
              </p>
            </div>
          </div>
          
          {/* Live Status Indicator */}
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-300 text-sm font-semibold">LIVE</span>
            {currentTabData?.status === 'live' && (
              <div className="text-xs text-gray-400">
                {new Date().toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Dynamic Sidebar with Real-time Status */}
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab}
          systemHealth={systemHealth}
          tabManager={tabManagerRef.current}
        />
        
        {/* Main Content Area with Real-time Data */}
        <main className="flex-1 overflow-auto">
          {renderActiveTab()}
        </main>
      </div>

      {/* Emergency Alert System */}
      {systemHealth?.alerts?.some((alert: any) => alert.level === 'emergency') && (
        <div className="fixed inset-0 bg-red-900/50 flex items-center justify-center z-50">
          <div className="bg-red-800 border border-red-600 rounded-lg p-6 max-w-md">
            <div className="text-center">
              <div className="text-4xl mb-2">🚨</div>
              <h2 className="text-xl font-bold text-white mb-2">
                EMERGENCY ALERT
              </h2>
              <p className="text-red-200 mb-4">
                Critical system failure detected. Mission control protocols activated.
              </p>
              <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors">
                Acknowledge Alert
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;