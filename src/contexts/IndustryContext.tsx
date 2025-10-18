import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface IndustryConfig {
  id: string;
  name: string;
  displayName: string;
  description: string;
  logo: string;
  primaryColor: string;
  accentColor: string;
  gradientBg: string;
  borderColor: string;
  navigation: NavigationItem[];
  workflows: WorkflowConfig[];
}

interface NavigationItem {
  path: string;
  label: string;
  icon: string;
  description?: string;
}

interface WorkflowConfig {
  id: string;
  name: string;
  description: string;
  agents: string[];
  workflows: string[];
}

interface IndustryContextType {
  currentIndustry: IndustryConfig;
  setIndustry: (industry: IndustryConfig) => void;
  availableIndustries: IndustryConfig[];
}

const industryConfigurations: IndustryConfig[] = [
  {
    id: 'true',
    name: 'true',
    displayName: 'True Agent OS',
    description: 'Advanced AI agent orchestration platform for enterprise operations',
    logo: 'data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMTAwIDEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0idHJ1ZUdyYWRpZW50IiB4MT0iMCUiIHkxPSIwJSIgeDI9IjAlIiB5Mj0iMTAwJSI+CiAgICAgIDxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNGRjAwMDAiIC8+CiAgICAgIDxzdG9wIG9mZnNldD0iNTAlIiBzdG9wLWNvbG9yPSIjRkYwMEZGIiAvPgogICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiM4MDAwODAiIC8+CiAgICA8L2xpbmVhckdyYWRpZW50PgogIDwvZGVmcz4KICA8cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgcng9IjEwIiBmaWxsPSJ1cmwoI3RydWVMb2dvR3JhZGllbnQpIi8+CiAgPHRleHQgeD0iNTAiIHk9IjU1IiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjQiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+dHJ1ZTwvdGV4dD4KPC9zdmc+',
    primaryColor: 'hsl(300, 100%, 50%)', // Purple/magenta
    accentColor: 'hsl(0, 100%, 50%)', // Red
    gradientBg: 'linear-gradient(145deg, #FF0000 0%, #FF00FF 50%, #800080 100%)',
    borderColor: 'hsl(300, 100%, 50% / 0.3)',
    navigation: [
      { path: '/', label: 'Dashboard', icon: 'Command' },
      { path: '/agent-command', label: 'Agent Command Centre', icon: 'Command' },
      { path: '/multi-agent-workspace', label: 'Multi Agent Workspace', icon: 'Bot' },
      { path: '/document-workspace', label: 'Document Chat', icon: 'FileText' },
      { path: '/ollama-agents', label: 'Bedrock Agents', icon: 'Bot' },
      { path: '/ollama-terminal', label: 'Bedrock Terminal', icon: 'Terminal' },
      { path: '/mcp-dashboard', label: 'MCP Gateway', icon: 'Server' },
      { path: '/agent-exchange', label: 'AI Marketplace', icon: 'ShoppingBag' },
      { path: '/system-flow', label: 'AgentOS Architecture Blueprint', icon: 'Network' },
      { path: '/settings', label: 'Settings', icon: 'Settings' }
    ],
        agentUseCases: [
        ],
    workflows: [
      {
        id: 'multi-agent-orchestration',
        name: 'Multi-Agent Orchestration System',
        description: 'Complete multi-agent workflow orchestration with A2A communication',
        agents: ['Orchestrator', 'Task Manager', 'Resource Allocator', 'Quality Monitor', 'Response Synthesizer', 'Error Handler'],
        workflows: ['Task Decomposition', 'Agent Selection', 'Execution Management', 'Quality Control', 'Response Synthesis', 'Error Recovery']
      }
    ]
  },
  {
    id: 'banking',
    name: 'banking',
    displayName: 'Banking Agent OS',
    description: 'Financial services and banking operations powered by AI',
    logo: 'https://aws.amazon.com/favicon.ico',
    primaryColor: 'hsl(358, 75%, 45%)', // banking red
    accentColor: 'hsl(358, 75%, 35%)',
    gradientBg: 'linear-gradient(145deg, #000000 0%, #E31E24 50%, #FFFFFF 100%)',
    borderColor: 'hsl(358, 75%, 45% / 0.3)',
    navigation: [
      { path: '/', label: 'Banking Dashboard', icon: 'Command' },
      { path: '/agent-command', label: 'Banking Command Centre', icon: 'Command' },
      { path: '/multi-agent-workspace', label: 'Banking Workspace', icon: 'Bot' },
      { path: '/mcp-dashboard', label: 'MCP Gateway', icon: 'Server' },
      { path: '/agent-exchange', label: 'Financial Solutions', icon: 'ShoppingBag' },
      { path: '/risk-analytics', label: 'Risk Analytics', icon: 'TrendingUp' },
      { path: '/wealth-management', label: 'Wealth Management', icon: 'TrendingUp' },
      { path: '/customer-insights', label: 'Customer Insights', icon: 'Users' },
      { path: '/system-flow', label: 'AgentOS Architecture Blueprint', icon: 'Network' },
      { path: '/settings', label: 'Settings', icon: 'Settings' }
    ],
    workflows: [
      {
        id: 'wealth-management',
        name: 'AI Wealth Management Centre',
        description: 'Complete wealth management workflow with 6 specialized agents',
        agents: ['Portfolio Manager', 'Risk Assessor', 'Market Analyst', 'Client Advisor', 'Compliance Officer', 'Research Analyst'],
        workflows: ['Portfolio Analysis', 'Risk Assessment', 'Market Research', 'Client Consultation', 'Compliance Check', 'Investment Research']
      }
    ]
  },
  {
    id: 'telco',
    name: 'telco',
    displayName: 'AWS AgentOS',
    description: 'AWS cloud-native telecommunications operations and network management powered by AI',
    logo: '/aws-logo.svg',
    primaryColor: 'hsl(25, 100%, 50%)', // AWS Orange
    accentColor: 'hsl(30, 100%, 45%)', // Darker Orange
    gradientBg: 'linear-gradient(145deg, #FF9900 0%, #FF6600 50%, #E65100 100%)',
    borderColor: 'hsl(25, 100%, 50% / 0.3)',
    navigation: [
      { path: '/', label: 'AWS Dashboard', icon: 'Command' },
      { path: '/agent-command', label: 'AWS Bedrock Command Centre', icon: 'Command' },
      { path: '/agent-exchange', label: 'AWS Solutions Marketplace', icon: 'ShoppingBag' },
      { path: '/multi-agent-workspace', label: 'AWS Agent Orchestration', icon: 'Bot' },
      { path: '/mcp-dashboard', label: 'AWS MCP Gateway', icon: 'Server' },
      { path: '/network-twin', label: 'AWS Network Twin', icon: 'Globe' },
      { path: '/customer-analytics', label: 'AWS Customer Analytics', icon: 'Users' },
      { path: '/telco-agents', label: 'Bedrock Agents', icon: 'Bot' },
      { path: '/telco-terminal', label: 'Bedrock Terminal', icon: 'Terminal' },
      { path: '/system-flow', label: 'AWS Architecture Blueprint', icon: 'Network' },
      { path: '/settings', label: 'Settings', icon: 'Settings' }
    ],
    workflows: [
      {
        id: 'network-optimization',
        name: 'AWS Network Optimization Suite',
        description: 'Complete AWS cloud-native network management with specialized AI agents',
        agents: ['AWS Bedrock Network Monitor', 'AWS Bedrock Performance Optimizer', 'AWS Bedrock Fault Detector', 'AWS Bedrock Customer Support', 'AWS Bedrock Capacity Planner', 'AWS Bedrock Security Guard'],
        workflows: ['AWS Bedrock Network Monitoring', 'AWS Bedrock Performance Analysis', 'AWS Bedrock Fault Detection', 'AWS Bedrock Customer Support', 'AWS Bedrock Capacity Planning', 'AWS Bedrock Security Monitoring']
      }
    ]
  },
  {
    id: 'healthcare',
    name: 'healthcare',
    displayName: 'AWS Healthcare Agent OS',
    description: 'Healthcare operations and patient management',
    logo: 'https://aws.amazon.com/favicon.ico',
    primaryColor: 'hsl(145, 70%, 45%)', // healthcare green
    accentColor: 'hsl(145, 70%, 35%)',
    gradientBg: 'linear-gradient(145deg, #000000 0%, #00B566 50%, #FFFFFF 100%)',
    borderColor: 'hsl(145, 70%, 45% / 0.3)',
    navigation: [
      { path: '/', label: 'Health Dashboard', icon: 'Command' },
      { path: '/agent-command', label: 'Care Command Centre', icon: 'Command' },
      { path: '/multi-agent-workspace', label: 'Care Orchestration', icon: 'Bot' },
      { path: '/mcp-dashboard', label: 'MCP Gateway', icon: 'Server' },
      { path: '/agent-exchange', label: 'Health Solutions', icon: 'ShoppingBag' },
      { path: '/patient-analytics', label: 'Patient Analytics', icon: 'TrendingUp' },
      { path: '/care-management', label: 'Care Management', icon: 'Heart' },
      { path: '/system-flow', label: 'AgentOS Architecture Blueprint', icon: 'Network' },
      { path: '/settings', label: 'Settings', icon: 'Settings' }
    ],
    workflows: [
      {
        id: 'patient-care',
        name: 'Patient Care Management',
        description: 'Comprehensive patient care with specialized agents',
        agents: ['Care Coordinator', 'Diagnostic Assistant', 'Treatment Planner', 'Medication Manager', 'Wellness Coach', 'Emergency Responder'],
        workflows: ['Care Coordination', 'Diagnosis Support', 'Treatment Planning', 'Medication Management', 'Wellness Monitoring', 'Emergency Response']
      }
    ]
  },
  {
    id: 'industrial',
    name: 'industrial',
    displayName: 'Air Liquide Agent OS',
    description: 'Industrial gas and technology operations powered by AI',
    logo: 'data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjQwIDUwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxjaXJjbGUgY3g9IjI1IiBjeT0iMjUiIHI9IjIyIiBmaWxsPSIjNEE2RkE1Ii8+PHBhdGggZD0iTTE1IDMyIFExNSAxOCAyNSAxOCBRMzUgMTggMzUgMzIgTDMxIDMyIFEzMSAyMiAyNSAyMiBRMTkgMjIgMTkgMzIgWiIgZmlsbD0id2hpdGUiLz48dGV4dCB4PSI1OCIgeT0iMzUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyMCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IiNEQzE0M0MiIGxldHRlci1zcGFjaW5nPSIwLjVweCI+QWlyIExpcXVpZGU8L3RleHQ+PC9zdmc+',
    primaryColor: 'hsl(220, 70%, 55%)', // Air Liquide blue
    accentColor: 'hsl(0, 70%, 55%)', // Air Liquide red
    gradientBg: 'linear-gradient(145deg, #000000 0%, #4A90E2 50%, #E53E3E 100%)',
    borderColor: 'hsl(220, 70%, 55% / 0.3)',
    navigation: [
      { path: '/', label: 'Industrial Dashboard', icon: 'Command' },
      { path: '/agent-command', label: 'Operations Command Centre', icon: 'Command' },
      { path: '/multi-agent-workspace', label: 'Industrial Orchestration', icon: 'Bot' },
      { path: '/mcp-dashboard', label: 'MCP Gateway', icon: 'Server' },
      { path: '/agent-exchange', label: 'Industrial Solutions', icon: 'ShoppingBag' },
      { path: '/procurement-analytics', label: 'Procurement Analytics', icon: 'TrendingUp' },
      { path: '/safety-monitoring', label: 'Safety Monitoring', icon: 'Shield' },
      { path: '/rd-discovery', label: 'R&D Discovery', icon: 'FlaskConical' },
      { path: '/talent-management', label: 'Talent Management', icon: 'Users' },
      { path: '/system-flow', label: 'AgentOS Architecture Blueprint', icon: 'Network' },
      { path: '/settings', label: 'Settings', icon: 'Settings' }
    ],
    workflows: [
      {
        id: 'industrial-procurement',
        name: 'Agentic Procurement & Supply Chain',
        description: 'Autonomous supply chain management with supplier research and risk monitoring',
        agents: ['Supplier Research Agent', 'RFP Generation Agent', 'Contract Negotiation Agent', 'Risk Monitoring Agent', 'Logistics Coordinator', 'Quality Assurance Agent', 'Cost Optimization Agent'],
        workflows: ['Supplier Discovery', 'RFP Creation', 'Contract Negotiation', 'Risk Assessment', 'Logistics Management', 'Quality Control', 'Cost Analysis']
      },
      {
        id: 'industrial-forecasting',
        name: 'Financial Forecasting & Scenario Analysis',
        description: 'Real-time financial forecasting with multi-source data integration and scenario modeling',
        agents: ['Market Intelligence Agent', 'Financial Forecasting Agent', 'Scenario Analysis Agent', 'Risk Assessment Agent', 'Economic Indicator Agent', 'Project Finance Agent'],
        workflows: ['Market Analysis', 'Financial Modeling', 'Scenario Planning', 'Risk Evaluation', 'Economic Monitoring', 'Project Valuation']
      },
      {
        id: 'industrial-recruitment',
        name: 'Talent Management & Recruitment',
        description: 'End-to-end talent lifecycle management with AI-powered screening and development',
        agents: ['Talent Sourcing Agent', 'Resume Screening Agent', 'Interview Coordinator', 'Onboarding Assistant', 'Career Development Agent'],
        workflows: ['Talent Discovery', 'Candidate Screening', 'Interview Management', 'Employee Onboarding', 'Career Planning']
      },
      {
        id: 'industrial-rd',
        name: 'R&D Materials Discovery',
        description: 'Accelerated materials discovery with academic research analysis and digital twin simulation',
        agents: ['Literature Mining Agent', 'Patent Research Agent', 'Digital Twin Simulator', 'Compound Analysis Agent', 'Lab Optimization Agent', 'Innovation Tracker'],
        workflows: ['Research Mining', 'Patent Analysis', 'Digital Simulation', 'Material Testing', 'Lab Coordination', 'Innovation Tracking']
      },
      {
        id: 'industrial-safety',
        name: 'Safety & Predictive Maintenance',
        description: 'Multi-modal safety monitoring with predictive maintenance and autonomous response',
        agents: ['Safety Monitor Agent', 'Predictive Maintenance Agent', 'Equipment Diagnostics Agent', 'Emergency Response Agent', 'Compliance Checker', 'Maintenance Scheduler', 'Risk Predictor', 'Alert Coordinator'],
        workflows: ['Safety Monitoring', 'Predictive Analysis', 'Equipment Diagnostics', 'Emergency Response', 'Compliance Tracking', 'Maintenance Planning', 'Risk Prediction', 'Alert Management']
      }
    ]
  }
];

