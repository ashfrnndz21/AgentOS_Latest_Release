
// Define mock decision nodes and data lineage for different industries
import { NodeType } from '@/components/DecisionPath/types';
import { ModelInfo } from '@/components/AgentTraceability';

export const getProjectData = () => {
  return {
    'hydrogen-production': {
      department: 'Hydrogen Production',
      decisionNodes: generateHydrogenProductionDecisionNodes(),
      lineageNodes: generateHydrogenProductionLineageNodes(),
      lineageEdges: generateHydrogenProductionLineageEdges(),
      agents: [
        {
          name: "Electrolysis Process Agent",
          description: "Monitors and optimizes hydrogen electrolysis production processes",
          model: {
            name: "GPT-4o",
            provider: "OpenAI",
            paramSize: "1.76 trillion",
            contextLength: "128,000 tokens", 
            latency: "250ms",
            role: "Automates electrolysis parameter optimization and process control"
          },
          tools: ["Process control systems", "Energy optimization algorithms", "Quality monitoring"],
          dataAccess: ["Production databases", "Energy consumption data", "Quality control systems"]
        },
        {
          name: "Production Planning Agent",
          description: "Optimizes hydrogen production schedules based on demand and energy costs",
          model: {
            name: "Claude 3 Opus",
            provider: "Anthropic",
            paramSize: "1.5 trillion",
            contextLength: "200,000 tokens", 
            latency: "320ms",
            role: "Analyzes demand patterns and optimizes production scheduling"
          },
          tools: ["Demand forecasting", "Energy cost optimization", "Production scheduling algorithms"],
          dataAccess: ["Demand forecasts", "Energy pricing data", "Production capacity data"]
        },
        {
          name: "Quality Control Agent",
          description: "Monitors hydrogen purity and ensures product quality standards",
          model: {
            name: "Llama 3 70B",
            provider: "Meta",
            paramSize: "70 billion",
            contextLength: "8,000 tokens", 
            latency: "180ms",
            role: "Evaluates product quality and ensures compliance with specifications"
          },
          tools: ["Spectroscopy analysis", "Purity testing", "Quality assurance protocols"],
          dataAccess: ["Quality test results", "Specification databases", "Compliance records"]
        },
        {
          name: "Safety Monitoring Agent",
          description: "Monitors production safety parameters and prevents hazardous conditions",
          model: {
            name: "GPT-4o",
            provider: "OpenAI",
            paramSize: "1.76 trillion",
            contextLength: "128,000 tokens", 
            latency: "230ms",
            role: "Real-time safety monitoring and hazard prevention"
          },
          tools: ["Safety sensor networks", "Risk assessment algorithms", "Emergency response protocols"],
          dataAccess: ["Safety sensor data", "Historical incident data", "Safety compliance databases"]
        },
        {
          name: "Maintenance Scheduling Agent",
          description: "Predicts equipment maintenance needs and schedules preventive maintenance",
          model: {
            name: "Claude 3 Sonnet",
            provider: "Anthropic",
            paramSize: "540 billion",
            contextLength: "180,000 tokens", 
            latency: "200ms",
            role: "Optimizes maintenance schedules and prevents equipment failures"
          },
          tools: ["Predictive analytics", "Equipment monitoring", "Maintenance optimization"],
          dataAccess: ["Equipment sensor data", "Maintenance history", "Performance metrics"]
        }
      ],
      workflow: [
        {
          phase: "Production Planning",
          description: "Optimize hydrogen production based on demand and energy availability",
          agents: ["Production Planning Agent", "Electrolysis Process Agent"],
          outputs: ["Production schedules", "Energy optimization plans", "Capacity allocations"]
        },
        {
          phase: "Process Control",
          description: "Monitor and control electrolysis processes for optimal efficiency",
          agents: ["Electrolysis Process Agent", "Safety Monitoring Agent"],
          outputs: ["Process parameters", "Safety compliance reports", "Efficiency metrics"]
        },
        {
          phase: "Quality Assurance",
          description: "Ensure hydrogen purity and quality standards are met",
          agents: ["Quality Control Agent", "Maintenance Scheduling Agent"],
          outputs: ["Quality certificates", "Purity test results", "Maintenance schedules"]
        }
      ]
    },
    'industrial-forecasting': {
      department: 'Financial Forecasting & Scenario Analysis',
      decisionNodes: generateDecisionNodes('industrial-forecasting'),
      lineageNodes: generateLineageNodes('industrial-forecasting'),
      lineageEdges: generateLineageEdges('industrial-forecasting'),
      agents: [
        {
          name: "Strategic Finance Analyst",
          description: "Provides real-time financial forecasting and scenario analysis for large industrial projects",
          model: {
            name: "GPT-4o",
            provider: "OpenAI",
            paramSize: "1.76 trillion",
            contextLength: "128,000 tokens", 
            latency: "280ms",
            role: "Generates dynamic forecasts and automated scenario modeling for billion-dollar projects"
          },
          tools: ["Financial modeling", "Scenario analysis", "Risk assessment", "ROI optimization"],
          dataAccess: ["Project financials", "Market data", "Economic indicators", "Risk databases"]
        },
        {
          name: "Market Intelligence Agent",
          description: "Continuously monitors market conditions and commodity prices affecting project economics",
          model: {
            name: "Claude 3 Opus",
            provider: "Anthropic",
            paramSize: "1.5 trillion",
            contextLength: "200,000 tokens", 
            latency: "350ms",
            role: "Real-time market data collection and trend analysis for strategic decision making"
          },
          tools: ["Market data APIs", "Price forecasting", "Volatility analysis", "Trend detection"],
          dataAccess: ["Bloomberg terminals", "Commodity exchanges", "Financial databases", "Market reports"]
        },
        {
          name: "Geopolitical Risk Agent",
          description: "Identifies potential supply chain and regulatory risks from global events",
          model: {
            name: "GPT-4 Turbo",
            provider: "OpenAI",
            paramSize: "1.76 trillion",
            contextLength: "128,000 tokens", 
            latency: "260ms",
            role: "Proactive risk identification and impact assessment from geopolitical events"
          },
          tools: ["News sentiment analysis", "Risk probability modeling", "Impact assessment", "Alert systems"],
          dataAccess: ["News feeds", "Government databases", "Trade publications", "Regulatory announcements"]
        },
        {
          name: "Project Timeline Agent",
          description: "Monitors project milestones and identifies potential delays or cost overruns",
          model: {
            name: "Claude 3 Sonnet",
            provider: "Anthropic",
            paramSize: "540 billion",
            contextLength: "180,000 tokens", 
            latency: "220ms",
            role: "Real-time project monitoring and timeline optimization"
          },
          tools: ["Project management integration", "Schedule optimization", "Resource allocation", "Delay prediction"],
          dataAccess: ["Project management systems", "Construction schedules", "Resource databases", "Contractor reports"]
        },
        {
          name: "Economic Indicator Agent",
          description: "Tracks macroeconomic trends affecting industrial demand and project viability",
          model: {
            name: "Llama 3 70B",
            provider: "Meta",
            paramSize: "70 billion",
            contextLength: "8,000 tokens", 
            latency: "190ms",
            role: "Macroeconomic analysis and demand forecasting for industrial markets"
          },
          tools: ["Economic modeling", "Demand forecasting", "Policy analysis", "Industry benchmarking"],
          dataAccess: ["Central bank data", "Economic databases", "Industry reports", "Government statistics"]
        }
      ],
      workflow: [
        {
          phase: "Data Ingestion & Processing",
          description: "Continuous collection and processing of multi-source data streams",
          agents: ["Market Intelligence Agent", "Geopolitical Risk Agent", "Economic Indicator Agent"],
          outputs: ["Real-time market data", "Risk assessments", "Economic forecasts", "News sentiment analysis"]
        },
        {
          phase: "Scenario Generation & Analysis",
          description: "Dynamic scenario modeling and financial impact analysis",
          agents: ["Strategic Finance Analyst", "Project Timeline Agent"],
          outputs: ["Financial forecasts", "Scenario models", "Risk-adjusted projections", "Timeline assessments"]
        },
        {
          phase: "Decision Support & Recommendations",
          description: "Generate actionable insights and mitigation strategies",
          agents: ["Strategic Finance Analyst", "Geopolitical Risk Agent"],
          outputs: ["Strategic recommendations", "Risk mitigation plans", "Investment decisions", "Stakeholder reports"]
        }
      ]
    },
    'process-engineering': {
      department: 'Process Engineering',
      decisionNodes: generateDecisionNodes('process-engineering'),
      lineageNodes: generateLineageNodes('process-engineering'),
      lineageEdges: generateLineageEdges('process-engineering'),
      agents: [
        {
          name: "Portfolio Optimization Agent",
          description: "Creates and rebalances investment portfolios based on client risk profiles",
          model: {
            name: "GPT-4o",
            provider: "OpenAI",
            paramSize: "1.76 trillion",
            contextLength: "128,000 tokens", 
            latency: "300ms",
            role: "Optimizes asset allocation and portfolio performance"
          },
          tools: ["Modern portfolio theory", "Risk modeling", "Asset allocation algorithms"],
          dataAccess: ["Market data", "Client risk profiles", "Portfolio holdings"]
        },
        {
          name: "Investment Research Agent",
          description: "Analyzes market trends and generates investment recommendations",
          model: {
            name: "Claude 3 Opus",
            provider: "Anthropic",
            paramSize: "1.5 trillion",
            contextLength: "200,000 tokens", 
            latency: "380ms",
            role: "Conducts fundamental and technical analysis for investment decisions"
          },
          tools: ["Market analysis", "Company research", "Economic modeling"],
          dataAccess: ["Financial markets data", "Company fundamentals", "Economic indicators"]
        },
        {
          name: "Tax Optimization Agent",
          description: "Identifies tax-efficient investment strategies and planning opportunities",
          model: {
            name: "GPT-4 Turbo",
            provider: "OpenAI",
            paramSize: "1.76 trillion",
            contextLength: "128,000 tokens", 
            latency: "240ms",
            role: "Optimizes tax implications of investment decisions"
          },
          tools: ["Tax modeling", "Regulatory compliance", "Estate planning tools"],
          dataAccess: ["Tax regulations", "Client tax profiles", "Investment tax implications"]
        },
        {
          name: "Wealth Advisor Assistant",
          description: "Supports wealth advisors with client insights and planning recommendations",
          model: {
            name: "Claude 3 Sonnet",
            provider: "Anthropic",
            paramSize: "540 billion",
            contextLength: "180,000 tokens", 
            latency: "210ms",
            role: "Provides comprehensive wealth planning and advisory support"
          },
          tools: ["Financial planning", "Goal-based investing", "Client communication"],
          dataAccess: ["Client financial data", "Life goals", "Market opportunities"]
        },
        {
          name: "ESG Investment Agent",
          description: "Identifies sustainable investment opportunities aligned with ESG criteria",
          model: {
            name: "Llama 3 70B",
            provider: "Meta",
            paramSize: "70 billion",
            contextLength: "8,000 tokens", 
            latency: "190ms",
            role: "Evaluates environmental, social, and governance factors in investments"
          },
          tools: ["ESG scoring", "Sustainability analysis", "Impact measurement"],
          dataAccess: ["ESG databases", "Sustainability reports", "Impact metrics"]
        }
      ]
    },
    default: {
      department: 'Air Separation Units',
      decisionNodes: generateDecisionNodes('default'),
      lineageNodes: generateLineageNodes('default'),
      lineageEdges: generateLineageEdges('default'),
      agents: [
        {
          name: "Air Separation Process Assistant",
          description: "Handles air separation unit operations and process optimization",
          model: {
            name: "GPT-4o",
            provider: "OpenAI",
            paramSize: "1.76 trillion",
            contextLength: "128,000 tokens", 
            latency: "220ms",
            role: "Multi-purpose industrial gas production and process control"
          }
        }
      ]
    }
  };
};

