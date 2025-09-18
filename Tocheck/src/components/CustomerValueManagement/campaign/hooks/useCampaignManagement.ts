
import { useState } from 'react';
import { CampaignType } from '../types';
import { toast } from '@/components/ui/use-toast';
import { useCvmContext } from '../../context/CvmContext';

// Mock data for initial state - in real app this would come from an API
const campaignList = [
  { 
    id: 'C1001', 
    name: 'Summer Data Booster', 
    type: 'Upsell', 
    startDate: '2023-05-01', 
    endDate: '2023-07-31', 
    target: 'Medium Value', 
    targetSize: 1200000,
    conversion: 5.8, 
    roi: 4.2, 
    status: 'Active',
    revenue: 2450000,
    cost: 580000
  },
  { 
    id: 'C1002', 
    name: 'Premium Retention Offer', 
    type: 'Retention', 
    startDate: '2023-04-15', 
    endDate: '2023-06-15', 
    target: 'High Value', 
    targetSize: 450000,
    conversion: 7.2, 
    roi: 5.1, 
    status: 'Active',
    revenue: 3200000,
    cost: 620000
  },
  { 
    id: 'C1003', 
    name: 'Family Plan Upgrade', 
    type: 'Cross-sell', 
    startDate: '2023-04-01', 
    endDate: '2023-05-31', 
    target: 'Medium Value', 
    targetSize: 850000,
    conversion: 4.5, 
    roi: 3.8, 
    status: 'Active',
    revenue: 1850000,
    cost: 480000
  },
  { 
    id: 'C1004', 
    name: 'Churn Prevention Bundle', 
    type: 'Retention', 
    startDate: '2023-05-10', 
    endDate: '2023-06-10', 
    target: 'At Risk', 
    targetSize: 320000,
    conversion: 8.4, 
    roi: 3.2, 
    status: 'Active',
    revenue: 1250000,
    cost: 385000
  },
  { 
    id: 'C1005', 
    name: 'New Device Promotional', 
    type: 'Cross-sell', 
    startDate: '2023-03-01', 
    endDate: '2023-04-30', 
    target: 'All Segments', 
    targetSize: 2200000,
    conversion: 3.2, 
    roi: 2.9, 
    status: 'Completed',
    revenue: 5400000,
    cost: 1850000
  },
];

export const useCampaignManagement = () => {
  const { selectedCampaign, setSelectedCampaign } = useCvmContext();
  const [campaignView, setCampaignView] = useState('performance');
  const [campaignDialogOpen, setCampaignDialogOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<CampaignType | undefined>(undefined);
  const [campaigns, setCampaigns] = useState<CampaignType[]>(campaignList);
  const [comparisonCampaigns, setComparisonCampaigns] = useState<string[]>([]);

  const handleCreateCampaign = () => {
    setEditingCampaign(undefined);
    setCampaignDialogOpen(true);
  };

  const handleEditCampaign = () => {
    setEditingCampaign(selectedCampaign);
    setCampaignDialogOpen(true);
  };

  const handleSaveCampaign = (campaignData: Partial<CampaignType>) => {
    if (editingCampaign) {
      // Update existing campaign
      setCampaigns(prevCampaigns => 
        prevCampaigns.map(campaign => 
          campaign.id === editingCampaign.id 
            ? { ...campaign, ...campaignData } 
            : campaign
        )
      );
      
      // Update selected campaign if it's the one being edited
      if (selectedCampaign?.id === editingCampaign.id) {
        setSelectedCampaign({ ...selectedCampaign, ...campaignData });
      }
    } else {
      // Create new campaign
      const newCampaign = campaignData as CampaignType;
      setCampaigns(prevCampaigns => [...prevCampaigns, newCampaign]);
    }
  };

  const handleStatusChange = (campaignId: string, newStatus: string) => {
    setCampaigns(prevCampaigns => 
      prevCampaigns.map(campaign => 
        campaign.id === campaignId 
          ? { ...campaign, status: newStatus } 
          : campaign
      )
    );
    
    // Update selected campaign if it's the one being changed
    if (selectedCampaign?.id === campaignId) {
      setSelectedCampaign({ ...selectedCampaign, status: newStatus });
    }
  };

  const handleRunSimulation = () => {
    toast({
      title: "Simulation Started",
      description: "Campaign performance simulation is running. Results will be available shortly.",
    });
  };

  const handleUseTemplate = (template: any) => {
    setEditingCampaign(undefined);
    setCampaignDialogOpen(true);
  };

  return {
    selectedCampaign,
    setSelectedCampaign,
    campaignView,
    setCampaignView,
    campaignDialogOpen,
    setCampaignDialogOpen,
    editingCampaign,
    setEditingCampaign,
    campaigns,
    setCampaigns,
    comparisonCampaigns,
    setComparisonCampaigns,
    handleCreateCampaign,
    handleEditCampaign,
    handleSaveCampaign,
    handleStatusChange,
    handleRunSimulation,
    handleUseTemplate
  };
};

export const getPerformanceData = () => {
  return [
    { month: 'Jan', conversion: 3.8, roi: 4.2, targetConversion: 3.5 },
    { month: 'Feb', conversion: 4.1, roi: 4.5, targetConversion: 3.5 },
    { month: 'Mar', conversion: 3.5, roi: 3.9, targetConversion: 3.5 },
    { month: 'Apr', conversion: 5.2, roi: 5.4, targetConversion: 3.5 },
    { month: 'May', conversion: 4.8, roi: 5.1, targetConversion: 3.5 },
    { month: 'Jun', conversion: 5.5, roi: 5.8, targetConversion: 3.5 },
  ];
};

export const getTargetBreakdown = () => {
  return [
    { name: 'High Value', value: 25 },
    { name: 'Medium Value', value: 35 },
    { name: 'Low Value', value: 20 },
    { name: 'New Customers', value: 10 },
    { name: 'At Risk', value: 10 },
  ];
};

export const getChartColors = () => {
  return ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
};
