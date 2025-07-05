import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  Award, 
  Users, 
  Clock, 
  Target, 
  Brain,
  Shield,
  Zap,
  BarChart3,
  LineChart,
  PieChart,
  Calendar,
  BookOpen,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Trophy,
  Star,
  Rocket,
  Globe,
  Activity,
  Eye,
  Download,
  Filter,
  RefreshCw,
  Code,
  Radio,
  Cpu,
  Box,
  GitBranch,
  Orbit,
  ChevronRight,
  CheckCircle,
  Lock
} from 'lucide-react';

interface TrainingRecord {
  id: string;
  missionName: string;
  scenario: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  score: number;
  maxScore: number;
  completionTime: number;
  timestamp: Date;
  objectivesCompleted: number;
  totalObjectives: number;
  anomaliesEncountered: number;
  anomaliesResolved: number;
  certification?: string;
}

interface Certification {
  id: string;
  name: string;
  description: string;
  requirements: Array<{
    missionType: string;
    minScore: number;
    requiredScenarios: string[];
  }>;
  badgeColor: string;
  level: 'basic' | 'advanced' | 'expert' | 'master';
  validityPeriod: number; // in months
}

interface PerformanceMetrics {
  overallScore: number;
  missionsCompleted: number;
  averageScore: number;
  bestScore: number;
  streakCount: number;
  totalTrainingHours: number;
  certificationCount: number;
  skillRatings: {
    missionPlanning: number;
    systemsManagement: number;
    emergencyResponse: number;
    teamwork: number;
    decisionMaking: number;
  };
}

interface TrainingModule {
  id: number;
  title: string;
  description: string;
  icon: React.ElementType;
  progress: number;
  duration: string;
  difficulty: 'Advanced' | 'Expert';
  certification: string;
  locked?: boolean;
}

const CERTIFICATIONS: Certification[] = [
  {
    id: 'mission-ops-basic',
    name: 'Mission Operations Specialist',
    description: 'Basic certification for mission operations and spacecraft systems management',
    requirements: [
      {
        missionType: 'orbital',
        minScore: 7500,
        requiredScenarios: ['iss-docking', 'jwst-deployment']
      }
    ],
    badgeColor: 'from-blue-500 to-cyan-500',
    level: 'basic',
    validityPeriod: 24
  },
  {
    id: 'emergency-response',
    name: 'Emergency Response Specialist',
    description: 'Advanced certification for handling critical mission anomalies and emergencies',
    requirements: [
      {
        missionType: 'landing',
        minScore: 8000,
        requiredScenarios: ['perseverance-edl']
      }
    ],
    badgeColor: 'from-red-500 to-orange-500',
    level: 'advanced',
    validityPeriod: 18
  },
  {
    id: 'deep-space-expert',
    name: 'Deep Space Mission Expert',
    description: 'Expert-level certification for complex interplanetary missions',
    requirements: [
      {
        missionType: 'interplanetary',
        minScore: 9000,
        requiredScenarios: ['cassini-soi', 'europa-clipper']
      }
    ],
    badgeColor: 'from-purple-500 to-pink-500',
    level: 'expert',
    validityPeriod: 12
  },
  {
    id: 'flight-director',
    name: 'Flight Director',
    description: 'Master-level certification for leading mission control operations',
    requirements: [
      {
        missionType: 'orbital',
        minScore: 9500,
        requiredScenarios: ['cassini-soi', 'jwst-deployment', 'perseverance-edl', 'iss-docking']
      }
    ],
    badgeColor: 'from-yellow-500 to-amber-500',
    level: 'master',
    validityPeriod: 36
  }
];

const TRAINING_MODULES = [
  {
    id: 'iss-operations',
    name: 'ISS Operations',
    description: 'Learn to operate and monitor the International Space Station',
    requiredScenarios: ['iss-tracking', 'iss-maintenance']
  },
  {
    id: 'iss-systems',
    name: 'ISS Systems',
    description: 'Master ISS systems and subsystems',
    requiredScenarios: ['iss-power', 'iss-life-support', 'iss-communication']
  }
];

