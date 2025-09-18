import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Bot, User, Link, MessageSquare } from 'lucide-react';
import { useOllamaModels } from '@/hooks/useOllamaModels';
import { useOllamaAgentsForPalette } from '@/hooks/useOllamaAgentsForPalette';
import { OLLAMA_MODELS } from '@/config/ollamaModels';

export interface ChatConfig {
  type: 'direct-llm' | 'independent-agent' | 'palette-agent';
  name: string;
  
  // Direct LLM Config
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  contextWindow?: number;
  
  // Independent Agent Config
  role?: string;
  personality?: string;
  capabilities?: string[];
  guardrails?: boolean;
  tools?: string[];
  
  // Palette Agent Config
  agentId?: string;
  chatMode?: 'direct' | 'workflow-aware';
  contextSharing?: boolean;
  workflowTrigger?: boolean;
  
  // UI Config (fixed for consistent canvas component)
  position: 'embedded';
  size: 'medium';
}

interface ChatConfigurationWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (config: ChatConfig) => void;
}

export const ChatConfigurationWizard: React.FC<ChatConfigurationWizardProps> = ({
  isOpen,
  onClose,
  onConfirm
}) => {
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState<Partial<ChatConfig>>({
    position: 'embedded',
    size: 'medium'
  });

  const { models } = useOllamaModels();
  const { agents } = useOllamaAgentsForPalette();

  const chatTypes = [
    {
      type: 'direct-llm' as const,
      title: 'Direct LLM Chat',
      description: 'Raw conversation with Ollama models',
      icon: Bot,
      color: 'bg-blue-500/20 border-blue-500/30 text-blue-300',
      features: ['Fast setup', 'Model selection', 'Custom prompts', 'Low latency']
    },
    {
      type: 'independent-agent' as const,
      title: 'Independent Chat Agent',
      description: 'Create a specialized chat agent',
      icon: User,
      color: 'bg-green-500/20 border-green-500/30 text-green-300',
      features: ['Custom personality', 'Guardrails', 'Tool access', 'Domain expertise']
    },
    {
      type: 'palette-agent' as const,
      title: 'Use Palette Agent',
      description: 'Chat directly with workflow agents',
      icon: Link,
      color: 'bg-purple-500/20 border-purple-500/30 text-purple-300',
      features: ['Reuse existing agents', 'Workflow integration', 'Context sharing', 'Consistency']
    }
  ];

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleConfirm = () => {
    console.log('🎯 Creating chat interface with config:', config);
    
    // Set consistent component size for canvas
    const finalConfig = {
      ...config,
      position: 'embedded' as const,
      size: 'medium' as const
    } as ChatConfig;
    
    console.log('🚀 Final config:', finalConfig);
    
    try {
      onConfirm(finalConfig);
      onClose();
      setStep(1);
      setConfig({
        position: 'embedded',
        size: 'medium'
      });
      console.log('✅ Chat interface created successfully');
    } catch (error) {
      console.error('❌ Error creating chat interface:', error);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-white mb-2">Choose Chat Interface Type</h3>
        <p className="text-gray-400 text-sm">Select how users will interact with your workflow</p>
      </div>
      
      <div className="grid gap-4">
        {chatTypes.map((type) => {
          const IconComponent = type.icon;
          const isSelected = config.type === type.type;
          
          return (
            <Card
              key={type.type}
              className={`p-4 cursor-pointer transition-all border-2 ${
                isSelected 
                  ? type.color + ' border-opacity-100' 
                  : 'bg-gray-800/40 border-gray-600/30 hover:border-gray-500/50'
              }`}
              onClick={() => setConfig({ ...config, type: type.type })}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${isSelected ? type.color : 'bg-gray-700/50'}`}>
                  <IconComponent className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-white mb-1">{type.title}</h4>
                  <p className="text-gray-400 text-sm mb-3">{type.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {type.features.map((feature) => (
                      <Badge key={feature} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );

  const renderStep2 = () => {
    if (config.type === 'direct-llm') {
      return (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-white mb-2">Configure Direct LLM Chat</h3>
            <p className="text-gray-400 text-sm">Set up direct model conversation</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Chat Name</label>
              <Input
                value={config.name || ''}
                onChange={(e) => setConfig({ ...config, name: e.target.value })}
                placeholder="e.g., Quick Assistant"
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Ollama Model</label>
              <Select
                value={config.model || ''}
                onValueChange={(value) => setConfig({ ...config, model: value })}
              >
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  {models.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Temperature: {config.temperature || 0.7}
              </label>
              <Slider
                value={[config.temperature || 0.7]}
                onValueChange={([value]) => setConfig({ ...config, temperature: value })}
                min={0.1}
                max={1.0}
                step={0.1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Focused</span>
                <span>Creative</span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Max Tokens</label>
              <Select
                value={config.maxTokens?.toString() || '1000'}
                onValueChange={(value) => setConfig({ ...config, maxTokens: parseInt(value) })}
              >
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="500">500 tokens</SelectItem>
                  <SelectItem value="1000">1,000 tokens</SelectItem>
                  <SelectItem value="2000">2,000 tokens</SelectItem>
                  <SelectItem value="4000">4,000 tokens</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">System Prompt (Optional)</label>
              <Textarea
                value={config.systemPrompt || ''}
                onChange={(e) => setConfig({ ...config, systemPrompt: e.target.value })}
                placeholder="You are a helpful assistant..."
                className="bg-gray-800 border-gray-600 text-white"
                rows={3}
              />
            </div>
          </div>
        </div>
      );
    }
    
    if (config.type === 'independent-agent') {
      return (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-white mb-2">Create Independent Chat Agent</h3>
            <p className="text-gray-400 text-sm">Design a specialized chat agent</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Agent Name</label>
              <Input
                value={config.name || ''}
                onChange={(e) => setConfig({ ...config, name: e.target.value })}
                placeholder="e.g., Customer Support Bot"
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
              <Input
                value={config.role || ''}
                onChange={(e) => setConfig({ ...config, role: e.target.value })}
                placeholder="e.g., Customer Service Specialist"
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Ollama Model</label>
              <Select
                value={config.model || ''}
                onValueChange={(value) => setConfig({ ...config, model: value })}
              >
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  {models.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Personality</label>
              <Textarea
                value={config.personality || ''}
                onChange={(e) => setConfig({ ...config, personality: e.target.value })}
                placeholder="Professional, friendly, and solution-focused..."
                className="bg-gray-800 border-gray-600 text-white"
                rows={2}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Capabilities</label>
              <Input
                value={config.capabilities?.join(', ') || ''}
                onChange={(e) => setConfig({ 
                  ...config, 
                  capabilities: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                })}
                placeholder="Customer Service, Problem Solving, Empathy"
                className="bg-gray-800 border-gray-600 text-white"
              />
              <p className="text-xs text-gray-500 mt-1">Separate capabilities with commas</p>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-300">Enable Guardrails</label>
                <p className="text-xs text-gray-500">Safety and content filtering</p>
              </div>
              <Switch
                checked={config.guardrails || false}
                onCheckedChange={(checked) => setConfig({ ...config, guardrails: checked })}
              />
            </div>
          </div>
        </div>
      );
    }
    
    if (config.type === 'palette-agent') {
      return (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-white mb-2">Use Palette Agent for Chat</h3>
            <p className="text-gray-400 text-sm">Connect with existing workflow agents</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Chat Name</label>
              <Input
                value={config.name || ''}
                onChange={(e) => setConfig({ ...config, name: e.target.value })}
                placeholder="e.g., Expert Consultation"
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Select Agent</label>
              <Select
                value={config.agentId || ''}
                onValueChange={(value) => {
                  const selectedAgent = agents.find(a => a.id === value);
                  setConfig({ 
                    ...config, 
                    agentId: value,
                    name: config.name || `Chat with ${selectedAgent?.name}`
                  });
                }}
              >
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue placeholder="Choose an agent from your palette" />
                </SelectTrigger>
                <SelectContent>
                  {agents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      <div className="flex items-center gap-2">
                        <span>{agent.icon}</span>
                        <span>{agent.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {agent.role}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Chat Mode</label>
              <Select
                value={config.chatMode || 'direct'}
                onValueChange={(value: 'direct' | 'workflow-aware') => 
                  setConfig({ ...config, chatMode: value })
                }
              >
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="direct">Direct Chat</SelectItem>
                  <SelectItem value="workflow-aware">Workflow Aware</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                {config.chatMode === 'workflow-aware' 
                  ? 'Agent has access to workflow context and history'
                  : 'Agent operates independently of workflow'
                }
              </p>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-300">Context Sharing</label>
                <p className="text-xs text-gray-500">Share chat context with workflow</p>
              </div>
              <Switch
                checked={config.contextSharing || false}
                onCheckedChange={(checked) => setConfig({ ...config, contextSharing: checked })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-300">Workflow Trigger</label>
                <p className="text-xs text-gray-500">Allow chat to trigger workflow execution</p>
              </div>
              <Switch
                checked={config.workflowTrigger || false}
                onCheckedChange={(checked) => setConfig({ ...config, workflowTrigger: checked })}
              />
            </div>
          </div>
        </div>
      );
    }
    
    return null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-400" />
            Add Chat Interface
            <Badge variant="outline" className="ml-auto">
              Step {step} of 3
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-white mb-2">Ready to Create</h3>
                <p className="text-gray-400 text-sm">Your chat interface will be added as a workflow component</p>
              </div>
              
              <Card className="p-4 bg-gray-800/40 border-gray-600/30">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-5 w-5 text-blue-400" />
                    <div>
                      <h4 className="font-semibold text-white">{config.name || 'Chat Interface'}</h4>
                      <p className="text-sm text-gray-400">
                        {chatTypes.find(t => t.type === config.type)?.title}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-300">
                    <p>✅ Will appear as a standard workflow component</p>
                    <p>✅ Consistent size with other nodes</p>
                    <p>✅ Embedded in your workflow canvas</p>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
        
        <div className="flex justify-between pt-4 border-t border-gray-700">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={step === 1}
            className="border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            Back
          </Button>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </Button>
            
            {step < 3 ? (
              <Button
                onClick={handleNext}
                disabled={!config.type || (step === 2 && !config.name)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleConfirm}
                disabled={
                  !config.type || 
                  !config.name || 
                  (config.type === 'direct-llm' && !config.model) ||
                  (config.type === 'independent-agent' && !config.model) ||
                  (config.type === 'palette-agent' && !config.agentId)
                }
                className="bg-green-600 hover:bg-green-700 text-white"
                title={`Type: ${config.type || 'missing'}, Name: ${config.name || 'missing'}`}
              >
                Create Chat Interface
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};