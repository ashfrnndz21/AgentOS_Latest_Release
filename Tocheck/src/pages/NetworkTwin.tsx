
import React from 'react';
import { NetworkTwinHeader } from '@/components/NetworkTwin/NetworkTwinHeader';
import { SimulationPanel } from '@/components/NetworkTwin/SimulationPanel';
import { InteractiveNetworkTopology } from '@/components/NetworkTwin/components/InteractiveNetworkTopology';
import { AnalysisPanel } from '@/components/NetworkTwin/AnalysisPanel';
import { NetworkAgents } from '@/components/NetworkTwin/NetworkAgents';
import { AgentDetailModal } from '@/components/NetworkTwin/modals/AgentDetailModal';
import { SiteDetailModal } from '@/components/NetworkTwin/modals/SiteDetailModal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNetworkTwinNavigation } from '@/components/NetworkTwin/hooks/useNetworkTwinNavigation';
import { networkDatasets } from '@/components/NetworkTwin/data/networkTwinData';
import { NetworkSelector } from '@/components/NetworkTwin/NetworkSelector';
import { useToast } from '@/hooks/use-toast';

const NetworkTwin = () => {
  const { toast } = useToast();
  const {
    navState,
    navigateToAgent,
    navigateToSite,
    navigateToSimulation,
    navigateToAnalysis,
    closeModal,
    setActiveTab,
    switchNetwork,
  } = useNetworkTwinNavigation();

  const handleAgentDeploy = (agentId: string) => {
    toast({
      title: "Agent Deployed",
      description: `Agent ${agentId} has been successfully deployed.`,
    });
  };

  const handleAgentStop = (agentId: string) => {
    toast({
      title: "Agent Stopped",
      description: `Agent ${agentId} has been stopped.`,
    });
  };

  const handleSiteOptimize = (siteId: string) => {
    toast({
      title: "Optimization Started",
      description: `Performance optimization initiated for site ${siteId}.`,
    });
  };

  const handleSiteMaintenance = (siteId: string) => {
    toast({
      title: "Maintenance Scheduled",
      description: `Maintenance has been scheduled for site ${siteId}.`,
    });
  };

  const handleAnalysisClick = (analysisType: string, data: any) => {
    navigateToAnalysis(analysisType, data);
    setActiveTab('analysis');
  };

  // Get current network data
  const currentNetworkData = networkDatasets[navState.selectedNetwork as keyof typeof networkDatasets];
  const selectedSite = navState.selectedSiteId ? 
    currentNetworkData.cellSites.find(site => site.id === navState.selectedSiteId) : null;
  
  return (
    <div className="flex-1 h-screen overflow-y-auto bg-beam-dark bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-beam-dark to-beam-dark text-beam-text">
      <div className="p-6 md:p-8">
        <div className="flex gap-6">
          {/* Sidebar with Network Selector */}
          <div className="w-80 flex-shrink-0">
            <NetworkSelector 
              selectedNetwork={navState.selectedNetwork}
              onNetworkChange={switchNetwork}
            />
          </div>
          
          {/* Main Content */}
          <div className="flex-1 flex flex-col gap-6">
            <NetworkTwinHeader />
          
          <Tabs defaultValue="topology" value={navState.activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-4 mb-6 bg-beam-dark-accent/40 border border-gray-700/50 rounded-xl p-1 gap-1">
              <TabsTrigger 
                value="topology" 
                className="rounded-lg flex items-center gap-2 data-[state=active]:bg-beam-blue data-[state=active]:text-white data-[state=active]:shadow-md"
              >
                Network Topology
              </TabsTrigger>
              <TabsTrigger 
                value="agents" 
                className="rounded-lg flex items-center gap-2 data-[state=active]:bg-beam-blue data-[state=active]:text-white data-[state=active]:shadow-md"
              >
                Network Agents
              </TabsTrigger>
              <TabsTrigger 
                value="simulation" 
                className="rounded-lg flex items-center gap-2 data-[state=active]:bg-beam-blue data-[state=active]:text-white data-[state=active]:shadow-md"
              >
                Simulation & Forecasting
              </TabsTrigger>
              <TabsTrigger 
                value="analysis" 
                className="rounded-lg flex items-center gap-2 data-[state=active]:bg-beam-blue data-[state=active]:text-white data-[state=active]:shadow-md"
              >
                Cross-Dimensional Analysis
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="topology" className="mt-0">
              <InteractiveNetworkTopology 
                cellSites={currentNetworkData.cellSites}
                onSiteClick={navigateToSite}
                onAnalysisClick={handleAnalysisClick}
              />
            </TabsContent>
            
            <TabsContent value="agents" className="mt-0">
              <NetworkAgents onAgentClick={navigateToAgent} />
            </TabsContent>
            
            <TabsContent value="simulation" className="mt-0">
              <SimulationPanel onSimulationComplete={navigateToSimulation} />
            </TabsContent>
            
            <TabsContent value="analysis" className="mt-0">
              <AnalysisPanel />
            </TabsContent>
          </Tabs>

          {/* Modals */}
          {navState.modalType === 'agent-detail' && navState.selectedAgent && (
            <AgentDetailModal
              isOpen={true}
              onClose={closeModal}
              agentId={navState.selectedAgent}
              onDeploy={handleAgentDeploy}
              onStop={handleAgentStop}
            />
          )}

          {navState.modalType === 'site-detail' && selectedSite && (
            <SiteDetailModal
              isOpen={true}
              onClose={closeModal}
              siteData={selectedSite}
              onOptimize={handleSiteOptimize}
              onMaintenance={handleSiteMaintenance}
            />
          )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetworkTwin;
