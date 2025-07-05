import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

interface ISSPosition {
  latitude: number;
  longitude: number;
  altitude: number;
  velocity: number;
}

interface SatelliteVisualization3DProps {
  showOrbit?: boolean;
  autoRotate?: boolean;
}

const EARTH_RADIUS = 5;
const KM_TO_SCENE_UNITS = EARTH_RADIUS / 6371; // Earth's radius in km
const ISS_BASE_SCALE = 0.3;
const UPDATE_INTERVAL = 2000; // Update every 2 seconds

const SatelliteVisualization3D: React.FC<SatelliteVisualization3DProps> = ({
  showOrbit = false,
  autoRotate = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const earthRef = useRef<THREE.Mesh | null>(null);
  const issRef = useRef<THREE.Group | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());
  const orbitRef = useRef<THREE.Line | null>(null);
  
  // State for ISS position and UI
  const [issPosition, setIssPosition] = useState<ISSPosition>({
    latitude: 32.4829,
    longitude: -91.5234,
    altitude: 408.00,
    velocity: 7.66,
  });
  const [showPopup, setShowPopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch ISS position directly from wheretheiss.at API
  useEffect(() => {
    const updateISSPosition = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('https://api.wheretheiss.at/v1/satellites/25544');
        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }
        
        const data = await response.json();
        setIssPosition({
          latitude: data.latitude,
          longitude: data.longitude,
          altitude: data.altitude,
          velocity: data.velocity,
        });
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching ISS position:', error);
        setError('Failed to update ISS position');
        setIsLoading(false);
      }
    };

    updateISSPosition();
    const interval = setInterval(updateISSPosition, UPDATE_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  // Handle mouse click
  const handleClick = (event: MouseEvent) => {
    if (!containerRef.current || !cameraRef.current || !sceneRef.current || !issRef.current) return;

    // Calculate mouse position in normalized device coordinates (-1 to +1)
    const rect = containerRef.current.getBoundingClientRect();
    mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // Update the picking ray with the camera and mouse position
    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);

    // Calculate objects intersecting the picking ray
    const intersects = raycasterRef.current.intersectObject(issRef.current, true);

    if (intersects.length > 0) {
      // Show popup at click position
      setPopupPosition({ x: event.clientX, y: event.clientY });
      setShowPopup(true);
    } else {
      setShowPopup(false);
    }
  };

  // Close popup when clicking outside
  const handleClickOutside = (event: MouseEvent) => {
    if (!event.target || !(event.target as Element).closest('.iss-info-popup')) {
      setShowPopup(false);
    }
  };

  // Add click handlers
  useEffect(() => {
    window.addEventListener('click', handleClick);
    window.addEventListener('click', handleClickOutside);
    return () => {
      window.removeEventListener('click', handleClick);
      window.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // Helper function to convert lat/lon to 3D position with precise calculations
  const latLonToPosition = (lat: number, lon: number, altitude: number): THREE.Vector3 => {
    // Convert to radians
    const latRad = lat * (Math.PI / 180);
    const lonRad = -lon * (Math.PI / 180); // Negative longitude for correct East/West orientation
    
    // Calculate radius including altitude
    const radius = EARTH_RADIUS + (altitude * KM_TO_SCENE_UNITS);
    
    // Convert to Cartesian coordinates
    // X: East(+)/West(-)
    // Y: Up(+)/Down(-)
    // Z: North(+)/South(-)
    return new THREE.Vector3(
      radius * Math.cos(latRad) * Math.cos(lonRad),
      radius * Math.sin(latRad),
      radius * Math.cos(latRad) * Math.sin(lonRad)
    );
  };

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera setup with wider field of view
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.position.set(15, 15, 15);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(400, 400);
    renderer.setClearColor(0x000000, 0);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controls setup
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controlsRef.current = controls;

    // Earth setup
    const earthGeometry = new THREE.SphereGeometry(EARTH_RADIUS, 64, 64);
    const earthTexture = new THREE.TextureLoader().load('/earth_texture.jpg');
    const earthMaterial = new THREE.MeshPhongMaterial({ 
      map: earthTexture,
      bumpScale: 0.05,
    });
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earth);
    earthRef.current = earth;

    // Add coordinate system helper (for debugging)
    const axesHelper = new THREE.AxesHelper(EARTH_RADIUS * 1.5);
    scene.add(axesHelper);

    // Add grid helper for latitude/longitude reference
    const gridHelper = new THREE.GridHelper(EARTH_RADIUS * 2, 36);
    gridHelper.rotation.x = Math.PI / 2;
    scene.add(gridHelper);

    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 3, 5);
    scene.add(directionalLight);

    // Create ISS representation
    const issGroup = new THREE.Group();
    
    // Main body
    const bodyGeometry = new THREE.BoxGeometry(1.5, 0.4, 0.4);
    const bodyMaterial = new THREE.MeshPhongMaterial({
      color: 0xdddddd,
      specular: 0x111111,
      shininess: 100
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    issGroup.add(body);

    // Solar panels
    const panelGeometry = new THREE.BoxGeometry(2, 1, 0.05);
    const panelMaterial = new THREE.MeshPhongMaterial({
      color: 0x2244ff,
      specular: 0x222222,
      shininess: 100
    });

    const leftPanel = new THREE.Mesh(panelGeometry, panelMaterial);
    leftPanel.position.set(-1.25, 0, 0);
    issGroup.add(leftPanel);

    const rightPanel = new THREE.Mesh(panelGeometry, panelMaterial);
    rightPanel.position.set(1.25, 0, 0);
    issGroup.add(rightPanel);

    // Scale the ISS
    issGroup.scale.set(ISS_BASE_SCALE, ISS_BASE_SCALE, ISS_BASE_SCALE);

    // Set initial position
    const initialPos = latLonToPosition(
      issPosition.latitude,
      issPosition.longitude,
      issPosition.altitude
    );
    issGroup.position.copy(initialPos);
    
    scene.add(issGroup);
    issRef.current = issGroup;

    // Debug sphere at exact coordinates
    const debugGeometry = new THREE.SphereGeometry(0.1, 16, 16);
    const debugMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const debugSphere = new THREE.Mesh(debugGeometry, debugMaterial);
    debugSphere.position.copy(initialPos);
    scene.add(debugSphere);

    // Add orbit line if showOrbit is true
    if (showOrbit) {
      const orbitGeometry = new THREE.BufferGeometry();
      const orbitPoints = [];
      const segments = 128;
      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        orbitPoints.push(
          Math.cos(theta) * 5,
          0,
          Math.sin(theta) * 5
        );
      }
      orbitGeometry.setAttribute('position', new THREE.Float32BufferAttribute(orbitPoints, 3));
      const orbitMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00 });
      const orbit = new THREE.Line(orbitGeometry, orbitMaterial);
      scene.add(orbit);
      orbitRef.current = orbit;
    }

    // Enable auto-rotation if specified
    if (controlsRef.current && autoRotate) {
      controlsRef.current.autoRotate = true;
      controlsRef.current.autoRotateSpeed = 2.0;
    }

    // Animation loop
    const animate = () => {
      if (issRef.current) {
        // Update ISS position
        const pos = latLonToPosition(
          issPosition.latitude,
          issPosition.longitude,
          issPosition.altitude
        );
        issRef.current.position.copy(pos);
        
        // Orient ISS to face the direction of travel
        issRef.current.lookAt(0, 0, 0);
        issRef.current.rotateX(Math.PI / 2);
      }

      // Update controls
      if (controlsRef.current) {
        controlsRef.current.update();
      }

      // Render
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }

      requestAnimationFrame(animate);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      if (containerRef.current && rendererRef.current && cameraRef.current) {
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;
        
        rendererRef.current.setSize(width, height);
        cameraRef.current.aspect = width / height;
        cameraRef.current.updateProjectionMatrix();
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (containerRef.current && rendererRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
    };
  }, [showOrbit, autoRotate]);

  return (
    <>
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: '100%',
          aspectRatio: '1',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '8px',
          overflow: 'hidden',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
          backgroundColor: '#000',
          position: 'absolute',
          left: '0',
          top: '0',
          right: '0',
          bottom: '0',
          margin: 'auto',
          zIndex: 10
        }}
      />
      {showPopup && (
        <div 
          className="iss-info-popup"
          style={{
            position: 'fixed',
            left: popupPosition.x + 10,
            top: popupPosition.y + 10,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            padding: '12px',
            color: 'white',
            fontSize: '14px',
            zIndex: 100,
            minWidth: '200px',
            backdropFilter: 'blur(4px)',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
          }}
        >
          <h3 style={{ margin: '0 0 8px 0', color: '#00ff00' }}>ISS Status</h3>
          <div style={{ marginBottom: '4px' }}>
            <strong>Latitude:</strong> {issPosition.latitude.toFixed(4)}°
            </div>
          <div style={{ marginBottom: '4px' }}>
            <strong>Longitude:</strong> {issPosition.longitude.toFixed(4)}°
          </div>
          <div style={{ marginBottom: '4px' }}>
            <strong>Altitude:</strong> {issPosition.altitude.toFixed(2)} km
          </div>
          <div style={{ marginBottom: '4px' }}>
            <strong>Velocity:</strong> {issPosition.velocity.toFixed(2)} km/s
        </div>
          {isLoading && (
            <div style={{ marginTop: '8px', color: '#888' }}>
              Updating...
            </div>
          )}
          {error && (
            <div style={{ marginTop: '8px', color: '#ff4444' }}>
              {error}
            </div>
          )}
          <div style={{ marginTop: '8px', fontSize: '12px', color: '#888' }}>
            Click anywhere to close
            </div>
        </div>
      )}
      {/* Loading indicator */}
      {isLoading && !showPopup && (
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          color: '#00ff00',
          padding: '8px',
          borderRadius: '4px',
          fontSize: '12px'
        }}>
          Updating ISS position...
      </div>
      )}
      {/* Error indicator */}
      {error && !showPopup && (
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          backgroundColor: 'rgba(255, 0, 0, 0.2)',
          color: '#ff4444',
          padding: '8px',
          borderRadius: '4px',
          fontSize: '12px'
        }}>
          {error}
      </div>
      )}
    </>
  );
};

export default SatelliteVisualization3D; 