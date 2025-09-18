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
    displayName: 'Banking Agent OS',
    description: 'Comprehensive banking operations and customer management',
    logo: '/lovable-uploads/a10b19c4-4389-4ff7-93ba-658a33b12c22.png',
    primaryColor: 'hsl(358, 75%, 45%)', // true-red
    accentColor: 'hsl(358, 75%, 35%)',
    gradientBg: 'linear-gradient(145deg, #000000 0%, #E31E24 50%, #FFFFFF 100%)',
    borderColor: 'hsl(358, 75%, 45% / 0.3)',
    navigation: [
      { path: '/', label: 'Dashboard', icon: 'Command' },
      { path: '/agent-command', label: 'Agent Command Centre', icon: 'Command' },
      { path: '/agents', label: 'AI Agents', icon: 'Bot' },
      { path: '/agent-workspace', label: 'Agent Workspace', icon: 'Workflow' },
      { path: '/multi-agent-workspace', label: 'Multi Agent Workspace', icon: 'Bot' },
      { path: '/agent-exchange', label: 'AI Marketplace', icon: 'ShoppingBag' },
      { path: '/risk-analytics', label: 'Risk Analytics', icon: 'TrendingUp' },
      { path: '/wealth-management', label: 'Wealth Management', icon: 'TrendingUp' },
      { path: '/customer-insights', label: 'Customer Insights', icon: 'Users' },
      { path: '/backend-validation', label: 'Backend Validation', icon: 'Settings' },
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
    displayName: 'Telco Agent OS',
    description: 'Telecommunications operations and network management',
    logo: '/lovable-uploads/a10b19c4-4389-4ff7-93ba-658a33b12c22.png',
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
      { path: '/agent-workspace', label: 'Network Workspace', icon: 'Workflow' },
      { path: '/network-twin', label: 'Network Twin', icon: 'Globe' },
      { path: '/customer-analytics', label: 'Customer Analytics', icon: 'Users' },
      { path: '/backend-validation', label: 'Backend Validation', icon: 'Settings' },
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
    displayName: 'Healthcare Agent OS',
    description: 'Healthcare operations and patient management',
    logo: '/lovable-uploads/a10b19c4-4389-4ff7-93ba-658a33b12c22.png',
    primaryColor: 'hsl(145, 70%, 45%)', // healthcare green
    accentColor: 'hsl(145, 70%, 35%)',
    gradientBg: 'linear-gradient(145deg, #000000 0%, #00B566 50%, #FFFFFF 100%)',
    borderColor: 'hsl(145, 70%, 45% / 0.3)',
    navigation: [
      { path: '/', label: 'Health Dashboard', icon: 'Command' },
      { path: '/agent-command', label: 'Care Command Centre', icon: 'Command' },
      { path: '/agents', label: 'Healthcare Agents', icon: 'Bot' },
      { path: '/agent-workspace', label: 'Care Workspace', icon: 'Workflow' },
      { path: '/multi-agent-workspace', label: 'Care Orchestration', icon: 'Bot' },
      { path: '/agent-exchange', label: 'Health Solutions', icon: 'ShoppingBag' },
      { path: '/patient-analytics', label: 'Patient Analytics', icon: 'TrendingUp' },
      { path: '/care-management', label: 'Care Management', icon: 'Heart' },
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
  const [currentIndustry, setCurrentIndustry] = useState<IndustryConfig>(
    industryConfigurations[0] // Default to banking
  );

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