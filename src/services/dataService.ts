import type { ISSTrackingData } from '../data/issData';
import type { SatelliteCoordinationData } from '../types/CassiniData';

interface SystemStatus {
  health: {
    thermal: string;
    propulsion: string;
    communication: string;
  };
  power: {
    consumption: number;
    batteryLevel: number;
  };
  storage: number;
  groundStation: string;
}

interface PerformanceData {
  timestamp: string;
  power: number;
  battery: number;
  storage: number;
}

interface TaskData {
  id: string;
  name: string;
  duration: number;
  priority: string;
  status: string;
  startTime: number;
  totalDuration: number;
}

interface SatelliteData {
  id: string;
  groundStation: string;
  bandwidth: {
    used: number;
    available: number;
  };
  status: {
    link: string;
    conflict: string;
    weather: string;
  };
  priority: string;
  throughput: number;
}

interface ISSMission {
  id: string;
  name: string;
  vehicle: string;
  type: 'private' | 'crew-rotation' | 'cargo' | 'test' | 'other';
  startDate: string;
  completionDate: string;
  description: string;
  status: 'upcoming' | 'in-progress' | 'completed' | 'delayed';
  daysLeft: number;
}

export class DataService {
  private isInitialized = false;
  private issData: ISSTrackingData[] = [];
  private satelliteData: SatelliteCoordinationData[] = [];
  private lastUpdateTime: number = Date.now();
  private initializationPromise: Promise<void> | null = null;
  private updateInProgress: boolean = false;
  private errorCount: number = 0;
  private readonly MAX_RETRIES = 3;
  private readonly ERROR_RESET_INTERVAL = 60000; // 1 minute
  private updateInterval: NodeJS.Timeout | null = null;
  private activeTasks: Map<string, TaskData> = new Map();
  private issMissions: ISSMission[] = [
    {
      id: 'axiom-4',
      name: 'Axiom-4',
      vehicle: 'Dragon Grace',
      type: 'private',
      startDate: '2025-06-26',
      completionDate: '2025-07-10',
      description: 'Private astronauts depart after 14-day stay',
      status: 'in-progress',
      daysLeft: 6
    },
    {
      id: 'crew-10',
      name: 'Crew-10',
      vehicle: 'Dragon Endurance',
      type: 'crew-rotation',
      startDate: '2025-08-15',
      completionDate: '2025-09-15',
      description: 'NASA crew of four returns; ends Expedition 73 overlap',
      status: 'upcoming',
      daysLeft: 73
    },
    {
      id: 'spx-33',
      name: 'CRS SpX-33',
      vehicle: 'Cargo Dragon',
      type: 'cargo',
      startDate: '2025-08-15',
      completionDate: '2025-09-15',
      description: 'Cargo Dragon undocks after ~30 days',
      status: 'upcoming',
      daysLeft: 73
    },
    {
      id: 'dream-chaser-1',
      name: 'Dream Chaser Demo-1',
      vehicle: 'Dream Chaser Tenacity',
      type: 'test',
      startDate: '2025-10-30',
      completionDate: '2025-10-31',
      description: 'First SNC space-plane test mission lands on runway',
      status: 'upcoming',
      daysLeft: 119
    },
    {
      id: 'progress-ms-32',
      name: 'Progress MS-32',
      vehicle: 'Progress MS',
      type: 'cargo',
      startDate: '2025-09-11',
      completionDate: '2026-03-11',
      description: 'Russian cargo ship docks six months',
      status: 'upcoming',
      daysLeft: 250
    },
    {
      id: 'cygnus-ng-23',
      name: 'Cygnus NG-23',
      vehicle: 'Cygnus',
      type: 'cargo',
      startDate: '2025-12-01',
      completionDate: '2025-12-15',
      description: 'Northrop Grumman freighter burns up on re-entry',
      status: 'upcoming',
      daysLeft: 164
    },
    {
      id: 'progress-ms-33',
      name: 'Progress MS-33',
      vehicle: 'Progress MS',
      type: 'cargo',
      startDate: '2025-12-18',
      completionDate: '2026-06-18',
      description: 'Cargo craft 94P begins ~180-day stint',
      status: 'upcoming',
      daysLeft: 349
    },
    {
      id: 'progress-ms-31',
      name: 'Progress MS-31',
      vehicle: 'Progress MS',
      type: 'cargo',
      startDate: '2025-06-01',
      completionDate: '2025-12-20',
      description: 'Current 92P freighter filled with rubbish undocks',
      status: 'in-progress',
      daysLeft: 169
    },
    {
      id: 'crew-11',
      name: 'Crew-11',
      vehicle: 'Dragon Endeavour',
      type: 'crew-rotation',
      startDate: '2025-07-31',
      completionDate: '2026-04-15',
      description: 'Expedition 74 begins when crew arrives',
      status: 'upcoming',
      daysLeft: 285
    },
    {
      id: 'soyuz-ms-28',
      name: 'Soyuz MS-28',
      vehicle: 'Soyuz MS',
      type: 'crew-rotation',
      startDate: '2025-11-27',
      completionDate: '2026-06-27',
      description: 'Carries Expedition 74/75 trio incl. NASA\'s Chris Williams',
      status: 'upcoming',
      daysLeft: 358
    },
    {
      id: 'crew-12',
      name: 'Crew-12',
      vehicle: 'Dragon',
      type: 'crew-rotation',
      startDate: '2026-03-01',
      completionDate: '2026-09-30',
      description: 'Next 6-month U.S. crew rotation',
      status: 'upcoming',
      daysLeft: 453
    },
    {
      id: 'dream-chaser-crs-1',
      name: 'Dream Chaser CRS-1',
      vehicle: 'Dream Chaser',
      type: 'cargo',
      startDate: '2026-01-29',
      completionDate: '2026-03-15',
      description: 'First operational Sierra Space supply run; 45-day dock',
      status: 'upcoming',
      daysLeft: 254
    },
    {
      id: 'soyuz-ms-29',
      name: 'Soyuz MS-29',
      vehicle: 'Soyuz MS',
      type: 'crew-rotation',
      startDate: '2026-06-01',
      completionDate: '2026-12-15',
      description: 'Russian crew rotation for Expedition 76',
      status: 'upcoming',
      daysLeft: 529
    },
    {
      id: 'axiom-1-module',
      name: 'Axiom-1 Module',
      vehicle: 'Commercial Module',
      type: 'other',
      startDate: '2026-01-01',
      completionDate: '2026-12-31',
      description: 'First Axiom commercial module attaches to ISS',
      status: 'upcoming',
      daysLeft: 545
    },
    {
      id: 'axiom-2-module',
      name: 'Axiom-2 Module',
      vehicle: 'Commercial Module',
      type: 'other',
      startDate: '2027-01-01',
      completionDate: '2027-12-31',
      description: 'Second Axiom commercial module attaches to ISS',
      status: 'upcoming',
      daysLeft: 910
    },
    {
      id: 'deorbit-tug',
      name: 'De-orbit Tug Launch',
      vehicle: 'Dragon XL-derived',
      type: 'other',
      startDate: '2029-12-01',
      completionDate: '2029-12-31',
      description: 'Launch of U.S. De-orbit Tug to dock with ISS',
      status: 'upcoming',
      daysLeft: 1610
    },
    {
      id: 'iss-deorbit',
      name: 'ISS De-orbit',
      vehicle: 'ISS',
      type: 'other',
      startDate: '2031-01-01',
      completionDate: '2031-01-31',
      description: 'Guided re-entry over Point Nemo; breakup & ocean disposal',
      status: 'upcoming',
      daysLeft: 2021
    }
  ];

