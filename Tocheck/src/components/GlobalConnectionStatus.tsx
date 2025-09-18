/**
 * Global Connection Status
 * Shows in header/footer of app for always-visible status
 */

import React, { useState } from 'react';
import { ConnectionStatus } from './ConnectionStatus';
import { ConnectionManager } from './ConnectionManager';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Settings } from 'lucide-react';

export const GlobalConnectionStatus: React.FC = () => {
  const [showManager, setShowManager] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <ConnectionStatus showDetails={true} showControls={false} />
      
      <Dialog open={showManager} onOpenChange={setShowManager}>
        <DialogTrigger asChild>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 text-gray-400 hover:text-white"
          >
            <Settings className="h-3 w-3" />
          </Button>
        </DialogTrigger>
        
        <DialogContent className="max-w-3xl bg-gray-900 border-gray-700">
          <ConnectionManager />
        </DialogContent>
      </Dialog>
    </div>
  );
};