// Generate hydrogen production specific decision nodes
function generateHydrogenProductionDecisionNodes(): NodeType[] {
  return [
    { 
      id: 'start', 
      type: 'start', 
      label: 'Production Request', 
      content: 'New hydrogen production order received', 
      connects: ['tool1'], 
      position: { x: 50, y: 100 } 
    },
    { 
      id: 'tool1', 
      type: 'tool', 
      label: 'Capacity Check', 
      content: 'Verifying production capacity and resource availability', 
      connects: ['decision1'], 
      position: { x: 250, y: 100 },
      toolDetails: { 
        input: 'Production order', 
        output: 'Capacity assessment', 
        databases: ['ProductionDB'], 
        executionTime: '1.8s', 
        query: 'SELECT * FROM production_capacity WHERE facility_id = ?' 
      } 
    },
    { 
      id: 'decision1', 
      type: 'decision', 
      label: 'Capacity Status', 
      content: 'Evaluating production capacity availability', 
      connects: ['tool2', 'alternate1'], 
      position: { x: 450, y: 100 } 
    },
    { 
      id: 'tool2', 
      type: 'tool', 
      label: 'Energy Assessment', 
      content: 'Analyzing energy requirements and availability', 
      connects: ['tool3'], 
      position: { x: 650, y: 100 },
      toolDetails: { 
        input: 'Production requirements', 
        output: 'Energy allocation plan', 
        databases: ['EnergyManagement'], 
        executionTime: '2.2s', 
        query: 'GET /energy-availability/{production_id}' 
      } 
    },
    { 
      id: 'alternate1', 
      type: 'alternate', 
      label: 'Capacity Exceeded', 
      content: 'Production rescheduling required', 
      connects: ['tool1'], 
      position: { x: 450, y: 250 } 
    },
    { 
      id: 'tool3', 
      type: 'tool', 
      label: 'Safety Check', 
      content: 'Verifying safety parameters and protocols', 
      connects: ['decision2'], 
      position: { x: 850, y: 100 },
      toolDetails: { 
        input: 'Production parameters, Safety protocols', 
        output: 'Safety clearance & Production authorization', 
        databases: ['SafetySystem'], 
        executionTime: '2.8s', 
        query: 'CALL verify_safety_protocols(?)' 
      } 
    },
    { 
      id: 'decision2', 
      type: 'decision', 
      label: 'Production Authorization', 
      content: 'Determining production approval status', 
      connects: ['tool4', 'alternate2'], 
      position: { x: 1050, y: 100 } 
    },
    { 
      id: 'tool4', 
      type: 'tool', 
      label: 'Production Start', 
      content: 'Initiating hydrogen production process', 
      connects: ['end'], 
      position: { x: 1250, y: 100 },
      toolDetails: { 
        input: 'Approved production order', 
        output: 'Active production & monitoring', 
        databases: ['ProductionControl'], 
        executionTime: '1.2s', 
        query: 'INSERT INTO production_runs (order_id, facility_id, start_time)' 
      } 
    },
    { 
      id: 'alternate2', 
      type: 'alternate', 
      label: 'Production Delayed', 
      content: 'Safety assessment requires additional review', 
      connects: ['end'], 
      position: { x: 1050, y: 250 } 
    },
    { 
      id: 'end', 
      type: 'end', 
      label: 'Process Complete', 
      content: 'Hydrogen production order processed', 
      connects: [], 
      position: { x: 1250, y: 250 } 
    },
  ];
}

