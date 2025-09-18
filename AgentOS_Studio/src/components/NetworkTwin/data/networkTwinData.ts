// Comprehensive static data for Network Twin

export interface CellSite {
  id: string;
  name: string;
  type: 'macro' | 'micro' | 'small' | 'femto';
  coordinates: [number, number];
  district: string;
  region: string;
  status: 'active' | 'inactive' | 'maintenance';
  congestion: number;
  capacity: number;
  utilization: number;
  technology: '4G' | '5G' | 'Hybrid';
  customers: number;
  revenue: number;
  churnRate: number;
  avgArpu: number;
  lastMaintenance: string;
  nextMaintenance: string;
  issues: string[];
  performanceScore: number;
}

export interface NetworkAgent {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'idle' | 'busy' | 'error';
  description: string;
  capabilities: string[];
  metrics: {
    accuracy: number;
    reliability: number;
    speed: number;
    coverage: number;
  };
  lastDeployed: string;
  deploymentHistory: Array<{
    date: string;
    duration: number;
    result: string;
    impact: string;
  }>;
  currentTask?: string;
  queuedTasks: number;
}

export interface SimulationScenario {
  id: string;
  name: string;
  type: 'traffic-growth' | 'failure-recovery' | 'capacity-expansion' | 'optimization';
  description: string;
  parameters: Record<string, any>;
  status: 'draft' | 'running' | 'completed' | 'failed';
  results?: {
    duration: number;
    impact: Record<string, number>;
    recommendations: string[];
    costBenefit: number;
  };
  createdAt: string;
  lastRun?: string;
}

// Network datasets for different Malaysian regions
export const networkDatasets = {
  kl: {
    name: 'Kuala Lumpur Metro',
    cellSites: [
      {
        id: 'KL001',
        name: 'KLCC Twin Towers',
        type: 'macro' as const,
        coordinates: [101.7117, 3.1578] as [number, number],
        district: 'Kuala Lumpur City Centre',
        region: 'Kuala Lumpur',
        status: 'active' as const,
        congestion: 0.89,
        capacity: 1200,
        utilization: 1068,
        technology: '5G' as const,
        customers: 850,
        revenue: 12400,
        churnRate: 0.021,
        avgArpu: 145,
        lastMaintenance: '2024-01-15',
        nextMaintenance: '2024-07-15',
        issues: ['Peak hour congestion in business district'],
        performanceScore: 88
      },
      {
        id: 'KL002',
        name: 'Bukit Bintang Shopping District',
        type: 'micro' as const,
        coordinates: [101.7103, 3.1478] as [number, number],
        district: 'Bukit Bintang',
        region: 'Kuala Lumpur',
        status: 'active' as const,
        congestion: 0.94,
        capacity: 800,
        utilization: 752,
        technology: 'Hybrid' as const,
        customers: 720,
        revenue: 9950,
        churnRate: 0.028,
        avgArpu: 138,
        lastMaintenance: '2024-02-08',
        nextMaintenance: '2024-08-08',
        issues: ['Critical congestion during shopping hours', 'Mall interference'],
        performanceScore: 79
      },
      {
        id: 'KL003',
        name: 'Mont Kiara Residential',
        type: 'small' as const,
        coordinates: [101.6503, 3.1728] as [number, number],
        district: 'Mont Kiara',
        region: 'Kuala Lumpur',
        status: 'active' as const,
        congestion: 0.52,
        capacity: 450,
        utilization: 234,
        technology: '4G' as const,
        customers: 380,
        revenue: 6270,
        churnRate: 0.015,
        avgArpu: 165,
        lastMaintenance: '2024-03-02',
        nextMaintenance: '2024-09-02',
        issues: [],
        performanceScore: 93
      }
    ]
  },
  johor: {
    name: 'Johor Bahru Metro',
    cellSites: [
      {
        id: 'JB001',
        name: 'JB City Square',
        type: 'macro' as const,
        coordinates: [103.7414, 1.4927] as [number, number],
        district: 'Johor Bahru',
        region: 'Johor',
        status: 'active' as const,
        congestion: 0.76,
        capacity: 900,
        utilization: 684,
        technology: '5G' as const,
        customers: 680,
        revenue: 8700,
        churnRate: 0.019,
        avgArpu: 128,
        lastMaintenance: '2024-01-20',
        nextMaintenance: '2024-07-20',
        issues: ['Cross-border traffic surge during weekends'],
        performanceScore: 86
      },
      {
        id: 'JB002',
        name: 'Skudai University Town',
        type: 'micro' as const,
        coordinates: [103.6414, 1.5327] as [number, number],
        district: 'Skudai',
        region: 'Johor',
        status: 'active' as const,
        congestion: 0.68,
        capacity: 600,
        utilization: 408,
        technology: 'Hybrid' as const,
        customers: 520,
        revenue: 6140,
        churnRate: 0.022,
        avgArpu: 118,
        lastMaintenance: '2024-02-15',
        nextMaintenance: '2024-08-15',
        issues: ['Student area high data usage'],
        performanceScore: 89
      }
    ]
  },
  penang: {
    name: 'Penang Island',
    cellSites: [
      {
        id: 'PG001',
        name: 'Georgetown Heritage Zone',
        type: 'macro' as const,
        coordinates: [100.3414, 5.4141] as [number, number],
        district: 'Georgetown',
        region: 'Penang',
        status: 'active' as const,
        congestion: 0.71,
        capacity: 700,
        utilization: 497,
        technology: '5G' as const,
        customers: 580,
        revenue: 7660,
        churnRate: 0.017,
        avgArpu: 132,
        lastMaintenance: '2024-01-25',
        nextMaintenance: '2024-07-25',
        issues: ['Heritage building restrictions', 'Tourist area congestion'],
        performanceScore: 87
      },
      {
        id: 'PG002',
        name: 'Bayan Lepas Tech Park',
        type: 'micro' as const,
        coordinates: [100.2814, 5.3241] as [number, number],
        district: 'Bayan Lepas',
        region: 'Penang',
        status: 'active' as const,
        congestion: 0.59,
        capacity: 550,
        utilization: 325,
        technology: 'Hybrid' as const,
        customers: 450,
        revenue: 6390,
        churnRate: 0.020,
        avgArpu: 142,
        lastMaintenance: '2024-02-18',
        nextMaintenance: '2024-08-18',
        issues: [],
        performanceScore: 91
      }
    ]
  },
  sabah: {
    name: 'Kota Kinabalu Metro',
    cellSites: [
      {
        id: 'KK001',
        name: 'KK City Centre',
        type: 'macro' as const,
        coordinates: [116.0753, 5.9789] as [number, number],
        district: 'Kota Kinabalu',
        region: 'Sabah',
        status: 'active' as const,
        congestion: 0.74,
        capacity: 600,
        utilization: 444,
        technology: '5G' as const,
        customers: 420,
        revenue: 5250,
        churnRate: 0.023,
        avgArpu: 125,
        lastMaintenance: '2024-01-30',
        nextMaintenance: '2024-07-30',
        issues: ['Remote location challenges'],
        performanceScore: 84
      }
    ]
  }
};

