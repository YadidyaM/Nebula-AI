export interface MissionData {
  id: string;
  timestamp: string;
  status: 'nominal' | 'warning' | 'critical';
  subsystems: {
    propulsion: number;
    power: number;
    communication: number;
    payload: number;
  };
  nextTask: string;
  location: {
    latitude: number;
    longitude: number;
  };
  resourceUsage: {
    power: number;
    bandwidth: number;
    storage: number;
  };
}