import React, { useEffect } from 'react';
import { BarChart2, History, Wrench, Database, Shield, CircleDollarSign, Activity, Brain } from 'lucide-react';
import { ProjectTiles } from './ProjectTiles';
import { AgentTraceability } from '@/components/AgentTraceability';
import { ToolsContent } from './ToolsContent';
import { GovernanceContent } from './GovernanceContent';
import { DataAccessContent } from './DataAccessContent';
import { CostContent } from './CostContent';
import { getProjectData } from './ProjectData';
import { getTelcoProjects } from './TelcoProjects';
import { useIndustry } from '@/contexts/IndustryContext';
import { useToast } from '@/hooks/use-toast';
import { RealAgentMonitoring } from './RealAgentMonitoring';
import { StrandsTraceability } from './StrandsTraceability';
import { TestStrandsTraceability } from './StrandsTraceability/TestStrandsTraceability';

interface MainTabsProps {
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

export const MainTabs: React.FC<MainTabsProps> = ({
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
  const { toast } = useToast();
  const { currentIndustry } = useIndustry();
  
  // Get project data from the appropriate source based on industry
  const projectDataObj = (currentIndustry.id === 'telco' || currentIndustry.id === 'true') ? 
    Object.fromEntries(getTelcoProjects().map(p => [p.id, { 
      department: p.department, 
      agents: Array(p.agentCount).fill(null).map((_, i) => ({ name: `Agent ${i + 1}` })) 
    }])) : 
    getProjectData();
  
  // Save active tab to localStorage
  useEffect(() => {
    if (activeTab) {
      localStorage.setItem('command-centre-active-tab', activeTab);
    }
  }, [activeTab]);
  
  // Find the current project data to extract the name and agents
  const currentProject = Object.entries(projectDataObj)
    .find(([id]) => id === selectedProject)?.[1];
  
  // Get industry-specific project configurations
  const industryProjects = (currentIndustry.id === 'telco' || currentIndustry.id === 'true') ? getTelcoProjects() : [];
  
  // Custom project names - industry aware
  const getProjectNames = () => {
    if (currentIndustry.id === 'telco' || currentIndustry.id === 'true') {
      return Object.fromEntries(industryProjects.map(p => [p.id, p.name]));
    }
    
    return {
      'hydrogen-production': 'Hydrogen Production',
      'industrial-forecasting': 'Financial Forecasting & Scenario Analysis',
      'process-engineering': 'Process Engineering',
      'default': 'Air Separation Units'
    };
  };
  
  const projectNames = getProjectNames();
  
  // Handle tab change with history state
  const handleTabChangeInternal = (value: string) => {
    console.log('🔄 MainTabs - Tab change requested:', value);
    console.log('🔍 MainTabs - Current activeTab:', activeTab);
    
    setActiveTab(value);
    
    // Save state in localStorage
    localStorage.setItem('command-centre-active-tab', value);
    
    // Update URL without refreshing the page
    window.history.pushState(
      { tab: value, project: selectedProject },
      '',
      `?tab=${value}${selectedProject ? `&project=${selectedProject}` : ''}`
    );
    
    console.log('✅ MainTabs - Tab changed to:', value);
  };

  return (
    <div className="w-full">
      {/* Custom tab list with original styling */}
      <div className="grid grid-cols-8 mb-6 bg-beam-dark-accent/40 border border-gray-700/50 rounded-xl p-1 gap-1 w-full max-w-full overflow-hidden">
        <button
          onClick={() => handleTabChangeInternal('dashboard')}
          className={`rounded-lg flex items-center gap-1 md:gap-2 text-xs md:text-sm min-w-0 px-2 py-2 transition-colors ${
            activeTab === 'dashboard' 
              ? 'bg-beam-blue text-white shadow-md' 
              : 'text-gray-300 hover:text-white hover:bg-beam-dark-accent/50'
          }`}
        >
          <BarChart2 size={16} className="md:w-[18px] md:h-[18px] flex-shrink-0" />
          <span className="hidden sm:inline font-medium truncate">Dashboard</span>
        </button>
        <button
          onClick={() => handleTabChangeInternal('traceability')}
          className={`rounded-lg flex items-center gap-1 md:gap-2 text-xs md:text-sm min-w-0 px-2 py-2 transition-colors ${
            activeTab === 'traceability' 
              ? 'bg-beam-blue text-white shadow-md' 
              : 'text-gray-300 hover:text-white hover:bg-beam-dark-accent/50'
          }`}
        >
          <History size={16} className="md:w-[18px] md:h-[18px] flex-shrink-0" />
          <span className="hidden sm:inline font-medium truncate">Traceability</span>
        </button>
        <button
          onClick={() => handleTabChangeInternal('tools')}
          className={`rounded-lg flex items-center gap-1 md:gap-2 text-xs md:text-sm min-w-0 px-2 py-2 transition-colors ${
            activeTab === 'tools' 
              ? 'bg-beam-blue text-white shadow-md' 
              : 'text-gray-300 hover:text-white hover:bg-beam-dark-accent/50'
          }`}
        >
          <Wrench size={16} className="md:w-[18px] md:h-[18px] flex-shrink-0" />
          <span className="hidden sm:inline font-medium truncate">Tools</span>
        </button>
        <button
          onClick={() => handleTabChangeInternal('data')}
          className={`rounded-lg flex items-center gap-1 md:gap-2 text-xs md:text-sm min-w-0 px-2 py-2 transition-colors ${
            activeTab === 'data' 
              ? 'bg-beam-blue text-white shadow-md' 
              : 'text-gray-300 hover:text-white hover:bg-beam-dark-accent/50'
          }`}
        >
          <Database size={16} className="md:w-[18px] md:h-[18px] flex-shrink-0" />
          <span className="hidden sm:inline font-medium truncate">Data</span>
        </button>
        <button
          onClick={() => handleTabChangeInternal('governance')}
          className={`rounded-lg flex items-center gap-1 md:gap-2 text-xs md:text-sm min-w-0 px-2 py-2 transition-colors ${
            activeTab === 'governance' 
              ? 'bg-beam-blue text-white shadow-md' 
              : 'text-gray-300 hover:text-white hover:bg-beam-dark-accent/50'
          }`}
        >
          <Shield size={16} className="md:w-[18px] md:h-[18px] flex-shrink-0" />
          <span className="hidden sm:inline font-medium truncate">Governance</span>
        </button>
        <button
          onClick={() => handleTabChangeInternal('cost')}
          className={`rounded-lg flex items-center gap-1 md:gap-2 text-xs md:text-sm min-w-0 px-2 py-2 transition-colors ${
            activeTab === 'cost' 
              ? 'bg-beam-blue text-white shadow-md' 
              : 'text-gray-300 hover:text-white hover:bg-beam-dark-accent/50'
          }`}
        >
          <CircleDollarSign size={16} className="md:w-[18px] md:h-[18px] flex-shrink-0" />
          <span className="hidden sm:inline font-medium truncate">Cost</span>
        </button>
        <button
          onClick={() => handleTabChangeInternal('strands')}
          className={`rounded-lg flex items-center gap-1 md:gap-2 text-xs md:text-sm min-w-0 px-2 py-2 transition-colors ${
            activeTab === 'strands' 
              ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md' 
              : 'text-gray-300 hover:text-white hover:bg-beam-dark-accent/50'
          }`}
        >
          <Brain size={16} className="md:w-[18px] md:h-[18px] flex-shrink-0" />
          <span className="hidden sm:inline font-medium truncate">Strands</span>
        </button>
        <button
          onClick={() => handleTabChangeInternal('monitoring')}
          className={`rounded-lg flex items-center gap-1 md:gap-2 text-xs md:text-sm min-w-0 px-2 py-2 transition-colors ${
            activeTab === 'monitoring' 
              ? 'bg-beam-blue text-white shadow-md' 
              : 'text-gray-300 hover:text-white hover:bg-beam-dark-accent/50'
          }`}
        >
          <Activity size={16} className="md:w-[18px] md:h-[18px] flex-shrink-0" />
          <span className="hidden sm:inline font-medium truncate">Monitor</span>
        </button>
      </div>

      {/* Tab content with conditional rendering */}
      <div className="w-full">
        {console.log('🔍 MainTabs render - activeTab:', activeTab)}
        {activeTab === 'dashboard' && (
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

        {activeTab === 'traceability' && (
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

        {activeTab === 'tools' && (
          <ToolsContent industry={currentIndustry.id} />
        )}

        {activeTab === 'data' && (
          <DataAccessContent industry={currentIndustry.id} />
        )}

        {activeTab === 'governance' && (
          <GovernanceContent industry={currentIndustry.id} />
        )}

        {activeTab === 'cost' && (
          <CostContent 
            selectedProject={selectedProject}
            setSelectedProject={setSelectedProject}
          />
        )}

        {activeTab === 'strands' && (
          <TestStrandsTraceability />
        )}

        {activeTab === 'monitoring' && (
          <RealAgentMonitoring />
        )}
      </div>
    </div>
  );
};