// Generate hydrogen production specific lineage nodes
function generateHydrogenProductionLineageNodes(): any[] {
  return [
    { id: 'productiondb', type: 'database', label: 'Production DB', content: 'Production orders and capacity data', position: { x: 50, y: 400 }, isCombinedView: true },
    { id: 'energyapi', type: 'api', label: 'Energy Management API', content: 'Energy allocation and monitoring service', position: { x: 250, y: 400 }, isCombinedView: true },
    { id: 'capacitydata', type: 'file', label: 'Capacity Data', content: 'Production facility capacity information', position: { x: 450, y: 400 }, isCombinedView: true },
    { id: 'safetysystem', type: 'database', label: 'Safety System', content: 'Safety protocols and monitoring', position: { x: 650, y: 400 }, isCombinedView: true },
    { id: 'energyallocation', type: 'transformation', label: 'Energy Allocation', content: 'Optimized energy distribution plans', position: { x: 850, y: 400 }, isCombinedView: true },
    { id: 'productioncontrol', type: 'database', label: 'Production Control', content: 'Active production monitoring systems', position: { x: 1050, y: 400 }, isCombinedView: true },
    { id: 'productionrecords', type: 'file', label: 'Production Records', content: 'Completed production documentation', position: { x: 1250, y: 400 }, isCombinedView: true },
  ];
}

