
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { CampaignType, PerformanceDataType } from './types';
import { PerformanceTab } from './tabs/PerformanceTab';
import { TargetTab } from './tabs/TargetTab';
import { FinancialsTab } from './tabs/FinancialsTab';

interface CampaignDetailsProps {
  selectedCampaign: CampaignType;
  campaignView: string;
  setCampaignView: (view: string) => void;
  performanceData: PerformanceDataType[];
  targetBreakdown: { name: string; value: number }[];
  colors: string[];
}

export const CampaignDetails = ({ 
  selectedCampaign, 
  campaignView, 
  setCampaignView,
  performanceData,
  targetBreakdown,
  colors
}: CampaignDetailsProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-medium text-white">{selectedCampaign.name}</h2>
          <p className="text-gray-400">Campaign ID: {selectedCampaign.id}</p>
        </div>
        <div className="flex gap-2">
          <Tabs value={campaignView} onValueChange={setCampaignView} className="w-auto">
            <TabsList className="bg-beam-dark/70 border border-gray-700/50">
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="target">Target Segments</TabsTrigger>
              <TabsTrigger value="financials">Financials</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button variant="outline" size="sm">
            <Download size={14} className="mr-1" />
            Export
          </Button>
        </div>
      </div>
      
      <TabsContent value="performance" className="m-0">
        <PerformanceTab 
          selectedCampaign={selectedCampaign}
          performanceData={performanceData}
        />
      </TabsContent>
      
      <TabsContent value="target" className="m-0">
        <TargetTab 
          targetBreakdown={targetBreakdown}
          colors={colors}
        />
      </TabsContent>
      
      <TabsContent value="financials" className="m-0">
        <FinancialsTab 
          selectedCampaign={selectedCampaign}
        />
      </TabsContent>
    </div>
  );
};
