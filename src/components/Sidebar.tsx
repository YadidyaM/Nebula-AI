import React, { useEffect, useState } from 'react';
import { 
  Home, 
  Satellite, 
  Target, 
  Cpu, 
  Users,
  Radio,
  Brain,
  Trophy,
  Monitor,
  Activity,
  Shield,
  BookOpen,
  Award,
  BarChart3,
  Settings,
  HelpCircle,
  Wifi,
  WifiOff,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  systemHealth?: any;
  tabManager?: any;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  systemHealth, 
  tabManager 
}) => {
  const [tabStatuses, setTabStatuses] = useState<Map<string, any>>(new Map());

  // NASA-Grade Menu Items with Real-time Capabilities
  const menuItems = [
    { 
      id: 'dashboard', 
      icon: Home, 
      label: 'Mission Overview',
      priority: 'critical',
      requiresLiveData: true
    },
    { 
      id: 'satellite-tracking', 
      icon: Satellite, 
      label: 'Satellite Tracking',
      priority: 'high',
      requiresLiveData: true
    },
    { 
      id: 'mission-control-center', 
      icon: Monitor, 
      label: 'Control Center', 
      badge: 'LIVE',
      priority: 'critical',
      requiresLiveData: true
    }
  ];

  const trainingItems = [
    { 
      id: 'training-hub', 
      icon: Brain, 
      label: 'Advanced Training', 
      badge: 'PRO',
      priority: 'high',
      requiresLiveData: false
    },
    { 
      id: 'resource-manager', 
      icon: BarChart3, 
      label: 'Resource Manager',
      priority: 'medium',
      requiresLiveData: true
    }
  ];

  // Monitor tab statuses from the tab manager
  useEffect(() => {
    if (!tabManager) return;

    const updateTabStatuses = () => {
      const newStatuses = new Map();
      
      [...menuItems, ...trainingItems].forEach(item => {
        const status = tabManager.getTabStatus?.(item.id);
        const data = tabManager.getTabData?.(item.id);
        
        newStatuses.set(item.id, {
          status: status,
          data: data,
          isActive: status?.isActive || false,
          dataFreshness: status?.dataFreshness || 0,
          errorCount: status?.errorCount || 0,
          performance: status?.performance || 100
        });
      });
      
      setTabStatuses(newStatuses);
    };

    // Update initially
    updateTabStatuses();

    // Set up periodic updates
    const interval = setInterval(updateTabStatuses, 2000);

    return () => clearInterval(interval);
  }, [tabManager]);

  // Get tab status indicator
  const getTabStatusIndicator = (tabId: string, requiresLiveData: boolean) => {
    const tabStatus = tabStatuses.get(tabId);
    
    if (!requiresLiveData) {
      return <CheckCircle className="w-3 h-3 text-gray-400" />;
    }

    if (!tabStatus) {
      return <Clock className="w-3 h-3 text-gray-400" />;
    }

    if (tabStatus.errorCount > 0) {
      return <AlertTriangle className="w-3 h-3 text-red-400" />;
    }

    if (tabStatus.isActive && tabStatus.dataFreshness < 10000) {
      return <CheckCircle className="w-3 h-3 text-green-400" />;
    }

    if (tabStatus.isActive) {
      return <Wifi className="w-3 h-3 text-yellow-400" />;
    }

    return <WifiOff className="w-3 h-3 text-red-400" />;
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'border-l-red-500';
      case 'high': return 'border-l-orange-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-500';
    }
  };

  const MenuItem = ({ item, isTraining = false }: { item: any; isTraining?: boolean }) => {
    const tabStatus = tabStatuses.get(item.id);
    const isActive = activeTab === item.id;
    
    return (
      <button
        onClick={() => setActiveTab(item.id)}
        className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 group border-l-2 ${
          isActive
            ? 'bg-gradient-to-r from-blue-600/20 to-cyan-600/10 text-white border-l-blue-400 shadow-lg backdrop-blur-sm'
            : `text-gray-300 hover:bg-gray-800/50 hover:text-white ${getPriorityColor(item.priority)}`
        }`}
      >
        <div className="flex items-center space-x-2 min-w-0 flex-1">
          <item.icon className={`w-4 h-4 flex-shrink-0 ${
            isActive ? 'text-blue-400' : 'text-gray-400 group-hover:text-blue-400'
          }`} />
          <span className="font-medium text-sm truncate">{item.label}</span>
        </div>
        
        <div className="flex items-center space-x-1 flex-shrink-0">
          {/* Tab Status Indicator */}
          {getTabStatusIndicator(item.id, item.requiresLiveData)}
          
          {/* Badge */}
          {item.badge && (
            <span className={`px-1.5 py-0.5 text-xs font-bold rounded ${
              item.badge === 'LIVE' ? 'bg-red-500/20 text-red-400 animate-pulse' :
              item.badge === 'PRO' ? 'bg-purple-500/20 text-purple-400' :
              item.badge === 'NEW' ? 'bg-green-500/20 text-green-400' :
              'bg-blue-500/20 text-blue-400'
            }`}>
              {item.badge}
            </span>
          )}
          
          {/* Performance Indicator */}
          {tabStatus?.performance && tabStatus.performance < 90 && (
            <div className={`w-1.5 h-1.5 rounded-full ${
              tabStatus.performance > 70 ? 'bg-yellow-400' : 'bg-red-400'
            }`} />
          )}
        </div>
      </button>
    );
  };

  // Calculate system status
  const getSystemStatus = () => {
    if (!systemHealth) return { color: 'gray', text: 'INITIALIZING', icon: Clock };
    
    switch (systemHealth.status) {
      case 'operational':
        return { color: 'green', text: 'OPERATIONAL', icon: CheckCircle };
      case 'degraded':
        return { color: 'yellow', text: 'DEGRADED', icon: AlertTriangle };
      case 'critical':
        return { color: 'red', text: 'CRITICAL', icon: AlertTriangle };
      case 'offline':
        return { color: 'gray', text: 'OFFLINE', icon: WifiOff };
      default:
        return { color: 'blue', text: 'UNKNOWN', icon: Clock };
    }
  };

  const systemStatus = getSystemStatus();
  const StatusIcon = systemStatus.icon;

  return (
    <div className="h-full w-64 bg-gray-900/95 backdrop-blur-sm border-r border-blue-500/30 flex flex-col">
      {/* NASA-Grade Header */}
      <div className="p-4 border-b border-blue-500/30">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
            <Satellite className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">NEBULA AI</h1>
            <p className="text-xs text-blue-300">Mission Control Suite</p>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 p-3 space-y-4 overflow-y-auto">
        {/* Mission Operations Section */}
        <div>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2 flex items-center">
            <Monitor className="w-3 h-3 mr-2" />
            Mission Operations
          </h2>
          <div className="space-y-1">
            {menuItems.map(item => (
              <MenuItem key={item.id} item={item} />
            ))}
          </div>
        </div>

        {/* Training & Analytics Section */}
        <div>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2 flex items-center">
            <Brain className="w-3 h-3 mr-2" />
            Training & Analytics
          </h2>
          <div className="space-y-1">
            {trainingItems.map(item => (
              <MenuItem key={item.id} item={item} isTraining />
            ))}
          </div>
        </div>
      </div>

      {/* NASA-Grade System Status Panel */}
      <div className="p-3 border-t border-blue-500/30">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-3 mb-3 border border-gray-700/50">
          <div className="flex items-center space-x-2 mb-2">
            <StatusIcon className={`w-3 h-3 text-${systemStatus.color}-400`} />
            <span className={`text-xs font-bold text-${systemStatus.color}-400`}>
              SYSTEM {systemStatus.text}
            </span>
          </div>
          
          <div className="text-xs text-gray-400 space-y-1">
            <div className="flex justify-between">
              <span>NASA API:</span>
              <span className={systemHealth?.apiStatuses?.nasa?.isOnline ? 'text-green-400' : 'text-red-400'}>
                {systemHealth?.apiStatuses?.nasa?.isOnline ? 'ONLINE' : 'OFFLINE'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>N2YO API:</span>
              <span className={systemHealth?.apiStatuses?.n2yo?.isOnline ? 'text-green-400' : 'text-red-400'}>
                {systemHealth?.apiStatuses?.n2yo?.isOnline ? 'ONLINE' : 'OFFLINE'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Data Streams:</span>
              <span className="text-blue-400">
                {systemHealth?.dataStreams?.size || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Uptime:</span>
              <span className="text-gray-300">
                {Math.floor((systemHealth?.uptime || 0) / 60000)}m
              </span>
            </div>
          </div>

          {/* Active Alerts */}
          {systemHealth?.alerts?.length > 0 && (
            <div className="mt-2 text-xs">
              <div className="text-red-400 font-semibold">
                🚨 {systemHealth.alerts.length} Alert(s)
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="space-y-1">
          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 group ${
              activeTab === 'settings'
                ? 'bg-gradient-to-r from-blue-600/20 to-cyan-600/10 text-white'
                : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
            }`}
          >
            <Settings className="w-4 h-4 text-gray-400 group-hover:text-blue-400" />
            <span className="font-medium text-sm">System Settings</span>
          </button>
        </div>
      </div>

      {/* Mission Specialist Profile */}
      <div className="p-3 border-t border-blue-500/30">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full flex items-center justify-center">
            <span className="text-sm font-bold text-white">MS</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-white truncate">Mission Specialist</div>
            <div className="text-xs text-blue-300 truncate">NASA Operations</div>
          </div>
          <div className={`w-2 h-2 rounded-full ${
            systemHealth?.status === 'operational' ? 'bg-green-400' : 'bg-red-400'
          }`}></div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;