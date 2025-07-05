// Dynamic Tab Management System for NASA-Grade Dashboard
// Manages real-time data flow to all dashboard tabs

import { RealTimeAPIOrchestrator } from './RealTimeAPIOrchestrator';
import { EventEmitter } from '../utils/EventEmitter';

interface TabConfig {
  id: string;
  name: string;
  icon: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  updateFrequency: number;
  dataRequirements: string[];
  alertEnabled: boolean;
  healthMonitoring: boolean;
}

interface TabData {
  tabId: string;
  data: any;
  timestamp: Date;
  status: 'live' | 'stale' | 'error';
  lastUpdate: Date;
  quality: 'excellent' | 'good' | 'poor' | 'degraded';
}

interface TabHandler {
  initialize(): Promise<void>;
  update(data: any): Promise<void>;
  handleError(error: any): Promise<void>;
  getStatus(): TabStatus;
  cleanup(): Promise<void>;
}

interface TabStatus {
  isActive: boolean;
  dataFreshness: number;
  errorCount: number;
  lastError?: Date;
  performance: number;
}

export class DynamicTabManager extends EventEmitter {
  private apiOrchestrator: RealTimeAPIOrchestrator;
  private activeHandlers: Map<string, TabHandler>;
  private tabConfigs: Map<string, TabConfig>;
  private tabData: Map<string, TabData>;
  private updateIntervals: Map<string, NodeJS.Timeout>;

  constructor(apiOrchestrator: RealTimeAPIOrchestrator) {
    super();
    this.apiOrchestrator = apiOrchestrator;
    this.activeHandlers = new Map();
    this.tabConfigs = new Map();
    this.tabData = new Map();
    this.updateIntervals = new Map();
    
    this.initializeTabConfigurations();
    this.setupAPIListeners();
  }

  private initializeTabConfigurations(): void {
    const tabs: TabConfig[] = [
      {
        id: 'dashboard',
        name: 'Mission Overview',
        icon: '🏠',
        priority: 'critical',
        updateFrequency: 1000,
        dataRequirements: ['system-health', 'iss-position', 'active-satellites'],
        alertEnabled: true,
        healthMonitoring: true
      },
      {
        id: 'mission-control',
        name: 'Mission Control',
        icon: '🎯',
        priority: 'critical',
        updateFrequency: 2000,
        dataRequirements: ['iss-position', 'telemetry'],
        alertEnabled: true,
        healthMonitoring: true
      },
      {
        id: 'satellite-tracking',
        name: 'Satellite Tracking',
        icon: '🛰️',
        priority: 'high',
        updateFrequency: 5000,
        dataRequirements: ['active-satellites', 'orbital-data', 'tracking-data'],
        alertEnabled: true,
        healthMonitoring: true
      },
      {
        id: 'mission-simulation',
        name: 'Mission Simulation',
        icon: '💻',
        priority: 'medium',
        updateFrequency: 10000,
        dataRequirements: ['simulation-data', 'scenario-updates'],
        alertEnabled: false,
        healthMonitoring: false
      },
      {
        id: 'mission-control-center',
        name: 'Control Center (LIVE)',
        icon: '📺',
        priority: 'critical',
        updateFrequency: 1000,
        dataRequirements: ['live-telemetry', 'console-displays', 'system-status'],
        alertEnabled: true,
        healthMonitoring: true
      },
      {
        id: 'training-hub',
        name: 'Training Hub (PRO)',
        icon: '🧠',
        priority: 'medium',
        updateFrequency: 30000,
        dataRequirements: ['training-scenarios', 'performance-metrics'],
        alertEnabled: false,
        healthMonitoring: false
      },
      {
        id: 'resource-manager',
        name: 'Resource Manager',
        icon: '📊',
        priority: 'high',
        updateFrequency: 15000,
        dataRequirements: ['resource-allocation', 'bandwidth-usage', 'power-consumption'],
        alertEnabled: true,
        healthMonitoring: true
      },
      {
        id: 'team-coordination',
        name: 'Team Coordination (NEW)',
        icon: '👥',
        priority: 'medium',
        updateFrequency: 20000,
        dataRequirements: ['team-status', 'communication-logs'],
        alertEnabled: false,
        healthMonitoring: false
      }
    ];

    tabs.forEach(tab => {
      this.tabConfigs.set(tab.id, tab);
      this.tabData.set(tab.id, {
        tabId: tab.id,
        data: null,
        timestamp: new Date(),
        status: 'stale',
        lastUpdate: new Date(),
        quality: 'poor'
      });
    });
  }

  private setupAPIListeners(): void {
    // Listen to API orchestrator events
    this.apiOrchestrator.on('telemetry-update', (data) => {
      this.distributeDataToTabs(data);
    });

    this.apiOrchestrator.on('system-health-change', (health) => {
      this.updateSystemHealthTabs(health);
    });

    this.apiOrchestrator.on('alert-created', (alert) => {
      this.propagateAlert(alert);
    });
  }

