// Satellite Tracking Service using N2YO API
// Provides real-time satellite tracking, collision detection, and pass predictions

export interface SatelliteData {
  satid: number;
  satname: string;
  transactionscount: number;
}

export interface SatellitePosition {
  satlatitude: number;
  satlongitude: number;
  sataltitude: number;
  azimuth: number;
  elevation: number;
  ra: number;
  dec: number;
  timestamp: number;
}

export interface VisualPass {
  startAz: number;
  startAzCompass: string;
  startEl: number;
  startUTC: number;
  maxAz: number;
  maxAzCompass: string;
  maxEl: number;
  maxUTC: number;
  endAz: number;
  endAzCompass: string;
  endEl: number;
  endUTC: number;
  mag: number;
  duration: number;
}

export interface TLEData {
  satid: number;
  satname: string;
  transactionscount: number;
  tle: string;
}

export interface SatelliteAbove {
  satid: number;
  satname: string;
  intDesignator: string;
  launchDate: string;
  satlat: number;
  satlng: number;
  satalt: number;
}

export interface CollisionAlert {
  satellite1: string;
  satellite2: string;
  distance: number;
  closestApproach: number;
  timestamp: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

// Satellite categories from N2YO
export const SATELLITE_CATEGORIES = {
  AMATEUR_RADIO: 18,
  BRIGHTEST: 1,
  CUBESATS: 32,
  DISASTER_MONITORING: 8,
  EARTH_RESOURCES: 6,
  EDUCATION: 29,
  ENGINEERING: 28,
  EXPERIMENTAL: 19,
  GPS_CONSTELLATION: 50,
  GPS_OPERATIONAL: 20,
  GLOBALSTAR: 17,
  GLONASS_CONSTELLATION: 51,
  GLONASS_OPERATIONAL: 21,
  GOES: 5,
  INTELSAT: 11,
  IRIDIUM: 15,
  ISS: 2,
  MILITARY: 30,
  MOLNIYA: 14,
  NOAA: 4,
  ORBCOMM: 16,
  STARLINK: 52,
  WEATHER: 3,
  ALL: 0
};

class SatelliteTracker {
  private apiKey: string;
  private baseUrl = 'http://localhost:3000/api/satellite';
  private cache = new Map<string, { data: any; timestamp: number }>();
  private cacheTimeout = 60000; // 1 minute cache
  private observers: Array<(data: any) => void> = [];
  private collisionThreshold = 10; // km

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  // Subscribe to real-time updates
  subscribe(callback: (data: any) => void) {
    this.observers.push(callback);
  }

  // Notify all observers
  private notify(data: any) {
    this.observers.forEach(callback => callback(data));
  }

  // Check cache validity
  private isValidCache(key: string): boolean {
    const cached = this.cache.get(key);
    if (!cached) return false;
    return Date.now() - cached.timestamp < this.cacheTimeout;
  }

