import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { X, Plus, Bot, Settings, Zap } from 'lucide-react';

interface A2AAgentCreationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAgentCreated?: (agent: A2AAgent) => void;
}

interface A2AAgent {
  id: string;
  name: string;
  description: string;
  port: number;
  model: string;
  systemPrompt: string;
  tools: string[];
  capabilities: string[];
}

const AVAILABLE_TOOLS = [
  'think',
  'current_time',
  'calculator',
  'web_search',
  'file_operations',
  'data_analysis',
  'api_call',
  'database_query',
  'image_processing',
  'text_processing'
];

const AVAILABLE_MODELS = [
  'llama3.2:latest',
  'llama3.2:1b',
  'mistral:latest',
  'phi3:latest',
  'qwen2.5:latest'
];

const PREDEFINED_TEMPLATES = [
  {
    name: 'Research Agent',
    description: 'Research and analysis specialist',
    tools: ['think', 'web_search', 'data_analysis'],
    systemPrompt: 'You are a research specialist with expertise in gathering, analyzing, and synthesizing information from various sources.',
    capabilities: ['research', 'analysis', 'data_synthesis']
  },
  {
    name: 'Calculator Agent',
    description: 'Mathematical calculation specialist',
    tools: ['think', 'calculator'],
    systemPrompt: 'You are a mathematical calculation specialist with expertise in solving complex mathematical problems and equations.',
    capabilities: ['mathematics', 'calculations', 'problem_solving']
  },
  {
    name: 'Weather Agent',
    description: 'Weather information specialist',
    tools: ['think', 'current_time', 'api_call'],
    systemPrompt: 'You are a weather specialist with expertise in weather patterns, forecasting, and environmental analysis.',
    capabilities: ['weather', 'forecasting', 'environmental_analysis']
  },
  {
    name: 'Stock Agent',
    description: 'Stock market analysis specialist',
    tools: ['think', 'current_time', 'data_analysis'],
    systemPrompt: 'You are a financial analyst specializing in stock market analysis, trends, and investment insights.',
    capabilities: ['finance', 'stock_analysis', 'market_trends']
  },
  {
    name: 'Custom Agent',
    description: 'Create a custom agent with your own specifications',
    tools: ['think'],
    systemPrompt: 'You are a helpful AI assistant.',
    capabilities: ['general']
  }
];

