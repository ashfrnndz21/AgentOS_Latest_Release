/**
 * Mock data for Strands-Enhanced Traceability
 * Realistic Air Liquide industrial workflow execution data
 */

import { 
  StrandsExecutionTrace, 
  NodeExecutionTrace, 
  StrandsAnalytics,
  IndustrialProcessTrace,
  StrandsWorkflowVisualization
} from './types';

// Mock Hydrogen Production Workflow Execution
export const mockHydrogenProductionTrace: StrandsExecutionTrace = {
  workflowId: 'hydrogen-prod-001',
  executionId: 'exec-hp-20241215-001',
  workflowName: 'Hydrogen Production Optimization',
  startTime: new Date('2024-12-15T09:00:00Z'),
  endTime: new Date('2024-12-15T09:12:34Z'),
  status: 'completed',
  executionPath: [
    'production-planner',
    'safety-validator',
    'electrolysis-optimizer',
    'quality-controller',
    'energy-manager',
    'output-aggregator'
  ],
  nodeExecutions: new Map([
    ['production-planner', {
      nodeId: 'production-planner',
      nodeName: 'Production Planning Agent',
      nodeType: 'strands-agent',
      startTime: new Date('2024-12-15T09:00:00Z'),
      endTime: new Date('2024-12-15T09:02:15Z'),
      duration: 135000,
      inputContext: {
        demand: 1000,
        energyPrice: 0.12,
        availableCapacity: 0.85
      },
      outputContext: {
        productionPlan: {
          targetOutput: 850,
          energyAllocation: 2.4,
          timeline: '4 hours',
          efficiency: 0.92
        }
      },
      reasoning: {
        objective: 'Optimize hydrogen production based on current demand and energy costs',
        approach: 'Multi-factor optimization considering demand, energy costs, and capacity',
        steps: [
          {
            step: 1,
            description: 'Analyze current demand patterns',
            input: { demand: 1000, historicalData: '30 days' },
            output: { demandTrend: 'increasing', confidence: 0.87 },
            reasoning: 'Historical data shows 15% increase in demand over past month',
            confidence: 0.87,
            duration: 25000
          },
          {
            step: 2,
            description: 'Evaluate energy cost optimization',
            input: { currentPrice: 0.12, forecast: '24 hours' },
            output: { optimalWindow: '09:00-13:00', savings: 0.03 },
            reasoning: 'Energy prices lowest during morning hours due to renewable availability',
            confidence: 0.92,
            duration: 35000
          },
          {
            step: 3,
            description: 'Calculate optimal production schedule',
            input: { demand: 1000, capacity: 0.85, energyWindow: '4 hours' },
            output: { schedule: 'optimized', efficiency: 0.92 },
            reasoning: 'Balanced approach maximizing efficiency while meeting demand',
            confidence: 0.89,
            duration: 75000
          }
        ],
        conclusion: 'Optimal production plan generated with 92% efficiency target',
        confidence: 0.89,
        alternatives: ['High-speed production', 'Energy-saving mode'],
        contextUsed: ['demand-forecast', 'energy-pricing', 'capacity-status'],
        toolsConsidered: ['demand-analyzer', 'energy-optimizer', 'capacity-planner']
      },
      toolsUsed: ['demand-analyzer', 'energy-optimizer'],
      tokensConsumed: 2847,
      confidence: 0.89,
      performance: {
        cpuUsage: 45,
        memoryUsage: 128,
        networkLatency: 23,
        throughput: 1250,
        errorRate: 0
      },
      status: 'completed'
    }],
    ['safety-validator', {
      nodeId: 'safety-validator',
      nodeName: 'Safety Validation Agent',
      nodeType: 'strands-guardrail',
      startTime: new Date('2024-12-15T09:02:15Z'),
      endTime: new Date('2024-12-15T09:03:45Z'),
      duration: 90000,
      inputContext: {
        productionPlan: {
          targetOutput: 850,
          energyAllocation: 2.4,
          timeline: '4 hours'
        }
      },
      outputContext: {
        safetyValidation: {
          status: 'approved',
          riskLevel: 'low',
          recommendations: ['Monitor pressure levels', 'Check cooling system']
        }
      },
      reasoning: {
        objective: 'Validate production plan against safety protocols',
        approach: 'Multi-layer safety analysis with regulatory compliance check',
        steps: [
          {
            step: 1,
            description: 'Pressure safety analysis',
            input: { targetOutput: 850, systemPressure: 'normal' },
            output: { pressureRisk: 'low', safetyMargin: 0.35 },
            reasoning: 'Production level well within safe pressure limits',
            confidence: 0.95,
            duration: 30000
          },
          {
            step: 2,
            description: 'Energy safety validation',
            input: { energyAllocation: 2.4, maxSafeLevel: 3.2 },
            output: { energySafety: 'approved', utilizationRatio: 0.75 },
            reasoning: 'Energy allocation 25% below maximum safe threshold',
            confidence: 0.98,
            duration: 25000
          },
          {
            step: 3,
            description: 'Regulatory compliance check',
            input: { productionPlan: 'optimized', regulations: 'ISO-14687' },
            output: { compliance: 'full', certificationValid: true },
            reasoning: 'All parameters comply with hydrogen production standards',
            confidence: 0.97,
            duration: 35000
          }
        ],
        conclusion: 'Production plan approved with low risk assessment',
        confidence: 0.97,
        contextUsed: ['safety-protocols', 'regulatory-standards', 'system-status'],
        toolsConsidered: ['pressure-analyzer', 'energy-validator', 'compliance-checker']
      },
      toolsUsed: ['pressure-analyzer', 'compliance-checker'],
      tokensConsumed: 1923,
      confidence: 0.97,
      performance: {
        cpuUsage: 32,
        memoryUsage: 96,
        networkLatency: 18,
        throughput: 980,
        errorRate: 0
      },
      status: 'completed'
    }]
  ]),
  contextEvolution: [
    {
      timestamp: new Date('2024-12-15T09:00:00Z'),
      nodeId: 'production-planner',
      contextData: { demand: 1000, energyPrice: 0.12 },
      contextSize: 1024,
      compressionLevel: 'none',
      preservedMemory: true
    },
    {
      timestamp: new Date('2024-12-15T09:02:15Z'),
      nodeId: 'safety-validator',
      contextData: { productionPlan: 'optimized', safetyStatus: 'validating' },
      contextSize: 1536,
      compressionLevel: 'summary',
      preservedMemory: true
    }
  ],
  handoffChain: [
    {
      fromNodeId: 'production-planner',
      toNodeId: 'safety-validator',
      timestamp: new Date('2024-12-15T09:02:15Z'),
      contextTransferred: 'compressed',
      contextSize: 1536,
      handoffReason: 'Safety validation required for production plan',
      expertiseMatch: true,
      success: true
    }
  ],
  reasoningChain: [
    {
      nodeId: 'production-planner',
      timestamp: new Date('2024-12-15T09:01:00Z'),
      reasoningType: 'sequential',
      reasoningDepth: 3,
      contextUtilization: 0.85,
      toolSelectionLogic: 'Demand analysis requires forecasting tools, energy optimization needs pricing data',
      confidenceEvolution: [0.75, 0.82, 0.87, 0.89]
    }
  ],
  toolUsagePattern: [
    {
      nodeId: 'production-planner',
      toolName: 'demand-analyzer',
      toolCategory: 'analysis',
      timestamp: new Date('2024-12-15T09:00:30Z'),
      duration: 45000,
      inputSize: 2048,
      outputSize: 1024,
      success: true
    },
    {
      nodeId: 'production-planner',
      toolName: 'energy-optimizer',
      toolCategory: 'optimization',
      timestamp: new Date('2024-12-15T09:01:15Z'),
      duration: 60000,
      inputSize: 1536,
      outputSize: 2048,
      success: true
    }
  ],
  metrics: {
    totalExecutionTime: 754000,
    nodeExecutionTimes: {
      'production-planner': 135000,
      'safety-validator': 90000
    },
    totalTokensUsed: 4770,
    averageConfidence: 0.93,
    toolsUsed: ['demand-analyzer', 'energy-optimizer', 'pressure-analyzer', 'compliance-checker'],
    handoffCount: 1,
    errorCount: 0,
    successRate: 1.0,
    contextEfficiency: 0.87,
    reasoningQuality: 0.91
  }
};