const COMPLETED_MISSIONS = [
  {
    missionName: 'ISS Tracking and Monitoring',
    scenario: 'iss-tracking',
    completionDate: '2024-03-10',
    score: 95,
    duration: '45 minutes',
    achievements: ['Perfect Landing', 'Efficient Route', 'Quick Response']
  }
];

const trainingModules: TrainingModule[] = [
  {
    id: 1,
    title: 'Model-Based Systems Engineering (MBSE)',
    description: 'Master SysML/Cameo for requirements, interfaces, and ICD generation in multi-partner space missions.',
    icon: Box,
    progress: 0,
    duration: '40 hours',
    difficulty: 'Expert',
    certification: 'MBSE Professional'
  },
  {
    id: 2,
    title: 'On-Board FDIR Systems',
    description: 'Design rule-based and AI-assisted fault detection systems for high-availability spacecraft.',
    icon: Shield,
    progress: 0,
    duration: '35 hours',
    difficulty: 'Expert',
    certification: 'FDIR Specialist'
  },
  {
    id: 3,
    title: 'Radiation-Tolerant Hardware Design',
    description: 'Learn TID budgeting, SEE prediction, and ECSS-Q-ST-30 derating standards.',
    icon: Cpu,
    progress: 0,
    duration: '45 hours',
    difficulty: 'Expert',
    certification: 'Rad-Hard Design Expert',
    locked: true
  },
  {
    id: 4,
    title: 'Spacecraft Cybersecurity',
    description: 'Implement CCSDS SDLS and zero-trust architectures for space systems.',
    icon: Shield,
    progress: 0,
    duration: '30 hours',
    difficulty: 'Advanced',
    certification: 'Space Cybersecurity Specialist'
  },
  {
    id: 5,
    title: 'Advanced Link Optimization',
    description: 'Implement adaptive coding, beam-steering, and LEO-ground handoff automation.',
    icon: Radio,
    progress: 0,
    duration: '35 hours',
    difficulty: 'Expert',
    certification: 'RF Systems Expert',
    locked: true
  },
  {
    id: 6,
    title: 'Multiphysics Simulation',
    description: 'Master coupled ANSYS/ESATAN/OpticStudio for comprehensive space system modeling.',
    icon: Box,
    progress: 0,
    duration: '50 hours',
    difficulty: 'Expert',
    certification: 'Space Systems Simulation Expert',
    locked: true
  },
  {
    id: 7,
    title: 'Edge AI for Space Systems',
    description: 'Deploy TensorRT/ONNX models on radiation-tolerant hardware for autonomous operations.',
    icon: Brain,
    progress: 0,
    duration: '40 hours',
    difficulty: 'Expert',
    certification: 'Space AI/ML Specialist'
  },
  {
    id: 8,
    title: 'Mission Ops Automation',
    description: 'Implement CI/CD, containerized tools, and on-orbit software updates.',
    icon: GitBranch,
    progress: 0,
    duration: '30 hours',
    difficulty: 'Advanced',
    certification: 'Mission Ops Automation Engineer'
  },
  {
    id: 9,
    title: 'Space Regulatory Strategy',
    description: 'Navigate ITU filings, licensing, and debris-mitigation requirements.',
    icon: Globe,
    progress: 0,
    duration: '25 hours',
    difficulty: 'Advanced',
    certification: 'Space Regulatory Specialist'
  },
  {
    id: 10,
    title: 'In-Orbit Servicing & RPO',
    description: 'Learn RPO sensors, GN&C, and legal frameworks for the servicing economy.',
    icon: Orbit,
    progress: 0,
    duration: '45 hours',
    difficulty: 'Expert',
    certification: 'RPO Operations Specialist',
    locked: true
  }
];

