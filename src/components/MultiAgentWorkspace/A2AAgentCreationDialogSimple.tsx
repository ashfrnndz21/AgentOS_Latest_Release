import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { X, Plus, Bot, Settings, Zap } from 'lucide-react';

interface A2AAgentCreationDialogSimpleProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAgentCreated?: (agent: any) => void;
}

export const A2AAgentCreationDialogSimple: React.FC<A2AAgentCreationDialogSimpleProps> = ({
  open,
  onOpenChange,
  onAgentCreated
}) => {
  const [agentName, setAgentName] = useState('');
  const [agentDescription, setAgentDescription] = useState('');
  const [agentPort, setAgentPort] = useState(8000);
  const [selectedModel, setSelectedModel] = useState('llama3.2:latest');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateAgent = async () => {
    if (!agentName.trim()) return;

    setIsCreating(true);
    
    try {
      const newAgent = {
        id: agentName.toLowerCase().replace(/\s+/g, '_'),
        name: agentName,
        description: agentDescription,
        port: agentPort,
        model: selectedModel,
        systemPrompt: systemPrompt,
        tools: ['think'],
        capabilities: ['general']
      };

      console.log('Creating A2A Agent:', newAgent);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (onAgentCreated) {
        onAgentCreated(newAgent);
      }
      onOpenChange(false);
      
      // Reset form
      setAgentName('');
      setAgentDescription('');
      setAgentPort(8000);
      setSystemPrompt('');
      
    } catch (error) {
      console.error('Failed to create A2A agent:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-green-400" />
            Create A2A Agent
          </DialogTitle>
          <DialogDescription>
            Create a new Agent-to-Agent network agent
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Agent Name *</label>
              <Input
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                placeholder="e.g., Weather Agent"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Port Number</label>
              <Input
                type="number"
                value={agentPort}
                onChange={(e) => setAgentPort(parseInt(e.target.value) || 8000)}
                placeholder="8000"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Input
              value={agentDescription}
              onChange={(e) => setAgentDescription(e.target.value)}
              placeholder="Brief description of the agent's purpose"
            />
          </div>

          {/* Model Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Language Model</label>
            <select 
              value={selectedModel} 
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full p-2 border border-gray-600 rounded-md bg-gray-800 text-white"
            >
              <option value="llama3.2:latest">llama3.2:latest</option>
              <option value="llama3.2:1b">llama3.2:1b</option>
              <option value="mistral:latest">mistral:latest</option>
              <option value="phi3:latest">phi3:latest</option>
            </select>
          </div>

          {/* System Prompt */}
          <div className="space-y-2">
            <label className="text-sm font-medium">System Prompt</label>
            <Textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="Define the agent's behavior and expertise..."
              rows={3}
            />
          </div>

          {/* Agent Preview */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Agent Preview</label>
            <Card className="p-4 bg-gray-800 border-gray-700">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-green-400" />
                  <div>
                    <h3 className="text-sm font-medium text-white">{agentName || 'Agent Name'}</h3>
                    <p className="text-xs text-gray-400">{agentDescription || 'Agent description'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-yellow-500" />
                  <span className="text-xs text-yellow-500">Creating</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                <Badge variant="secondary" className="text-xs bg-green-600 text-white">
                  A2A Network
                </Badge>
                <Badge variant="secondary" className="text-xs bg-gray-700 text-gray-300">
                  {selectedModel}
                </Badge>
                <Badge variant="secondary" className="text-xs bg-gray-700 text-gray-300">
                  think
                </Badge>
              </div>
              <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                <Settings className="h-3 w-3" />
                <span>Port: {agentPort}</span>
              </div>
            </Card>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateAgent}
              disabled={!agentName.trim() || isCreating}
              className="bg-green-600 hover:bg-green-700"
            >
              {isCreating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Creating Agent...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Create A2A Agent
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
