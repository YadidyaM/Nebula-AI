import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Monitor,
  Users,
  Radio,
  AlertTriangle,
  Activity,
  Target,
  Globe,
  Settings,
  Clock,
  CheckCircle
} from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import ThreeGlobe from 'three-globe';
import * as THREE from 'three';

const Earth = () => {
  const globeRef = useRef<any>();

  useEffect(() => {
    const globe = new ThreeGlobe()
      .globeImageUrl('//unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
      .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
      .atmosphereColor('lightskyblue')
      .atmosphereAltitude(0.15)
      .showGraticules(true)
      .showAtmosphere(true);

    globeRef.current = globe;

    // Add ISS point
    const issPosition = { lat: 0, lng: 0, altitude: 0.1 };
    globe.pointsData([issPosition])
      .pointColor(() => '#00ff00')
      .pointAltitude(0.1)
      .pointRadius(2)
      .pointsMerge(true);

    // Update ISS position every 5 seconds
    const updateISSPosition = async () => {
      try {
        const response = await fetch('https://api.wheretheiss.at/v1/satellites/25544');
        const data = await response.json();
        globe.pointsData([{
          lat: data.latitude,
          lng: data.longitude,
          altitude: 0.1
        }]);
      } catch (error) {
        console.error('Failed to fetch ISS position:', error);
      }
    };

    const interval = setInterval(updateISSPosition, 5000);
    updateISSPosition(); // Initial position update

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <primitive object={globeRef.current || new THREE.Object3D()} />
  );
};

const MissionControlCenter: React.FC = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Main visualization area */}
      <div className="flex-1 relative">
        <Canvas
          camera={{ position: [0, 0, 200], fov: 75 }}
          style={{ background: 'black' }}
        >
          <ambientLight intensity={0.6} />
          <directionalLight position={[1, 1, 1]} intensity={1} />
          <Earth />
          <OrbitControls
            enableDamping
            dampingFactor={0.05}
            rotateSpeed={0.5}
            minDistance={120}
            maxDistance={500}
          />
        </Canvas>
            </div>
            
      {/* Quick Actions Panel */}
      <div className="absolute top-4 right-4 bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-lg p-4 w-64 z-20">
        <h3 className="text-white font-bold mb-3 flex items-center">
          <Settings className="w-5 h-5 mr-2 text-blue-400" />
          Quick Actions
        </h3>
        <div className="space-y-2">
          <button className="w-full flex items-center justify-between p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
            <span className="text-sm text-white">Track ISS</span>
            <Target className="w-4 h-4 text-cyan-400" />
          </button>
          <button className="w-full flex items-center justify-between p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
            <span className="text-sm text-white">System Status</span>
            <Activity className="w-4 h-4 text-green-400" />
            </button>
          <button className="w-full flex items-center justify-between p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
            <span className="text-sm text-white">Communications</span>
            <Radio className="w-4 h-4 text-yellow-400" />
            </button>
        </div>
      </div>

      {/* System Status */}
      <div className="absolute bottom-4 left-4 bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-lg p-4 z-20">
                            <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-white">ISS Tracking Active</span>
        </div>
      </div>
    </div>
  );
};

export default MissionControlCenter; 