  async initializeAllTabs(): Promise<void> {
    console.log('🚀 Initializing Dynamic Tab System...');

    try {
      // Initialize handlers for each tab
      for (const [tabId, config] of this.tabConfigs) {
        await this.initializeTabHandler(tabId, config);
      }

      // Start the API orchestrator
      await this.apiOrchestrator.startRealTimeStreams();

      console.log('✅ All tabs initialized successfully');
      this.emit('tab-system-ready');

    } catch (error) {
      console.error('❌ Failed to initialize tab system:', error);
      throw error;
    }
  }

  private async initializeTabHandler(tabId: string, config: TabConfig): Promise<void> {
    let handler: TabHandler;

    // Create appropriate handler based on tab type
    switch (tabId) {
      case 'dashboard':
        handler = new DashboardHandler(config, this.apiOrchestrator);
        break;
      case 'mission-control':
        handler = new MissionControlHandler(config, this.apiOrchestrator);
        break;
      case 'satellite-tracking':
        handler = new SatelliteTrackingHandler(config, this.apiOrchestrator);
        break;
      case 'mission-control-center':
        handler = new MissionControlCenterHandler(config, this.apiOrchestrator);
        break;
      case 'resource-manager':
        handler = new ResourceManagerHandler(config, this.apiOrchestrator);
        break;
      default:
        handler = new GenericTabHandler(config, this.apiOrchestrator);
    }

    await handler.initialize();
    this.activeHandlers.set(tabId, handler);

    // Set up update interval for tab
    if (config.updateFrequency > 0) {
      const interval = setInterval(async () => {
        await this.updateTab(tabId);
      }, config.updateFrequency);
      
      this.updateIntervals.set(tabId, interval);
    }

    console.log(`📋 Tab '${tabId}' handler initialized`);
  }

  private async updateTab(tabId: string): Promise<void> {
    const handler = this.activeHandlers.get(tabId);
    const tabData = this.tabData.get(tabId);
    
    if (!handler || !tabData) return;

    try {
      // Get latest data for tab
      const data = await this.getTabData(tabId);
      
      // Update handler
      await handler.update(data);
      
      // Update tab data record
      tabData.data = data;
      tabData.timestamp = new Date();
      tabData.status = 'live';
      tabData.lastUpdate = new Date();
      tabData.quality = 'excellent';

      // Emit update event
      this.emit(`tab-updated:${tabId}`, {
        tabId,
        data,
        timestamp: new Date()
      });

    } catch (error) {
      console.error(`❌ Error updating tab '${tabId}':`, error);
      await this.handleTabError(tabId, error);
    }
  }

  private async getTabData(tabId: string): Promise<any> {
    const config = this.tabConfigs.get(tabId);
    if (!config) return null;

    const data: any = {};

    // Collect required data based on tab configuration
    for (const requirement of config.dataRequirements) {
      switch (requirement) {
        case 'system-health':
          data.systemHealth = this.apiOrchestrator.getSystemHealth();
          break;
        case 'iss-position':
          data.issPosition = await this.getLatestISSPosition();
          break;
        case 'active-satellites':
          data.satellites = await this.getActiveSatellites();
          break;
        case 'live-telemetry':
          data.telemetry = await this.getLiveTelemetry();
          break;
        case 'resource-allocation':
          data.resources = await this.getResourceData();
          break;
        // Add more data sources as needed
      }
    }

    return data;
  }

  private async getLatestISSPosition(): Promise<any> {
    // Implementation to get latest ISS position
    return { latitude: 41.702, longitude: -76.014, altitude: 408, velocity: 7.66 };
  }

  private async getActiveSatellites(): Promise<any> {
    // Implementation to get active satellites
    return [];
  }

  private async getLiveTelemetry(): Promise<any> {
    // Implementation to get live telemetry
    return {};
  }

  private async getResourceData(): Promise<any> {
    // Implementation to get resource data
    return {};
  }

  private distributeDataToTabs(data: any): void {
    // Distribute incoming data to relevant tabs
    for (const [tabId, config] of this.tabConfigs) {
      if (this.isDataRelevantToTab(data, config)) {
        this.emit(`data-for-tab:${tabId}`, data);
      }
    }
  }

  private isDataRelevantToTab(data: any, config: TabConfig): boolean {
    // Check if data is relevant to tab based on requirements
    return config.dataRequirements.some(req => 
      data.streamId === req || data.dataType === req
    );
  }

  private updateSystemHealthTabs(health: any): void {
    // Update tabs that monitor system health
    for (const [tabId, config] of this.tabConfigs) {
      if (config.healthMonitoring) {
        this.emit(`health-update:${tabId}`, health);
      }
    }
  }

