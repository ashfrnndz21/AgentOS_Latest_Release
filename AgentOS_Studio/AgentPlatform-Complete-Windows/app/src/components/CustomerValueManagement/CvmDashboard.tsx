
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AgentsTab } from './AgentsTab';
import { SegmentationTab } from './SegmentationTab';
import { CampaignAnalysisTab } from './CampaignAnalysisTab';
import { PropensityModelsTab } from './PropensityModelsTab';
import { NextBestOfferTab } from './NextBestOfferTab';
import { DataSourcesTab } from './DataSourcesTab';
import { CvmAgenticDecisioning } from './CvmAgenticDecisioning';
import { 
  Users,
  Bot, 
  BarChart2, 
  TrendingUp, 
  Gift, 
  Database,
  Brain
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const CvmDashboard = () => {
  const [activeTab, setActiveTab] = useState('agents');
  const { toast } = useToast();
  
  // Store active tab in localStorage to persist across page reloads
  useEffect(() => {
    // Try to get a saved tab from localStorage
    const savedTab = localStorage.getItem('cvm-active-tab');
    if (savedTab) {
      setActiveTab(savedTab);
    }
  }, []);

  // Update localStorage when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    localStorage.setItem('cvm-active-tab', value);
  };

  return (
    <Tabs defaultValue={activeTab} value={activeTab} onValueChange={handleTabChange} className="w-full">
      <TabsList className="grid grid-cols-7 mb-6 bg-beam-dark-accent/40 border border-gray-700/50 rounded-xl p-1 gap-1">
        <TabsTrigger 
          value="agents" 
          className="rounded-lg flex items-center gap-2 data-[state=active]:bg-beam-blue data-[state=active]:text-white data-[state=active]:shadow-md"
        >
          <Bot size={18} />
          <span className="hidden md:inline font-medium">Agents</span>
        </TabsTrigger>
        <TabsTrigger 
          value="segmentation" 
          className="rounded-lg flex items-center gap-2 data-[state=active]:bg-beam-blue data-[state=active]:text-white data-[state=active]:shadow-md"
        >
          <Users size={18} />
          <span className="hidden md:inline font-medium">Segmentation</span>
        </TabsTrigger>
        <TabsTrigger 
          value="campaign" 
          className="rounded-lg flex items-center gap-2 data-[state=active]:bg-beam-blue data-[state=active]:text-white data-[state=active]:shadow-md"
        >
          <BarChart2 size={18} />
          <span className="hidden md:inline font-medium">Campaign Analysis</span>
        </TabsTrigger>
        <TabsTrigger 
          value="propensity" 
          className="rounded-lg flex items-center gap-2 data-[state=active]:bg-beam-blue data-[state=active]:text-white data-[state=active]:shadow-md"
        >
          <TrendingUp size={18} />
          <span className="hidden md:inline font-medium">Propensity Models</span>
        </TabsTrigger>
        <TabsTrigger 
          value="nbo" 
          className="rounded-lg flex items-center gap-2 data-[state=active]:bg-beam-blue data-[state=active]:text-white data-[state=active]:shadow-md"
        >
          <Gift size={18} />
          <span className="hidden md:inline font-medium">Next Best Offer</span>
        </TabsTrigger>
        <TabsTrigger 
          value="datasources" 
          className="rounded-lg flex items-center gap-2 data-[state=active]:bg-beam-blue data-[state=active]:text-white data-[state=active]:shadow-md"
        >
          <Database size={18} />
          <span className="hidden md:inline font-medium">Data Sources</span>
        </TabsTrigger>
        <TabsTrigger 
          value="decisioning" 
          className="rounded-lg flex items-center gap-2 data-[state=active]:bg-beam-blue data-[state=active]:text-white data-[state=active]:shadow-md"
        >
          <Brain size={18} />
          <span className="hidden md:inline font-medium">AI Decisioning</span>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="agents" className="mt-0">
        <AgentsTab />
      </TabsContent>
      
      <TabsContent value="segmentation" className="mt-0">
        <SegmentationTab />
      </TabsContent>
      
      <TabsContent value="campaign" className="mt-0">
        <CampaignAnalysisTab />
      </TabsContent>
      
      <TabsContent value="propensity" className="mt-0">
        <PropensityModelsTab />
      </TabsContent>
      
      <TabsContent value="nbo" className="mt-0">
        <NextBestOfferTab />
      </TabsContent>
      
      <TabsContent value="datasources" className="mt-0">
        <DataSourcesTab />
      </TabsContent>
      
      <TabsContent value="decisioning" className="mt-0">
        <CvmAgenticDecisioning />
      </TabsContent>
    </Tabs>
  );
};