const IndustryContext = createContext<IndustryContextType | undefined>(undefined);

export const useIndustry = () => {
  const context = useContext(IndustryContext);
  if (context === undefined) {
    throw new Error('useIndustry must be used within an IndustryProvider');
  }
  return context;
};

interface IndustryProviderProps {
  children: ReactNode;
}

export const IndustryProvider: React.FC<IndustryProviderProps> = ({ children }) => {
  // Initialize with custom configuration if available
  const getInitialIndustry = (): IndustryConfig => {
    // Force True Agent OS configuration as default
    const trueConfig = industryConfigurations.find(config => config.id === 'true');
    if (!trueConfig) {
      console.error('True configuration not found, falling back to first config');
      return industryConfigurations[0];
    }
    
    // Clear any cached configurations
    try {
      const savedConfig = localStorage.getItem('industryConfig');
      if (savedConfig) {
        const parsed = JSON.parse(savedConfig);
        // Only use saved config if it's the true one
        if (parsed.id === 'true' && parsed.name && parsed.displayName) {
          return parsed;
        } else {
          // Clear non-true cached configs
          localStorage.removeItem('industryConfig');
        }
      }
    } catch (error) {
      console.warn('Failed to load saved industry config:', error);
      localStorage.removeItem('industryConfig');
    }
    
    const defaultIndustry = { ...trueConfig };
    const customLogo = localStorage.getItem('customLogo');
    if (customLogo) {
      defaultIndustry.logo = customLogo;
    }
    
    // Save the true config to localStorage
    localStorage.setItem('industryConfig', JSON.stringify(defaultIndustry));
    
    return defaultIndustry;
  };

  const [currentIndustry, setCurrentIndustry] = useState<IndustryConfig>(getInitialIndustry());

  const setIndustry = (industry: IndustryConfig) => {
    setCurrentIndustry(industry);
    // Apply theme to CSS variables
    document.documentElement.style.setProperty('--industry-primary', industry.primaryColor);
    document.documentElement.style.setProperty('--industry-accent', industry.accentColor);
    document.documentElement.style.setProperty('--industry-border', industry.borderColor);
  };

  const value: IndustryContextType = {
    currentIndustry,
    setIndustry,
    availableIndustries: industryConfigurations,
  };

  return (
    <IndustryContext.Provider value={value}>
      {children}
    </IndustryContext.Provider>
  );
};