export const A2AAgentCreationDialog: React.FC<A2AAgentCreationDialogProps> = ({
  open,
  onOpenChange,
  onAgentCreated
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('Custom Agent');
  const [agentName, setAgentName] = useState('');
  const [agentDescription, setAgentDescription] = useState('');
  const [agentPort, setAgentPort] = useState(8000);
  const [selectedModel, setSelectedModel] = useState('llama3.2:latest');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [selectedTools, setSelectedTools] = useState<string[]>(['think']);
  const [capabilities, setCapabilities] = useState<string[]>(['general']);
  const [isCreating, setIsCreating] = useState(false);

  const handleTemplateChange = (templateName: string) => {
    const template = PREDEFINED_TEMPLATES.find(t => t.name === templateName);
    if (template) {
      setSelectedTemplate(templateName);
      setAgentName(template.name);
      setAgentDescription(template.description);
      setSystemPrompt(template.systemPrompt);
      setSelectedTools(template.tools);
      setCapabilities(template.capabilities);
    }
  };

  const handleToolToggle = (tool: string) => {
    setSelectedTools(prev => 
      prev.includes(tool) 
        ? prev.filter(t => t !== tool)
        : [...prev, tool]
    );
  };

  const handleCapabilityAdd = (capability: string) => {
    if (capability && !capabilities.includes(capability)) {
      setCapabilities(prev => [...prev, capability]);
    }
  };

  const handleCapabilityRemove = (capability: string) => {
    setCapabilities(prev => prev.filter(c => c !== capability));
  };

  const findNextAvailablePort = () => {
    // Simple port finding logic - in real implementation, check with backend
    return 8000 + Math.floor(Math.random() * 1000);
  };

  const handleCreateAgent = async () => {
    if (!agentName.trim()) return;

    setIsCreating(true);
    
    try {
      const newAgent: A2AAgent = {
        id: agentName.toLowerCase().replace(/\s+/g, '_'),
        name: agentName,
        description: agentDescription,
        port: agentPort,
        model: selectedModel,
        systemPrompt: systemPrompt,
        tools: selectedTools,
        capabilities: capabilities
      };

      // TODO: Send request to backend to create A2A agent
      console.log('Creating A2A Agent:', newAgent);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      onAgentCreated?.(newAgent);
      onOpenChange(false);
      
      // Reset form
      setAgentName('');
      setAgentDescription('');
      setAgentPort(findNextAvailablePort());
      setSystemPrompt('');
      setSelectedTools(['think']);
      setCapabilities(['general']);
      setSelectedTemplate('Custom Agent');
      
    } catch (error) {
      console.error('Failed to create A2A agent:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-green-400" />
            Create A2A Agent
          </DialogTitle>
          <DialogDescription>
            Create a new Agent-to-Agent network agent with independent server capabilities
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Template Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Agent Template</Label>
            <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent>
                {PREDEFINED_TEMPLATES.map((template) => (
                  <SelectItem key={template.name} value={template.name}>
                    <div className="flex flex-col">
                      <span className="font-medium">{template.name}</span>
                      <span className="text-xs text-gray-500">{template.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="agent-name">Agent Name *</Label>
              <Input
                id="agent-name"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                placeholder="e.g., Weather Agent"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="agent-port">Port Number</Label>
              <Input
                id="agent-port"
                type="number"
                value={agentPort}
                onChange={(e) => setAgentPort(parseInt(e.target.value) || 8000)}
                placeholder="8000"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="agent-description">Description</Label>
            <Input
              id="agent-description"
              value={agentDescription}
              onChange={(e) => setAgentDescription(e.target.value)}
              placeholder="Brief description of the agent's purpose"
            />
          </div>

          {/* Model Selection */}
          <div className="space-y-2">
            <Label>Language Model</Label>
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_MODELS.map((model) => (
                  <SelectItem key={model} value={model}>
                    {model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* System Prompt */}
          <div className="space-y-2">
            <Label htmlFor="system-prompt">System Prompt</Label>
            <Textarea
              id="system-prompt"
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="Define the agent's behavior and expertise..."
              rows={4}
            />
          </div>

          {/* Tools Selection */}
          <div className="space-y-3">
            <Label>Available Tools</Label>
            <div className="grid grid-cols-2 gap-2">
              {AVAILABLE_TOOLS.map((tool) => (
                <Card
                  key={tool}
                  className={`p-3 cursor-pointer transition-colors ${
                    selectedTools.includes(tool)
                      ? 'bg-green-600 border-green-500'
                      : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                  }`}
                  onClick={() => handleToolToggle(tool)}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      selectedTools.includes(tool) ? 'bg-green-400' : 'bg-gray-500'
                    }`} />
                    <span className="text-sm font-medium">{tool}</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Capabilities */}
          <div className="space-y-3">
            <Label>Capabilities</Label>
            <div className="flex flex-wrap gap-2">
              {capabilities.map((capability) => (
                <Badge
                  key={capability}
                  variant="secondary"
                  className="flex items-center gap-1 bg-green-600 text-white"
                >
                  {capability}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => handleCapabilityRemove(capability)}
                  />
                </Badge>
              ))}
              <Input
                placeholder="Add capability..."
                className="w-32"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const input = e.currentTarget;
                    handleCapabilityAdd(input.value);
                    input.value = '';
                  }
                }}
              />
            </div>
          </div>

          {/* Agent Preview */}
          <div className="space-y-3">
            <Label>Agent Preview</Label>
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
                {selectedTools.slice(0, 3).map((tool) => (
                  <Badge key={tool} variant="secondary" className="text-xs bg-gray-700 text-gray-300">
                    {tool}
                  </Badge>
                ))}
                {selectedTools.length > 3 && (
                  <Badge variant="secondary" className="text-xs bg-gray-700 text-gray-300">
                    +{selectedTools.length - 3} more
                  </Badge>
                )}
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



