import { Activity, Compass, Rocket, Trophy } from 'lucide-react';

export const SIMULATION_MODES = {
  TRAINING: 'training',
  PROFESSIONAL: 'professional',
  RESEARCH: 'research'
} as const;

export const TRAINING_MODULES = [
  {
    id: 'basic-operations',
    name: 'Basic Operations',
    category: 'operations',
    scenarios: [
      {
        id: 'iss-tracking',
        name: 'ISS Tracking and Monitoring',
        description: 'Learn to track and monitor the International Space Station in real-time.',
        difficulty: 'beginner',
        duration: 30,
        missionType: 'orbital',
        spacecraft: 'station',
        objectives: [
          {
            id: 'obj-1',
            description: 'Initialize ISS tracking system',
            type: 'primary',
            status: 'pending',
            points: 100
          },
          {
            id: 'obj-2',
            description: 'Monitor ISS telemetry data',
            type: 'primary',
            status: 'pending',
            points: 150
          },
          {
            id: 'obj-3',
            description: 'Analyze orbital parameters',
            type: 'secondary',
            status: 'pending',
            points: 100
          }
        ],
        initialConditions: {
          position: [0, 0, 408],
          velocity: [7.66, 0, 0],
          fuel: 100,
          systemHealth: 100
        },
        criticalEvents: [
          {
            type: 'communication',
            time: 600,
            probability: 0.3,
            severity: 'medium',
            description: 'Communication signal degradation',
            requiredAction: 'Switch to backup communication system'
          }
        ]
      }
    ],
    certification: false
  },
  {
    id: 'advanced-operations',
    name: 'Advanced Operations',
    category: 'operations',
    scenarios: [
      {
        id: 'iss-maintenance',
        name: 'ISS Maintenance Operations',
        description: 'Conduct maintenance operations on the International Space Station.',
        difficulty: 'intermediate',
        duration: 60,
        missionType: 'maintenance',
        spacecraft: 'station',
        objectives: [
          {
            id: 'obj-1',
            description: 'Perform system diagnostics',
            type: 'primary',
            status: 'pending',
            points: 200
          },
          {
            id: 'obj-2',
            description: 'Execute maintenance procedures',
            type: 'primary',
            status: 'pending',
            points: 300
          },
          {
            id: 'obj-3',
            description: 'Verify system functionality',
            type: 'secondary',
            status: 'pending',
            points: 150
          }
        ],
        initialConditions: {
          position: [0, 0, 408],
          velocity: [7.66, 0, 0],
          fuel: 100,
          systemHealth: 85
        },
        criticalEvents: [
          {
            type: 'system',
            time: 1200,
            probability: 0.4,
            severity: 'high',
            description: 'Critical system malfunction',
            requiredAction: 'Execute emergency repair procedure'
          }
        ]
      }
    ],
    certification: true
  }
];

export const PROFESSIONAL_SCENARIOS = [
  {
    id: 'cassini-soi',
    name: 'Cassini Saturn Orbit Insertion',
    description: 'Execute the critical Saturn orbit insertion maneuver',
    difficulty: 'expert',
    duration: 4,
    missionType: 'interplanetary',
    spacecraft: 'probe',
    objectives: [
      {
        id: 'soi-burn',
        description: 'Complete orbit insertion burn',
        type: 'primary',
        status: 'pending',
        points: 500
      }
    ],
    initialConditions: {
      position: [0, 0, 0],
      velocity: [0, 0, 0],
      fuel: 100,
      systemHealth: 100
    },
    criticalEvents: [
      {
        type: 'engine-anomaly',
        time: 1.5,
        probability: 0.3,
        severity: 'critical',
        description: 'Main engine performance degradation detected',
        requiredAction: 'Switch to backup thrusters'
      }
    ],
    realMissionBasis: 'NASA Cassini-Huygens Mission'
  }
]; 