// Default export for backward compatibility
export const cellSites: CellSite[] = networkDatasets.kl.cellSites;

export const networkAgents: NetworkAgent[] = [
  {
    id: 'agent-001',
    name: 'Network Topology Analyzer',
    type: 'topology',
    status: 'active',
    description: 'Analyzes network structure, connectivity patterns, and identifies optimization opportunities',
    capabilities: ['Topology Mapping', 'Connection Analysis', 'Path Optimization', 'Redundancy Assessment'],
    metrics: {
      accuracy: 94,
      reliability: 97,
      speed: 89,
      coverage: 92
    },
    lastDeployed: '2024-01-20T10:30:00Z',
    deploymentHistory: [
      {
        date: '2024-01-20',
        duration: 45,
        result: 'Success',
        impact: 'Identified 3 optimization opportunities'
      },
      {
        date: '2024-01-15',
        duration: 52,
        result: 'Success',
        impact: 'Mapped 250+ network connections'
      }
    ],
    currentTask: 'Analyzing Central Jakarta topology',
    queuedTasks: 2
  },
  {
    id: 'agent-002',
    name: 'Customer Churn Predictor',
    type: 'churn-analysis',
    status: 'busy',
    description: 'Predicts customer churn risk based on network performance and usage patterns',
    capabilities: ['Churn Prediction', 'Risk Scoring', 'Behavior Analysis', 'Retention Recommendations'],
    metrics: {
      accuracy: 91,
      reliability: 88,
      speed: 93,
      coverage: 87
    },
    lastDeployed: '2024-01-22T14:15:00Z',
    deploymentHistory: [
      {
        date: '2024-01-22',
        duration: 120,
        result: 'In Progress',
        impact: 'Processing 15,000 customer profiles'
      },
      {
        date: '2024-01-18',
        duration: 95,
        result: 'Success',
        impact: 'Identified 450 high-risk customers'
      }
    ],
    currentTask: 'Processing churn risk analysis for South Jakarta',
    queuedTasks: 5
  },
  {
    id: 'agent-003',
    name: 'Capacity Optimizer',
    type: 'capacity',
    status: 'idle',
    description: 'Optimizes network capacity allocation and predicts future capacity requirements',
    capabilities: ['Capacity Planning', 'Load Balancing', 'Resource Optimization', 'Forecasting'],
    metrics: {
      accuracy: 96,
      reliability: 94,
      speed: 78,
      coverage: 89
    },
    lastDeployed: '2024-01-19T09:45:00Z',
    deploymentHistory: [
      {
        date: '2024-01-19',
        duration: 180,
        result: 'Success',
        impact: 'Optimized capacity for 12 high-traffic sites'
      }
    ],
    queuedTasks: 1
  },
  {
    id: 'agent-004',
    name: 'Service Quality Monitor',
    type: 'quality',
    status: 'active',
    description: 'Monitors service quality metrics and identifies performance degradation',
    capabilities: ['QoS Monitoring', 'Performance Analysis', 'SLA Tracking', 'Alert Generation'],
    metrics: {
      accuracy: 98,
      reliability: 96,
      speed: 95,
      coverage: 94
    },
    lastDeployed: '2024-01-22T16:00:00Z',
    deploymentHistory: [
      {
        date: '2024-01-22',
        duration: 30,
        result: 'Success',
        impact: 'Detected 2 performance anomalies'
      }
    ],
    currentTask: 'Real-time quality monitoring',
    queuedTasks: 0
  }
];

