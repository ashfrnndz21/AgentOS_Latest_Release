
import React, { useState, useCallback, useMemo, useRef } from 'react';
import { Layout } from '@/components/Layout';
import { useIndustry } from '@/contexts/IndustryContext';
import { 
  QuickActions, 
  getProjectData,
  decisionPathMetadata,
  dataLineageMetadata
} from '@/components/CommandCentre';
import { FixedMainTabs } from '@/components/CommandCentre/FixedMainTabs';


import { getTelcoProjectData } from '@/components/CommandCentre/TelcoProjectData';

const AgentCommand = () => {
  const { currentIndustry } = useIndustry();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState(
    currentIndustry.id === 'telco' ? 'network-operations' : 'hydrogen-production'
  );
  const mountedRef = useRef(true);
  
  // Use useMemo to prevent unnecessary recalculations and select correct data based on industry
  const projectData = useMemo(() => {
    return currentIndustry.id === 'telco' ? getTelcoProjectData() : getProjectData();
  }, [currentIndustry.id]);

  // Update selectedProject when industry changes to prevent undefined project data access
  React.useEffect(() => {
    const defaultProject = currentIndustry.id === 'telco' ? 'network-operations' : 'hydrogen-production';
    setSelectedProject(defaultProject);
  }, [currentIndustry.id]);

  const handleNodeClick = useCallback((nodeId: string) => {
    if (mountedRef.current) {
      setSelectedNode(nodeId === selectedNode ? null : nodeId);
    }
  }, [selectedNode]);

  const handleTabChange = useCallback((tab: string) => {
    if (mountedRef.current) {
      setActiveTab(tab);
    }
  }, []);

  const handleProjectSelect = useCallback((projectId: string) => {
    if (mountedRef.current) {
      setSelectedProject(projectId);
      // Don't automatically change to traceability if we're on the cost tab
      if (activeTab !== 'cost') {
        setActiveTab('traceability');
      }
    }
  }, [activeTab]);

  // Use useEffect to update the mountedRef when component unmounts
  React.useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return (
    <Layout>
      <div className="flex-1 h-screen overflow-y-auto overflow-x-hidden bg-beam-dark bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-beam-dark to-beam-dark text-beam-text">
        <div className="w-full p-6 md:p-8">
          <div className="flex flex-col gap-6 max-w-full">
            <div className="glass-panel backdrop-blur-md bg-beam-dark-accent/30 border border-gray-700/50 rounded-xl p-6 shadow-lg">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="mb-4 md:mb-0">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-green-400 text-sm">Active</span>
                  </div>
                  <h1 className="text-3xl font-bold text-white mt-1 mb-2">
                    {currentIndustry.displayName}
                  </h1>
                  <p className="text-gray-300">
                    Monitor, manage and govern your {currentIndustry.name} AI agents in real-time
                  </p>
                </div>
                
                <div className="flex gap-3 items-center">
                  <QuickActions />
                </div>
              </div>
            </div>
            
            <FixedMainTabs 
              activeTab={activeTab}
              setActiveTab={handleTabChange}
              selectedProject={selectedProject}
              setSelectedProject={handleProjectSelect}
              projectData={projectData}
              selectedNode={selectedNode}
              onNodeClick={handleNodeClick}
              decisionPathMetadata={decisionPathMetadata}
              dataLineageMetadata={dataLineageMetadata}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AgentCommand;