  private taskTypes = [
    'ISS System Maintenance',
    'EVA Preparation',
    'Science Experiment Monitoring',
    'Crew Health Assessment',
    'Communication Systems Check',
    'Life Support Systems Check',
    'Cargo Transfer Operations',
    'Emergency Response Drill',
    'Docking Port Inspection',
    'Solar Array Performance Check'
  ];

  private groundStations = [
    'GS-ALPHA',
    'GS-BETA',
    'GS-GAMMA',
    'GS-DELTA',
    'GS-EPSILON'
  ];

  private weatherConditions = ['Clear', 'Rain', 'Storm'];
  private priorities = ['High', 'Medium', 'Low'];

  constructor() {
    // Initialize error count reset interval
    setInterval(() => {
      this.errorCount = 0;
    }, this.ERROR_RESET_INTERVAL);

    // Initialize task update interval
    setInterval(() => {
      this.updateTaskDurations();
    }, 1000);
  }

  private updateTaskDurations() {
    const now = Date.now();
    this.activeTasks.forEach((task, id) => {
      const elapsed = now - task.startTime;
      const remaining = Math.max(0, task.totalDuration * 60000 - elapsed);
      task.duration = Math.ceil(remaining / 60000);

      if (task.duration <= 0) {
        // Task completed, generate a new one
        this.activeTasks.delete(id);
        this.generateNewTask();
      }
    });
  }