// Mock Financial Forecasting Workflow Execution
export const mockFinancialForecastingTrace: StrandsExecutionTrace = {
  workflowId: 'financial-forecast-001',
  executionId: 'exec-ff-20241215-002',
  workflowName: 'Industrial Gas Market Forecasting',
  startTime: new Date('2024-12-15T10:00:00Z'),
  endTime: new Date('2024-12-15T10:18:45Z'),
  status: 'completed',
  executionPath: [
    'market-analyst',
    'risk-assessor',
    'scenario-modeler',
    'compliance-checker',
    'report-generator'
  ],
  nodeExecutions: new Map([
    ['market-analyst', {
      nodeId: 'market-analyst',
      nodeName: 'Market Intelligence Agent',
      nodeType: 'strands-agent',
      startTime: new Date('2024-12-15T10:00:00Z'),
      endTime: new Date('2024-12-15T10:05:30Z'),
      duration: 330000,
      inputContext: {
        marketSegment: 'industrial-gases',
        timeHorizon: '12-months',
        regions: ['europe', 'asia-pacific']
      },
      outputContext: {
        marketAnalysis: {
          growthForecast: 0.08,
          volatilityIndex: 0.23,
          keyDrivers: ['energy-transition', 'industrial-recovery'],
          riskFactors: ['supply-chain', 'regulatory-changes']
        }
      },
      reasoning: {
        objective: 'Analyze industrial gas market trends and generate 12-month forecast',
        approach: 'Multi-source data analysis with machine learning trend detection',
        steps: [
          {
            step: 1,
            description: 'Historical data analysis',
            input: { timeRange: '5-years', dataPoints: 1200 },
            output: { trends: 'identified', seasonality: 'detected' },
            reasoning: 'Strong correlation between industrial activity and gas demand',
            confidence: 0.91,
            duration: 120000
          },
          {
            step: 2,
            description: 'External factor integration',
            input: { economicIndicators: 'current', geopoliticalEvents: 'recent' },
            output: { impactAssessment: 'moderate-positive', adjustmentFactor: 1.05 },
            reasoning: 'Energy transition driving increased hydrogen demand',
            confidence: 0.85,
            duration: 150000
          },
          {
            step: 3,
            description: 'Forecast generation',
            input: { historicalTrends: 'processed', externalFactors: 'integrated' },
            output: { forecast: '8% growth', confidence: 0.87 },
            reasoning: 'Balanced growth expected with moderate volatility',
            confidence: 0.87,
            duration: 60000
          }
        ],
        conclusion: '8% growth forecast with 23% volatility index',
        confidence: 0.87,
        contextUsed: ['market-data', 'economic-indicators', 'industry-reports'],
        toolsConsidered: ['trend-analyzer', 'volatility-calculator', 'forecast-engine']
      },
      toolsUsed: ['trend-analyzer', 'forecast-engine'],
      tokensConsumed: 3456,
      confidence: 0.87,
      performance: {
        cpuUsage: 68,
        memoryUsage: 256,
        networkLatency: 45,
        throughput: 2100,
        errorRate: 0
      },
      status: 'completed'
    }]
  ]),
  contextEvolution: [],
  handoffChain: [],
  reasoningChain: [],
  toolUsagePattern: [],
  metrics: {
    totalExecutionTime: 1125000,
    nodeExecutionTimes: {
      'market-analyst': 330000
    },
    totalTokensUsed: 3456,
    averageConfidence: 0.87,
    toolsUsed: ['trend-analyzer', 'forecast-engine'],
    handoffCount: 0,
    errorCount: 0,
    successRate: 1.0,
    contextEfficiency: 0.82,
    reasoningQuality: 0.88
  }
};