export const simulationScenarios: SimulationScenario[] = [
  {
    id: 'sim-001',
    name: '5G Traffic Growth Scenario',
    type: 'traffic-growth',
    description: 'Simulates 200% traffic growth over 12 months with 5G adoption',
    parameters: {
      trafficGrowthRate: 200,
      timeframe: 12,
      technology: '5G',
      region: 'Jakarta'
    },
    status: 'completed',
    results: {
      duration: 45,
      impact: {
        capacityUtilization: 89,
        revenueIncrease: 34,
        infrastructureCost: 12,
        customerSatisfaction: 91
      },
      recommendations: [
        'Deploy 15 additional micro cells in high-traffic areas',
        'Upgrade 8 existing macro sites to 5G SA',
        'Implement dynamic spectrum sharing'
      ],
      costBenefit: 2.8
    },
    createdAt: '2024-01-15T10:00:00Z',
    lastRun: '2024-01-20T14:30:00Z'
  },
  {
    id: 'sim-002',
    name: 'Business District Congestion Relief',
    type: 'optimization',
    description: 'Optimization scenario for Central Business District during peak hours',
    parameters: {
      targetArea: 'Central Jakarta CBD',
      peakHours: '08:00-10:00, 17:00-19:00',
      optimizationGoal: 'reduce_congestion'
    },
    status: 'completed',
    results: {
      duration: 25,
      impact: {
        congestionReduction: 45,
        customerExperience: 87,
        networkEfficiency: 92,
        operationalCost: -8
      },
      recommendations: [
        'Implement load balancing across 3 macro sites',
        'Deploy temporary small cells during peak hours',
        'Adjust antenna tilt angles for better coverage'
      ],
      costBenefit: 4.2
    },
    createdAt: '2024-01-18T09:15:00Z',
    lastRun: '2024-01-21T11:45:00Z'
  },
  {
    id: 'sim-003',
    name: 'Disaster Recovery Simulation',
    type: 'failure-recovery',
    description: 'Simulates major site failure and recovery procedures',
    parameters: {
      failureType: 'power_outage',
      affectedSites: ['JKT001', 'JKT002'],
      duration: 4,
      recoveryTime: 30
    },
    status: 'draft',
    createdAt: '2024-01-22T13:20:00Z'
  }
];

export const getAgentsByType = (type?: string) => {
  if (!type) return networkAgents;
  return networkAgents.filter(agent => agent.type === type);
};

export const getSitesByRegion = (region?: string) => {
  if (!region || region === 'all') return cellSites;
  return cellSites.filter(site => site.region === region);
};

export const getSitesByDistrict = (district?: string) => {
  if (!district || district === 'all') return cellSites;
  return cellSites.filter(site => site.district === district);
};

export const getSimulationsByType = (type?: string) => {
  if (!type) return simulationScenarios;
  return simulationScenarios.filter(scenario => scenario.type === type);
};