// Generate hydrogen production specific lineage edges
function generateHydrogenProductionLineageEdges(): any[] {
  return [
    { source: 'productiondb', target: 'capacitydata', type: 'data_flow' },
    { source: 'energyapi', target: 'energyallocation', type: 'data_flow' },
    { source: 'capacitydata', target: 'safetysystem', type: 'transformation' },
    { source: 'energyallocation', target: 'safetysystem', type: 'data_flow' },
    { source: 'safetysystem', target: 'productioncontrol', type: 'dependency' },
    { source: 'productioncontrol', target: 'productionrecords', type: 'data_flow' },
  ];
}

// Helper functions to generate mock data for other industrial projects
function generateDecisionNodes(projectId: string): NodeType[] {
  const baseNodes: NodeType[] = [
    { id: 'start', type: 'start', label: 'Start Process', content: 'Industrial process initiated', connects: ['tool1'], position: { x: 50, y: 100 } },
    { id: 'tool1', type: 'tool', label: 'Data Collection', content: 'Gathering required operational data', connects: ['decision1'], position: { x: 250, y: 100 }, toolDetails: { input: 'Process request', output: 'Operational data', databases: ['IndustrialDB'], executionTime: '0.8s', query: 'SELECT * FROM operations WHERE ...' } },
    { id: 'decision1', type: 'decision', label: 'Compliance Check', content: 'Verifying regulatory compliance', connects: ['tool2', 'alternate1'], position: { x: 450, y: 100 } },
    { id: 'tool2', type: 'tool', label: 'Risk Analysis', content: 'Analyzing operational risk factors', connects: ['decision2'], position: { x: 650, y: 100 }, toolDetails: { input: 'Operational data', output: 'Risk assessment', databases: ['RiskDB'], executionTime: '1.2s', query: 'CALL risk_analysis(...)' } },
    { id: 'alternate1', type: 'alternate', label: 'Compliance Issue', content: 'Additional review required', connects: ['end'], position: { x: 450, y: 250 } },
    { id: 'decision2', type: 'decision', label: 'Approval Gate', content: 'Final approval decision', connects: ['tool3'], position: { x: 850, y: 100 } },
    { id: 'tool3', type: 'tool', label: 'Execute Operation', content: 'Processing approved operation', connects: ['end'], position: { x: 1050, y: 100 }, toolDetails: { input: 'Approved request', output: 'Completed operation', databases: ['OperationsDB'], executionTime: '0.5s', query: 'INSERT INTO operations ...' } },
    { id: 'end', type: 'end', label: 'Process Complete', content: 'Industrial process completed', connects: [], position: { x: 1050, y: 250 } },
  ];

  return baseNodes;
}

