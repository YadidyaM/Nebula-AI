import { ISSTrackingData } from './issData';

export const issMissionData: ISSTrackingData[] = [
  {
    id: "ISS-001",
    timestamp: new Date().toISOString(),
    phase: "Orbital Operations",
    orbitNumber: 1,
    velocity: 7.66,
    distance: 408,
    coordinates: {
      latitude: 45.5,
      longitude: -122.6,
      altitude: 408
    },
    systemStatus: {
      power: 98,
      communication: 95,
      lifeSupportSystems: 99,
      attitudeControl: 97
    },
    timeScale: {
      realTimeRatio: 1,
      orbitalPeriod: 92.68
    }
  }
];

export const satelliteCoordinationData = [
  {
    id: "SAT-001",
    timestamp: "2024-03-10T10:00:00Z",
    status: "nominal",
    groundStation: "GS-ALPHA",
    bandwidth: 85,
    nextDownlink: "2024-03-10T12:00:00Z",
    priority: "high",
    dataQueue: 256 // MB
  },
  // Add more mock data as needed
];