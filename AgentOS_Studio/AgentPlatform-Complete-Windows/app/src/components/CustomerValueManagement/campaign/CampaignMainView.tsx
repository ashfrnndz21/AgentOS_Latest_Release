
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CampaignFilters } from './CampaignFilters';
import { CampaignList } from './CampaignList';
import { CampaignDetails } from './CampaignDetails';
import { CampaignExport } from './CampaignExport';
import { CampaignStatus } from './CampaignStatus';
import { CampaignType } from './types';
import { useCvmContext } from '../context/CvmContext';
import { getPerformanceData, getTargetBreakdown, getChartColors } from './hooks/useCampaignManagement';

interface CampaignMainViewProps {
  campaigns: CampaignType[];
  onSelectCampaign: (campaign: CampaignType) => void;
  campaignView: string;
  setCampaignView: (view: string) => void;
  handleEditCampaign: () => void;
  handleStatusChange: (campaignId: string, status: string) => void;
  onTemplatesClick: () => void;
  onNotificationsClick: () => void;
  onAbTestingClick: () => void;
}

export const CampaignMainView: React.FC<CampaignMainViewProps> = ({
  campaigns,
  onSelectCampaign,
  campaignView,
  setCampaignView,
  handleEditCampaign,
  handleStatusChange,
  onTemplatesClick,
  onNotificationsClick,
  onAbTestingClick
}) => {
  const { selectedCampaign, setSelectedCampaign } = useCvmContext();
  const performanceData = getPerformanceData();
  const targetBreakdown = getTargetBreakdown();
  const colors = getChartColors();

  // Set first campaign as selected when component mounts and no campaign is selected
  useEffect(() => {
    if (!selectedCampaign && campaigns.length > 0) {
      setSelectedCampaign(campaigns[0]);
    }
  }, [campaigns, selectedCampaign, setSelectedCampaign]);

  return (
    <>
      {/* Campaign Filter Controls */}
      <CampaignFilters />
      
      {/* Campaign List Table */}
      <div className="flex justify-between items-center mb-3">
        <Button
          variant="outline"
          size="sm"
          className="border-gray-700 text-gray-300 hover:bg-gray-800"
        >
          <Filter size={16} className="mr-1" />
          Filter
        </Button>
        
        <div className="flex gap-2">
          <CampaignExport 
            campaigns={campaigns}
            selectedCampaign={selectedCampaign}
          />
          
          <Button
            variant="outline"
            size="sm"
            className="border-gray-700 text-gray-300 hover:bg-gray-800"
            onClick={onTemplatesClick}
          >
            <Filter size={16} className="mr-1" />
            Templates
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="border-gray-700 text-gray-300 hover:bg-gray-800"
            onClick={onNotificationsClick}
          >
            <Filter size={16} className="mr-1" />
            Notifications
          </Button>
        </div>
      </div>
      
      <CampaignList 
        campaignList={campaigns}
        onSelectCampaign={onSelectCampaign}
      />
      
      {/* Selected Campaign Details */}
      {selectedCampaign && (
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
                  <TabsTrigger value="ab-testing" onClick={onAbTestingClick}>A/B Testing</TabsTrigger>
                </TabsList>
              </Tabs>
              
              <Button variant="outline" size="sm" onClick={handleEditCampaign}>
                <Filter size={14} className="mr-1" />
                Edit
              </Button>
              
              <CampaignStatus 
                campaign={selectedCampaign}
                onStatusChange={handleStatusChange}
              />
            </div>
          </div>
          
          <CampaignDetails 
            selectedCampaign={selectedCampaign}
            campaignView={campaignView}
            setCampaignView={setCampaignView}
            performanceData={performanceData}
            targetBreakdown={targetBreakdown}
            colors={colors}
          />
        </div>
      )}
    </>
  );
};