function generateLineageNodes(projectId: string): any[] {
  const baseNodes = [
    { id: 'industrialdb', type: 'database', label: 'Industrial DB', content: 'Core industrial system data', position: { x: 50, y: 350 } },
    { id: 'clientrequest', type: 'api', label: 'Client Request', content: 'Customer service requests', position: { x: 250, y: 350 } },
    { id: 'operationaldata', type: 'file', label: 'Operational Data', content: 'Processed operational information', position: { x: 450, y: 350 } },
    { id: 'riskassessment', type: 'transformation', label: 'Risk Assessment', content: 'Analyzed risk metrics', position: { x: 650, y: 350 } },
    { id: 'riskdb', type: 'database', label: 'Risk DB', content: 'Risk management system', position: { x: 850, y: 350 } },
    { id: 'transactiondb', type: 'database', label: 'Transaction DB', content: 'Transaction processing system', position: { x: 1050, y: 350 } },
    { id: 'completedtransaction', type: 'file', label: 'Completed Transaction', content: 'Final transaction records', position: { x: 1250, y: 350 } },
  ];

  return baseNodes.map(node => ({ ...node, isCombinedView: true }));
}

function generateLineageEdges(projectId: string): any[] {
  return [
    { source: 'industrialdb', target: 'operationaldata', type: 'data_flow' },
    { source: 'clientrequest', target: 'operationaldata', type: 'data_flow' },
    { source: 'operationaldata', target: 'riskassessment', type: 'transformation' },
    { source: 'riskassessment', target: 'riskdb', type: 'data_flow' },
    { source: 'riskdb', target: 'transactiondb', type: 'dependency' },
    { source: 'transactiondb', target: 'completedtransaction', type: 'data_flow' },
  ];
}

// Export decision path metadata for visualization
export const decisionPathMetadata = {
  width: 1800,
  height: 400,
  nodeSize: {
    width: 140,
    height: 70,
  },
  nodeTypes: {
    start: {
      color: '#4ade80',
      icon: 'Play',
    },
    tool: {
      color: '#a8bdf8',
      icon: 'Wrench',
    },
    decision: {
      color: '#facc15',
      icon: 'GitBranch',
    },
    alternate: {
      color: '#f87171',
      icon: 'AlertTriangle',
    },
    end: {
      color: '#9ca3af',
      icon: 'Check',
    },
  },
};

// Export data lineage metadata for visualization
export const dataLineageMetadata = {
  width: 1800,
  height: 400,
  nodeSize: {
    width: 140,
    height: 70,
  },
  nodeTypes: {
    database: {
      color: '#8B5CF6',
      icon: 'Database',
    },
    api: {
      color: '#3B82F6',
      icon: 'Zap',
    },
    file: {
      color: '#10B981',
      icon: 'FileText',
    },
    transformation: {
      color: '#EC4899',
      icon: 'GitMerge',
    },
  },
};

// Generate forecasting specific decision nodes
function generateForecastingDecisionNodes(): NodeType[] {
  return [
    { 
      id: 'start', 
      type: 'start', 
      label: 'Market Analysis Request', 
      content: 'New financial forecasting request received', 
      connects: ['tool1'], 
      position: { x: 50, y: 100 } 
    },
    { 
      id: 'tool1', 
      type: 'tool', 
      label: 'Data Collection', 
      content: 'Gathering market data and economic indicators', 
      connects: ['decision1'], 
      position: { x: 250, y: 100 },
      toolDetails: { 
        input: 'Market request', 
        output: 'Market data', 
        databases: ['MarketDB'], 
        executionTime: '2.5s', 
        query: 'SELECT * FROM market_data WHERE date >= ?' 
      } 
    },
    { 
      id: 'decision1', 
      type: 'decision', 
      label: 'Data Quality Check', 
      content: 'Evaluating data completeness and accuracy', 
      connects: ['tool2', 'alternate1'], 
      position: { x: 450, y: 100 } 
    },
    { 
      id: 'tool2', 
      type: 'tool', 
      label: 'Scenario Modeling', 
      content: 'Running financial scenario analysis', 
      connects: ['tool3'], 
      position: { x: 650, y: 100 },
      toolDetails: { 
        input: 'Market data', 
        output: 'Scenario models', 
        databases: ['ScenarioEngine'], 
        executionTime: '4.2s', 
        query: 'CALL run_scenario_analysis(?)' 
      } 
    },
    { 
      id: 'alternate1', 
      type: 'alternate', 
      label: 'Data Insufficient', 
      content: 'Additional data sources required', 
      connects: ['tool1'], 
      position: { x: 450, y: 250 } 
    },
    { 
      id: 'tool3', 
      type: 'tool', 
      label: 'Risk Assessment', 
      content: 'Analyzing potential risks and mitigation strategies', 
      connects: ['decision2'], 
      position: { x: 850, y: 100 },
      toolDetails: { 
        input: 'Scenario models', 
        output: 'Risk assessment & recommendations', 
        databases: ['RiskEngine'], 
        executionTime: '3.8s', 
        query: 'CALL assess_financial_risks(?)' 
      } 
    },
    { 
      id: 'decision2', 
      type: 'decision', 
      label: 'Forecast Approval', 
      content: 'Determining forecast confidence and approval', 
      connects: ['tool4', 'alternate2'], 
      position: { x: 1050, y: 100 } 
    },
    { 
      id: 'tool4', 
      type: 'tool', 
      label: 'Report Generation', 
      content: 'Creating comprehensive forecast report', 
      connects: ['end'], 
      position: { x: 1250, y: 100 },
      toolDetails: { 
        input: 'Risk assessment', 
        output: 'Forecast report & recommendations', 
        databases: ['ReportingDB'], 
        executionTime: '2.1s', 
        query: 'INSERT INTO forecast_reports (analysis_id, recommendations)' 
      } 
    },
    { 
      id: 'alternate2', 
      type: 'alternate', 
      label: 'Low Confidence', 
      content: 'Forecast confidence below threshold', 
      connects: ['end'], 
      position: { x: 1050, y: 250 } 
    },
    { 
      id: 'end', 
      type: 'end', 
      label: 'Analysis Complete', 
      content: 'Financial forecasting analysis completed', 
      connects: [], 
      position: { x: 1250, y: 250 } 
    },
  ];
}

