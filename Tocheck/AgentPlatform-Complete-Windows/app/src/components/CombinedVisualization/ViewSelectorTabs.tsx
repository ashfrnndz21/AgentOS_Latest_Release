
import React from 'react';
import { Network, GitMerge, ArrowUpDown } from 'lucide-react';
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip';

interface ViewSelectorTabsProps {
  visualizationType: 'decision' | 'lineage' | 'combined';
  setVisualizationType: (value: 'decision' | 'lineage' | 'combined') => void;
}

export const ViewSelectorTabs: React.FC<ViewSelectorTabsProps> = ({
  visualizationType,
  setVisualizationType,
}) => {
  return (
    <div className="absolute top-2 right-2 z-20">
      <Tabs
        value={visualizationType}
        onValueChange={(value) => setVisualizationType(value as 'decision' | 'lineage' | 'combined')}
        className="bg-gray-900/70 rounded-lg border border-gray-700/40 p-1"
      >
        <TabsList className="bg-transparent border-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <TabsTrigger value="decision" className="data-[state=active]:bg-blue-600">
                <Network size={16} />
              </TabsTrigger>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p className="text-xs">Decision Path</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <TabsTrigger value="lineage" className="data-[state=active]:bg-blue-600">
                <GitMerge size={16} />
              </TabsTrigger>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p className="text-xs">Data Lineage</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <TabsTrigger value="combined" className="data-[state=active]:bg-blue-600">
                <ArrowUpDown size={16} />
              </TabsTrigger>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p className="text-xs">Combined View</p>
            </TooltipContent>
          </Tooltip>
        </TabsList>
      </Tabs>
    </div>
  );
};
