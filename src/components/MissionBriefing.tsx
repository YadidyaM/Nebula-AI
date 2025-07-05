import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Rocket, 
  Target, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  Circle,
  FileText,
  Users,
  Settings,
  Map,
  Zap,
  Shield,
  Globe,
  Orbit,
  Activity,
  Brain,
  Award,
  ChevronRight,
  ChevronLeft,
  X,
  Download,
  Eye,
  Star,
  Radio,
  BarChart3
} from 'lucide-react';
import SatelliteVisualization3D from './SatelliteVisualization3D';

interface MissionBriefingProps {
  scenario: {
    id: string;
    name: string;
    description: string;
    difficulty: string;
    duration: number;
    missionType: string;
    spacecraft: string;
    objectives: Array<{
      id: string;
      description: string;
      type: string;
      points: number;
    }>;
    criticalEvents: Array<{
      type: string;
      time: number;
      probability: number;
      severity: string;
      description: string;
      requiredAction?: string;
    }>;
    realMissionBasis?: string;
  };
  onStartMission: () => void;
  onClose: () => void;
}

interface Checklist {
  id: string;
  category: string;
  items: Array<{
    id: string;
    description: string;
    completed: boolean;
    required: boolean;
  }>;
}

const MissionBriefing: React.FC<MissionBriefingProps> = ({
  scenario,
  onStartMission,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'objectives' | 'procedures' | 'checklist' | 'risks'>('overview');
  const [checklists, setChecklists] = useState<Checklist[]>([
    {
      id: 'pre-launch',
      category: 'Pre-Launch Systems',
      items: [
        { id: 'power-check', description: 'Verify all power systems nominal', completed: false, required: true },
        { id: 'comm-check', description: 'Establish communication links', completed: false, required: true },
        { id: 'nav-align', description: 'Navigation system alignment complete', completed: false, required: true },
        { id: 'fuel-verify', description: 'Fuel levels verified and within limits', completed: false, required: true },
        { id: 'thermal-check', description: 'Thermal systems operational', completed: false, required: false }
      ]
    },
    {
      id: 'flight-ops',
      category: 'Flight Operations',
      items: [
        { id: 'flight-plan', description: 'Flight plan uploaded and verified', completed: false, required: true },
        { id: 'emergency-proc', description: 'Emergency procedures reviewed', completed: false, required: true },
        { id: 'backup-systems', description: 'Backup systems tested and ready', completed: false, required: false },
        { id: 'crew-brief', description: 'Crew briefed on mission parameters', completed: false, required: true }
      ]
    }
  ]);

  const [showISS, setShowISS] = useState(true);

  const toggleChecklistItem = (checklistId: string, itemId: string) => {
    setChecklists(prev => 
      prev.map(checklist => 
        checklist.id === checklistId
          ? {
              ...checklist,
              items: checklist.items.map(item =>
                item.id === itemId ? { ...item, completed: !item.completed } : item
              )
            }
          : checklist
      )
    );
  };

  const getCompletionStatus = () => {
    const totalRequired = checklists.flatMap(c => c.items.filter(i => i.required)).length;
    const completedRequired = checklists.flatMap(c => c.items.filter(i => i.required && i.completed)).length;
    return { total: totalRequired, completed: completedRequired };
  };

  const canStartMission = () => {
    const status = getCompletionStatus();
    return status.completed === status.total;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'expert': return 'text-red-400 bg-red-500/20';
      case 'advanced': return 'text-orange-400 bg-orange-500/20';
      case 'intermediate': return 'text-yellow-400 bg-yellow-500/20';
      default: return 'text-green-400 bg-green-500/20';
    }
  };

  const getMissionTypeIcon = (type: string) => {
    switch (type) {
      case 'orbital': return <Orbit className="w-5 h-5" />;
      case 'landing': return <Target className="w-5 h-5" />;
      case 'rendezvous': return <Activity className="w-5 h-5" />;
      default: return <Rocket className="w-5 h-5" />;
    }
  };

  const TabButton = ({ id, icon: Icon, label, isActive }: { 
    id: string; 
    icon: any; 
    label: string; 
    isActive: boolean; 
  }) => (
    <button
      onClick={() => setActiveTab(id as any)}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
        isActive 
          ? 'bg-cyan-600 text-white shadow-lg' 
          : 'hover:bg-slate-700 text-slate-300'
      }`}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-6xl h-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-900/50 to-blue-900/50 border-b border-slate-700 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl">
                {getMissionTypeIcon(scenario.missionType)}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{scenario.name}</h1>
                <div className="flex items-center space-x-4 mt-1">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getDifficultyColor(scenario.difficulty)}`}>
                    {scenario.difficulty.toUpperCase()}
                  </span>
                  <span className="text-slate-400">{scenario.duration}h duration</span>
                  <span className="text-slate-400 capitalize">{scenario.missionType}</span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-2 mt-6">
            <TabButton id="overview" icon={Eye} label="Overview" isActive={activeTab === 'overview'} />
            <TabButton id="objectives" icon={Target} label="Objectives" isActive={activeTab === 'objectives'} />
            <TabButton id="procedures" icon={FileText} label="Procedures" isActive={activeTab === 'procedures'} />
            <TabButton id="checklist" icon={CheckCircle} label="Checklist" isActive={activeTab === 'checklist'} />
            <TabButton id="risks" icon={AlertTriangle} label="Risk Assessment" isActive={activeTab === 'risks'} />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-xl font-bold text-white mb-3">Mission Overview</h2>
                <p className="text-slate-300 text-lg leading-relaxed">{scenario.description}</p>
              </div>

              {/* ISS Tracking Section */}
              <div className="bg-slate-800/50 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Globe className="w-6 h-6 text-cyan-400" />
                    <h3 className="font-semibold text-white">ISS Live Tracking</h3>
                  </div>
                  <button
                    onClick={() => setShowISS(!showISS)}
                    className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors"
                  >
                    {showISS ? 'Hide' : 'Show'} Tracker
                  </button>
                </div>
                {showISS && (
                  <div className="relative aspect-video w-full bg-black rounded-lg overflow-hidden">
                    <SatelliteVisualization3D />
                  </div>
                )}
              </div>

              {/* Mission Status Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Communications Status */}
                <div className="bg-slate-800/50 rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Radio className="w-6 h-6 text-green-400" />
                    <h3 className="font-semibold text-white">Communications</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">Ground Station</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs text-green-400">Online</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">ISS Comm</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs text-green-400">Strong</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">Backup Link</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <span className="text-xs text-yellow-400">Standby</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mission Timeline */}
                <div className="bg-slate-800/50 rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Clock className="w-6 h-6 text-orange-400" />
                    <h3 className="font-semibold text-white">Mission Timeline</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <div className="text-sm text-white">ISS Orbital Operations</div>
                        <div className="text-xs text-gray-400">Current - Ongoing</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <div className="text-sm text-white">Next Pass Over Ground Station</div>
                        <div className="text-xs text-gray-400">In 45 minutes</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <div className="flex-1">
                        <div className="text-sm text-white">Crew Sleep Period</div>
                        <div className="text-xs text-gray-400">In 6 hours</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="bg-slate-800/50 rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <BarChart3 className="w-6 h-6 text-purple-400" />
                    <h3 className="font-semibold text-white">Mission Stats</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">Mission Duration</span>
                      <span className="text-sm text-white">{scenario.duration}h</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">Spacecraft</span>
                      <span className="text-sm text-white capitalize">{scenario.spacecraft}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">Mission Type</span>
                      <span className="text-sm text-white capitalize">{scenario.missionType}</span>
                    </div>
                  </div>
                </div>
              </div>

              {scenario.realMissionBasis && (
                <div className="bg-blue-900/30 border border-blue-500/30 rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-3">
                    <Globe className="w-6 h-6 text-blue-400" />
                    <h3 className="text-lg font-semibold text-blue-300">Real Mission Basis</h3>
                  </div>
                  <p className="text-blue-200">{scenario.realMissionBasis}</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'objectives' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-bold text-white">Mission Objectives</h2>
              
              <div className="space-y-4">
                {scenario.objectives.map((objective, index) => (
                  <div
                    key={objective.id}
                    className={`p-6 rounded-xl border-l-4 ${
                      objective.type === 'primary' ? 'bg-red-900/20 border-red-500' :
                      objective.type === 'secondary' ? 'bg-yellow-900/20 border-yellow-500' :
                      'bg-green-900/20 border-green-500'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                          objective.type === 'primary' ? 'bg-red-500/20 text-red-300' :
                          objective.type === 'secondary' ? 'bg-yellow-500/20 text-yellow-300' :
                          'bg-green-500/20 text-green-300'
                        }`}>
                          {objective.type.toUpperCase()}
                        </div>
                        <span className="text-slate-400">#{index + 1}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-cyan-400">{objective.points}</div>
                        <div className="text-xs text-slate-400">POINTS</div>
                      </div>
                    </div>
                    <p className="text-white text-lg">{objective.description}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'procedures' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-bold text-white">Mission Procedures</h2>
              
              <div className="space-y-6">
                <div className="bg-slate-800/50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-cyan-400 mb-4">Pre-Mission Phase</h3>
                  <ol className="list-decimal list-inside space-y-2 text-slate-300">
                    <li>Complete all pre-launch system checks</li>
                    <li>Verify mission parameters and flight plan</li>
                    <li>Establish communication with ground control</li>
                    <li>Initialize spacecraft systems and instruments</li>
                  </ol>
                </div>

                <div className="bg-slate-800/50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-green-400 mb-4">Mission Execution</h3>
                  <ol className="list-decimal list-inside space-y-2 text-slate-300">
                    <li>Monitor all spacecraft systems continuously</li>
                    <li>Execute maneuvers according to flight plan</li>
                    <li>Respond to anomalies using established procedures</li>
                    <li>Maintain situational awareness of mission status</li>
                    <li>Document all significant events and decisions</li>
                  </ol>
                </div>

                <div className="bg-slate-800/50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-yellow-400 mb-4">Emergency Procedures</h3>
                  <ol className="list-decimal list-inside space-y-2 text-slate-300">
                    <li>Assess severity and immediate threat to mission</li>
                    <li>Implement safing procedures if required</li>
                    <li>Contact ground control for support</li>
                    <li>Execute contingency plans as necessary</li>
                    <li>Maintain detailed logs of all actions taken</li>
                  </ol>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'checklist' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Pre-Mission Checklist</h2>
                <div className="text-right">
                  <div className="text-lg font-bold text-cyan-400">
                    {getCompletionStatus().completed}/{getCompletionStatus().total}
                  </div>
                  <div className="text-xs text-slate-400">REQUIRED ITEMS</div>
                </div>
              </div>

              <div className="space-y-6">
                {checklists.map(checklist => (
                  <div key={checklist.id} className="bg-slate-800/50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-cyan-400 mb-4">{checklist.category}</h3>
                    <div className="space-y-3">
                      {checklist.items.map(item => (
                        <div
                          key={item.id}
                          className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-700/50 transition-colors"
                        >
                          <button
                            onClick={() => toggleChecklistItem(checklist.id, item.id)}
                            className={`flex-shrink-0 ${
                              item.completed ? 'text-green-400' : 'text-slate-500'
                            }`}
                          >
                            {item.completed ? (
                              <CheckCircle className="w-5 h-5" />
                            ) : (
                              <Circle className="w-5 h-5" />
                            )}
                          </button>
                          <span className={`flex-1 ${
                            item.completed ? 'text-slate-400 line-through' : 'text-slate-200'
                          }`}>
                            {item.description}
                          </span>
                          {item.required && (
                            <span className="text-red-400 text-xs font-bold">REQUIRED</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'risks' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-bold text-white">Risk Assessment</h2>
              
              <div className="space-y-4">
                {scenario.criticalEvents.map((event, index) => (
                  <div
                    key={index}
                    className={`p-6 rounded-xl border-l-4 ${
                      event.severity === 'critical' ? 'bg-red-900/20 border-red-500' :
                      event.severity === 'high' ? 'bg-orange-900/20 border-orange-500' :
                      event.severity === 'medium' ? 'bg-yellow-900/20 border-yellow-500' :
                      'bg-green-900/20 border-green-500'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <AlertTriangle className={`w-5 h-5 ${
                          event.severity === 'critical' ? 'text-red-400' :
                          event.severity === 'high' ? 'text-orange-400' :
                          event.severity === 'medium' ? 'text-yellow-400' :
                          'text-green-400'
                        }`} />
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          event.severity === 'critical' ? 'bg-red-500/20 text-red-300' :
                          event.severity === 'high' ? 'bg-orange-500/20 text-orange-300' :
                          event.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                          'bg-green-500/20 text-green-300'
                        }`}>
                          {event.severity.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-slate-300">{(event.probability * 100).toFixed(0)}%</div>
                        <div className="text-xs text-slate-400">PROBABILITY</div>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-white mb-2">{event.description}</h3>
                    <div className="text-sm text-slate-400 mb-3">
                      Expected time: T+{event.time.toFixed(1)} hours
                    </div>
                    
                    {event.requiredAction && (
                      <div className="bg-slate-900/50 rounded-lg p-3">
                        <div className="text-sm font-semibold text-cyan-400 mb-1">Required Action:</div>
                        <div className="text-slate-300">{event.requiredAction}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-700 p-6">
          <div className="flex items-center justify-between">
            <div className="text-slate-400">
              {!canStartMission() && (
                <span className="text-yellow-400">
                  Complete all required checklist items to start mission
                </span>
              )}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-6 py-2 border border-slate-600 rounded-lg hover:bg-slate-700 transition-colors text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={onStartMission}
                disabled={!canStartMission()}
                className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                  canStartMission()
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white'
                    : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                }`}
              >
                Launch Mission
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default MissionBriefing; 