  private propagateAlert(alert: any): void {
    // Propagate alerts to relevant tabs
    for (const [tabId, config] of this.tabConfigs) {
      if (config.alertEnabled) {
        this.emit(`alert:${tabId}`, alert);
      }
    }
  }

  private async handleTabError(tabId: string, error: any): Promise<void> {
    const handler = this.activeHandlers.get(tabId);
    const tabData = this.tabData.get(tabId);
    
    if (handler) {
      await handler.handleError(error);
    }
    
    if (tabData) {
      tabData.status = 'error';
      tabData.quality = 'degraded';
    }

    this.emit(`tab-error:${tabId}`, { tabId, error });
  }

  // Public API
  getTabData(tabId: string): TabData | undefined {
    return this.tabData.get(tabId);
  }

  getTabStatus(tabId: string): TabStatus | undefined {
    const handler = this.activeHandlers.get(tabId);
    return handler?.getStatus();
  }

  async switchToTab(tabId: string): Promise<void> {
    const config = this.tabConfigs.get(tabId);
    if (!config) {
      throw new Error(`Unknown tab: ${tabId}`);
    }

    this.emit('tab-switched', { 
      tabId, 
      timestamp: new Date(),
      config 
    });

    // Trigger immediate update for the active tab
    await this.updateTab(tabId);
  }

  async cleanup(): Promise<void> {
    // Stop all intervals
    for (const [tabId, interval] of this.updateIntervals) {
      clearInterval(interval);
    }
    this.updateIntervals.clear();

    // Cleanup all handlers
    for (const [tabId, handler] of this.activeHandlers) {
      await handler.cleanup();
    }
    this.activeHandlers.clear();

    // Stop API orchestrator
    await this.apiOrchestrator.stopAllStreams();

    console.log('🛑 Dynamic Tab Manager shut down');
  }
}

// Tab Handler Implementations
abstract class BaseTabHandler implements TabHandler {
  protected config: TabConfig;
  protected apiOrchestrator: RealTimeAPIOrchestrator;
  protected status: TabStatus;

  constructor(config: TabConfig, apiOrchestrator: RealTimeAPIOrchestrator) {
    this.config = config;
    this.apiOrchestrator = apiOrchestrator;
    this.status = {
      isActive: false,
      dataFreshness: 0,
      errorCount: 0,
      performance: 100
    };
  }

  abstract initialize(): Promise<void>;
  abstract update(data: any): Promise<void>;

  async handleError(error: any): Promise<void> {
    this.status.errorCount++;
    this.status.lastError = new Date();
    console.error(`Tab ${this.config.id} error:`, error);
  }

  getStatus(): TabStatus {
    return { ...this.status };
  }

  async cleanup(): Promise<void> {
    this.status.isActive = false;
  }
}

class DashboardHandler extends BaseTabHandler {
  async initialize(): Promise<void> {
    console.log('🏠 Initializing Dashboard handler...');
    this.status.isActive = true;
  }

  async update(data: any): Promise<void> {
    // Handle dashboard-specific updates
    this.status.dataFreshness = Date.now() - data.timestamp?.getTime() || 0;
  }
}

class MissionControlHandler extends BaseTabHandler {
  async initialize(): Promise<void> {
    console.log('🎯 Initializing Mission Control handler...');
    this.status.isActive = true;
  }

  async update(data: any): Promise<void> {
    // Handle mission control specific updates
    this.status.dataFreshness = Date.now() - data.timestamp?.getTime() || 0;
  }
}

class SatelliteTrackingHandler extends BaseTabHandler {
  async initialize(): Promise<void> {
    console.log('🛰️ Initializing Satellite Tracking handler...');
    this.status.isActive = true;
  }

  async update(data: any): Promise<void> {
    // Handle satellite tracking specific updates
    this.status.dataFreshness = Date.now() - data.timestamp?.getTime() || 0;
  }
}

class MissionControlCenterHandler extends BaseTabHandler {
  async initialize(): Promise<void> {
    console.log('📺 Initializing Mission Control Center handler...');
    this.status.isActive = true;
  }

  async update(data: any): Promise<void> {
    // Handle live telemetry and console displays
    this.status.dataFreshness = Date.now() - data.timestamp?.getTime() || 0;
  }
}

class ResourceManagerHandler extends BaseTabHandler {
  async initialize(): Promise<void> {
    console.log('📊 Initializing Resource Manager handler...');
    this.status.isActive = true;
  }

  async update(data: any): Promise<void> {
    // Handle resource management updates
    this.status.dataFreshness = Date.now() - data.timestamp?.getTime() || 0;
  }
}

class GenericTabHandler extends BaseTabHandler {
  async initialize(): Promise<void> {
    console.log(`📋 Initializing ${this.config.name} handler...`);
    this.status.isActive = true;
  }

  async update(data: any): Promise<void> {
    // Handle generic tab updates
    this.status.dataFreshness = Date.now() - data.timestamp?.getTime() || 0;
  }
} 