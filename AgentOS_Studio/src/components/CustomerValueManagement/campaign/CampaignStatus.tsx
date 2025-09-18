
import React from 'react';
import { Button } from '@/components/ui/button';
import { CampaignType } from './types';
import { toast } from '@/components/ui/use-toast';
import { PauseCircle, PlayCircle, Archive, AlertCircle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface CampaignStatusProps {
  campaign: CampaignType;
  onStatusChange: (campaignId: string, newStatus: string) => void;
}

export const CampaignStatus = ({ campaign, onStatusChange }: CampaignStatusProps) => {
  const handlePause = () => {
    onStatusChange(campaign.id, 'Paused');
    toast({
      title: "Campaign Paused",
      description: `${campaign.name} has been paused. You can resume it at any time.`,
    });
  };

  const handleResume = () => {
    onStatusChange(campaign.id, 'Active');
    toast({
      title: "Campaign Resumed",
      description: `${campaign.name} is now active and running.`,
    });
  };

  const handleArchive = () => {
    onStatusChange(campaign.id, 'Archived');
    toast({
      title: "Campaign Archived",
      description: `${campaign.name} has been archived.`,
    });
  };

  return (
    <div className="flex items-center gap-2">
      {campaign.status === 'Active' && (
        <Button 
          variant="outline" 
          size="sm" 
          className="border-amber-600/50 text-amber-400 hover:bg-amber-950/30"
          onClick={handlePause}
        >
          <PauseCircle size={16} className="mr-1" />
          Pause
        </Button>
      )}

      {campaign.status === 'Paused' && (
        <Button 
          variant="outline" 
          size="sm"
          className="border-green-600/50 text-green-400 hover:bg-green-950/30"
          onClick={handleResume}
        >
          <PlayCircle size={16} className="mr-1" />
          Resume
        </Button>
      )}

      {(campaign.status === 'Active' || campaign.status === 'Paused') && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="outline" 
              size="sm"
              className="border-gray-600/50 text-gray-400 hover:bg-gray-800/30"
            >
              <Archive size={16} className="mr-1" />
              Archive
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-beam-dark text-white border-gray-700">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white flex items-center gap-2">
                <AlertCircle size={20} className="text-amber-400" />
                Archive Campaign
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-400">
                Are you sure you want to archive "{campaign.name}"? This will stop the campaign and move it to the archive.
                You can access archived campaigns from the filter menu.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-gray-800 text-white hover:bg-gray-700 border-gray-600">Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleArchive} className="bg-red-900 hover:bg-red-800 text-white">
                Archive Campaign
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};
