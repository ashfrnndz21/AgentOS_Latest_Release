
import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, Play, Plus, BarChart2 } from 'lucide-react';
import { CardTitle, CardDescription } from '@/components/ui/card';

interface CampaignHeaderProps {
  activeSection: string;
  onCreateCampaign: () => void;
  onRunSimulation: () => void;
  onCalendarClick: () => void;
  onComparisonClick: () => void;
}

export const CampaignHeader: React.FC<CampaignHeaderProps> = ({
  activeSection,
  onCreateCampaign,
  onRunSimulation,
  onCalendarClick,
  onComparisonClick
}) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <CardTitle className="text-xl text-white">Campaign Analysis & Planning</CardTitle>
        <CardDescription className="text-gray-300">
          Track performance, run simulations, and optimize campaigns
        </CardDescription>
      </div>
      <div className="flex gap-2">
        <Button className="bg-beam-blue hover:bg-blue-600" onClick={onCreateCampaign}>
          <Plus size={16} className="mr-1" />
          Create Campaign
        </Button>
        <Button variant="outline" size="sm" onClick={onRunSimulation}>
          <Play size={16} className="mr-1" />
          Run Simulation
        </Button>
        
        {/* View selector buttons */}
        <Button
          variant={activeSection === 'calendar' ? 'default' : 'outline'}
          size="sm"
          className={activeSection === 'calendar' ? 'bg-beam-blue' : 'border-gray-700'}
          onClick={onCalendarClick}
        >
          <Calendar size={16} className="mr-1" />
          Calendar
        </Button>
        
        <Button
          variant={activeSection === 'comparison' ? 'default' : 'outline'}
          size="sm"
          className={activeSection === 'comparison' ? 'bg-beam-blue' : 'border-gray-700'}
          onClick={onComparisonClick}
        >
          <BarChart2 size={16} className="mr-1" />
          Compare
        </Button>
      </div>
    </div>
  );
};