// Mock Analytics Data
export const mockStrandsAnalytics: StrandsAnalytics = {
  workflowEfficiency: {
    executionTime: {
      average: 845000,
      median: 754000,
      min: 330000,
      max: 1125000,
      trend: [800000, 820000, 845000, 830000, 810000]
    },
    tokenUsage: {
      totalUsed: 8226,
      averagePerNode: 2742,
      efficiency: 0.89,
      costEstimate: 0.16
    },
    toolUtilization: {
      mostUsed: ['trend-analyzer', 'energy-optimizer', 'compliance-checker'],
      efficiency: {
        'trend-analyzer': 0.92,
        'energy-optimizer': 0.88,
        'compliance-checker': 0.95
      },
      errorRates: {
        'trend-analyzer': 0.02,
        'energy-optimizer': 0.01,
        'compliance-checker': 0.00
      }
    },
    agentPerformance: {
      performance: {
        'production-planner': 0.89,
        'safety-validator': 0.97,
        'market-analyst': 0.87
      },
      specialization: {
        'production-planner': ['optimization', 'scheduling'],
        'safety-validator': ['compliance', 'risk-assessment'],
        'market-analyst': ['forecasting', 'trend-analysis']
      },
      collaboration: {
        'production-planner': 0.85,
        'safety-validator': 0.92,
        'market-analyst': 0.78
      }
    }
  },
  reasoningQuality: {
    confidenceDistribution: [0.75, 0.82, 0.87, 0.89, 0.92, 0.95, 0.97],
    reasoningDepth: [2, 3, 3, 4, 2],
    decisionAccuracy: 0.91,
    contextUtilization: 0.85
  },
  collaborationPatterns: {
    handoffEfficiency: 0.94,
    contextPreservation: 0.87,
    agentSpecialization: {
      'production-optimization': 0.89,
      'safety-validation': 0.97,
      'market-analysis': 0.87
    },
    loadDistribution: {
      'production-planner': 0.35,
      'safety-validator': 0.25,
      'market-analyst': 0.40
    }
  },
  industrialMetrics: {
    safetyCompliance: 0.98,
    qualityMetrics: {
      'hydrogen-purity': 99.97,
      'energy-efficiency': 0.92,
      'production-yield': 0.89
    },
    processEfficiency: 0.91,
    regulatoryCompliance: 0.96
  }
};

