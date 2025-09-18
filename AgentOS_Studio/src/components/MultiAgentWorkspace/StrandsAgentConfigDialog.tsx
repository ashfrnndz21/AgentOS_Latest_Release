/**
 * Strands Agent Configuration Dialog
 * Professional configuration interface for Strands agents
 */

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { StrandsOllamaAgent, StrandsTool } from '@/types/StrandsTypes';
import { useStrandsAgentPalette } from '@/hooks/useStrandsAgentPalette';

interface StrandsAgentConfigDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: Partial<StrandsOllamaAgent>) => void;
  agent?: StrandsOllamaAgent;
  mode: 'create' | 'edit';
}

export const StrandsAgentConfigDialog: React.FC<StrandsAgentConfigDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  agent,
  mode
}) => {
  const { availableModels, getAvailableTools } = useStrandsAgentPalette();
  const [config, setConfig] = useState<Partial<StrandsOllamaAgent>>({
    name: '',
    model: 'llama3.2:latest',
    systemPrompt: '',
    reasoningPattern: 'sequential',
    contextManagement: {
      preserveMemory: true,
      maxContextLength: 4000,
      compressionLevel: 'summary'
    },
    ollamaConfig: {
      temperature: 0.7,
      maxTokens: 1000,
      keepAlive: '5m'
    },
    capabilities: [],
    category: 'general',
    tools: []
  });

  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const availableTools = getAvailableTools();

  // Initialize config when agent changes
  useEffect(() => {
    if (agent && mode === 'edit') {
      setConfig(agent);
      setSelectedTools(agent.tools.map(t => t.name));
    } else {
      // Reset for create mode
      setConfig({
        name: '',
        model: 'llama3.2:latest',
        systemPrompt: '',
        reasoningPattern: 'sequential',
        contextManagement: {
          preserveMemory: true,
          maxContextLength: 4000,
          compressionLevel: 'summary'
        },
        ollamaConfig: {
          temperature: 0.7,
          maxTokens: 1000,
          keepAlive: '5m'
        },
        capabilities: [],
        category: 'general',
        tools: []
      });
      setSelectedTools([]);
    }
  }, [agent, mode]);

  const handleSave = () => {
    const selectedToolObjects = availableTools.filter(tool => 
      selectedTools.includes(tool.name)
    );

    const finalConfig = {
      ...config,
      tools: selectedToolObjects
    };

    onSave(finalConfig);
    onClose();
  };

  const handleToolToggle = (toolName: string) => {
    setSelectedTools(prev => 
      prev.includes(toolName)
        ? prev.filter(t => t !== toolName)
        : [...prev, toolName]
    );
  };

  const addCapability = (capability: string) => {
    if (capability && !config.capabilities?.includes(capability)) {
      setConfig(prev => ({
        ...prev,
        capabilities: [...(prev.capabilities || []), capability]
      }));
    }
  };

  const removeCapability = (capability: string) => {
    setConfig(prev => ({
      ...prev,
      capabilities: prev.capabilities?.filter(c => c !== capability) || []
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-800 border-slate-600">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <span className="text-2xl">🧠</span>
            {mode === 'create' ? 'Create Strands Agent' : `Configure ${agent?.name}`}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-slate-700">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="model">Model Config</TabsTrigger>
            <TabsTrigger value="tools">Tools & Capabilities</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          {/* Basic Information */}
          <TabsContent value="basic" className="space-y-4">
            <Card className="bg-slate-700/50 border-slate-600">
              <CardHeader>
                <CardTitle className="text-white text-sm">Agent Identity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-slate-300">Agent Name</Label>
                  <Input
                    id="name"
                    value={config.name}
                    onChange={(e) => setConfig(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter agent name..."
                    className="bg-slate-600 border-slate-500 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="systemPrompt" className="text-slate-300">System Prompt</Label>
                  <Textarea
                    id="systemPrompt"
                    value={config.systemPrompt}
                    onChange={(e) => setConfig(prev => ({ ...prev, systemPrompt: e.target.value }))}
                    placeholder="Define the agent's role, personality, and behavior..."
                    rows={4}
                    className="bg-slate-600 border-slate-500 text-white"
                  />
                </div>

                <div>
                  <Label className="text-slate-300">Category</Label>
                  <Select 
                    value={config.category} 
                    onValueChange={(value: any) => setConfig(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger className="bg-slate-600 border-slate-500 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      <SelectItem value="research">🔍 Research Agent</SelectItem>
                      <SelectItem value="calculation">🧮 Calculation Agent</SelectItem>
                      <SelectItem value="documentation">📝 Documentation Agent</SelectItem>
                      <SelectItem value="general">🤖 General Purpose</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Model Configuration */}
          <TabsContent value="model" className="space-y-4">
            <Card className="bg-slate-700/50 border-slate-600">
              <CardHeader>
                <CardTitle className="text-white text-sm">Ollama Model Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-slate-300">Ollama Model</Label>
                  <Select 
                    value={config.model} 
                    onValueChange={(value) => setConfig(prev => ({ ...prev, model: value }))}
                  >
                    <SelectTrigger className="bg-slate-600 border-slate-500 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      {availableModels.map(model => (
                        <SelectItem key={model.name} value={model.name}>
                          {model.name} ({model.details?.parameter_size || 'Unknown size'})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-slate-300">
                    Temperature: {config.ollamaConfig?.temperature}
                  </Label>
                  <Slider
                    value={[config.ollamaConfig?.temperature || 0.7]}
                    onValueChange={([value]) => 
                      setConfig(prev => ({
                        ...prev,
                        ollamaConfig: { ...prev.ollamaConfig!, temperature: value }
                      }))
                    }
                    max={2}
                    min={0}
                    step={0.1}
                    className="mt-2"
                  />
                  <div className="flex justify-between text-xs text-slate-400 mt-1">
                    <span>Focused (0)</span>
                    <span>Balanced (1)</span>
                    <span>Creative (2)</span>
                  </div>
                </div>

                <div>
                  <Label htmlFor="maxTokens" className="text-slate-300">Max Tokens</Label>
                  <Input
                    id="maxTokens"
                    type="number"
                    value={config.ollamaConfig?.maxTokens}
                    onChange={(e) => 
                      setConfig(prev => ({
                        ...prev,
                        ollamaConfig: { ...prev.ollamaConfig!, maxTokens: parseInt(e.target.value) }
                      }))
                    }
                    className="bg-slate-600 border-slate-500 text-white"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tools & Capabilities */}
          <TabsContent value="tools" className="space-y-4">
            <Card className="bg-slate-700/50 border-slate-600">
              <CardHeader>
                <CardTitle className="text-white text-sm">Available Tools</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {availableTools.map(tool => (
                    <div key={tool.name} className="flex items-center space-x-2">
                      <Checkbox
                        id={tool.name}
                        checked={selectedTools.includes(tool.name)}
                        onCheckedChange={() => handleToolToggle(tool.name)}
                      />
                      <Label htmlFor={tool.name} className="text-slate-300 text-sm">
                        {tool.name}
                      </Label>
                      <Badge variant="outline" className="text-xs border-slate-500 text-slate-400">
                        {tool.category}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-700/50 border-slate-600">
              <CardHeader>
                <CardTitle className="text-white text-sm">Capabilities</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {config.capabilities?.map(capability => (
                    <Badge 
                      key={capability} 
                      variant="secondary" 
                      className="bg-purple-600/20 text-purple-300 cursor-pointer"
                      onClick={() => removeCapability(capability)}
                    >
                      {capability} ×
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add capability..."
                    className="bg-slate-600 border-slate-500 text-white"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addCapability(e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Advanced Settings */}
          <TabsContent value="advanced" className="space-y-4">
            <Card className="bg-slate-700/50 border-slate-600">
              <CardHeader>
                <CardTitle className="text-white text-sm">Strands Intelligence</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-slate-300">Reasoning Pattern</Label>
                  <Select 
                    value={config.reasoningPattern} 
                    onValueChange={(value: any) => setConfig(prev => ({ ...prev, reasoningPattern: value }))}
                  >
                    <SelectTrigger className="bg-slate-600 border-slate-500 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      <SelectItem value="sequential">🔄 Sequential - Step by step reasoning</SelectItem>
                      <SelectItem value="parallel">⚡ Parallel - Multi-threaded thinking</SelectItem>
                      <SelectItem value="conditional">🤔 Conditional - Context-aware decisions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="preserveMemory"
                      checked={config.contextManagement?.preserveMemory}
                      onCheckedChange={(checked) => 
                        setConfig(prev => ({
                          ...prev,
                          contextManagement: {
                            ...prev.contextManagement!,
                            preserveMemory: checked as boolean
                          }
                        }))
                      }
                    />
                    <Label htmlFor="preserveMemory" className="text-slate-300">
                      Preserve Memory Between Tasks
                    </Label>
                  </div>

                  <div>
                    <Label className="text-slate-300">
                      Max Context Length: {config.contextManagement?.maxContextLength}
                    </Label>
                    <Slider
                      value={[config.contextManagement?.maxContextLength || 4000]}
                      onValueChange={([value]) => 
                        setConfig(prev => ({
                          ...prev,
                          contextManagement: {
                            ...prev.contextManagement!,
                            maxContextLength: value
                          }
                        }))
                      }
                      max={8000}
                      min={1000}
                      step={500}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label className="text-slate-300">Context Compression</Label>
                    <Select 
                      value={config.contextManagement?.compressionLevel} 
                      onValueChange={(value: any) => 
                        setConfig(prev => ({
                          ...prev,
                          contextManagement: {
                            ...prev.contextManagement!,
                            compressionLevel: value
                          }
                        }))
                      }
                    >
                      <SelectTrigger className="bg-slate-600 border-slate-500 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        <SelectItem value="none">None - Keep full context</SelectItem>
                        <SelectItem value="summary">Summary - Compress to key points</SelectItem>
                        <SelectItem value="key_points">Key Points - Extract essentials</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-slate-500 text-slate-300">
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            className="bg-purple-600 hover:bg-purple-700 text-white"
            disabled={!config.name || !config.model}
          >
            {mode === 'create' ? 'Create Agent' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};