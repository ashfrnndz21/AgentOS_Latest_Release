import React, { useState, useEffect } from 'react';
import { BarChart2, History, Wrench, Database, Shield, CircleDollarSign, Activity, Brain } from 'lucide-react';
import { ProjectTiles } from './ProjectTiles';
import { AgentTraceability } from '@/components/AgentTraceability';
import { ToolsContent } from './ToolsContent';
import { GovernanceContent } from './GovernanceContent';
import { DataAccessContent } from './DataAccessContent';
import { CostContent } from './CostContent';
import { RealAgentMonitoring } from './RealAgentMonitoring';
import { SimpleStrandsTraceability } from './StrandsTraceability/SimpleStrandsTraceability';
import { getProjectData, getBankingProjectData } from './ProjectData';
import { getTelcoProjects } from './TelcoProjects';
import { useIndustry } from '@/contexts/IndustryContext';



interface FixedMainTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedProject: string;
  setSelectedProject: (projectId: string) => void;
  projectData: any;
  selectedNode: string | null;
  onNodeClick: (nodeId: string) => void;
  decisionPathMetadata: any;
  dataLineageMetadata: any;
}

export const FixedMainTabs: React.FC<FixedMainTabsProps> = ({
  activeTab,
  setActiveTab,
  selectedProject,
  setSelectedProject,
  projectData,
  selectedNode,
  onNodeClick,
  decisionPathMetadata,
  dataLineageMetadata
}) => {
  const [internalActiveTab, setInternalActiveTab] = useState(activeTab || 'dashboard');
  const { currentIndustry } = useIndustry();

  // Get project data from the appropriate source based on industry
  const projectDataObj = currentIndustry.id === 'telco' ? 
    Object.fromEntries(getTelcoProjects().map(p => [p.id, { 
      department: p.department, 
      agents: Array(p.agentCount).fill(null).map((_, i) => ({ name: `Agent ${i + 1}` })) 
    }])) : 
    currentIndustry.id === 'banking' ? 
    getBankingProjectData() :
    getProjectData();

  // Custom project names - industry aware
  const getProjectNames = () => {
    if (currentIndustry.id === 'telco') {
      const industryProjects = getTelcoProjects();
      return Object.fromEntries(industryProjects.map(p => [p.id, p.name]));
    }
    
    if (currentIndustry.id === 'banking') {
      return {
        'wealth-management': 'Wealth Management Portfolio',
        'risk-analytics': 'Credit Risk Assessment',
        'fraud-detection': 'Fraud Detection System',
        'customer-insights': 'Customer Analytics Platform',
        'default': 'Banking Operations'
      };
    }
    
    return {
      'hydrogen-production': 'Hydrogen Production',
      'industrial-forecasting': 'Financial Forecasting & Scenario Analysis',
      'process-engineering': 'Process Engineering',
      'default': 'Air Separation Units'
    };
  };
  
  const projectNames = getProjectNames();

  // Sync with parent component
  useEffect(() => {
    if (activeTab !== internalActiveTab) {
      setInternalActiveTab(activeTab);
    }
  }, [activeTab]);

  const handleTabClick = (tabName: string) => {
    console.log('🔄 Tab clicked:', tabName);
    setInternalActiveTab(tabName);
    setActiveTab(tabName);
    console.log('✅ Tab changed to:', tabName);
  };

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: BarChart2 },
    { id: 'traceability', name: 'Traceability', icon: History },
    { id: 'tools', name: 'Tools', icon: Wrench },
    { id: 'data', name: 'Data', icon: Database },
    { id: 'governance', name: 'Governance', icon: Shield },
    { id: 'cost', name: 'Cost', icon: CircleDollarSign },
    { id: 'strands', name: 'Strands', icon: Brain },
    { id: 'monitoring', name: 'Monitor', icon: Activity }
  ];

  return (
    <div className="w-full">
      {/* Debug info */}
      <div className="mb-4 p-2 bg-blue-900/20 border border-blue-500/30 rounded text-blue-300 text-sm">
        🔍 Debug: Active tab = "{internalActiveTab}"
      </div>

      {/* Tab buttons */}
      <div className="flex flex-wrap gap-2 mb-6 p-2 bg-gray-900/50 rounded-lg">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = internalActiveTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s ease',
                backgroundColor: isActive 
                  ? (tab.id === 'strands' ? '#7c3aed' : '#3b82f6')
                  : '#374151',
                color: isActive ? '#ffffff' : '#d1d5db'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = '#4b5563';
                  e.currentTarget.style.color = '#ffffff';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = '#374151';
                  e.currentTarget.style.color = '#d1d5db';
                }
              }}
            >
              <Icon size={16} />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="w-full">
        {internalActiveTab === 'dashboard' && (
          <div className="glass-panel backdrop-blur-md bg-beam-dark-accent/30 border border-gray-700/50 rounded-xl p-6 shadow-lg">
            <ProjectTiles 
              projects={currentIndustry.id === 'telco' ? getTelcoProjects() : 
                Object.entries(projectDataObj).map(([id, data]: [string, any]) => ({
                  id,
                  name: projectNames[id as keyof typeof projectNames] || id,
                  description: `${data.agents?.length || 1} agent${data.agents?.length !== 1 ? 's' : ''}`,
                  agentCount: data.agents?.length || 1,
                  tools: ['API Gateway', 'Data Connector', 'Prediction Engine'],
                  databases: ['Customer DB', 'Analytics Warehouse'],
                  globalGuardrails: ['PII Protection', 'Content Filtering'],
                  localGuardrails: ['Network Data Protection', 'Custom Regex Filter'],
                  color: id === 'hydrogen-production' ? 'border-blue-500' : 
                        id === 'industrial-forecasting' ? 'border-purple-500' :
                        id === 'process-engineering' ? 'border-green-500' : 'border-gray-500',
                  department: data.department || 'General'
                }))
              }
              onSelectProject={(projectId) => {
                setSelectedProject(projectId);
                setActiveTab('traceability');
              }}
            />
          </div>
        )}

        {internalActiveTab === 'traceability' && (
          <AgentTraceability 
            decisionNodes={projectData[selectedProject]?.decisionNodes || []}
            lineageNodes={projectData[selectedProject]?.lineageNodes || []}
            lineageEdges={projectData[selectedProject]?.lineageEdges || []}
            decisionPathMetadata={decisionPathMetadata}
            dataLineageMetadata={dataLineageMetadata}
            selectedNode={selectedNode}
            onNodeClick={onNodeClick}
            projectName={projectNames[selectedProject as keyof typeof projectNames] || "Project"}
            agents={projectData[selectedProject]?.agents || []}
          />
        )}

        {internalActiveTab === 'tools' && (
          <ToolsContent industry={currentIndustry.id === 'telco' ? 'telco' : 'industrial'} />
        )}

        {internalActiveTab === 'data' && (
          <DataAccessContent industry={currentIndustry.id === 'telco' ? 'telco' : 'industrial'} />
        )}

        {internalActiveTab === 'governance' && (
          <GovernanceContent industry={currentIndustry.id === 'telco' ? 'telco' : 'industrial'} />
        )}

        {internalActiveTab === 'cost' && (
          <CostContent 
            selectedProject={selectedProject}
            setSelectedProject={setSelectedProject}
          />
        )}

        {internalActiveTab === 'strands' && (
          <SimpleStrandsTraceability 
            selectedProject={selectedProject}
            projectData={projectData}
            currentIndustry={currentIndustry}
            onNodeClick={onNodeClick}
          />
        )}

        {internalActiveTab === 'monitoring' && (
          <RealAgentMonitoring />
        )}
      </div>
    </div>
  );
};