// Mock Workflow Visualization
export const mockWorkflowVisualization: StrandsWorkflowVisualization = {
  executionFlow: {
    nodes: [
      {
        id: 'production-planner',
        type: 'strands-agent',
        position: { x: 100, y: 100 },
        data: {
          name: 'Production Planning Agent',
          status: 'completed',
          performance: 0.89,
          confidence: 0.89
        }
      },
      {
        id: 'safety-validator',
        type: 'strands-guardrail',
        position: { x: 300, y: 100 },
        data: {
          name: 'Safety Validation Agent',
          status: 'completed',
          performance: 0.97,
          confidence: 0.97
        }
      }
    ],
    edges: [
      {
        id: 'e1',
        source: 'production-planner',
        target: 'safety-validator',
        animated: true,
        style: { stroke: '#10b981', strokeWidth: 2 }
      }
    ],
    currentNode: 'safety-validator',
    executionPath: ['production-planner', 'safety-validator']
  },
  reasoningBubbles: [
    {
      nodeId: 'production-planner',
      position: { x: 150, y: 50 },
      reasoning: mockHydrogenProductionTrace.nodeExecutions.get('production-planner')!.reasoning,
      expanded: false
    }
  ],
  contextFlow: {
    flows: [
      {
        fromNode: 'production-planner',
        toNode: 'safety-validator',
        contextData: { productionPlan: 'optimized' },
        compressionRatio: 0.75,
        transferTime: 150
      }
    ],
    currentContext: { productionPlan: 'optimized', safetyStatus: 'approved' },
    contextSize: 1536
  },
  toolUsageIndicators: [
    {
      nodeId: 'production-planner',
      tools: [
        {
          toolName: 'demand-analyzer',
          usageCount: 1,
          averageDuration: 45000,
          successRate: 1.0
        },
        {
          toolName: 'energy-optimizer',
          usageCount: 1,
          averageDuration: 60000,
          successRate: 1.0
        }
      ],
      totalUsage: 2
    }
  ],
  performanceHeatmap: {
    heatmapData: [
      {
        nodeId: 'production-planner',
        x: 100,
        y: 100,
        value: 0.89,
        metric: 'performance'
      },
      {
        nodeId: 'safety-validator',
        x: 300,
        y: 100,
        value: 0.97,
        metric: 'performance'
      }
    ],
    performanceMetrics: {
      'average-performance': 0.93,
      'total-efficiency': 0.91,
      'error-rate': 0.00
    },
    bottlenecks: []
  }
};

// Helper function to get mock data by project
export const getMockTraceByProject = (projectId: string): StrandsExecutionTrace => {
  switch (projectId) {
    case 'hydrogen-production':
      return mockHydrogenProductionTrace;
    case 'industrial-forecasting':
      return mockFinancialForecastingTrace;
    case 'process-engineering':
      return mockHydrogenProductionTrace; // Reuse for now
    default:
      return mockHydrogenProductionTrace;
  }
};

export const getMockAnalytics = (): StrandsAnalytics => mockStrandsAnalytics;
export const getMockVisualization = (): StrandsWorkflowVisualization => mockWorkflowVisualization;