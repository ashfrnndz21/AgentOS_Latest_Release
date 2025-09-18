
import React, { useEffect } from 'react';
import { BarChart2, History, Wrench, Database, Shield, CircleDollarSign, Activity } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  const projectDataObj = currentIndustry.id === 'telco' ? 
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
  const industryProjects = currentIndustry.id === 'telco' ? getTelcoProjects() : [];
  
  // Custom project names - industry aware
  const getProjectNames = () => {
    if (currentIndustry.id === 'telco') {
      return Object.fromEntries(industryProjects.map(p => [p.id, p.name]));
    }
    
    return {
      'network-capex': 'Network Capex Investment Management',
      'customer-lifetime': 'Customer Lifetime Value Management',
      'sales-service-ai': 'Sales & Service Optimization',
      'customer-experience': 'Customer Experience Enhancement',
      'hr-analytics': 'HR Analytics & Talent Management',
      'default': 'Default Project'
    };
  };
  
  const projectNames = getProjectNames();
  
  // Handle tab change with history state
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    // Save state in localStorage
    localStorage.setItem('command-centre-active-tab', value);
    
    // Update URL without refreshing the page
    window.history.pushState(
      { tab: value, project: selectedProject },
      '',
      `?tab=${value}${selectedProject ? `&project=${selectedProject}` : ''}`
    );
  };
  
  return (
    <Tabs defaultValue="dashboard" value={activeTab} onValueChange={handleTabChange} className="w-full">
      <TabsList className="grid grid-cols-7 mb-6 bg-beam-dark-accent/40 border border-gray-700/50 rounded-xl p-1 gap-1 w-full max-w-full overflow-hidden">
        <TabsTrigger 
          value="dashboard" 
          className="rounded-lg flex items-center gap-1 md:gap-2 data-[state=active]:bg-beam-blue data-[state=active]:text-white data-[state=active]:shadow-md text-xs md:text-sm min-w-0"
        >
          <BarChart2 size={16} className="md:w-[18px] md:h-[18px] flex-shrink-0" />
          <span className="hidden sm:inline font-medium truncate">Dashboard</span>
        </TabsTrigger>
        <TabsTrigger 
          value="traceability" 
          className="rounded-lg flex items-center gap-1 md:gap-2 data-[state=active]:bg-beam-blue data-[state=active]:text-white data-[state=active]:shadow-md text-xs md:text-sm min-w-0"
        >
          <History size={16} className="md:w-[18px] md:h-[18px] flex-shrink-0" />
          <span className="hidden sm:inline font-medium truncate">Traceability</span>
        </TabsTrigger>
        <TabsTrigger 
          value="tools" 
          className="rounded-lg flex items-center gap-1 md:gap-2 data-[state=active]:bg-beam-blue data-[state=active]:text-white data-[state=active]:shadow-md text-xs md:text-sm min-w-0"
        >
          <Wrench size={16} className="md:w-[18px] md:h-[18px] flex-shrink-0" />
          <span className="hidden sm:inline font-medium truncate">Tools</span>
        </TabsTrigger>
        <TabsTrigger 
          value="data" 
          className="rounded-lg flex items-center gap-1 md:gap-2 data-[state=active]:bg-beam-blue data-[state=active]:text-white data-[state=active]:shadow-md text-xs md:text-sm min-w-0"
        >
          <Database size={16} className="md:w-[18px] md:h-[18px] flex-shrink-0" />
          <span className="hidden sm:inline font-medium truncate">Data</span>
        </TabsTrigger>
        <TabsTrigger 
          value="governance" 
          className="rounded-lg flex items-center gap-1 md:gap-2 data-[state=active]:bg-beam-blue data-[state=active]:text-white data-[state=active]:shadow-md text-xs md:text-sm min-w-0"
        >
          <Shield size={16} className="md:w-[18px] md:h-[18px] flex-shrink-0" />
          <span className="hidden sm:inline font-medium truncate">Governance</span>
        </TabsTrigger>
        <TabsTrigger 
          value="cost" 
          className="rounded-lg flex items-center gap-1 md:gap-2 data-[state=active]:bg-beam-blue data-[state=active]:text-white data-[state=active]:shadow-md text-xs md:text-sm min-w-0"
        >
          <CircleDollarSign size={16} className="md:w-[18px] md:h-[18px] flex-shrink-0" />
          <span className="hidden sm:inline font-medium truncate">Cost</span>
        </TabsTrigger>
        <TabsTrigger 
          value="monitoring" 
          className="rounded-lg flex items-center gap-1 md:gap-2 data-[state=active]:bg-beam-blue data-[state=active]:text-white data-[state=active]:shadow-md text-xs md:text-sm min-w-0"
        >
          <Activity size={16} className="md:w-[18px] md:h-[18px] flex-shrink-0" />
          <span className="hidden sm:inline font-medium truncate">Monitor</span>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="dashboard" className="mt-0">
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
                color: id === 'network-capex' ? 'border-blue-500' : 
                      id === 'customer-lifetime' ? 'border-purple-500' :
                      id === 'sales-service-ai' ? 'border-green-500' :
                      id === 'customer-experience' ? 'border-amber-500' :
                      id === 'hr-analytics' ? 'border-pink-500' : 'border-gray-500',
                department: data.department || 'General'
              }))
            }
            onSelectProject={(projectId) => {
              setSelectedProject(projectId);
              setActiveTab('traceability');
            }}
          />
        </div>
      </TabsContent>
      
      <TabsContent value="traceability" className="mt-0">
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
      </TabsContent>
      
      <TabsContent value="tools" className="mt-0">
        <ToolsContent industry={currentIndustry.id} />
      </TabsContent>
      
      <TabsContent value="data" className="mt-0">
        <DataAccessContent industry={currentIndustry.id} />
      </TabsContent>
      
      <TabsContent value="governance" className="mt-0">
        <GovernanceContent industry={currentIndustry.id} />
      </TabsContent>
      
      <TabsContent value="cost" className="mt-0">
        <CostContent 
          selectedProject={selectedProject}
          setSelectedProject={setSelectedProject}
        />
      </TabsContent>

      <TabsContent value="monitoring" className="mt-0">
        <RealAgentMonitoring />
      </TabsContent>
    </Tabs>
  );
};