// Generate forecasting specific lineage nodes
function generateForecastingLineageNodes(): any[] {
  return [
    { id: 'marketdb', type: 'database', label: 'Market DB', content: 'Market data and economic indicators', position: { x: 50, y: 400 }, isCombinedView: true },
    { id: 'economicapi', type: 'api', label: 'Economic Data API', content: 'Real-time economic indicators service', position: { x: 250, y: 400 }, isCombinedView: true },
    { id: 'marketdata', type: 'file', label: 'Market Data', content: 'Processed market information', position: { x: 450, y: 400 }, isCombinedView: true },
    { id: 'scenarioengine', type: 'database', label: 'Scenario Engine', content: 'Financial modeling and scenario analysis', position: { x: 650, y: 400 }, isCombinedView: true },
    { id: 'scenariomodels', type: 'transformation', label: 'Scenario Models', content: 'Generated financial scenarios', position: { x: 850, y: 400 }, isCombinedView: true },
    { id: 'riskengine', type: 'database', label: 'Risk Engine', content: 'Risk assessment and mitigation systems', position: { x: 1050, y: 400 }, isCombinedView: true },
    { id: 'forecastreports', type: 'file', label: 'Forecast Reports', content: 'Completed forecast documentation', position: { x: 1250, y: 400 }, isCombinedView: true },
  ];
}

// Generate forecasting specific lineage edges
function generateForecastingLineageEdges(): any[] {
  return [
    { source: 'marketdb', target: 'marketdata', type: 'data_flow' },
    { source: 'economicapi', target: 'scenariomodels', type: 'data_flow' },
    { source: 'marketdata', target: 'scenarioengine', type: 'transformation' },
    { source: 'scenariomodels', target: 'riskengine', type: 'data_flow' },
    { source: 'riskengine', target: 'forecastreports', type: 'dependency' },
    { source: 'scenarioengine', target: 'forecastreports', type: 'data_flow' },
  ];
}

