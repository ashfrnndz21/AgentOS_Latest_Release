import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Network, 
  Sparkles, 
  CheckCircle, 
  AlertCircle,
  Loader2
} from 'lucide-react';
import { StrandsSdkAgent } from '@/lib/services/StrandsSdkService';
import { a2aService } from '@/lib/services/A2AService';

interface A2AAgentRegistrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agent: StrandsSdkAgent | null;
  onRegistered: () => void;
}

export const A2AAgentRegistrationDialog: React.FC<A2AAgentRegistrationDialogProps> = ({
  open,
  onOpenChange,
  agent,
  onRegistered
}) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleRegister = async () => {
    if (!agent) return;

    setIsRegistering(true);
    setRegistrationStatus('idle');
    setErrorMessage('');

    try {
      // Register the agent for A2A communication
      await a2aService.registerAgent({
        id: agent.id!,
        name: agent.name,
        description: agent.description || '',
        model: (agent as any).model_id || 'llama3.2:latest',
        capabilities: agent.tools || []
      });

      setRegistrationStatus('success');
      
      // Notify parent component
      onRegistered();
      
      // Close dialog after a short delay
      setTimeout(() => {
        onOpenChange(false);
        setRegistrationStatus('idle');
      }, 2000);

    } catch (error) {
      console.error('Failed to register agent for A2A:', error);
      setRegistrationStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setIsRegistering(false);
    }
  };

  if (!agent) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Network className="h-5 w-5 text-purple-400" />
            Register Agent for A2A
          </DialogTitle>
          <DialogDescription>
            Enable agent-to-agent communication for {agent.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Agent Info */}
          <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-purple-400" />
              <span className="font-medium text-white">{agent.name}</span>
              <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                Strands SDK
              </Badge>
            </div>
            <p className="text-sm text-gray-400 mb-2">{agent.description}</p>
            <div className="text-xs text-gray-500">
              <div>Model: {(agent as any).model_id}</div>
              <div>Tools: {agent.tools?.length || 0} configured</div>
            </div>
          </div>

          {/* Registration Status */}
          {registrationStatus === 'success' && (
            <Alert className="border-green-500 bg-green-500/10">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <AlertDescription className="text-green-300">
                Agent successfully registered for A2A communication!
              </AlertDescription>
            </Alert>
          )}

          {registrationStatus === 'error' && (
            <Alert className="border-red-500 bg-red-500/10">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-300">
                {errorMessage}
              </AlertDescription>
            </Alert>
          )}

          {/* A2A Benefits */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-300">A2A Capabilities:</h4>
            <ul className="text-xs text-gray-400 space-y-1">
              <li>• Communicate with other registered agents</li>
              <li>• Share information and collaborate on tasks</li>
              <li>• Participate in multi-agent workflows</li>
              <li>• Real-time message routing and status updates</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleRegister}
              disabled={isRegistering}
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              {isRegistering ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Registering...
                </>
              ) : (
                <>
                  <Network className="h-4 w-4 mr-2" />
                  Register for A2A
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isRegistering}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};





