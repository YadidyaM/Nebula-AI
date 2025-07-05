import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Line } from '@react-three/drei';
import * as THREE from 'three';

interface OrbitVisualizerProps {
  satellites: Array<{
    id: number;
    name: string;
    position: {
      satlatitude: number;
      satlongitude: number;
      sataltitude: number;
    };
    category: string;
  }>;
  centerSatellite?: number;
}

function Earth() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial 
        color="#4A90E2" 
        roughness={0.8}
        metalness={0.2}
      />
      {/* Atmosphere */}
      <mesh scale={1.05}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial 
          color="#87CEEB" 
          transparent 
          opacity={0.1}
        />
      </mesh>
    </mesh>
  );
}

function SatelliteMarker({ 
  position, 
  name, 
  category, 
  isSelected = false 
}: { 
  position: [number, number, number]; 
  name: string; 
  category: string;
  isSelected?: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (meshRef.current && isSelected) {
      meshRef.current.rotation.y += 0.05;
    }
  });

  const getColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'starlink': return '#60A5FA';
      case 'iss': return '#10B981';
      case 'gps': return '#F59E0B';
      case 'weather': return '#8B5CF6';
      default: return '#9CA3AF';
    }
  };

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <boxGeometry args={isSelected ? [0.08, 0.08, 0.08] : [0.04, 0.04, 0.04]} />
        <meshStandardMaterial 
          color={getColor(category)} 
          emissive={getColor(category)}
          emissiveIntensity={isSelected ? 0.5 : 0.2}
        />
      </mesh>
      {isSelected && (
        <Text
          position={[0, 0.2, 0]}
          fontSize={0.1}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {name}
        </Text>
      )}
    </group>
  );
}

function OrbitPath({ satellites }: { satellites: any[] }) {
  const points = satellites.map(sat => {
    // Convert lat/lng/alt to 3D coordinates
    const lat = (sat.position.satlatitude * Math.PI) / 180;
    const lng = (sat.position.satlongitude * Math.PI) / 180;
    const radius = 1 + (sat.position.sataltitude / 6371) * 0.5; // Scale altitude
    
    const x = radius * Math.cos(lat) * Math.cos(lng);
    const y = radius * Math.sin(lat);
    const z = radius * Math.cos(lat) * Math.sin(lng);
    
    return new THREE.Vector3(x, y, z);
  });

  if (points.length < 2) return null;

  return (
    <Line
      points={points}
      color="#00D4FF"
      transparent
      opacity={0.6}
      lineWidth={2}
    />
  );
}

const SatelliteOrbitVisualizer: React.FC<OrbitVisualizerProps> = ({ 
  satellites, 
  centerSatellite 
}) => {
  const [selectedSatellite, setSelectedSatellite] = useState<number | null>(centerSatellite || null);

  const convertToCartesian = (lat: number, lng: number, alt: number) => {
    const latRad = (lat * Math.PI) / 180;
    const lngRad = (lng * Math.PI) / 180;
    const radius = 1 + (alt / 6371) * 0.5; // Scale altitude relative to Earth radius
    
    const x = radius * Math.cos(latRad) * Math.cos(lngRad);
    const y = radius * Math.sin(latRad);
    const z = radius * Math.cos(latRad) * Math.sin(lngRad);
    
    return [x, y, z] as [number, number, number];
  };

  return (
    <div className="w-full h-96 bg-slate-900/50 rounded-xl border border-slate-700/50 overflow-hidden">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        
        <Earth />
        
        {satellites.map((sat) => (
          <SatelliteMarker
            key={sat.id}
            position={convertToCartesian(
              sat.position.satlatitude,
              sat.position.satlongitude,
              sat.position.sataltitude
            )}
            name={sat.name}
            category={sat.category}
            isSelected={selectedSatellite === sat.id}
          />
        ))}
        
        <OrbitPath satellites={satellites} />
        
        <OrbitControls 
          enableZoom={true}
          enablePan={true}
          enableRotate={true}
          autoRotate={true}
          autoRotateSpeed={0.5}
        />
      </Canvas>
      
      {/* Satellite List Overlay */}
      <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur rounded-lg p-3 max-w-xs">
        <h4 className="text-sm font-semibold text-cyan-400 mb-2">Tracked Objects</h4>
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {satellites.map((sat) => (
            <button
              key={sat.id}
              onClick={() => setSelectedSatellite(selectedSatellite === sat.id ? null : sat.id)}
              className={`w-full text-left px-2 py-1 rounded text-xs transition-colors ${
                selectedSatellite === sat.id
                  ? 'bg-cyan-600 text-white'
                  : 'hover:bg-slate-700 text-slate-300'
              }`}
            >
              <div className="font-mono">{sat.name}</div>
              <div className="text-slate-400">Alt: {sat.position.sataltitude.toFixed(0)}km</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SatelliteOrbitVisualizer; 