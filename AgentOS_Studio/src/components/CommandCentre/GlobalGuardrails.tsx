
import React, { useState, useCallback } from 'react';
import { Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ActionDialog } from './CreateAgent/ActionDialog';
import { GuardrailItem } from './GuardrailItem';
import { Guardrail, globalGuardrails } from './GuardrailData';
import { toast } from "sonner";

interface GlobalGuardrailsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const GlobalGuardrails: React.FC<GlobalGuardrailsProps> = ({ open, onOpenChange }) => {
  // State for managing guardrail settings
  const [guardrailSettings, setGuardrailSettings] = useState<Guardrail[]>(globalGuardrails);
  
  // Toggle handler for guardrail switches
  const toggleGuardrail = useCallback((id: string) => {
    setGuardrailSettings(prev => 
      prev.map(guard => 
        guard.id === id ? { ...guard, enabled: !guard.enabled } : guard
      )
    );
    
    // Show toast notification for user feedback
    const guardrail = guardrailSettings.find(g => g.id === id);
    if (guardrail) {
      const newState = !guardrail.enabled;
      toast(`${guardrail.name} has been ${newState ? 'enabled' : 'disabled'}.`);
    }
  }, [guardrailSettings]);
  
  return (
    <ActionDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Global Guardrails"
      description="Configure organization-wide AI guardrails"
      icon={<Shield className="text-purple-400" />}
    >
      <div className="space-y-4">
        <Card className="bg-beam-dark-accent/30 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-lg">Organization Guardrails</CardTitle>
            <CardDescription className="text-gray-400">
              These guardrails apply to all AI agents across your organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[350px] pr-4">
              <div className="space-y-4">
                {guardrailSettings.map((guardrail) => (
                  <GuardrailItem 
                    key={guardrail.id}
                    guardrail={guardrail} 
                    onToggle={toggleGuardrail}
                  />
                ))}
              </div>
            </ScrollArea>
          </CardContent>
          <CardFooter className="border-t border-gray-700 pt-4 flex justify-between">
            <div className="text-sm text-gray-400">
              {guardrailSettings.filter(g => g.enabled).length} of {guardrailSettings.length} guardrails active
            </div>
            <Button 
              className="bg-beam-blue hover:bg-blue-600"
              onClick={() => {
                toast("Organization-wide guardrail settings have been saved.");
                onOpenChange(false);
              }}
            >
              Save Changes
            </Button>
          </CardFooter>
        </Card>
      </div>
    </ActionDialog>
  );
};
