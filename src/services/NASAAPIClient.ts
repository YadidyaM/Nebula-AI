// NASA API Client for Real-Time Mission Data
// Integrates with multiple NASA APIs for comprehensive space mission data

interface NASAAPIConfig {
  apiKey: string;
  baseURL: string;
  endpoints: {
    [key: string]: string;
  };
}

interface APIResponse {
  success: boolean;
  data?: any;
  error?: string;
  timestamp: Date;
  endpoint: string;
}

export class NASAAPIClient {
  private config: NASAAPIConfig;
  private requestCount: number = 0;
  private lastRequestTime: number = 0;

  constructor(apiKey: string) {
    this.config = {
      apiKey,
      baseURL: 'https://api.nasa.gov',
      endpoints: {
        // Earth Imagery
        earthImagery: '/planetary/earth/imagery',
        earthAssets: '/planetary/earth/assets',
        
        // Mars Rover Photos
        marsRoverPhotos: '/mars-photos/api/v1/rovers/{rover}/photos',
        marsRoverManifest: '/mars-photos/api/v1/manifests/{rover}',
        
        // Near Earth Objects (Asteroids)
        neo: '/neo/rest/v1/neo/browse',
        neoLookup: '/neo/rest/v1/neo/{asteroid_id}',
        neoToday: '/neo/rest/v1/feed/today',
        
        // Astronomy Picture of the Day
        apod: '/planetary/apod',
        
        // Exoplanets
        exoplanets: '/exoplanet/records',
        
        // Solar Flare Data
        solarFlares: '/DONKI/FLR',
        
        // Space Weather
        spaceWeather: '/DONKI/notifications',
        
        // TechTransfer
        techTransfer: '/techtransfer/patent',
        
        // Sounds from Space
        sounds: '/planetary/sounds',
        
        // Insight Weather (Mars)
        insightWeather: '/insight_weather'
      }
    };
  }

