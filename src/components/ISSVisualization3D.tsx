import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';
import * as satellite from 'satellite.js';
import './animations.css';

interface ISSData {
  latitude: number;
  longitude: number;
  altitude: number;
  velocity: number;
  timestamp: Date;
}

interface ISSVisualization3DProps {
  autoRotate?: boolean;
  showOrbit?: boolean;
}

const ISSVisualization3D: React.FC<ISSVisualization3DProps> = ({
  autoRotate = true,
  showOrbit = true,
}) => {
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [issData, setISSData] = useState<ISSData | null>(null);
  const [orbitPoints, setOrbitPoints] = useState<{ x: number, y: number, z: number }[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // TLE data (will be updated from API)
  const [tleLine1, setTleLine1] = useState('');
  const [tleLine2, setTleLine2] = useState('');

  // Fetch ISS TLE data
  useEffect(() => {
    const fetchTLE = async () => {
      try {
        const response = await fetch('https://api.wheretheiss.at/v1/satellites/25544/tles');
        const data = await response.json();
        setTleLine1(data.line1);
        setTleLine2(data.line2);
      } catch (error) {
        console.error('Error fetching TLE data:', error);
      }
    };

    fetchTLE();
    const interval = setInterval(fetchTLE, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  // Calculate ISS position using TLE data
  useEffect(() => {
    if (!tleLine1 || !tleLine2) return;

    const updateISSPosition = () => {
      const satrec = satellite.twoline2satrec(tleLine1, tleLine2);
      if (!satrec) return;

      const date = new Date();
      const positionAndVelocity = satellite.propagate(satrec, date);
      if (!positionAndVelocity.position || !positionAndVelocity.velocity) return;

      const gmst = satellite.gstime(date);
      const position = satellite.eciToGeodetic(positionAndVelocity.position, gmst);
      
      const velocity = Math.sqrt(
        Math.pow(positionAndVelocity.velocity.x * 60 * 60 * 24, 2) +
        Math.pow(positionAndVelocity.velocity.y * 60 * 60 * 24, 2) +
        Math.pow(positionAndVelocity.velocity.z * 60 * 60 * 24, 2)
      );

      setISSData({
        latitude: satellite.degreesLat(position.latitude),
        longitude: satellite.degreesLong(position.longitude),
        altitude: position.height * 1000, // Convert to meters
        velocity: velocity, // km/s
        timestamp: date
      });

      // Calculate orbit points
      const orbitPoints = [];
      for (let i = 0; i < 360; i += 5) {
        const futureDate = new Date(date.getTime() + i * 60000); // 1 minute steps
        const futurePos = satellite.propagate(satrec, futureDate);
        if (futurePos.position) {
          const futureGmst = satellite.gstime(futureDate);
          const geodetic = satellite.eciToGeodetic(futurePos.position, futureGmst);
          
          // Convert to 3D coordinates
          const radius = 150 + geodetic.height * 50; // Scale altitude
          const lat = satellite.degreesLat(geodetic.latitude);
          const lon = satellite.degreesLong(geodetic.longitude);
          
          const x = radius * Math.cos(lat * Math.PI / 180) * Math.cos(lon * Math.PI / 180);
          const y = radius * Math.sin(lat * Math.PI / 180);
          const z = radius * Math.cos(lat * Math.PI / 180) * Math.sin(lon * Math.PI / 180);
          
          orbitPoints.push({ x, y, z });
        }
      }
      setOrbitPoints(orbitPoints);
    };

    updateISSPosition();
    const interval = setInterval(updateISSPosition, 1000);
    return () => clearInterval(interval);
  }, [tleLine1, tleLine2]);

  // Auto-rotate Earth
  useEffect(() => {
    if (!autoRotate) return;
    
    const interval = setInterval(() => {
      if (!isDragging) {
        setRotation(prev => ({
          ...prev,
          y: (prev.y + 0.2) % 360
        }));
      }
    }, 50);

    return () => clearInterval(interval);
  }, [autoRotate, isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;

    setRotation(prev => ({
      ...prev,
      x: Math.max(-90, Math.min(90, prev.x + deltaY * 0.5)),
      y: (prev.y + deltaX * 0.5) % 360
    }));

    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const renderISS = () => {
    if (!issData) return null;

    const radius = 150 + (issData.altitude / 1000) * 50;
    const lat = issData.latitude * Math.PI / 180;
    const lon = issData.longitude * Math.PI / 180;
    
    const x = radius * Math.cos(lat) * Math.cos(lon);
    const y = radius * Math.sin(lat);
    const z = radius * Math.cos(lat) * Math.sin(lon);

    return (
      <motion.div
        className="absolute cursor-pointer z-50"
        style={{
          left: '50%',
          top: '50%',
          transform: `translate3d(${x}px, ${y}px, ${z}px) translate(-50%, -50%)`,
          transformStyle: 'preserve-3d'
        }}
        whileHover={{ scale: 1.5 }}
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 iss-marker glow hover-scale"
          style={{
            backgroundColor: '#10B981',
            borderColor: '#fff',
            boxShadow: '0 0 20px #10B98140'
          }}
        >
          <Globe className="w-5 h-5 text-white" />
        </div>

        {/* ISS trail */}
        <div
          className="absolute top-1/2 left-1/2 w-1 opacity-50"
          style={{
            height: issData.velocity / 10,
            backgroundColor: '#10B981',
            transform: 'translate(-50%, -100%)',
            background: 'linear-gradient(to bottom, transparent, #10B981)'
          }}
        />
      </motion.div>
    );
  };

  const renderOrbit = () => {
    if (!showOrbit || orbitPoints.length === 0) return null;

    return (
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none orbit-line"
        style={{ transform: 'translate3d(0,0,0)' }}
      >
        <path
          d={`M ${orbitPoints.map((p, i) => 
            `${i === 0 ? 'M' : 'L'} ${p.x + window.innerWidth/2},${p.y + window.innerHeight/2}`
          ).join(' ')}`}
          fill="none"
          stroke="#10B981"
          strokeWidth="2"
          strokeOpacity="0.3"
          strokeDasharray="4 4"
        />
      </svg>
    );
  };

  return (
    <div className="relative w-full h-full bg-gradient-to-b from-gray-900 via-blue-900 to-black overflow-hidden">
      {/* Stars background */}
      <div className="absolute inset-0">
        {Array.from({ length: 200 }, (_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-60 star"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      {/* 3D Container */}
      <div
        ref={containerRef}
        className="absolute inset-0 cursor-grab active:cursor-grabbing"
        style={{
          perspective: '1000px',
          transformStyle: 'preserve-3d'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* 3D Scene */}
        <div
          className="relative w-full h-full"
          style={{
            transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) rotateZ(${rotation.z}deg)`,
            transformStyle: 'preserve-3d',
            transition: isDragging ? 'none' : 'transform 0.1s ease-out'
          }}
        >
          {/* Earth */}
          <div
            className="absolute left-1/2 top-1/2 w-64 h-64 rounded-full bg-blue-500 earth-rotation earth-shadow"
            style={{
              transform: 'translate(-50%, -50%)',
              backgroundImage: 'url(https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Blue_Marble_2002.png/2880px-Blue_Marble_2002.png)',
              backgroundSize: 'cover'
            }}
          />

          {/* Render ISS and Orbit */}
          {renderISS()}
          {renderOrbit()}
        </div>
      </div>

      {/* ISS Information Overlay */}
      {issData && (
        <div className="absolute top-4 left-4 bg-black bg-opacity-50 p-4 rounded-lg text-white info-panel">
          <h3 className="text-lg font-bold mb-2">ISS Position</h3>
          <p>Latitude: {issData.latitude.toFixed(4)}°</p>
          <p>Longitude: {issData.longitude.toFixed(4)}°</p>
          <p>Altitude: {(issData.altitude / 1000).toFixed(2)} km</p>
          <p>Velocity: {issData.velocity.toFixed(2)} km/s</p>
        </div>
      )}
    </div>
  );
};

export default ISSVisualization3D; 