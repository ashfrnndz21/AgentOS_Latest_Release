import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Info } from 'lucide-react';
import { SimpleAgentNameField } from './SimpleAgentNameField';
import { SimpleModelSelector } from './SimpleModelSelector';
import { SimpleRoleSelector } from './SimpleRoleSelector';
import { SimpleMemorySelector } from './SimpleMemorySelector';
import { SimpleToolsGuardrails } from './SimpleToolsGuardrails';
import { SimpleMCPToolsSelection } from './SimpleMCPToolsSelection';
import { AIModels } from './models';
import { roles, tools } from './toolsRolesData';

interface DebugWorkingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DebugWorkingDialog: React.FC<DebugWorkingDialogProps> = ({
  open,
  onOpenChange
}) => {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [agentName, setAgentName] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('openai');
  const [selectedModel, setSelectedModel] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [description, setDescription] = useState('');
  const [memory, setMemory] = useState({
    shortTerm: true,
    longTerm: false,
    summary: false,
    entity: false,
  });
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [guardrails, setGuardrails] = useState({
    global: true,
    local: false,
  });
  const [databaseAccess, setDatabaseAccess] = useState(false);
  const [selectedMCPTools, setSelectedMCPTools] = useState<{ toolId: string; serverId: string; }[]>([]);

  const nextStep = () => {
    setStep(prev => Math.min(prev + 1, 6));
  };

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleMemoryToggle = (memoryId: string, checked: boolean) => {
    setMemory(prev => ({ ...prev, [memoryId]: checked }));
  };

  const handleToolToggle = (toolId: string, checked: boolean) => {
    setSelectedTools(prev => 
      checked 
        ? [...prev, toolId]
        : prev.filter(id => id !== toolId)
    );
  };

  const handleGuardrailToggle = (type: 'global' | 'local', checked: boolean) => {
    setGuardrails(prev => ({ ...prev, [type]: checked }));
  };

  const handleMCPToolToggle = (toolId: string, serverId: string, checked: boolean) => {
    setSelectedMCPTools(prev => 
      checked 
        ? [...prev, { toolId, serverId }]
        : prev.filter(tool => !(tool.toolId === toolId && tool.serverId === serverId))
    );
  };

  const handleSubmit = () => {
    toast({
      title: "Agent Created Successfully",
      description: "Debug agent created!"
    });
    onOpenChange(false);
    setStep(1);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-beam-dark-accent border-gray-700 text-white sm:max-w-md z-50">
        <DialogHeader>
          <DialogTitle className="text-white">Create New Agent (Debug)</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {step === 1 ? (
            <div className="space-y-6">
              <SimpleAgentNameField 
                value={agentName}
                onChange={setAgentName}
              />
              <SimpleModelSelector 
                selectedModel={selectedModel}
                setSelectedModel={setSelectedModel}
                selectedProvider={selectedProvider}
                handleProviderChange={setSelectedProvider}
                handleModelChange={(model) => setSelectedModel(AIModels[selectedProvider]?.find(m => m.id === model) || null)}
                AIModels={AIModels}
              />
            </div>
          ) : step === 2 ? (
            <SimpleRoleSelector 
              roles={roles}
              handleRoleSelect={setSelectedRole}
              selectedRole={selectedRole}
              description={description}
              onDescriptionChange={setDescription}
            />
          ) : step === 3 ? (
            <SimpleMemorySelector 
              handleMemoryToggle={handleMemoryToggle}
              memory={memory}
            />
          ) : step === 4 ? (
            <SimpleToolsGuardrails 
              tools={tools}
              handleToolToggle={handleToolToggle}
              selectedTools={selectedTools}
              guardrails={guardrails}
              onGuardrailToggle={handleGuardrailToggle}
              databaseAccess={databaseAccess}
              onDatabaseAccessToggle={setDatabaseAccess}
            />
          ) : step === 5 ? (
            <SimpleMCPToolsSelection 
              selectedMCPTools={selectedMCPTools}
              onMCPToolToggle={handleMCPToolToggle}
            />
          ) : step === 6 ? (
            <div className="text-center space-y-4">
              <h2 className="text-xl text-white">Review & Confirm</h2>
              <div className="text-left space-y-2 bg-beam-dark p-4 rounded-lg">
                <p className="text-gray-300"><span className="text-white">Name:</span> {agentName || 'Not set'}</p>
                <p className="text-gray-300"><span className="text-white">Role:</span> {selectedRole || 'Not selected'}</p>
                <p className="text-gray-300"><span className="text-white">Model:</span> {selectedModel?.name || 'Default'}</p>
                <p className="text-gray-300"><span className="text-white">Tools:</span> {selectedTools.length} selected</p>
                <p className="text-gray-300"><span className="text-white">MCP Tools:</span> {selectedMCPTools.length} selected</p>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <h2 className="text-xl text-white">Step {step} of 6</h2>
              <p className="text-gray-300">Debug step content for step {step}</p>
            </div>
          )}
          
          <DialogFooter className="gap-2 flex-row sm:justify-between">
            <div className="flex gap-2">
              {step > 1 && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={prevStep}
                  className="border-gray-700 text-white hover:bg-gray-700"
                >
                  Back
                </Button>
              )}
              
              {step < 6 ? (
                <Button 
                  type="button" 
                  onClick={nextStep}
                  className="bg-beam-blue hover:bg-beam-blue/80 text-white"
                >
                  Next
                </Button>
              ) : (
                <Button 
                  type="button" 
                  onClick={handleSubmit}
                  className="bg-green-500 hover:bg-green-600 text-white"
                >
                  Create Agent
                </Button>
              )}
            </div>
            
            <div className="text-xs text-gray-400 flex items-center gap-1">
              <Info size={12} />
              Step {step} of 6
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};