// Banking project data
export const getBankingProjectData = () => {
  return {
    'wealth-management': {
      department: 'Wealth Management',
      decisionNodes: generateWealthManagementDecisionNodes(),
      lineageNodes: generateWealthManagementLineageNodes(),
      lineageEdges: generateWealthManagementLineageEdges(),
      agents: [
        {
          name: "Portfolio Manager Agent",
          description: "Manages investment portfolios and asset allocation strategies",
          model: {
            name: "GPT-4o",
            provider: "OpenAI",
            paramSize: "1.76 trillion",
            contextLength: "128,000 tokens", 
            latency: "250ms",
            role: "Optimizes portfolio allocation and manages investment strategies"
          },
          tools: ["Portfolio optimization", "Risk assessment", "Market analysis"],
          dataAccess: ["Market data", "Client portfolios", "Risk metrics"]
        },
        {
          name: "Risk Assessment Agent",
          description: "Analyzes and monitors investment risks across portfolios",
          model: {
            name: "Claude 3 Opus",
            provider: "Anthropic",
            paramSize: "1.5 trillion",
            contextLength: "200,000 tokens", 
            latency: "320ms",
            role: "Evaluates risk exposure and compliance with risk parameters"
          },
          tools: ["Risk modeling", "Stress testing", "Compliance monitoring"],
          dataAccess: ["Risk databases", "Market volatility data", "Regulatory requirements"]
        },
        {
          name: "Client Advisory Agent",
          description: "Provides personalized investment advice and client communication",
          model: {
            name: "Llama 3 70B",
            provider: "Meta",
            paramSize: "70 billion",
            contextLength: "8,000 tokens", 
            latency: "180ms",
            role: "Delivers personalized investment recommendations and client insights"
          },
          tools: ["Client profiling", "Investment recommendations", "Communication tools"],
          dataAccess: ["Client data", "Investment preferences", "Performance reports"]
        }
      ]
    },
    'risk-analytics': {
      department: 'Risk Management',
      decisionNodes: generateRiskAnalyticsDecisionNodes(),
      lineageNodes: generateRiskAnalyticsLineageNodes(),
      lineageEdges: generateRiskAnalyticsLineageEdges(),
      agents: [
        {
          name: "Credit Risk Agent",
          description: "Assesses credit risk for loan applications and existing portfolios",
          model: {
            name: "GPT-4o",
            provider: "OpenAI",
            paramSize: "1.76 trillion",
            contextLength: "128,000 tokens", 
            latency: "250ms",
            role: "Evaluates creditworthiness and default probability"
          },
          tools: ["Credit scoring", "Default prediction", "Risk modeling"],
          dataAccess: ["Credit bureaus", "Financial statements", "Payment history"]
        }
      ]
    },
    'fraud-detection': {
      department: 'Security Operations',
      decisionNodes: generateFraudDetectionDecisionNodes(),
      lineageNodes: generateFraudDetectionLineageNodes(),
      lineageEdges: generateFraudDetectionLineageEdges(),
      agents: [
        {
          name: "Fraud Detection Agent",
          description: "Monitors transactions for fraudulent activity in real-time",
          model: {
            name: "Claude 3 Opus",
            provider: "Anthropic",
            paramSize: "1.5 trillion",
            contextLength: "200,000 tokens", 
            latency: "320ms",
            role: "Identifies suspicious patterns and prevents fraudulent transactions"
          },
          tools: ["Pattern recognition", "Anomaly detection", "Real-time monitoring"],
          dataAccess: ["Transaction data", "Customer behavior", "Fraud databases"]
        }
      ]
    }
  };
};

// Generate banking decision nodes
function generateWealthManagementDecisionNodes(): NodeType[] {
  return [
    { id: 'start', type: 'start', label: 'Client Portfolio Review', content: 'Wealth management process initiated', connects: ['tool1'], position: { x: 50, y: 100 } },
    { id: 'tool1', type: 'tool', label: 'Portfolio Analysis', content: 'Analyzing current portfolio performance', connects: ['decision1'], position: { x: 250, y: 100 }, toolDetails: { input: 'Portfolio data', output: 'Performance metrics', databases: ['PortfolioDB'], executionTime: '1.2s', query: 'SELECT * FROM portfolios WHERE ...' } },
    { id: 'decision1', type: 'decision', label: 'Risk Assessment', content: 'Evaluating portfolio risk levels', connects: ['tool2', 'alternate1'], position: { x: 450, y: 100 } },
    { id: 'tool2', type: 'tool', label: 'Rebalancing', content: 'Optimizing asset allocation', connects: ['end'], position: { x: 650, y: 100 }, toolDetails: { input: 'Risk metrics', output: 'Rebalanced portfolio', databases: ['AssetDB'], executionTime: '0.8s', query: 'UPDATE portfolios SET ...' } },
    { id: 'alternate1', type: 'alternate', label: 'High Risk Alert', content: 'Portfolio exceeds risk tolerance', connects: ['end'], position: { x: 450, y: 250 } },
    { id: 'end', type: 'end', label: 'Portfolio Updated', content: 'Wealth management process completed', connects: [], position: { x: 850, y: 100 } }
  ];
}

function generateRiskAnalyticsDecisionNodes(): NodeType[] {
  return [
    { id: 'start', type: 'start', label: 'Credit Application', content: 'Credit risk assessment initiated', connects: ['tool1'], position: { x: 50, y: 100 } },
    { id: 'tool1', type: 'tool', label: 'Credit Check', content: 'Retrieving credit history and scores', connects: ['decision1'], position: { x: 250, y: 100 }, toolDetails: { input: 'Applicant data', output: 'Credit report', databases: ['CreditDB'], executionTime: '0.5s', query: 'SELECT * FROM credit_reports WHERE ...' } },
    { id: 'decision1', type: 'decision', label: 'Risk Evaluation', content: 'Assessing default probability', connects: ['tool2', 'alternate1'], position: { x: 450, y: 100 } },
    { id: 'tool2', type: 'tool', label: 'Loan Approval', content: 'Processing approved loan application', connects: ['end'], position: { x: 650, y: 100 }, toolDetails: { input: 'Risk assessment', output: 'Loan terms', databases: ['LoanDB'], executionTime: '0.3s', query: 'INSERT INTO loans ...' } },
    { id: 'alternate1', type: 'alternate', label: 'High Risk', content: 'Application requires manual review', connects: ['end'], position: { x: 450, y: 250 } },
    { id: 'end', type: 'end', label: 'Decision Made', content: 'Credit assessment completed', connects: [], position: { x: 850, y: 100 } }
  ];
}

