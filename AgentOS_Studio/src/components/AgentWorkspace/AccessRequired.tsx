
import React from 'react';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';

export interface AccessRequiredProps {
  projectName: string | null;
  onRequestAccess?: () => void;
}

export const AccessRequired: React.FC<AccessRequiredProps> = ({ 
  projectName,
  onRequestAccess 
}) => {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-gradient-to-b from-beam-dark to-beam-dark-accent p-4">
      <div className="bg-beam-dark-accent/30 rounded-full p-4 mb-6">
        <Lock className="h-12 w-12 text-yellow-500" />
      </div>
      
      <h2 className="text-xl font-semibold text-white mb-2">
        Access Required
      </h2>
      
      <p className="text-gray-400 text-center max-w-md mb-8">
        You need access to the {projectName || 'Project'} workspace to interact with this agent.
        Request access from your administrator or project owner.
      </p>
      
      {onRequestAccess && (
        <Button onClick={onRequestAccess} variant="default">
          Request Access
        </Button>
      )}
    </div>
  );
};
