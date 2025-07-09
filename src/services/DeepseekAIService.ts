// Deepseek AI Service for Space Mission Intelligence
// Advanced Natural Language Processing for Space Operations

interface DeepseekResponse {
  decision?: string;
  reasoning?: string[];
  confidence?: number;
  actions?: string[];
  analysis?: string;
  recommendations?: string[];
}

interface MissionQuery {
  query: string;
  context: {
    systemStatus?: any;
    satelliteData?: any;
    missionType?: string;
    urgency?: 'low' | 'medium' | 'high' | 'critical';
  };
  responseType: 'analysis' | 'decision' | 'recommendation' | 'explanation';
}

interface SpaceIntelligence {
  orbitalMechanics: boolean;
  collisionAvoidance: boolean;
  missionPlanning: boolean;
  anomalyDiagnosis: boolean;
  resourceOptimization: boolean;
}

export class DeepseekAIService {
  private readonly API_URL = 'https://api.deepseek.com/chat/completions';
  private readonly MODEL = 'deepseek-chat';
  private readonly MAX_TOKENS = 4096;
  private readonly TEMPERATURE = 0.1;
  
  private requestCount = 0;
  private lastRequestTime = 0;
  private readonly RATE_LIMIT = 100; // requests per minute
  
  // Space domain expertise prompts
  private readonly SYSTEM_PROMPTS = {
    MISSION_CONTROL: `You are an advanced AI system for NASA-grade space mission control operations. You have expertise in:
- Orbital mechanics and trajectory planning
- Satellite constellation management
- Real-time anomaly detection and resolution
- Resource optimization for space missions
- Collision avoidance and space debris tracking
- Emergency response protocols
- Autonomous decision making for space operations

Always respond with precise, actionable recommendations focused on mission safety and success.`,

    ORBITAL_MECHANICS: `You are a specialized AI for orbital mechanics and spacecraft navigation. You understand:
- Keplerian orbital elements
- Hohmann transfer orbits
- Station-keeping maneuvers
- Gravitational perturbations
- Orbital decay and atmospheric drag
- Launch window calculations
- Rendezvous and docking procedures

Provide technically accurate orbital mechanics solutions.`,

    COLLISION_AVOIDANCE: `You are an expert AI for space collision avoidance and debris tracking. You specialize in:
- Conjunction analysis and probability calculations
- Automated collision avoidance maneuvers
- Space debris tracking and prediction
- Risk assessment for satellite operations
- Emergency evasive procedures
- Coordination with space traffic management

Focus on real-time collision prevention and space safety.`,

    MISSION_PLANNING: `You are an AI mission planner for complex space operations. Your expertise includes:
- Multi-satellite mission coordination
- Resource allocation and scheduling
- Risk mitigation strategies
- Timeline optimization
- Contingency planning
- Ground station coordination
- Data downlink prioritization

Optimize missions for success while minimizing risks and costs.`
  };

  constructor(private apiKey: string) {
    if (!apiKey) {
      console.warn('⚠️ Deepseek API key not provided. AI features will be limited.');
    }
  }

  // Main AI Query Method
  async processSpaceMissionQuery(query: MissionQuery): Promise<DeepseekResponse> {
    try {
      await this.checkRateLimit();
      
      const systemPrompt = this.selectSystemPrompt(query);
      const enhancedPrompt = this.enhanceQueryWithContext(query);
      
      const response = await this.makeAPIRequest(systemPrompt, enhancedPrompt);
      
      return this.parseAIResponse(response, query.responseType);
      
    } catch (error) {
      console.error('Deepseek AI query error:', error);
      return {
        analysis: 'AI analysis unavailable due to service error',
        confidence: 0,
        recommendations: ['Manual intervention recommended']
      };
    }
  }

  // Specialized AI Methods
  async analyzeCollisionRisk(satelliteData: any): Promise<DeepseekResponse> {
    const query: MissionQuery = {
      query: `Analyze collision risk for satellite constellation`,
      context: {
        satelliteData,
        urgency: 'high'
      },
      responseType: 'analysis'
    };
    
    return this.processSpaceMissionQuery(query);
  }

  async optimizeResourceAllocation(systemStatus: any): Promise<DeepseekResponse> {
    const query: MissionQuery = {
      query: `Optimize resource allocation for maximum efficiency`,
      context: {
        systemStatus,
        urgency: 'medium'
      },
      responseType: 'recommendation'
    };
    
    return this.processSpaceMissionQuery(query);
  }

  async planAutonomousResponse(anomaly: any): Promise<DeepseekResponse> {
    const query: MissionQuery = {
      query: `Plan autonomous response to system anomaly`,
      context: {
        systemStatus: anomaly,
        urgency: 'critical'
      },
      responseType: 'decision'
    };
    
    return this.processSpaceMissionQuery(query);
  }

  async generateMissionPlan(objectives: any): Promise<DeepseekResponse> {
    const query: MissionQuery = {
      query: `Generate optimal mission execution plan`,
      context: {
        missionType: 'autonomous',
        urgency: 'low'
      },
      responseType: 'recommendation'
    };
    
    return this.processSpaceMissionQuery(query);
  }

  // Advanced AI Methods
  async predictSystemFailure(telemetryData: any): Promise<DeepseekResponse> {
    const prompt = `Analyze telemetry data for potential system failures:
${JSON.stringify(telemetryData, null, 2)}

Predict:
1. Probability of component failures
2. Time to failure estimates
3. Preventive maintenance recommendations
4. Risk mitigation strategies`;

    try {
      const response = await this.makeAPIRequest(
        this.SYSTEM_PROMPTS.MISSION_CONTROL,
        prompt
      );
      
      return this.parseAIResponse(response, 'analysis');
      
    } catch (error) {
      console.error('System failure prediction error:', error);
      return {
        analysis: 'Prediction unavailable',
        confidence: 0,
        recommendations: ['Monitor system closely']
      };
    }
  }

