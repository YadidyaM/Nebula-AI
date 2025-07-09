import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Zap, 
  Shield, 
  Cpu, 
  Activity,
  AlertTriangle,
  CheckCircle,
  Bot,
  Radar,
  Gauge,
  TrendingUp,
  Settings,
  Eye,
  Clock,
  BarChart3,
  Target,
  Globe,
  Satellite,
  Radio,
  Battery,
  HardDrive,
  Thermometer,
  WifiOff
} from 'lucide-react';
import { EnhancedAutonomousAgent } from '../services/EnhancedAutonomousAgent';
import { DeepseekAIService } from '../services/DeepseekAIService';

interface AIDecision {
  id: string;
  type: string;
  decision: string;
  reasoning: string[];
  confidence: number;
  executedActions: string[];
  outcome: 'success' | 'failure' | 'pending';
  timestamp: Date;
  humanOverrideRequired: boolean;
}

interface AIMetrics {
  decisionsPerHour: number;
  accuracyRate: number;
  autonomyLevel: number;
  collisionsPrevented: number;
  systemFailuresPrevented: number;
  resourceEfficiencyGain: number;
  totalDecisions: number;
  successfulDecisions: number;
}

interface SystemAlert {
  id: string;
  type: 'collision' | 'anomaly' | 'optimization' | 'maintenance';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  aiResponse: string;
  timestamp: Date;
  resolved: boolean;
}