const mockTrainingRecords: TrainingRecord[] = [
  {
    id: '1',
    missionName: 'Cassini Saturn Orbit Insertion',
    scenario: 'cassini-soi',
    difficulty: 'expert',
    score: 8750,
    maxScore: 10000,
    completionTime: 4.2,
    timestamp: new Date('2024-01-15'),
    objectivesCompleted: 3,
    totalObjectives: 4,
    anomaliesEncountered: 2,
    anomaliesResolved: 2,
    certification: 'deep-space-expert'
  },
  {
    id: '2',
    missionName: 'ISS Dragon Docking',
    scenario: 'iss-docking',
    difficulty: 'intermediate',
    score: 7200,
    maxScore: 8000,
    completionTime: 1.8,
    timestamp: new Date('2024-01-10'),
    objectivesCompleted: 4,
    totalObjectives: 4,
    anomaliesEncountered: 1,
    anomaliesResolved: 1,
    certification: 'mission-ops-basic'
  }
];

const AdvancedTrainingDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'certifications' | 'analytics'>('overview');
  const [trainingRecords] = useState<TrainingRecord[]>(mockTrainingRecords);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [performanceMetrics] = useState<PerformanceMetrics>({
    overallScore: 8475,
    missionsCompleted: 12,
    averageScore: 7891,
    bestScore: 8750,
    streakCount: 5,
    totalTrainingHours: 24.5,
    certificationCount: 2,
    skillRatings: {
      missionPlanning: 85,
      systemsManagement: 78,
      emergencyResponse: 92,
      teamwork: 88,
      decisionMaking: 81
    }
  });
  const [selectedModule, setSelectedModule] = useState<TrainingModule | null>(null);

  const getPerformanceGrade = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 95) return { grade: 'A+', color: 'text-green-400' };
    if (percentage >= 90) return { grade: 'A', color: 'text-green-400' };
    if (percentage >= 85) return { grade: 'B+', color: 'text-blue-400' };
    if (percentage >= 80) return { grade: 'B', color: 'text-blue-400' };
    if (percentage >= 75) return { grade: 'C+', color: 'text-yellow-400' };
    if (percentage >= 70) return { grade: 'C', color: 'text-yellow-400' };
    return { grade: 'F', color: 'text-red-400' };
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'expert': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'advanced': return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case 'intermediate': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      default: return 'bg-green-500/20 text-green-300 border-green-500/30';
    }
  };

  const StatCard = ({ icon: Icon, label, value, change, color = 'text-cyan-400' }: {
    icon: any;
    label: string;
    value: string | number;
    change?: string;
    color?: string;
  }) => (
    <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <Icon className={`w-6 h-6 ${color}`} />
        {change && (
          <span className={`text-sm ${change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
            {change}
          </span>
        )}
      </div>
      <div className="space-y-1">
        <div className={`text-2xl font-bold ${color}`}>{value}</div>
        <div className="text-sm text-slate-400">{label}</div>
      </div>
    </div>
  );

  const SkillRadarChart = ({ skills }: { skills: PerformanceMetrics['skillRatings'] }) => (
    <div className="relative w-48 h-48 mx-auto">
      <svg viewBox="0 0 200 200" className="w-full h-full">
        {/* Pentagon grid */}
        {[1, 2, 3, 4, 5].map(level => (
          <polygon
            key={level}
            points="100,20 180,76 156,164 44,164 20,76"
            fill="none"
            stroke="rgb(71, 85, 105)"
            strokeWidth="1"
            opacity={0.3}
            transform={`scale(${level / 5})`}
            transformOrigin="100 100"
          />
        ))}
        
        {/* Skill area */}
        <polygon
          points={`
            100,${20 + (100 - skills.missionPlanning) * 0.8}
            ${180 - (100 - skills.systemsManagement) * 0.8},76
            ${156 - (100 - skills.emergencyResponse) * 0.56},164
            ${44 + (100 - skills.teamwork) * 0.56},164
            ${20 + (100 - skills.decisionMaking) * 0.8},76
          `}
          fill="rgba(96, 165, 250, 0.3)"
          stroke="rgb(96, 165, 250)"
          strokeWidth="2"
        />
        
        {/* Skill points */}
        {Object.entries(skills).map(([skill, value], index) => {
          const angles = [0, 72, 144, 216, 288];
          const angle = (angles[index] - 90) * (Math.PI / 180);
          const radius = 80 * (value / 100);
          const x = 100 + radius * Math.cos(angle);
          const y = 100 + radius * Math.sin(angle);
          
          return (
            <circle
              key={skill}
              cx={x}
              cy={y}
              r="4"
              fill="rgb(96, 165, 250)"
            />
          );
        })}
      </svg>
      
      {/* Skill labels */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          {Object.entries(skills).map(([skill, value], index) => {
            const angles = [0, 72, 144, 216, 288];
            const angle = angles[index] - 90;
            const radius = 110;
            const x = Math.cos(angle * (Math.PI / 180)) * radius;
            const y = Math.sin(angle * (Math.PI / 180)) * radius;
            
            return (
              <div
                key={skill}
                className="absolute text-xs text-slate-300 font-medium"
                style={{
                  left: `calc(50% + ${x}px)`,
                  top: `calc(50% + ${y}px)`,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <div className="text-center">
                  <div className="capitalize">{skill.replace(/([A-Z])/g, ' $1').trim()}</div>
                  <div className="text-cyan-400 font-bold">{value}%</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-full bg-gray-900 text-white p-6">
      <div className="flex-1 flex flex-col">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Advanced Space Engineering Training</h1>
          <p className="text-gray-400">Master cutting-edge space systems engineering through hands-on modules</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {trainingModules.map((module) => (
            <div
              key={module.id}
              className={`relative bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition-all cursor-pointer ${
                module.locked ? 'opacity-75' : ''
              }`}
              onClick={() => !module.locked && setSelectedModule(module)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-500/20 rounded-lg">
                    <module.icon className="w-6 h-6 text-blue-400" />
              </div>
                          <div>
                    <h3 className="font-semibold mb-1">{module.title}</h3>
                    <p className="text-sm text-gray-400">{module.description}</p>
                            </div>
                          </div>
                {module.locked && (
                  <div className="absolute top-4 right-4">
                    <Lock className="w-5 h-5 text-gray-500" />
                            </div>
                          )}
              </div>

              <div className="mt-4 flex items-center justify-between text-sm">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center text-gray-400">
                    <Clock className="w-4 h-4 mr-1" />
                    {module.duration}
                  </div>
                  <div className="flex items-center text-gray-400">
                    <Award className="w-4 h-4 mr-1" />
                    {module.difficulty}
                        </div>
                      </div>
                <div className="flex items-center text-blue-400">
                  <span className="mr-2">Start Module</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-4">
                <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all duration-300"
                    style={{ width: `${module.progress}%` }}
                            />
                </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

      {/* Module details sidebar */}
      {selectedModule && (
        <div className="w-96 ml-6 bg-gray-800 p-6 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">{selectedModule.title}</h2>
            <button
              onClick={() => setSelectedModule(null)}
              className="text-gray-400 hover:text-white"
            >
              ×
            </button>
                      </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-400 mb-2">Certification</h3>
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-yellow-400" />
                <span>{selectedModule.certification}</span>
                      </div>
                    </div>
                    
            <div>
              <h3 className="text-sm font-semibold text-gray-400 mb-2">Prerequisites</h3>
              <ul className="space-y-2">
                <li className="flex items-center text-sm">
                  <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                  Basic spacecraft systems knowledge
                </li>
                <li className="flex items-center text-sm">
                  <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                  Programming fundamentals
                </li>
                <li className="flex items-center text-sm">
                  <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                  Systems engineering basics
                </li>
              </ul>
                          </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-400 mb-2">What You'll Learn</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• Industry-standard tools and methodologies</li>
                <li>• Real-world case studies and examples</li>
                <li>• Hands-on practical exercises</li>
                <li>• Best practices and design patterns</li>
              </ul>
                    </div>
                    
            <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition-colors">
              Begin Training
                    </button>
                  </div>
              </div>
          )}
    </div>
  );
};

export default AdvancedTrainingDashboard; 