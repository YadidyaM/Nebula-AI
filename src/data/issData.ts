export interface ISSTrackingData {
  id: string;
  timestamp: string;
  phase: string;
  orbitNumber: number;
  velocity: number; // km/s
  distance: number; // km
  coordinates: {
    latitude: number;
    longitude: number;
    altitude: number; // km
  };
  systemStatus: {
    power: number;
    communication: number;
    lifeSupportSystems: number;
    attitudeControl: number;
  };
  timeScale: {
    realTimeRatio: number; // 1 second = X seconds real time
    orbitalPeriod: number; // minutes
  };
}

export const issInitialData: ISSTrackingData = {
  id: "ISS-001",
  timestamp: new Date().toISOString(),
  phase: "Orbital Operations",
  orbitNumber: 1,
  velocity: 7.66, // Average ISS velocity
  distance: 408, // Average ISS altitude
  coordinates: {
    latitude: 0,
    longitude: 0,
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
    orbitalPeriod: 92.68 // ISS orbital period in minutes
  }
}; 