const AIMissionControl: React.FC = () => {
  const [aiAgent] = useState(() => new EnhancedAutonomousAgent());
  const [deepseekAI] = useState(() => new DeepseekAIService(import.meta.env.VITE_DEEPSEEK_API_KEY || ''));
  
  const [isAIActive, setIsAIActive] = useState(false);
  const [aiMetrics, setAIMetrics] = useState<AIMetrics>({
    decisionsPerHour: 0,
    accuracyRate: 0.95,
    autonomyLevel: 0.87,
    collisionsPrevented: 0,
    systemFailuresPrevented: 0,
    resourceEfficiencyGain: 0,
    totalDecisions: 0,
    successfulDecisions: 0
  });
  
  const [recentDecisions, setRecentDecisions] = useState<AIDecision[]>([]);
  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>([]);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'decisions' | 'monitoring' | 'optimization'>('overview');
  const [aiQuery, setAIQuery] = useState('');
  const [aiResponse, setAIResponse] = useState('');
  const [isProcessingQuery, setIsProcessingQuery] = useState(false);

  // Real-time AI status
  const [aiStatus, setAIStatus] = useState({
    systemHealth: 'OPERATIONAL',
    activeModules: 0,
    dataQuality: 95,
    responseTime: 245
  });

  useEffect(() => {
    // Subscribe to AI agent events
    const handleAIDecision = (decision: AIDecision) => {
      setRecentDecisions(prev => [decision, ...prev.slice(0, 49)]);
    };

    const handleCollisionAvoided = (data: any) => {
      const alert: SystemAlert = {
        id: `collision_${Date.now()}`,
        type: 'collision',
        severity: 'CRITICAL',
        message: `Collision avoided between satellites ${data.prediction.satelliteId} and ${data.prediction.targetId}`,
        aiResponse: data.decision.decision,
        timestamp: new Date(),
        resolved: true
      };
      setSystemAlerts(prev => [alert, ...prev.slice(0, 19)]);
    };

    const handleSystemMaintained = (data: any) => {
      const alert: SystemAlert = {
        id: `maintenance_${Date.now()}`,
        type: 'maintenance',
        severity: data.anomaly.severity as SystemAlert['severity'],
        message: `System maintenance completed: ${data.anomaly.component}`,
        aiResponse: data.decision.decision,
        timestamp: new Date(),
        resolved: true
      };
      setSystemAlerts(prev => [alert, ...prev.slice(0, 19)]);
    };

    const handleResourceOptimized = (data: any) => {
      const alert: SystemAlert = {
        id: `optimization_${Date.now()}`,
        type: 'optimization',
        severity: 'MEDIUM',
        message: `Resource optimization applied: ${data.optimization.resourceType} (${data.optimization.energySavings}% efficiency gain)`,
        aiResponse: data.decision.decision,
        timestamp: new Date(),
        resolved: true
      };
      setSystemAlerts(prev => [alert, ...prev.slice(0, 19)]);
    };

    const handleAIMetrics = (metrics: AIMetrics) => {
      setAIMetrics(metrics);
    };

    aiAgent.on('autonomous_decision', handleAIDecision);
    aiAgent.on('collision_avoided', handleCollisionAvoided);
    aiAgent.on('system_maintained', handleSystemMaintained);
    aiAgent.on('resource_optimized', handleResourceOptimized);
    aiAgent.on('ai_metrics', handleAIMetrics);

    return () => {
      aiAgent.off('autonomous_decision', handleAIDecision);
      aiAgent.off('collision_avoided', handleCollisionAvoided);
      aiAgent.off('system_maintained', handleSystemMaintained);
      aiAgent.off('resource_optimized', handleResourceOptimized);
      aiAgent.off('ai_metrics', handleAIMetrics);
    };
  }, [aiAgent]);

  // Simulate real-time AI status updates
  useEffect(() => {
    const interval = setInterval(() => {
      setAIStatus(prev => ({
        ...prev,
        activeModules: Math.floor(Math.random() * 12) + 8,
        dataQuality: 90 + Math.random() * 10,
        responseTime: 200 + Math.random() * 100
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const toggleAI = async () => {
    if (isAIActive) {
      aiAgent.stop();
      setIsAIActive(false);
    } else {
      await aiAgent.start();
      setIsAIActive(true);
    }
  };

  const handleAIQuery = async () => {
    if (!aiQuery.trim() || isProcessingQuery) return;
    
    setIsProcessingQuery(true);
    setAIResponse('');
    
    try {
      const response = await deepseekAI.processNaturalLanguageQuery(aiQuery);
      setAIResponse(response);
    } catch (error) {
      setAIResponse('Error processing AI query. Please try again.');
    } finally {
      setIsProcessingQuery(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPERATIONAL': return 'text-green-400';
      case 'DEGRADED': return 'text-yellow-400';
      case 'CRITICAL': return 'text-red-400';
      default: return 'text-blue-400';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'border-red-500 bg-red-900/20';
      case 'HIGH': return 'border-orange-500 bg-orange-900/20';
      case 'MEDIUM': return 'border-yellow-500 bg-yellow-900/20';
      case 'LOW': return 'border-blue-500 bg-blue-900/20';
      default: return 'border-gray-500 bg-gray-900/20';
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* AI System Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div 
          className="bg-gray-800/50 backdrop-blur-sm border border-green-500/30 rounded-lg p-4"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Autonomy Level</p>
              <p className="text-2xl font-bold text-green-400">
                {(aiMetrics.autonomyLevel * 100).toFixed(1)}%
              </p>
            </div>
            <Brain className="w-8 h-8 text-green-400" />
          </div>
        </motion.div>

        <motion.div 
          className="bg-gray-800/50 backdrop-blur-sm border border-blue-500/30 rounded-lg p-4"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Decisions/Hour</p>
              <p className="text-2xl font-bold text-blue-400">{aiMetrics.decisionsPerHour}</p>
            </div>
            <Zap className="w-8 h-8 text-blue-400" />
          </div>
        </motion.div>

        <motion.div 
          className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/30 rounded-lg p-4"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Accuracy Rate</p>
              <p className="text-2xl font-bold text-purple-400">
                {(aiMetrics.accuracyRate * 100).toFixed(1)}%
              </p>
            </div>
            <Target className="w-8 h-8 text-purple-400" />
          </div>
        </motion.div>

        <motion.div 
          className="bg-gray-800/50 backdrop-blur-sm border border-orange-500/30 rounded-lg p-4"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Interventions Saved</p>
              <p className="text-2xl font-bold text-orange-400">
                {aiMetrics.collisionsPrevented + aiMetrics.systemFailuresPrevented}
              </p>
            </div>
            <Shield className="w-8 h-8 text-orange-400" />
          </div>
        </motion.div>
      </div>

      {/* AI Natural Language Interface */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-blue-500/30 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Bot className="w-5 h-5 mr-2 text-blue-400" />
          AI Mission Assistant
        </h3>
        
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={aiQuery}
              onChange={(e) => setAIQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAIQuery()}
              placeholder="Ask the AI about mission status, satellite tracking, or system optimization..."
              className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
            />
            <button
              onClick={handleAIQuery}
              disabled={isProcessingQuery || !aiQuery.trim()}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
            >
              {isProcessingQuery ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Query AI'
              )}
            </button>
          </div>
          
          {aiResponse && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-700/50 border border-gray-600 rounded-lg p-4"
            >
              <p className="text-green-400 text-sm font-medium mb-2">🤖 AI Response:</p>
              <p className="text-gray-200 whitespace-pre-wrap">{aiResponse}</p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Recent AI Activities */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-600 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Activity className="w-5 h-5 mr-2 text-green-400" />
          Recent AI Activities
        </h3>
        
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {systemAlerts.slice(0, 5).map((alert) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`p-3 rounded-lg border ${getSeverityColor(alert.severity)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-white font-medium">{alert.message}</p>
                  <p className="text-sm text-gray-400 mt-1">AI Action: {alert.aiResponse}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {alert.timestamp.toLocaleTimeString()}
                  </p>
                </div>
                {alert.resolved && (
                  <CheckCircle className="w-5 h-5 text-green-400 ml-2 flex-shrink-0" />
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderDecisions = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
        <Cpu className="w-5 h-5 mr-2 text-blue-400" />
        Autonomous Decisions Log
      </h3>
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {recentDecisions.map((decision) => (
          <motion.div
            key={decision.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800/50 border border-gray-600 rounded-lg p-4"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <span className="text-blue-400 font-medium">{decision.type.replace('_', ' ').toUpperCase()}</span>
                <span className="text-sm text-gray-400 ml-2">
                  Confidence: {(decision.confidence * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center">
                {decision.outcome === 'success' && <CheckCircle className="w-4 h-4 text-green-400" />}
                {decision.outcome === 'failure' && <AlertTriangle className="w-4 h-4 text-red-400" />}
                {decision.outcome === 'pending' && <Clock className="w-4 h-4 text-yellow-400" />}
              </div>
            </div>
            
            <p className="text-white mb-2">{decision.decision}</p>
            
            {decision.reasoning.length > 0 && (
              <div className="text-sm text-gray-400">
                <p className="font-medium mb-1">Reasoning:</p>
                <ul className="list-disc list-inside space-y-1">
                  {decision.reasoning.map((reason, idx) => (
                    <li key={idx}>{reason}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {decision.executedActions.length > 0 && (
              <div className="text-sm text-gray-400 mt-2">
                <p className="font-medium mb-1">Actions Taken:</p>
                <ul className="list-disc list-inside space-y-1">
                  {decision.executedActions.map((action, idx) => (
                    <li key={idx} className="text-green-400">{action}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <p className="text-xs text-gray-500 mt-2">
              {decision.timestamp.toLocaleString()}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderMonitoring = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* System Health Monitoring */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-green-500/30 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Gauge className="w-5 h-5 mr-2 text-green-400" />
          System Health
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
            <div className="flex items-center">
              <Battery className="w-5 h-5 text-blue-400 mr-2" />
              <span className="text-white">Power Systems</span>
            </div>
            <span className="text-green-400">OPTIMAL</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
            <div className="flex items-center">
              <Radio className="w-5 h-5 text-purple-400 mr-2" />
              <span className="text-white">Communications</span>
            </div>
            <span className="text-green-400">STABLE</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
            <div className="flex items-center">
              <HardDrive className="w-5 h-5 text-orange-400 mr-2" />
              <span className="text-white">Data Storage</span>
            </div>
            <span className="text-yellow-400">MONITORING</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
            <div className="flex items-center">
              <Thermometer className="w-5 h-5 text-red-400 mr-2" />
              <span className="text-white">Thermal Control</span>
            </div>
            <span className="text-green-400">NOMINAL</span>
          </div>
        </div>
      </div>

      {/* AI Performance Metrics */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-blue-500/30 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2 text-blue-400" />
          AI Performance
        </h3>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">Data Quality</span>
              <span className="text-white">{aiStatus.dataQuality.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${aiStatus.dataQuality}%` }}
              />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">Response Time</span>
              <span className="text-white">{aiStatus.responseTime.toFixed(0)}ms</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.max(0, 100 - (aiStatus.responseTime / 10))}%` }}
              />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">Active Modules</span>
              <span className="text-white">{aiStatus.activeModules}/12</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(aiStatus.activeModules / 12) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2 flex items-center">
            <Brain className="w-8 h-8 mr-3 text-blue-400" />
            AI Mission Control
          </h2>
          <p className="text-gray-400">
            Autonomous space operations with 95% human intervention reduction
          </p>
        </div>
        
        <motion.button
          onClick={toggleAI}
          className={`px-6 py-3 rounded-lg font-medium flex items-center transition-all ${
            isAIActive 
              ? 'bg-red-600 hover:bg-red-700 text-white' 
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Bot className="w-5 h-5 mr-2" />
          {isAIActive ? 'Deactivate AI' : 'Activate AI'}
        </motion.button>
      </div>

      {/* AI Status Indicator */}
      <motion.div 
        className={`p-4 rounded-lg border-2 ${
          isAIActive 
            ? 'border-green-500 bg-green-900/20' 
            : 'border-gray-500 bg-gray-900/20'
        }`}
        animate={{ 
          borderColor: isAIActive ? '#10B981' : '#6B7280',
          backgroundColor: isAIActive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(107, 114, 128, 0.1)'
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-3 ${
              isAIActive ? 'bg-green-500' : 'bg-gray-500'
            }`} />
            <span className="text-white font-medium">
              AI System Status: {isAIActive ? 'AUTONOMOUS' : 'STANDBY'}
            </span>
          </div>
          
          {isAIActive && (
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center">
                <Zap className="w-4 h-4 text-yellow-400 mr-1" />
                <span className="text-gray-300">{aiMetrics.decisionsPerHour} decisions/hr</span>
              </div>
              <div className="flex items-center">
                <Shield className="w-4 h-4 text-green-400 mr-1" />
                <span className="text-gray-300">{aiMetrics.collisionsPrevented} collisions prevented</span>
              </div>
              <div className="flex items-center">
                <TrendingUp className="w-4 h-4 text-blue-400 mr-1" />
                <span className="text-gray-300">{aiMetrics.resourceEfficiencyGain.toFixed(1)}% efficiency gain</span>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Navigation Tabs */}
      <div className="flex space-x-4 border-b border-gray-700">
        {[
          { id: 'overview', label: 'Overview', icon: Eye },
          { id: 'decisions', label: 'Decisions', icon: Cpu },
          { id: 'monitoring', label: 'Monitoring', icon: Radar },
          { id: 'optimization', label: 'Optimization', icon: Settings }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedTab(tab.id as any)}
            className={`flex items-center px-4 py-2 font-medium transition-colors ${
              selectedTab === tab.id
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <tab.icon className="w-4 h-4 mr-2" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {selectedTab === 'overview' && renderOverview()}
          {selectedTab === 'decisions' && renderDecisions()}
          {selectedTab === 'monitoring' && renderMonitoring()}
          {selectedTab === 'optimization' && (
            <div className="text-center py-12">
              <Settings className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">Resource optimization panel coming soon...</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AIMissionControl; 