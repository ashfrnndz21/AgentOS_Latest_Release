
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from '@/components/ui/use-toast';
import { FileText, FileDown } from 'lucide-react';
import { CampaignType } from './types';

interface CampaignExportProps {
  campaigns: CampaignType[];
  selectedCampaign?: CampaignType;
}

export const CampaignExport = ({ campaigns, selectedCampaign }: CampaignExportProps) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = (format: 'pdf' | 'csv' | 'excel', all: boolean = false) => {
    setIsExporting(true);
    
    // Simulate export process
    setTimeout(() => {
      setIsExporting(false);
      
      const exportType = all ? 'All campaigns' : 'Campaign details';
      const formatName = format.toUpperCase();
      
      toast({
        title: `${formatName} Export Successful`,
        description: `${exportType} have been exported as ${formatName} file.`,
      });
    }, 1000);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={isExporting}
          className="border-gray-700 text-gray-300 hover:bg-gray-800"
        >
          {isExporting ? (
            <>Exporting...</>
          ) : (
            <>
              <FileText size={16} className="mr-1" />
              Export
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-beam-dark text-white border-gray-700">
        {selectedCampaign && (
          <>
            <DropdownMenuItem 
              className="hover:bg-gray-800 cursor-pointer"
              onClick={() => handleExport('pdf')}
            >
              <FileDown size={16} className="mr-2 text-blue-400" />
              Export "{selectedCampaign.name}" as PDF
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="hover:bg-gray-800 cursor-pointer"
              onClick={() => handleExport('csv')}
            >
              <FileDown size={16} className="mr-2 text-green-400" />
              Export "{selectedCampaign.name}" as CSV
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuItem 
          className="hover:bg-gray-800 cursor-pointer"
          onClick={() => handleExport('excel', true)}
        >
          <FileDown size={16} className="mr-2 text-green-400" />
          Export all campaigns as Excel
        </DropdownMenuItem>
        <DropdownMenuItem 
          className="hover:bg-gray-800 cursor-pointer"
          onClick={() => handleExport('csv', true)}
        >
          <FileDown size={16} className="mr-2 text-blue-400" />
          Export all campaigns as CSV
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