  private generateNewTask(): TaskData {
    const id = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const taskName = this.taskTypes[Math.floor(Math.random() * this.taskTypes.length)];
    
    // Set task duration based on type
    let totalDuration: number;
    let priority: string;
    
    switch (taskName) {
      case 'EVA Preparation':
        totalDuration = 180 + Math.floor(Math.random() * 60); // 3-4 hours
        priority = 'High';
        break;
      case 'Emergency Response Drill':
        totalDuration = 60 + Math.floor(Math.random() * 30); // 1-1.5 hours
        priority = 'High';
        break;
      case 'Cargo Transfer Operations':
        totalDuration = 120 + Math.floor(Math.random() * 120); // 2-4 hours
        priority = 'Medium';
        break;
      case 'Science Experiment Monitoring':
        totalDuration = 90 + Math.floor(Math.random() * 90); // 1.5-3 hours
        priority = 'Medium';
        break;
      case 'Crew Health Assessment':
        totalDuration = 45 + Math.floor(Math.random() * 30); // 45-75 minutes
        priority = 'High';
        break;
      default:
        totalDuration = 30 + Math.floor(Math.random() * 60); // 30-90 minutes
        priority = this.priorities[Math.floor(Math.random() * this.priorities.length)];
    }

    const task: TaskData = {
      id,
      name: taskName,
      duration: totalDuration,
      priority,
      status: 'Success',
      startTime: Date.now(),
      totalDuration
    };
    this.activeTasks.set(id, task);
    return task;
  }

  private generateRandomCassiniData(): ISSTrackingData[] {
    const now = Date.now();
    return Array(5).fill(null).map((_, index) => {
      const task = Array.from(this.activeTasks.values())[index] || this.generateNewTask();
      return {
        id: "ISS-001",
        timestamp: new Date(now - index * 60000).toISOString(),
        phase: "Orbital Operations",
        orbitNumber: Math.floor(Math.random() * 1000),
        velocity: 7.66 + (Math.random() * 0.2 - 0.1), // Small random variation
        distance: 408 + (Math.random() * 10 - 5), // Small random variation
        coordinates: {
          latitude: (Math.random() * 180 - 90),
          longitude: (Math.random() * 360 - 180),
          altitude: 408 + (Math.random() * 10 - 5)
        },
        systemStatus: {
          power: 95 + (Math.random() * 10 - 5),
          communication: 95 + (Math.random() * 10 - 5),
          lifeSupportSystems: 95 + (Math.random() * 10 - 5),
          attitudeControl: 95 + (Math.random() * 10 - 5)
        },
        timeScale: {
          realTimeRatio: 1,
          orbitalPeriod: 92.68
        }
      };
    });
  }

  private generateRandomSatelliteData(): SatelliteCoordinationData[] {
    return Array(5).fill(null).map((_, index) => ({
      timestamp: new Date().toISOString(),
      satellite_id: `SAT-${String(index + 1).padStart(3, '0')}`,
      ground_station: this.groundStations[Math.floor(Math.random() * this.groundStations.length)],
      inter_satellite_link: Math.random() > 0.1 ? "Available" : "Unavailable",
      bandwidth_used_mbps: 100 + Math.random() * 400,
      available_bandwidth_mbps: 600 + Math.random() * 400,
      conflict_status: Math.random() > 0.9 ? "Conflict" : "No Conflict",
      conflict_resolution: "Granted",
      weather_condition: this.weatherConditions[Math.floor(Math.random() * this.weatherConditions.length)],
      priority: this.priorities[Math.floor(Math.random() * this.priorities.length)],
      orbital_position_x_km: -20000 + Math.random() * 40000,
      orbital_position_y_km: -30000 + Math.random() * 60000,
      orbital_position_z_km: -15000 + Math.random() * 30000,
      throughput_mbps: 200 + Math.random() * 500
    }));
  }