  private async makeRequest(endpoint: string, params: Record<string, any> = {}): Promise<APIResponse> {
    try {
      // Rate limiting (1000 requests per hour for NASA APIs)
      const now = Date.now();
      if (now - this.lastRequestTime < 3600) { // 3.6 seconds between requests
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      this.lastRequestTime = now;
      this.requestCount++;

      // Build URL with parameters
      const url = new URL(this.config.baseURL + endpoint);
      url.searchParams.append('api_key', this.config.apiKey);
      
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, value.toString());
        }
      });

      console.log(`🌍 NASA API Request: ${endpoint}`);
      
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Nebula-AI-Mission-Control/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`NASA API Error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();

      return {
        success: true,
        data,
        timestamp: new Date(),
        endpoint
      };

    } catch (error) {
      console.error(`❌ NASA API Error for ${endpoint}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
        endpoint
      };
    }
  }

  // Earth Imagery APIs
  async getEarthImagery(lat: number, lon: number, date?: string, dim?: number): Promise<APIResponse> {
    const params: any = { lat, lon };
    if (date) params.date = date;
    if (dim) params.dim = dim;
    
    return this.makeRequest(this.config.endpoints.earthImagery, params);
  }

  async getEarthAssets(lat: number, lon: number, date?: string): Promise<APIResponse> {
    const params: any = { lat, lon };
    if (date) params.date = date;
    
    return this.makeRequest(this.config.endpoints.earthAssets, params);
  }

  // Mars Rover APIs
  async getMarsRoverPhotos(rover: string = 'curiosity', sol?: number, earthDate?: string, camera?: string): Promise<APIResponse> {
    const endpoint = this.config.endpoints.marsRoverPhotos.replace('{rover}', rover);
    const params: any = {};
    
    if (sol) params.sol = sol;
    if (earthDate) params.earth_date = earthDate;
    if (camera) params.camera = camera;
    
    return this.makeRequest(endpoint, params);
  }

  async getMarsRoverManifest(rover: string = 'curiosity'): Promise<APIResponse> {
    const endpoint = this.config.endpoints.marsRoverManifest.replace('{rover}', rover);
    return this.makeRequest(endpoint);
  }

  // Near Earth Objects (Asteroids)
  async getNearEarthObjects(page: number = 0, size: number = 20): Promise<APIResponse> {
    return this.makeRequest(this.config.endpoints.neo, { page, size });
  }

  async getNEOToday(): Promise<APIResponse> {
    return this.makeRequest(this.config.endpoints.neoToday);
  }

  async getNEOLookup(asteroidId: string): Promise<APIResponse> {
    const endpoint = this.config.endpoints.neoLookup.replace('{asteroid_id}', asteroidId);
    return this.makeRequest(endpoint);
  }

  // Astronomy Picture of the Day
  async getAPOD(date?: string, count?: number, thumbs?: boolean): Promise<APIResponse> {
    const params: any = {};
    if (date) params.date = date;
    if (count) params.count = count;
    if (thumbs) params.thumbs = thumbs;
    
    return this.makeRequest(this.config.endpoints.apod, params);
  }

  // Exoplanets
  async getExoplanets(table: string = 'exoplanets', select?: string, where?: string): Promise<APIResponse> {
    const params: any = { table };
    if (select) params.select = select;
    if (where) params.where = where;
    
    return this.makeRequest(this.config.endpoints.exoplanets, params);
  }

  // Solar Flares
  async getSolarFlares(startDate?: string, endDate?: string): Promise<APIResponse> {
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    return this.makeRequest(this.config.endpoints.solarFlares, params);
  }

  // Space Weather Notifications
  async getSpaceWeatherNotifications(startDate?: string, endDate?: string, type?: string): Promise<APIResponse> {
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    if (type) params.type = type;
    
    return this.makeRequest(this.config.endpoints.spaceWeather, params);
  }

  // Technology Transfer
  async getTechTransfer(query?: string): Promise<APIResponse> {
    const params: any = {};
    if (query) params.q = query;
    
    return this.makeRequest(this.config.endpoints.techTransfer, params);
  }

  // Sounds from Space
  async getSounds(limit: number = 10): Promise<APIResponse> {
    return this.makeRequest(this.config.endpoints.sounds, { limit });
  }

  // Mars Insight Weather
  async getInsightWeather(): Promise<APIResponse> {
    return this.makeRequest(this.config.endpoints.insightWeather);
  }

  // Real-time ISS Position (using different NASA endpoint)
  async getISSPosition(): Promise<APIResponse> {
    try {
      // ISS Current Location API
      const response = await fetch('http://api.open-notify.org/iss-now.json');
      const data = await response.json();
      
      if (data.message === 'success') {
        return {
          success: true,
          data: {
            latitude: parseFloat(data.iss_position.latitude),
            longitude: parseFloat(data.iss_position.longitude),
            timestamp: data.timestamp,
            altitude: 408, // Average ISS altitude in km
            velocity: 7.66 // Average ISS velocity in km/s
          },
          timestamp: new Date(),
          endpoint: 'iss-position'
        };
      } else {
        throw new Error('Invalid ISS position response');
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get ISS position',
        timestamp: new Date(),
        endpoint: 'iss-position'
      };
    }
  }

  // Get ISS Pass Times for a location
  async getISSPassTimes(lat: number, lon: number, alt: number = 0, n: number = 5): Promise<APIResponse> {
    try {
      const url = `http://api.open-notify.org/iss-pass.json?lat=${lat}&lon=${lon}&alt=${alt}&n=${n}`;
      const response = await fetch(url);
      const data = await response.json();
      
      return {
        success: data.message === 'success',
        data: data.response,
        timestamp: new Date(),
        endpoint: 'iss-pass-times'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get ISS pass times',
        timestamp: new Date(),
        endpoint: 'iss-pass-times'
      };
    }
  }

  // People in Space
  async getPeopleInSpace(): Promise<APIResponse> {
    try {
      const response = await fetch('http://api.open-notify.org/astros.json');
      const data = await response.json();
      
      return {
        success: data.message === 'success',
        data: {
          number: data.number,
          people: data.people
        },
        timestamp: new Date(),
        endpoint: 'people-in-space'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get people in space',
        timestamp: new Date(),
        endpoint: 'people-in-space'
      };
    }
  }

  // Test API connection
  async testConnection(): Promise<boolean> {
    try {
      const result = await this.getAPOD();
      return result.success;
    } catch (error) {
      console.error('❌ NASA API connection test failed:', error);
      return false;
    }
  }

  // Get API usage statistics
  getUsageStats() {
    return {
      requestCount: this.requestCount,
      lastRequestTime: new Date(this.lastRequestTime),
      rateLimitRemaining: Math.max(0, 1000 - (this.requestCount % 1000))
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
          endpoint: 'NASA API',
          lastCheck: new Date()
        }
      };
    } catch (error) {
      return {
        status: 'error',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
          endpoint: 'NASA API',
          lastCheck: new Date()
        }
      };
    }
  }
} 