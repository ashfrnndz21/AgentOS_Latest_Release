
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CampaignType } from './types';
import { BarChart, ResponsiveContainer, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CampaignComparisonProps {
  campaigns: CampaignType[];
  selectedCampaigns: string[];
  onSelectCampaigns: (ids: string[]) => void;
}

export const CampaignComparison = ({ campaigns, selectedCampaigns, onSelectCampaigns }: CampaignComparisonProps) => {
  const comparisonData = campaigns
    .filter(campaign => selectedCampaigns.includes(campaign.id))
    .map(campaign => ({
      name: campaign.name,
      conversion: campaign.conversion,
      roi: campaign.roi,
      cost: campaign.cost / 1000000, // Convert to millions for display
      revenue: campaign.revenue / 1000000, // Convert to millions for display
    }));

  const handleSelectCampaign = (id: string) => {
    if (selectedCampaigns.includes(id)) {
      onSelectCampaigns(selectedCampaigns.filter(c => c !== id));
    } else {
      if (selectedCampaigns.length < 3) {
        onSelectCampaigns([...selectedCampaigns, id]);
      }
    }
  };

  return (
    <Card className="border-gray-800/30 bg-beam-dark-accent/50 backdrop-blur-md shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-white flex justify-between items-center">
          <span>Campaign Comparison</span>
          <div className="flex gap-2 items-center">
            <span className="text-sm text-gray-400">Add campaign:</span>
            <Select 
              onValueChange={handleSelectCampaign}
              value=""
            >
              <SelectTrigger className="w-[180px] bg-beam-dark/70 border-gray-700 h-8">
                <SelectValue placeholder="Select campaign" />
              </SelectTrigger>
              <SelectContent className="bg-beam-dark border-gray-700">
                {campaigns.map(campaign => (
                  <SelectItem 
                    key={campaign.id} 
                    value={campaign.id}
                    disabled={selectedCampaigns.includes(campaign.id)}
                  >
                    {campaign.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {selectedCampaigns.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            Select campaigns to compare their performance
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-3">
              {selectedCampaigns.map(id => {
                const campaign = campaigns.find(c => c.id === id);
                if (!campaign) return null;
                return (
                  <div
                    key={id}
                    className="px-3 py-1 bg-gray-800/50 rounded-md text-sm flex items-center gap-2"
                  >
                    <span>{campaign.name}</span>
                    <button
                      className="text-gray-400 hover:text-white"
                      onClick={() => handleSelectCampaign(id)}
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>
            
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={comparisonData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="name" tick={{ fill: '#aaa' }} />
                  <YAxis tick={{ fill: '#aaa' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#222', border: '1px solid #444' }}
                    itemStyle={{ color: '#fff' }}
                    formatter={(value: number, name: string) => {
                      if (name === 'revenue' || name === 'cost') {
                        return [`$${value.toFixed(2)}M`, name];
                      }
                      if (name === 'conversion') {
                        return [`${value}%`, name];
                      }
                      if (name === 'roi') {
                        return [`${value}x`, name];
                      }
                      return [value, name];
                    }}
                  />
                  <Legend wrapperStyle={{ color: '#fff' }} />
                  <Bar dataKey="conversion" name="Conversion %" fill="#3b82f6" />
                  <Bar dataKey="roi" name="ROI" fill="#10b981" />
                  <Bar dataKey="revenue" name="Revenue ($M)" fill="#8b5cf6" />
                  <Bar dataKey="cost" name="Cost ($M)" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