  private async initializeData(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Generate initial tasks
      for (let i = 0; i < 5; i++) {
        this.generateNewTask();
      }

      // Generate initial data
      this.issData = this.generateRandomCassiniData();
      this.satelliteData = this.generateRandomSatelliteData();
      
      this.isInitialized = true;
      this.lastUpdateTime = Date.now();

      // Start periodic updates
      if (this.updateInterval) {
        clearInterval(this.updateInterval);
      }

      this.updateInterval = setInterval(() => {
        if (!this.updateInProgress) {
          this.updateData();
        }
      }, 1000);

    } catch (error) {
      console.error('Error during data service initialization:', error);
      this.isInitialized = false;
      throw new Error('Failed to initialize data service');
    }
  }

  private updateData() {
    if (!this.isInitialized || this.updateInProgress) return;

    try {
      this.updateInProgress = true;
      const now = Date.now();

      // Update ISS data with new values
      this.issData = this.generateRandomCassiniData();
      this.satelliteData = this.generateRandomSatelliteData();
      
      // Update mission days left
      this.updateMissionDaysLeft();

      this.lastUpdateTime = now;
      this.errorCount = 0; // Reset error count on successful update
    } catch (error) {
      console.error('Error updating data:', error);
      this.errorCount++;
      
      if (this.errorCount >= this.MAX_RETRIES) {
        this.isInitialized = false;
      }
    } finally {
      this.updateInProgress = false;
    }
  }

  private updateMissionDaysLeft() {
    const now = new Date();
    this.issMissions = this.issMissions.map(mission => {
      const completionDate = new Date(mission.completionDate);
      const daysLeft = Math.ceil((completionDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      // Update mission status based on dates and days left
      let status = mission.status;
      const startDate = new Date(mission.startDate);
      
      if (now >= startDate && now <= completionDate) {
        status = 'in-progress';
      } else if (now > completionDate) {
        status = 'completed';
      } else {
        status = 'upcoming';
      }

      return {
        ...mission,
        daysLeft: Math.max(0, daysLeft),
        status
      };
    });
  }

  // Public methods
  async loadData(): Promise<void> {
    if (!this.initializationPromise) {
      this.initializationPromise = this.initializeData();
    }
    return this.initializationPromise;
  }

  getLatestSystemStatus(): SystemStatus | null {
    if (!this.isInitialized || this.issData.length === 0) {
      return {
        health: {
          thermal: "Good",
          propulsion: "Operational",
          communication: "Stable",
        },
        power: {
          consumption: 150,
          batteryLevel: 85
        },
        storage: 5000,
        groundStation: "Available"
      };
    }

    try {
      const latest = this.issData[0];
      return {
        health: {
          thermal: "Good",
          propulsion: "Operational",
          communication: "Stable",
        },
        power: {
          consumption: latest.systemStatus.power,
          batteryLevel: latest.systemStatus.lifeSupportSystems
        },
        storage: 5000,
        groundStation: "Available"
      };
    } catch (error) {
      console.error('Error getting system status:', error);
      return null;
    }
  }

  getSystemPerformanceData(): PerformanceData[] {
    if (!this.isInitialized) {
      // Return realistic ISS baseline values
      return [{
        timestamp: new Date().toLocaleTimeString(),
        power: 94.8, // Nominal ISS power consumption
        battery: 96.1, // Typical ISS battery level
        storage: 102.4 // 80% of 128GB total storage
      }];
    }

    try {
      return this.issData.map(data => ({
        timestamp: data.timestamp,
        // Map power between 84-120W nominal range with occasional spikes
        power: Math.min(150, 84 + (data.systemStatus.power / 100) * 36 + (Math.random() > 0.95 ? Math.random() * 30 : 0)),
        // Map battery between 90-100% with emphasis on 95-100% optimal range
        battery: Math.max(90, 95 + (data.systemStatus.lifeSupportSystems / 100) * 5),
        // Map storage between 75-90% of total capacity (128GB) with occasional spikes for data dumps
        storage: Math.min(128, 96 + (data.systemStatus.attitudeControl / 100) * 19.2 + (Math.random() > 0.98 ? Math.random() * 6.4 : 0))
      }));
    } catch (error) {
      console.error('Error getting performance data:', error);
      return [];
    }
  }

  getActiveTasks(): TaskData[] {
    if (!this.isInitialized) {
      return [{
        id: "1",
        name: "System Initialization",
        duration: 60,
        priority: "High",
        status: "Success",
        startTime: Date.now(),
        totalDuration: 60
      }];
    }

    try {
      return Array.from(this.activeTasks.values());
    } catch (error) {
      console.error('Error getting active tasks:', error);
      return [];
    }
  }

  getSatelliteCoordination(): SatelliteData[] {
    if (!this.isInitialized) {
      return [{
        id: "SAT-001",
        groundStation: "GS-ALPHA",
        bandwidth: {
          used: 200,
          available: 500
        },
        status: {
          link: "Available",
          conflict: "No Conflict",
          weather: "Clear"
        },
        priority: "high",
        throughput: 300
      }];
    }

    try {
      return this.satelliteData.map(data => ({
        id: data.satellite_id,
        groundStation: data.ground_station,
        bandwidth: {
          used: data.bandwidth_used_mbps,
          available: data.available_bandwidth_mbps
        },
        status: {
          link: data.inter_satellite_link,
          conflict: data.conflict_status,
          weather: data.weather_condition
        },
        priority: data.priority.toLowerCase(),
        throughput: data.throughput_mbps
      }));
    } catch (error) {
      console.error('Error getting satellite coordination:', error);
      return [];
    }
  }

  startDataGeneration(interval: number = 5000) {
    setInterval(() => {
      // Update ISS data with new values
      this.issData = this.generateRandomCassiniData();
    }, interval);
  }

  getIssMissions(): ISSMission[] {
    return this.issMissions;
  }
}