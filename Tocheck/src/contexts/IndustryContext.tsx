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
    id: 'banking',
    name: 'banking',
    displayName: 'AWS Banking Agent OS',
    description: 'Comprehensive banking operations and customer management',
    logo: 'https://aws.amazon.com/favicon.ico',
    primaryColor: 'hsl(358, 75%, 45%)', // true-red
    accentColor: 'hsl(358, 75%, 35%)',
    gradientBg: 'linear-gradient(145deg, #000000 0%, #E31E24 50%, #FFFFFF 100%)',
    borderColor: 'hsl(358, 75%, 45% / 0.3)',
    navigation: [
      { path: '/', label: 'Dashboard', icon: 'Command' },
      { path: '/agent-command', label: 'Agent Command Centre', icon: 'Command' },
      { path: '/agents', label: 'AI Agents', icon: 'Bot' },
      { path: '/multi-agent-workspace', label: 'Multi Agent Workspace', icon: 'Bot' },
      { path: '/mcp-dashboard', label: 'MCP Gateway', icon: 'Server' },
      { path: '/agent-exchange', label: 'AI Marketplace', icon: 'ShoppingBag' },
      { path: '/risk-analytics', label: 'Risk Analytics', icon: 'TrendingUp' },
      { path: '/wealth-management', label: 'Wealth Management', icon: 'TrendingUp' },
      { path: '/customer-insights', label: 'Customer Insights', icon: 'Users' },
      { path: '/agent-control', label: 'Agent Control Panel', icon: 'Activity' },
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
    displayName: 'AWS Telco Agent OS',
    description: 'Telecommunications operations and network management',
    logo: 'https://aws.amazon.com/favicon.ico',
    primaryColor: 'hsl(220, 90%, 55%)', // telco blue
    accentColor: 'hsl(220, 90%, 45%)',
    gradientBg: 'linear-gradient(145deg, #000000 0%, #0066FF 50%, #FFFFFF 100%)',
    borderColor: 'hsl(220, 90%, 55% / 0.3)',
    navigation: [
      { path: '/', label: 'Dashboard', icon: 'Command' },
      { path: '/agent-command', label: 'Agent Command Centre', icon: 'Command' },
      { path: '/agent-exchange', label: 'Agent Marketplace', icon: 'ShoppingBag' },
      { path: '/multi-agent-workspace', label: 'Multi Agent Orchestration', icon: 'Bot' },
      { path: '/agents', label: 'Network Agents', icon: 'Bot' },
      { path: '/mcp-dashboard', label: 'MCP Gateway', icon: 'Server' },
      { path: '/network-twin', label: 'Network Twin', icon: 'Globe' },
      { path: '/customer-analytics', label: 'Customer Analytics', icon: 'Users' },
      { path: '/agent-control', label: 'Agent Control Panel', icon: 'Activity' },
      { path: '/system-flow', label: 'AgentOS Architecture Blueprint', icon: 'Network' },
      { path: '/settings', label: 'Settings', icon: 'Settings' }
    ],
    workflows: [
      {
        id: 'network-optimization',
        name: 'Network Optimization Suite',
        description: 'Complete network management with specialized agents',
        agents: ['Network Monitor', 'Performance Optimizer', 'Fault Detector', 'Customer Support', 'Capacity Planner', 'Security Guard'],
        workflows: ['Network Monitoring', 'Performance Analysis', 'Fault Detection', 'Customer Support', 'Capacity Planning', 'Security Monitoring']
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
      { path: '/agents', label: 'Healthcare Agents', icon: 'Bot' },
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
    try {
      const savedConfig = localStorage.getItem('industryConfig');
      if (savedConfig) {
        const parsed = JSON.parse(savedConfig);
        // Validate that the parsed config has required properties
        if (parsed.id && parsed.name && parsed.displayName) {
          return parsed;
        }
      }
    } catch (error) {
      console.warn('Failed to load saved industry config:', error);
    }
    
    // Fallback to default with custom logo if available
    const defaultIndustry = { ...industryConfigurations[0] };
    const customLogo = localStorage.getItem('customLogo');
    if (customLogo) {
      defaultIndustry.logo = customLogo;
    }
    
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

export const useIndustryContext = (): IndustryContextType => {
  const context = useContext(IndustryContext);
  if (!context) {
    throw new Error('useIndustryContext must be used within an IndustryProvider');
  }
  return context;
};