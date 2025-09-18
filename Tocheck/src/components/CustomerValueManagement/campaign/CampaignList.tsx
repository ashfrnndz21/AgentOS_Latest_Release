
import React, { useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CalendarDays, ArrowRight, Filter, TrendingUp } from 'lucide-react';
import { CampaignType } from './types';
import { useCvmContext } from '../context/CvmContext';

interface CampaignListProps {
  campaignList: CampaignType[];
  onSelectCampaign?: (campaign: CampaignType) => void;
}

export const CampaignList = ({ campaignList, onSelectCampaign }: CampaignListProps) => {
  const { selectedCampaign, setSelectedCampaign } = useCvmContext();
  
  // Use the first campaign as default if no campaign is selected
  useEffect(() => {
    if (!selectedCampaign && campaignList.length > 0) {
      setSelectedCampaign(campaignList[0]);
    }
  }, [campaignList, selectedCampaign, setSelectedCampaign]);

  const handleSelectCampaign = (campaign: CampaignType) => {
    setSelectedCampaign(campaign);
    if (onSelectCampaign) {
      onSelectCampaign(campaign);
    }
  };

  return (
    <div className="bg-beam-dark/70 p-4 rounded-lg border border-gray-700/30 mb-6">
      <h3 className="text-white font-medium mb-4">Active Campaigns</h3>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-700">
              <TableHead className="text-white">ID</TableHead>
              <TableHead className="text-white">Campaign</TableHead>
              <TableHead className="text-white">Type</TableHead>
              <TableHead className="text-white">Target</TableHead>
              <TableHead className="text-white">Timeline</TableHead>
              <TableHead className="text-white">Conversion</TableHead>
              <TableHead className="text-white">ROI</TableHead>
              <TableHead className="text-white">Status</TableHead>
              <TableHead className="text-white">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {campaignList.map((campaign) => (
              <TableRow 
                key={campaign.id} 
                className={`border-gray-700 hover:bg-gray-800/30 cursor-pointer ${
                  selectedCampaign?.id === campaign.id ? 'bg-gray-800/50' : ''
                }`}
                onClick={() => handleSelectCampaign(campaign)}
              >
                <TableCell className="text-white">{campaign.id}</TableCell>
                <TableCell className="text-white font-medium">{campaign.name}</TableCell>
                <TableCell>
                  <Badge className={`
                    ${campaign.type === 'Upsell' ? 'bg-blue-900/30 text-blue-400 border-blue-600' : 
                      campaign.type === 'Retention' ? 'bg-purple-900/30 text-purple-400 border-purple-600' :
                      'bg-green-900/30 text-green-400 border-green-600'}
                  `}>
                    {campaign.type}
                  </Badge>
                </TableCell>
                <TableCell className="text-white">{campaign.target}</TableCell>
                <TableCell className="text-gray-300">
                  <div className="flex items-center gap-1">
                    <CalendarDays size={14} className="text-gray-400" />
                    <span>{campaign.startDate.split('-')[1]}/{campaign.startDate.split('-')[2]}</span>
                    <ArrowRight size={12} />
                    <span>{campaign.endDate.split('-')[1]}/{campaign.endDate.split('-')[2]}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="text-white">{campaign.conversion}%</span>
                    <Progress value={campaign.conversion * 10} className="h-1.5 w-12" />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <span className="text-white">{campaign.roi}x</span>
                    {campaign.roi > 4 ? 
                      <TrendingUp size={14} className="text-green-400" /> : 
                      <span className="text-amber-400">→</span>
                    }
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={campaign.status === 'Active' ? 
                    'bg-green-900/30 text-green-400 border-green-600' : 
                    'bg-gray-700/30 text-gray-300 border-gray-600'
                  }>
                    {campaign.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" className="h-8 px-2">
                    <Filter size={14} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
