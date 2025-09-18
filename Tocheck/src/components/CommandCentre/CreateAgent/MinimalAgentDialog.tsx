import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Cpu, ChevronDown } from 'lucide-react';
import { AIModels } from './models';

interface MinimalAgentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const MinimalAgentDialog: React.FC<MinimalAgentDialogProps> = ({
  open,
  onOpenChange
}) => {
  const [step, setStep] = useState(1);
  const [agentName, setAgentName] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('openai');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [memory, setMemory] = useState({
    shortTerm: true,
    longTerm: false,
    summary: false,
    entity: false,
  });
  const [tools, setTools] = useState<string[]>([]);
  const [mcpTools, setMcpTools] = useState<string[]>([]);
  const { toast } = useToast();

  const nextStep = () => {
    setStep(prev => Math.min(prev + 1, 6));
  };

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = () => {
    toast({
      title: "Agent Created Successfully",
      description: `${agentName || 'New Agent'} has been created!`
    });
    onOpenChange(false);
    // Reset all state
    setStep(1);
    setAgentName('');
    setSelectedProvider('openai');
    setSelectedModel('');
    setSelectedRole('');
    setMemory({
      shortTerm: true,
      longTerm: false,
      summary: false,
      entity: false,
    });
    setTools([]);
    setMcpTools([]);
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="agentName" className="text-white">Agent Name</Label>
              <Input
                id="agentName"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                placeholder="Enter agent name"
                className="bg-beam-dark border-gray-700 text-white"
              />
            </div>
            <div>
              <Label className="text-white">AI Provider</Label>
              <div className="flex gap-2 mt-2">
                {['openai', 'anthropic', 'meta'].map((provider) => (
                  <Button
                    key={provider}
                    type="button"
                    variant={selectedProvider === provider ? "default" : "outline"}
                    onClick={() => setSelectedProvider(provider)}
                    className={selectedProvider === provider ? 
                      "bg-beam-blue text-white" : 
                      "border-gray-700 text-white hover:bg-gray-700"
                    }
                  >
                    {provider.charAt(0).toUpperCase() + provider.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-white">AI Model (Optional)</Label>
              <div className="mt-2">
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full bg-beam-dark border border-gray-700 text-white rounded-md px-3 py-2"
                >
                  <option value="">Select a model</option>
                  {AIModels[selectedProvider]?.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-white text-lg">Role Selection</h3>
            <div className="grid grid-cols-2 gap-2">
              {['Customer Service', 'Sales Assistant', 'Technical Support', 'Data Analyst', 'Content Creator', 'Custom'].map((role) => (
                <Button
                  key={role}
                  type="button"
                  variant={selectedRole === role ? "default" : "outline"}
                  onClick={() => setSelectedRole(role)}
                  className={selectedRole === role ? 
                    "bg-beam-blue text-white" : 
                    "border-gray-700 text-white hover:bg-gray-700"
                  }
                >
                  {role}
                </Button>
              ))}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-white text-lg">Memory Configuration</h3>
            <div className="space-y-3">
              {Object.entries(memory).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <Label className="text-white capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()} Memory
                  </Label>
                  <Button
                    type="button"
                    variant={value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setMemory(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }))}
                    className={value ? 
                      "bg-green-500 text-white" : 
                      "border-gray-700 text-white hover:bg-gray-700"
                    }
                  >
                    {value ? 'Enabled' : 'Disabled'}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-white text-lg">Tools & Guardrails</h3>
            <div className="space-y-2">
              {['Web Search', 'Calculator', 'File Manager', 'Email', 'Calendar'].map((tool) => (
                <div key={tool} className="flex items-center justify-between">
                  <Label className="text-white">{tool}</Label>
                  <Button
                    type="button"
                    variant={tools.includes(tool) ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      if (tools.includes(tool)) {
                        setTools(prev => prev.filter(t => t !== tool));
                      } else {
                        setTools(prev => [...prev, tool]);
                      }
                    }}
                    className={tools.includes(tool) ? 
                      "bg-beam-blue text-white" : 
                      "border-gray-700 text-white hover:bg-gray-700"
                    }
                  >
                    {tools.includes(tool) ? 'Selected' : 'Select'}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-4">
            <h3 className="text-white text-lg">MCP Tools</h3>
            <div className="space-y-2">
              {['AWS Documentation', 'GitHub Integration', 'Slack Connector', 'Database Query'].map((mcpTool) => (
                <div key={mcpTool} className="flex items-center justify-between">
                  <Label className="text-white">{mcpTool}</Label>
                  <Button
                    type="button"
                    variant={mcpTools.includes(mcpTool) ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      if (mcpTools.includes(mcpTool)) {
                        setMcpTools(prev => prev.filter(t => t !== mcpTool));
                      } else {
                        setMcpTools(prev => [...prev, mcpTool]);
                      }
                    }}
                    className={mcpTools.includes(mcpTool) ? 
                      "bg-purple-500 text-white" : 
                      "border-gray-700 text-white hover:bg-gray-700"
                    }
                  >
                    {mcpTools.includes(mcpTool) ? 'Selected' : 'Select'}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        );
      case 6:
        return (
          <div className="space-y-4">
            <h3 className="text-white text-lg">Review & Create</h3>
            <div className="bg-beam-dark-accent p-4 rounded border border-gray-700 space-y-2">
              <p className="text-white"><strong>Name:</strong> {agentName || 'Unnamed Agent'}</p>
              <p className="text-white"><strong>Provider:</strong> {selectedProvider}</p>
              <p className="text-white"><strong>Model:</strong> {selectedModel || 'Default'}</p>
              <p className="text-white"><strong>Role:</strong> {selectedRole || 'Not selected'}</p>
              <p className="text-white"><strong>Tools:</strong> {tools.length > 0 ? tools.join(', ') : 'None'}</p>
              <p className="text-white"><strong>MCP Tools:</strong> {mcpTools.length > 0 ? mcpTools.join(', ') : 'None'}</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-beam-dark-accent border-gray-700 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">Create New Agent</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {renderStepContent()}
          
          <div className="flex justify-between items-center">
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
            
            <div className="text-xs text-gray-400">
              Step {step} of 6
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};