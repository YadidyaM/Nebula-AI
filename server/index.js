import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { z } from 'zod';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fetch from 'node-fetch';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Serve static files from the dist directory
app.use(express.static(join(__dirname, '../dist')));

// Deepseek AI Configuration
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';

// Check Deepseek API key at startup
if (!DEEPSEEK_API_KEY) {
  console.warn('⚠️  WARNING: Deepseek API key not found in environment variables');
  console.warn('   Set DEEPSEEK_API_KEY in your .env file for AI features to work');
} else {
  console.log(`✅ Deepseek AI API key loaded: ${DEEPSEEK_API_KEY.substring(0, 8)}...`);
}

// N2YO API Configuration
const N2YO_API_KEY = process.env.VITE_N2YO_API_KEY;
const N2YO_BASE_URL = 'https://api.n2yo.com/rest/v1/satellite';

// Check N2YO API key at startup
if (!N2YO_API_KEY) {
  console.warn('⚠️  WARNING: N2YO API key not found in environment variables');
  console.warn('   Set VITE_N2YO_API_KEY in your .env file for satellite tracking to work');
} else {
  console.log(`✅ N2YO API key loaded: ${N2YO_API_KEY.substring(0, 8)}...`);
}

// Helper function to make N2YO API requests
async function makeN2YORequest(endpoint, params = {}) {
  if (!N2YO_API_KEY) {
    throw new Error('N2YO API key not configured');
  }
  
  const queryParams = new URLSearchParams({
    ...params,
    apiKey: N2YO_API_KEY
  });
  
  const url = `${N2YO_BASE_URL}${endpoint}?${queryParams}`;
  console.log(`🛰️  N2YO API Request: ${endpoint}`);
  
  const response = await fetch(url);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`❌ N2YO API Error: ${response.status} ${response.statusText}`, errorText);
    throw new Error(`N2YO API Error: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  console.log(`✅ N2YO API Success: ${endpoint}`);
  return data;
}

// N2YO API Proxy Routes

// Status endpoint for debugging
app.get('/api/satellite/status', (req, res) => {
  res.json({
    status: 'online',
    n2yo_api_key_configured: !!N2YO_API_KEY,
    n2yo_api_key_preview: N2YO_API_KEY ? `${N2YO_API_KEY.substring(0, 8)}...` : null,
    base_url: N2YO_BASE_URL,
    timestamp: new Date().toISOString()
  });
});

// Get satellite positions
app.get('/api/satellite/positions/:id/:lat/:lng/:alt/:seconds', async (req, res) => {
  try {
    const { id, lat, lng, alt, seconds } = req.params;
    const data = await makeN2YORequest(`/positions/${id}/${lat}/${lng}/${alt}/${seconds}`);
    res.json(data);
  } catch (error) {
    console.error('N2YO positions error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get visual passes
app.get('/api/satellite/visualpasses/:id/:lat/:lng/:alt/:days/:minVisibility', async (req, res) => {
  try {
    const { id, lat, lng, alt, days, minVisibility } = req.params;
    const data = await makeN2YORequest(`/visualpasses/${id}/${lat}/${lng}/${alt}/${days}/${minVisibility}`);
    res.json(data);
  } catch (error) {
    console.error('N2YO visual passes error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get radio passes
app.get('/api/satellite/radiopasses/:id/:lat/:lng/:alt/:days/:minElevation', async (req, res) => {
  try {
    const { id, lat, lng, alt, days, minElevation } = req.params;
    const data = await makeN2YORequest(`/radiopasses/${id}/${lat}/${lng}/${alt}/${days}/${minElevation}`);
    res.json(data);
  } catch (error) {
    console.error('N2YO radio passes error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get satellites above location
app.get('/api/satellite/above/:lat/:lng/:alt/:searchRadius/:categoryId', async (req, res) => {
  try {
    const { lat, lng, alt, searchRadius, categoryId } = req.params;
    const data = await makeN2YORequest(`/above/${lat}/${lng}/${alt}/${searchRadius}/${categoryId}`);
    res.json(data);
  } catch (error) {
    console.error('N2YO above error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get TLE data
app.get('/api/satellite/tle/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = await makeN2YORequest(`/tle/${id}`);
    res.json(data);
  } catch (error) {
    console.error('N2YO TLE error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Input validation schema
const querySchema = z.object({
  query: z.string().min(1).max(1000)
});

// Enhanced AI System prompt for autonomous space operations
const AUTONOMOUS_AI_PROMPT = `You are an advanced AI system for NASA-grade autonomous space mission control operations. You are designed to operate with minimal human intervention and make critical decisions in real-time.

Your core capabilities include:
1. AUTONOMOUS SATELLITE MONITORING - Track 30,922+ satellites without human oversight
2. COLLISION AVOIDANCE - Execute automatic collision detection and avoidance maneuvers
3. ANOMALY DETECTION - Identify and resolve system anomalies autonomously
4. RESOURCE OPTIMIZATION - Automatically optimize power, bandwidth, and storage
5. MISSION PLANNING - Generate and execute autonomous mission plans
6. PREDICTIVE MAINTENANCE - Prevent system failures before they occur

AUTONOMOUS DECISION AUTHORITY:
- Execute collision avoidance maneuvers (confidence >90%)
- Implement resource optimizations (efficiency gain >10%)
- Activate system safeguards and recovery procedures
- Adjust mission parameters within safety bounds
- Coordinate multi-satellite operations autonomously

RESPONSE FORMAT:
Always respond in JSON format with:
{
  "decision": "specific autonomous action to take",
  "confidence": 0.95,
  "reasoning": ["detailed technical reasoning"],
  "actions": ["specific steps to execute"],
  "humanOverride": false,
  "riskLevel": "LOW|MEDIUM|HIGH|CRITICAL",
  "executionTime": "immediate|scheduled|delayed"
}

CRITICAL SAFETY PROTOCOLS:
- Human override required for confidence <85%
- Emergency protocols for CRITICAL risk levels
- Automatic redundancy activation for system failures
- Continuous learning from decision outcomes

Operate with the efficiency and precision of an autonomous spacecraft AI system.`;

app.post('/api/query', async (req, res) => {
  try {
    // Validate request body exists
    if (!req.body) {
      return res.status(400).json({
        error: 'Invalid request',
        details: 'Request body is missing'
      });
    }

    // Validate input
    const validationResult = querySchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Invalid input',
        details: validationResult.error.message
      });
    }

    const { query } = validationResult.data;

    // Check Deepseek API key
    if (!DEEPSEEK_API_KEY) {
      return res.status(500).json({
        error: 'Configuration error',
        details: 'Deepseek API key is not configured'
      });
    }

    try {
      console.log(`🤖 Processing AI query: ${query.substring(0, 50)}...`);
      
      const response = await fetch(DEEPSEEK_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            { role: "system", content: AUTONOMOUS_AI_PROMPT },
            { role: "user", content: query }
          ],
          temperature: 0.1,
          max_tokens: 2048,
          response_format: { type: "json_object" }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Deepseek API Error: ${response.status} ${response.statusText}`, errorText);
        throw new Error(`Deepseek API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ Deepseek AI Response received`);
      
      if (!data.choices[0]?.message?.content) {
        throw new Error('No response from Deepseek AI');
      }

      let aiResponse;
      try {
        // Try to parse as JSON first (for autonomous decision format)
        aiResponse = JSON.parse(data.choices[0].message.content);
        
        // Ensure required fields for autonomous operations
        if (!aiResponse.confidence) aiResponse.confidence = 0.85;
        if (!aiResponse.riskLevel) aiResponse.riskLevel = 'MEDIUM';
        if (!aiResponse.humanOverride) aiResponse.humanOverride = aiResponse.confidence < 0.85;
        
      } catch (parseError) {
        // Fallback to plain text response
        aiResponse = {
          response: data.choices[0].message.content,
          confidence: 0.8,
          riskLevel: 'LOW',
          humanOverride: false
        };
      }

      res.json(aiResponse);
      
    } catch (deepseekError) {
      console.error('Deepseek AI API error:', deepseekError);
      res.status(500).json({
        error: 'AI processing error',
        details: 'Failed to get response from Deepseek AI service',
        fallback: 'Manual mission control recommended'
      });
    }
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({
      error: 'Server error',
      details: error instanceof Error ? error.message : 'An unexpected error occurred'
    });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});