  async optimizeOrbitalManeuver(maneuverData: any): Promise<DeepseekResponse> {
    const prompt = `Optimize orbital maneuver for:
Target: ${maneuverData.target}
Current orbit: ${JSON.stringify(maneuverData.currentOrbit)}
Fuel available: ${maneuverData.fuelMass} kg
Time constraints: ${maneuverData.timeWindow}

Calculate:
1. Optimal delta-V requirements
2. Maneuver timing and duration
3. Fuel consumption optimization
4. Risk assessment`;

    try {
      const response = await this.makeAPIRequest(
        this.SYSTEM_PROMPTS.ORBITAL_MECHANICS,
        prompt
      );
      
      return this.parseAIResponse(response, 'decision');
      
    } catch (error) {
      console.error('Orbital maneuver optimization error:', error);
      return {
        decision: 'Manual planning required',
        confidence: 0,
        actions: ['Consult mission planning team']
      };
    }
  }

  // Natural Language Mission Interface
  async processNaturalLanguageQuery(query: string, context?: any): Promise<string> {
    try {
      const enhancedQuery = `Mission Control Query: ${query}
${context ? `Context: ${JSON.stringify(context)}` : ''}

Provide a clear, professional response suitable for mission control operations.`;

      const response = await this.makeAPIRequest(
        this.SYSTEM_PROMPTS.MISSION_CONTROL,
        enhancedQuery
      );
      
      return response.choices[0].message.content || 'No response available';
      
    } catch (error) {
      console.error('Natural language query error:', error);
      return 'AI assistant temporarily unavailable. Please check system status.';
    }
  }

  // Core API Methods
  private async makeAPIRequest(systemPrompt: string, userPrompt: string): Promise<any> {
    if (!this.apiKey) {
      throw new Error('Deepseek API key not configured');
    }
    
    const response = await fetch(this.API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: this.MAX_TOKENS,
        temperature: this.TEMPERATURE,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      throw new Error(`Deepseek API error: ${response.status} ${response.statusText}`);
    }

    this.requestCount++;
    this.lastRequestTime = Date.now();
    
    return response.json();
  }

  private selectSystemPrompt(query: MissionQuery): string {
    const { context } = query;
    
    if (context.urgency === 'critical') {
      return this.SYSTEM_PROMPTS.COLLISION_AVOIDANCE;
    }
    
    if (query.query.toLowerCase().includes('orbit') || query.query.toLowerCase().includes('trajectory')) {
      return this.SYSTEM_PROMPTS.ORBITAL_MECHANICS;
    }
    
    if (query.responseType === 'decision' || query.query.toLowerCase().includes('plan')) {
      return this.SYSTEM_PROMPTS.MISSION_PLANNING;
    }
    
    return this.SYSTEM_PROMPTS.MISSION_CONTROL;
  }

  private enhanceQueryWithContext(query: MissionQuery): string {
    let enhancedPrompt = `Mission Query: ${query.query}\n\n`;
    
    if (query.context.systemStatus) {
      enhancedPrompt += `System Status:\n${JSON.stringify(query.context.systemStatus, null, 2)}\n\n`;
    }
    
    if (query.context.satelliteData) {
      enhancedPrompt += `Satellite Data:\n${JSON.stringify(query.context.satelliteData, null, 2)}\n\n`;
    }
    
    enhancedPrompt += `Response Type: ${query.responseType}\n`;
    enhancedPrompt += `Urgency Level: ${query.context.urgency || 'medium'}\n\n`;
    
    switch (query.responseType) {
      case 'analysis':
        enhancedPrompt += 'Provide detailed analysis with risk assessment and technical insights.';
        break;
      case 'decision':
        enhancedPrompt += 'Provide a specific decision with clear reasoning and action steps.';
        break;
      case 'recommendation':
        enhancedPrompt += 'Provide actionable recommendations with priority levels.';
        break;
      case 'explanation':
        enhancedPrompt += 'Provide clear explanation suitable for mission control operators.';
        break;
    }
    
    enhancedPrompt += '\n\nRespond in JSON format with relevant fields: analysis, decision, recommendations, actions, confidence (0-1).';
    
    return enhancedPrompt;
  }

  private parseAIResponse(response: any, responseType: string): DeepseekResponse {
    try {
      const content = response.choices[0].message.content;
      const parsed = JSON.parse(content);
      
      return {
        decision: parsed.decision,
        reasoning: parsed.reasoning || parsed.analysis?.split('\n') || [],
        confidence: parsed.confidence || 0.8,
        actions: parsed.actions || [],
        analysis: parsed.analysis,
        recommendations: parsed.recommendations || []
      };
      
    } catch (error) {
      // Fallback parsing if JSON fails
      const content = response.choices[0].message.content;
      
      return {
        analysis: content,
        confidence: 0.7,
        recommendations: ['Review AI response for details']
      };
    }
  }

  private async checkRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < 60000 && this.requestCount >= this.RATE_LIMIT) {
      const waitTime = 60000 - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
      this.requestCount = 0;
    }
  }

  // Utility Methods
  getServiceStatus() {
    return {
      apiKeyConfigured: !!this.apiKey,
      requestCount: this.requestCount,
      lastRequestTime: new Date(this.lastRequestTime),
      rateLimitRemaining: this.RATE_LIMIT - this.requestCount,
      serviceStatus: this.apiKey ? 'operational' : 'limited'
    };
  }

  resetRateLimit() {
    this.requestCount = 0;
    this.lastRequestTime = 0;
  }
} 