  // Make API request with caching via backend proxy
  private async makeRequest(endpoint: string, params: Record<string, any> = {}): Promise<any> {
    const cacheKey = `${endpoint}_${JSON.stringify(params)}`;
    
    if (this.isValidCache(cacheKey)) {
      return this.cache.get(cacheKey)!.data;
    }

    try {
      // Use backend proxy instead of direct N2YO API calls
      const response = await fetch(`${this.baseUrl}${endpoint}`);
      if (!response.ok) {
        throw new Error(`Backend API Error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      this.cache.set(cacheKey, { data, timestamp: Date.now() });
      
      return data;
    } catch (error) {
      console.error('Satellite tracking API error:', error);
      throw error;
    }
  }

  // Get Two Line Element data for a satellite
  async getTLE(satelliteId: number): Promise<TLEData> {
    const data = await this.makeRequest(`/tle/${satelliteId}`);
    this.notify({ type: 'tle', data });
    return data;
  }

  // Get satellite positions (real-time tracking)
  async getPositions(
    satelliteId: number,
    observerLat: number,
    observerLng: number,
    observerAlt: number,
    seconds: number = 300
  ): Promise<{ info: SatelliteData; positions: SatellitePosition[] }> {
    const data = await this.makeRequest(
      `/positions/${satelliteId}/${observerLat}/${observerLng}/${observerAlt}/${seconds}`
    );
    this.notify({ type: 'positions', data });
    return data;
  }

  // Get visual passes for satellite observation
  async getVisualPasses(
    satelliteId: number,
    observerLat: number,
    observerLng: number,
    observerAlt: number,
    days: number = 10,
    minVisibility: number = 300
  ): Promise<{ info: SatelliteData; passes: VisualPass[] }> {
    const data = await this.makeRequest(
      `/visualpasses/${satelliteId}/${observerLat}/${observerLng}/${observerAlt}/${days}/${minVisibility}`
    );
    this.notify({ type: 'visualPasses', data });
    return data;
  }

  // Get radio passes for amateur radio communication
  async getRadioPasses(
    satelliteId: number,
    observerLat: number,
    observerLng: number,
    observerAlt: number,
    days: number = 10,
    minElevation: number = 40
  ): Promise<{ info: SatelliteData; passes: VisualPass[] }> {
    const data = await this.makeRequest(
      `/radiopasses/${satelliteId}/${observerLat}/${observerLng}/${observerAlt}/${days}/${minElevation}`
    );
    this.notify({ type: 'radioPasses', data });
    return data;
  }

  // Get satellites above a location
  async getSatellitesAbove(
    observerLat: number,
    observerLng: number,
    observerAlt: number,
    searchRadius: number = 70,
    categoryId: number = SATELLITE_CATEGORIES.ALL
  ): Promise<{ info: { category: string; satcount: number }; above: SatelliteAbove[] }> {
    const data = await this.makeRequest(
      `/above/${observerLat}/${observerLng}/${observerAlt}/${searchRadius}/${categoryId}`
    );
    this.notify({ type: 'satellitesAbove', data });
    return data;
  }

  // Track ISS with enhanced details
  async trackISS(
    observerLat: number,
    observerLng: number,
    observerAlt: number = 0
  ): Promise<{
    position: SatellitePosition[];
    nextPass: VisualPass | null;
    currentPosition: SatellitePosition | null;
  }> {
    const issId = 25544; // ISS NORAD ID
    
    try {
      // Get current position
      const positionData = await this.getPositions(issId, observerLat, observerLng, observerAlt, 1);
      const currentPosition = positionData.positions[0] || null;

      // Get next visible pass
      const passData = await this.getVisualPasses(issId, observerLat, observerLng, observerAlt, 3, 60);
      const nextPass = passData.passes[0] || null;

      // Get extended position data for trajectory
      const extendedData = await this.getPositions(issId, observerLat, observerLng, observerAlt, 300);

      const result = {
        position: extendedData.positions,
        nextPass,
        currentPosition
      };

      this.notify({ type: 'issTracking', data: result });
      return result;
    } catch (error) {
      console.error('ISS tracking error:', error);
      throw error;
    }
  }

  // Collision detection and avoidance alerts
  async detectCollisions(
    observerLat: number,
    observerLng: number,
    observerAlt: number = 0,
    searchRadius: number = 90
  ): Promise<CollisionAlert[]> {
    try {
      const satellitesData = await this.getSatellitesAbove(
        observerLat, observerLng, observerAlt, searchRadius, SATELLITE_CATEGORIES.ALL
      );

      const alerts: CollisionAlert[] = [];
      const satellites = satellitesData.above;

      // Check for potential collisions between satellites
      for (let i = 0; i < satellites.length; i++) {
        for (let j = i + 1; j < satellites.length; j++) {
          const sat1 = satellites[i];
          const sat2 = satellites[j];

          // Calculate distance between satellites
          const distance = this.calculateDistance(
            sat1.satlat, sat1.satlng, sat1.satalt,
            sat2.satlat, sat2.satlng, sat2.satalt
          );

          if (distance < this.collisionThreshold) {
            const riskLevel = this.assessRiskLevel(distance);
            
            alerts.push({
              satellite1: sat1.satname,
              satellite2: sat2.satname,
              distance,
              closestApproach: distance,
              timestamp: Date.now(),
              riskLevel
            });
          }
        }
      }

      if (alerts.length > 0) {
        this.notify({ type: 'collisionAlerts', data: alerts });
      }

      return alerts;
    } catch (error) {
      console.error('Collision detection error:', error);
      return [];
    }
  }

  // Calculate 3D distance between two satellites
  private calculateDistance(
    lat1: number, lng1: number, alt1: number,
    lat2: number, lng2: number, alt2: number
  ): number {
    const R = 6371; // Earth radius in km
    
    // Convert to radians
    const lat1Rad = lat1 * Math.PI / 180;
    const lat2Rad = lat2 * Math.PI / 180;
    const deltaLat = (lat2 - lat1) * Math.PI / 180;
    const deltaLng = (lng2 - lng1) * Math.PI / 180;

    // Haversine formula for surface distance
    const a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
              Math.cos(lat1Rad) * Math.cos(lat2Rad) *
              Math.sin(deltaLng/2) * Math.sin(deltaLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const surfaceDistance = R * c;

    // 3D distance considering altitude
    const altDiff = Math.abs(alt1 - alt2);
    return Math.sqrt(surfaceDistance * surfaceDistance + altDiff * altDiff);
  }

  // Assess collision risk level
  private assessRiskLevel(distance: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    if (distance < 1) return 'CRITICAL';
    if (distance < 3) return 'HIGH';
    if (distance < 7) return 'MEDIUM';
    return 'LOW';
  }

  // Get satellites by category with details
  async getSatellitesByCategory(
    categoryId: number,
    observerLat: number,
    observerLng: number,
    observerAlt: number = 0
  ): Promise<SatelliteAbove[]> {
    const data = await this.getSatellitesAbove(observerLat, observerLng, observerAlt, 90, categoryId);
    return data.above;
  }

  // Start real-time tracking session
  async startRealTimeTracking(
    satelliteIds: number[],
    observerLat: number,
    observerLng: number,
    observerAlt: number = 0,
    interval: number = 30000 // 30 seconds
  ): Promise<() => void> {
    const trackingInterval = setInterval(async () => {
      try {
        for (const satelliteId of satelliteIds) {
          await this.getPositions(satelliteId, observerLat, observerLng, observerAlt, 1);
        }
        
        // Check for collisions
        await this.detectCollisions(observerLat, observerLng, observerAlt);
      } catch (error) {
        console.error('Real-time tracking error:', error);
      }
    }, interval);

    // Return stop function
    return () => clearInterval(trackingInterval);
  }

  // Get tracking statistics
  getTrackingStats(): { 
    cacheSize: number; 
    activeObservers: number; 
    apiCalls: number; 
  } {
    return {
      cacheSize: this.cache.size,
      activeObservers: this.observers.length,
      apiCalls: Array.from(this.cache.values()).length
    };
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear();
  }
}

export default SatelliteTracker; 