
import React, { useState, useCallback } from 'react';
import { Map, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ActionDialog } from './CreateAgent/ActionDialog';
import { GuardrailItem } from './GuardrailItem';
import { Guardrail, localGuardrails } from './GuardrailData';
import { toast } from "sonner";

interface LocalGuardrailsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const LocalGuardrails: React.FC<LocalGuardrailsProps> = ({ open, onOpenChange }) => {
  // State for managing guardrail settings
  const [guardrailSettings, setGuardrailSettings] = useState<Guardrail[]>(localGuardrails);
  
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
      toast(`${guardrail.name} has been ${newState ? 'enabled' : 'disabled'} for this project.`);
    }
  }, [guardrailSettings]);
  
  return (
    <ActionDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Local Guardrails"
      description="Configure project-specific AI guardrails"
      icon={<Map className="text-indigo-400" />}
    >
      <div className="space-y-4">
        <Card className="bg-beam-dark-accent/30 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-lg">Network CapEx Project Guardrails</CardTitle>
            <CardDescription className="text-gray-400">
              These guardrails only apply to the current project
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between py-2 px-3 mb-4 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
              <div className="flex items-center gap-2">
                <Shield size={18} className="text-indigo-400" />
                <span className="text-white font-medium">Global Guardrails</span>
              </div>
              <Switch checked={true} disabled />
            </div>
          
            <Separator className="my-4 bg-gray-700/50" />
            
            <ScrollArea className="h-[300px] pr-4">
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
              {guardrailSettings.filter(g => g.enabled).length} of {guardrailSettings.length} project guardrails active
            </div>
            <Button 
              className="bg-beam-blue hover:bg-blue-600"
              onClick={() => {
                toast("Project-specific guardrail settings have been saved.");
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
