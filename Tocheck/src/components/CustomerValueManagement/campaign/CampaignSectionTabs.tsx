
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface CampaignSectionTabsProps {
  activeSection: string;
  onChange: (value: any) => void;
}

export const CampaignSectionTabs: React.FC<CampaignSectionTabsProps> = ({
  activeSection,
  onChange
}) => {
  return (
    <div className="mt-4 lg:hidden">
      <Tabs value={activeSection} onValueChange={onChange} className="w-full">
        <TabsList className="grid grid-cols-3 w-full bg-beam-dark/70 border border-gray-700/50">
          <TabsTrigger value="main">Campaigns</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="comparison">Compare</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};
