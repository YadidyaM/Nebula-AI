// N2YO API Client for Real-Time Satellite Tracking
// Professional satellite tracking and orbital prediction system

interface N2YOAPIConfig {
  apiKey: string;
  baseURL: string;
  endpoints: {
    [key: string]: string;
  };
}

interface SatellitePosition {
  satlatitude: number;
  satlongitude: number;
  sataltitude: number;
  azimuth: number;
  elevation: number;
  ra: number;
  dec: number;
  timestamp: number;
}

interface SatelliteInfo {
  satid: number;
  satname: string;
  intDesignator?: string;
  launchDate?: string;
  satlat?: number;
  satlng?: number;
  satalt?: number;
}

interface APIResponse {
  success: boolean;
  data?: any;
  error?: string;
  timestamp: Date;
  endpoint: string;
  requestsRemaining?: number;
}

export class N2YOAPIClient {
  private config: N2YOAPIConfig;
  private requestCount: number = 0;
  private lastRequestTime: number = 0;
  private dailyRequestLimit: number = 1000;

  constructor(apiKey: string) {
    this.config = {
      apiKey,
      baseURL: 'https://api.n2yo.com/rest/v1/satellite',
      endpoints: {
        // Satellite positions
        positions: '/positions/{id}/{observer_lat}/{observer_lng}/{observer_alt}/{seconds}',
        
        // Visual passes
        visualPasses: '/visualpasses/{id}/{observer_lat}/{observer_lng}/{observer_alt}/{days}/{min_visibility}',
        
        // Radio passes
        radioPasses: '/radiopasses/{id}/{observer_lat}/{observer_lng}/{observer_alt}/{days}/{min_elevation}',
        
        // Above location
        above: '/above/{observer_lat}/{observer_lng}/{observer_alt}/{search_radius}/{category_id}',
        
        // TLE (Two Line Element)
        tle: '/tle/{id}',
        
        // Satellite info
        info: '/info/{id}',
        
        // Category
        category: '/category/{category_id}',
        
        // Search by name
        search: '/search/{search_name}',
        
        // Upcoming launches
        launches: '/launches/{start}/{end}',
        
        // Solar activity
        solar: '/solar'
      }
    };
  }

