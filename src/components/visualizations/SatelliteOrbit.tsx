import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Globe, Satellite } from 'lucide-react';

// ISS Mission Constants (all distances in kilometers)
const ISS_ORBITAL_PARAMETERS = {
  ALTITUDE: 408, // Average altitude
  ORBITAL_PERIOD: 92.68, // minutes
  VELOCITY: 7.66 // km/s
};

interface ISSState {
  position: {
    latitude: number;
    longitude: number;
    altitude: number;
  };
  velocity: number;
  orbitNumber: number;
  phase: string;
  systemStatus: {
    power: number;
    communication: number;
    lifeSupportSystems: number;
    attitudeControl: number;
  };
}

const SatelliteOrbit: React.FC = () => {
  const [state, setState] = useState<ISSState>({
    position: {
      latitude: 0,
      longitude: 0,
      altitude: ISS_ORBITAL_PARAMETERS.ALTITUDE
    },
    velocity: ISS_ORBITAL_PARAMETERS.VELOCITY,
    orbitNumber: 1,
    phase: "Orbital Operations",
    systemStatus: {
      power: 98,
      communication: 95,
      lifeSupportSystems: 99,
      attitudeControl: 97
    }
  });

  useEffect(() => {
    const fetchISSPosition = async () => {
      try {
        const response = await fetch('https://api.wheretheiss.at/v1/satellites/25544');
        const data = await response.json();
        
        setState(prev => ({
          ...prev,
          position: {
            latitude: data.latitude,
            longitude: data.longitude,
            altitude: data.altitude
        },
          velocity: data.velocity
        }));
      } catch (error) {
        console.error('Error fetching ISS position:', error);
      }
    };

    fetchISSPosition();
    const interval = setInterval(fetchISSPosition, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-full bg-gray-900">
      <div className="absolute top-4 left-4 bg-black bg-opacity-50 p-4 rounded-lg text-white">
        <div className="font-bold mb-2">ISS Status</div>
        <div className="space-y-1">
          <div>Phase: {state.phase}</div>
          <div>Orbit: #{state.orbitNumber}</div>
          <div>Velocity: {state.velocity.toFixed(2)} km/s</div>
          <div>Altitude: {state.position.altitude.toFixed(2)} km</div>
          <div>Latitude: {state.position.latitude.toFixed(4)}°</div>
          <div>Longitude: {state.position.longitude.toFixed(4)}°</div>
        </div>
      </div>

      {/* 3D Visualization */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-96 h-96">
          {/* Earth */}
          <div className="absolute left-1/2 top-1/2 w-64 h-64 rounded-full bg-blue-500 transform -translate-x-1/2 -translate-y-1/2"
            style={{
              backgroundImage: 'url(https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Blue_Marble_2002.png/2880px-Blue_Marble_2002.png)',
              backgroundSize: 'cover'
            }}
          />

          {/* ISS Orbit */}
          <div className="absolute left-1/2 top-1/2 w-80 h-80 rounded-full border border-blue-300 opacity-30 transform -translate-x-1/2 -translate-y-1/2" />

          {/* ISS */}
          <motion.div
            className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"
            animate={{
              x: Math.cos(state.position.longitude * Math.PI / 180) * 160,
              y: Math.sin(state.position.latitude * Math.PI / 180) * 160,
              rotate: state.position.longitude
            }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-4 h-4 bg-white rounded-full shadow-lg" />
          </motion.div>
        </div>
              </div>

      {/* System Status */}
      <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 p-4 rounded-lg text-white">
        <div className="font-bold mb-2">System Status</div>
        <div className="space-y-2">
          {Object.entries(state.systemStatus).map(([system, value]) => (
            <div key={system} className="flex items-center justify-between">
              <span className="capitalize">{system.replace(/([A-Z])/g, ' $1').trim()}</span>
              <div className="ml-4 w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full ${
                    value > 90 ? 'bg-green-500' :
                    value > 70 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${value}%` }}
                />
              </div>
            </div>
          ))}
      </div>
      </div>
    </div>
  );
};

export default SatelliteOrbit;