function generateFraudDetectionDecisionNodes(): NodeType[] {
  return [
    { id: 'start', type: 'start', label: 'Transaction Monitor', content: 'Real-time transaction monitoring', connects: ['tool1'], position: { x: 50, y: 100 } },
    { id: 'tool1', type: 'tool', label: 'Pattern Analysis', content: 'Analyzing transaction patterns', connects: ['decision1'], position: { x: 250, y: 100 }, toolDetails: { input: 'Transaction data', output: 'Risk score', databases: ['TransactionDB'], executionTime: '0.1s', query: 'SELECT * FROM transactions WHERE ...' } },
    { id: 'decision1', type: 'decision', label: 'Fraud Check', content: 'Evaluating fraud probability', connects: ['tool2', 'alternate1'], position: { x: 450, y: 100 } },
    { id: 'tool2', type: 'tool', label: 'Transaction Approved', content: 'Processing legitimate transaction', connects: ['end'], position: { x: 650, y: 100 }, toolDetails: { input: 'Verified transaction', output: 'Approval', databases: ['ApprovalDB'], executionTime: '0.05s', query: 'UPDATE transactions SET status = approved' } },
    { id: 'alternate1', type: 'alternate', label: 'Fraud Alert', content: 'Suspicious activity detected', connects: ['end'], position: { x: 450, y: 250 } },
    { id: 'end', type: 'end', label: 'Transaction Complete', content: 'Fraud detection process completed', connects: [], position: { x: 850, y: 100 } }
  ];
}

// Generate banking lineage nodes (simplified)
function generateWealthManagementLineageNodes(): any[] {
  return [
    { id: 'clientdb', type: 'database', label: 'Client DB', content: 'Client portfolio data', position: { x: 50, y: 350 } },
    { id: 'marketapi', type: 'api', label: 'Market Data API', content: 'Real-time market prices', position: { x: 250, y: 350 } },
    { id: 'portfolioengine', type: 'transformation', label: 'Portfolio Engine', content: 'Portfolio optimization', position: { x: 450, y: 350 } },
    { id: 'riskdb', type: 'database', label: 'Risk DB', content: 'Risk assessment data', position: { x: 650, y: 350 } },
    { id: 'portfolioreport', type: 'file', label: 'Portfolio Report', content: 'Client portfolio summary', position: { x: 850, y: 350 } }
  ];
}

function generateRiskAnalyticsLineageNodes(): any[] {
  return [
    { id: 'creditdb', type: 'database', label: 'Credit DB', content: 'Credit history data', position: { x: 50, y: 350 } },
    { id: 'riskengine', type: 'transformation', label: 'Risk Engine', content: 'Credit risk assessment', position: { x: 250, y: 350 } },
    { id: 'loandb', type: 'database', label: 'Loan DB', content: 'Loan application data', position: { x: 450, y: 350 } }
  ];
}

function generateFraudDetectionLineageNodes(): any[] {
  return [
    { id: 'transactiondb', type: 'database', label: 'Transaction DB', content: 'Real-time transactions', position: { x: 50, y: 350 } },
    { id: 'fraudengine', type: 'transformation', label: 'Fraud Engine', content: 'Fraud detection algorithms', position: { x: 250, y: 350 } },
    { id: 'alertdb', type: 'database', label: 'Alert DB', content: 'Fraud alerts and logs', position: { x: 450, y: 350 } }
  ];
}

// Generate banking lineage edges (simplified)
function generateWealthManagementLineageEdges(): any[] {
  return [
    { source: 'clientdb', target: 'portfolioengine', type: 'data_flow' },
    { source: 'marketapi', target: 'portfolioengine', type: 'data_flow' },
    { source: 'portfolioengine', target: 'riskdb', type: 'transformation' },
    { source: 'riskdb', target: 'portfolioreport', type: 'data_flow' }
  ];
}

function generateRiskAnalyticsLineageEdges(): any[] {
  return [
    { source: 'creditdb', target: 'riskengine', type: 'data_flow' },
    { source: 'riskengine', target: 'loandb', type: 'data_flow' }
  ];
}

function generateFraudDetectionLineageEdges(): any[] {
  return [
    { source: 'transactiondb', target: 'fraudengine', type: 'data_flow' },
    { source: 'fraudengine', target: 'alertdb', type: 'data_flow' }
  ];
}