  private async makeRequest(endpoint: string, retries: number = 3): Promise<APIResponse> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        // Rate limiting (1000 requests per day)
        const now = Date.now();
        if (now - this.lastRequestTime < 86400000 / this.dailyRequestLimit) { // 86.4 seconds between requests
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        this.lastRequestTime = now;
        this.requestCount++;

        console.log(`🛰️ N2YO API Request (attempt ${attempt}): ${endpoint}`);
        
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Nebula-AI-Mission-Control/1.0'
          }
        });

        if (!response.ok) {
          if (response.status === 429) {
            // Rate limit exceeded, wait and retry
            if (attempt < retries) {
              console.log(`⏳ Rate limit exceeded, waiting before retry ${attempt + 1}...`);
              await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
              continue;
            }
          }
          throw new Error(`N2YO API Error: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();

        // Check for API-specific errors
        if (data.error) {
          throw new Error(`N2YO API Error: ${data.error}`);
        }

        return {
          success: true,
          data,
          timestamp: new Date(),
          endpoint: endpoint.split('?')[0],
          requestsRemaining: this.dailyRequestLimit - (this.requestCount % this.dailyRequestLimit)
        };

      } catch (error) {
        if (attempt === retries) {
          console.error(`❌ N2YO API Error after ${retries} attempts:`, error);
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date(),
            endpoint: endpoint.split('?')[0]
          };
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }

    // This should never be reached, but TypeScript requires it
    return {
      success: false,
      error: 'Maximum retries exceeded',
      timestamp: new Date(),
      endpoint: endpoint.split('?')[0]
    };
  }

  private buildURL(template: string, params: Record<string, any>): string {
    let url = this.config.baseURL + template;
    
    // Replace path parameters
    Object.entries(params).forEach(([key, value]) => {
      url = url.replace(`{${key}}`, encodeURIComponent(value.toString()));
    });
    
    // Add API key (first and only query parameter)
    url += `?apiKey=${this.config.apiKey}`;
    
    return url;
  }

  // Get real-time satellite positions
  async getSatellitePositions(
    satelliteId: number, 
    observerLat: number, 
    observerLng: number, 
    observerAlt: number = 0, 
    seconds: number = 300
  ): Promise<APIResponse> {
    const url = this.buildURL(this.config.endpoints.positions, {
      id: satelliteId,
      observer_lat: observerLat,
      observer_lng: observerLng,
      observer_alt: observerAlt,
      seconds: seconds
    });
    
    return this.makeRequest(url);
  }

  // Get ISS position (ISS NORAD ID: 25544)
  async getISSPosition(observerLat: number = 0, observerLng: number = 0, observerAlt: number = 0): Promise<APIResponse> {
    return this.getSatellitePositions(25544, observerLat, observerLng, observerAlt, 1);
  }

  // Get visual passes for a satellite
  async getVisualPasses(
    satelliteId: number,
    observerLat: number,
    observerLng: number,
    observerAlt: number = 0,
    days: number = 10,
    minVisibility: number = 300
  ): Promise<APIResponse> {
    const url = this.buildURL(this.config.endpoints.visualPasses, {
      id: satelliteId,
      observer_lat: observerLat,
      observer_lng: observerLng,
      observer_alt: observerAlt,
      days: days,
      min_visibility: minVisibility
    });
    
    return this.makeRequest(url);
  }

  // Get ISS visual passes
  async getISSVisualPasses(observerLat: number, observerLng: number, observerAlt: number = 0, days: number = 10): Promise<APIResponse> {
    return this.getVisualPasses(25544, observerLat, observerLng, observerAlt, days);
  }

  // Get radio passes for a satellite
  async getRadioPasses(
    satelliteId: number,
    observerLat: number,
    observerLng: number,
    observerAlt: number = 0,
    days: number = 10,
    minElevation: number = 0
  ): Promise<APIResponse> {
    const url = this.buildURL(this.config.endpoints.radioPasses, {
      id: satelliteId,
      observer_lat: observerLat,
      observer_lng: observerLng,
      observer_alt: observerAlt,
      days: days,
      min_elevation: minElevation
    });
    
    return this.makeRequest(url);
  }

  // Get satellites above a location
  async getSatellitesAbove(
    observerLat: number,
    observerLng: number,
    observerAlt: number = 0,
    searchRadius: number = 70,
    categoryId: number = 0
  ): Promise<APIResponse> {
    const url = this.buildURL(this.config.endpoints.above, {
      observer_lat: observerLat,
      observer_lng: observerLng,
      observer_alt: observerAlt,
      search_radius: searchRadius,
      category_id: categoryId
    });
    
    return this.makeRequest(url);
  }

  // Get TLE (Two Line Element) data for a satellite
  async getTLE(satelliteId: number): Promise<APIResponse> {
    const url = this.buildURL(this.config.endpoints.tle, {
      id: satelliteId
    });
    
    return this.makeRequest(url);
  }

  // Get satellite information
  async getSatelliteInfo(satelliteId: number): Promise<APIResponse> {
    const url = this.buildURL(this.config.endpoints.info, {
      id: satelliteId
    });
    
    return this.makeRequest(url);
  }

  // Get satellites by category
  async getSatellitesByCategory(categoryId: number): Promise<APIResponse> {
    const url = this.buildURL(this.config.endpoints.category, {
      category_id: categoryId
    });
    
    return this.makeRequest(url);
  }

  // Search satellites by name
  async searchSatellites(searchName: string): Promise<APIResponse> {
    const url = this.buildURL(this.config.endpoints.search, {
      search_name: searchName
    });
    
    return this.makeRequest(url);
  }

  // Get upcoming launches
  async getUpcomingLaunches(startDate?: string, endDate?: string): Promise<APIResponse> {
    const start = startDate || new Date().toISOString().split('T')[0];
    const end = endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const url = this.buildURL(this.config.endpoints.launches, {
      start: start,
      end: end
    });
    
    return this.makeRequest(url);
  }

  // Get solar activity data
  async getSolarActivity(): Promise<APIResponse> {
    const url = this.config.baseURL.replace('/satellite', '') + this.config.endpoints.solar + `?apiKey=${this.config.apiKey}`;
    return this.makeRequest(url);
  }

  // Preset satellite categories
  async getBrightestSatellites(observerLat: number, observerLng: number): Promise<APIResponse> {
    return this.getSatellitesByCategory(1); // Category 1: Brightest satellites
  }

  async getActiveSpaceStations(observerLat: number, observerLng: number): Promise<APIResponse> {
    return this.getSatellitesByCategory(2); // Category 2: Space stations
  }

  async getWeatherSatellites(): Promise<APIResponse> {
    return this.getSatellitesByCategory(3); // Category 3: Weather satellites
  }

  async getDisasterMonitoringSatellites(): Promise<APIResponse> {
    return this.getSatellitesByCategory(8); // Category 8: Disaster monitoring
  }

  async getEarthResourcesSatellites(): Promise<APIResponse> {
    return this.getSatellitesByCategory(6); // Category 6: Earth resources
  }

  async getSearchAndRescueSatellites(): Promise<APIResponse> {
    return this.getSatellitesByCategory(7); // Category 7: Search and rescue
  }

  // Real-time tracking for multiple satellites
  async getMultipleSatellitePositions(
    satelliteIds: number[],
    observerLat: number,
    observerLng: number,
    observerAlt: number = 0
  ): Promise<APIResponse[]> {
    const promises = satelliteIds.map(id => 
      this.getSatellitePositions(id, observerLat, observerLng, observerAlt, 1)
    );
    
    try {
      const results = await Promise.allSettled(promises);
      return results.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value;
        } else {
          return {
            success: false,
            error: result.reason.message || 'Unknown error',
            timestamp: new Date(),
            endpoint: `satellite-${satelliteIds[index]}`
          };
        }
      });
    } catch (error) {
      return [{
        success: false,
        error: 'Failed to fetch multiple satellite positions',
        timestamp: new Date(),
        endpoint: 'multiple-satellites'
      }];
    }
  }

  // Test API connection
  async testConnection(): Promise<boolean> {
    try {
      const result = await this.getISSPosition();
      return result.success;
    } catch (error) {
      console.error('❌ N2YO API connection test failed:', error);
      return false;
    }
  }

  // Get API usage statistics
  getUsageStats() {
    return {
      requestCount: this.requestCount,
      lastRequestTime: new Date(this.lastRequestTime),
      dailyRequestsRemaining: Math.max(0, this.dailyRequestLimit - (this.requestCount % this.dailyRequestLimit)),
      dailyLimit: this.dailyRequestLimit
    };
  }

  // Health check
  async healthCheck(): Promise<{ status: string; details: any }> {
    try {
      const testResult = await this.testConnection();
      const stats = this.getUsageStats();
      
      return {
        status: testResult ? 'healthy' : 'degraded',
        details: {
          ...stats,
          endpoint: 'N2YO API',
          lastCheck: new Date()
        }
      };
    } catch (error) {
      return {
        status: 'error',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
          endpoint: 'N2YO API',
          lastCheck: new Date()
        }
      };
    }
  }

  // Utility: Convert NORAD ID to common satellite names
  getCommonSatellites(): { [key: string]: number } {
    return {
      'ISS': 25544,
      'Hubble Space Telescope': 20580,
      'Tiangong Space Station': 48274,
      'NOAA-18': 28654,
      'NOAA-19': 33591,
      'Terra': 25994,
      'Aqua': 27424,
      'Landsat 8': 39084,
      'Landsat 9': 49260,
      'Sentinel-1A': 39634,
      'Sentinel-2A': 40697,
      'Sentinel-3A': 41335,
      'GOES-16': 41866,
      'GOES-17': 43226,
      'JWST': 50463
    };
  }

  // Get position for common satellites by name
  async getCommonSatellitePosition(satelliteName: string, observerLat: number, observerLng: number): Promise<APIResponse> {
    const commonSats = this.getCommonSatellites();
    const satelliteId = commonSats[satelliteName];
    
    if (!satelliteId) {
      return {
        success: false,
        error: `Unknown satellite: ${satelliteName}. Available: ${Object.keys(commonSats).join(', ')}`,
        timestamp: new Date(),
        endpoint: 'common-satellite'
      };
    }
    
    return this.getSatellitePositions(satelliteId, observerLat, observerLng, 0, 1);
  }
} 