/**
 * Fixed Strands Agent Adaptation Dialog
 * Converts Ollama agents to Strands intelligence agents with advanced reasoning capabilities
 */

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Brain, 
  Bot, 
  Settings, 
  Eye, 
  BarChart3,
  ArrowRight,
  Info,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Shield
} from 'lucide-react';

import { 
  strandsAgentService, 
  DisplayableOllamaAgent, 
  StrandsAgent, 
  StrandsAgentConfig 
} from '@/lib/services/StrandsAgentService';

interface StrandsAgentAdaptationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  ollamaAgent: DisplayableOllamaAgent | null;
  onAgentAdapted: (strandsAgent: StrandsAgent) => void;
}

export const StrandsAgentAdaptationDialog: React.FC<StrandsAgentAdaptationDialogProps> = ({
  isOpen,
  onClose,
  ollamaAgent,
  onAgentAdapted
}) => {
  const [adapting, setAdapting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // Debug logging
  console.log('StrandsAgentAdaptationDialog render:', { isOpen, ollamaAgent: ollamaAgent?.name });

  // Early return with error boundary
  if (isOpen && !ollamaAgent) {
    console.error('Adaptation dialog opened without ollamaAgent');
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl bg-gray-900 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">Error</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <p className="text-red-400">No agent data available for adaptation.</p>
            <Button onClick={onClose} className="mt-4">Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  
  // Configuration state
  const [config, setConfig] = useState<Partial<StrandsAgentConfig>>({
    name: '',
    role: '',
    description: '',
    system_prompt: '',
    temperature: 0.7,
    max_tokens: 1000,
    reasoning_pattern: 'sequential',
    reflection_enabled: true,
    chain_of_thought_depth: 3,
    tools_config: [],
    tool_selection_strategy: 'automatic',
    mcp_servers: [],
    agent_architecture: 'single',
    delegation_rules: [],
    communication_protocol: 'direct',
    telemetry_enabled: true,
    tracing_level: 'basic',
    metrics_collection: [],
    execution_mode: 'local',
    resource_limits: {},
    error_handling: {}
  });

  // Initialize config when Ollama agent changes
  useEffect(() => {
    if (ollamaAgent) {
      try {
        console.log('Initializing config for agent:', ollamaAgent.name);
        
        // Build comprehensive description including all Ollama features
        let adaptedDescription = ollamaAgent.description || 'Adapted from Ollama agent with Strands intelligence capabilities';
        
        if (ollamaAgent.personality) {
          adaptedDescription += `\n\nPersonality: ${ollamaAgent.personality}`;
        }
        if (ollamaAgent.expertise) {
          adaptedDescription += `\n\nExpertise: ${ollamaAgent.expertise}`;
        }
        if (ollamaAgent.guardrails?.enabled) {
          adaptedDescription += `\n\nSecurity: Enhanced with ${ollamaAgent.guardrails.safety_level} safety level guardrails`;
        }
        
        const newConfig = {
          name: `${ollamaAgent.name} (Strands)`,
          role: ollamaAgent.role || 'Assistant',
          description: adaptedDescription,
          system_prompt: ollamaAgent.system_prompt || '',
          temperature: ollamaAgent.temperature || 0.7,
          max_tokens: ollamaAgent.max_tokens || 1000,
          reasoning_pattern: 'sequential' as const,
          reflection_enabled: true,
          chain_of_thought_depth: 3,
          tools_config: Array.isArray(ollamaAgent.tools) ? ollamaAgent.tools : [],
          tool_selection_strategy: 'automatic' as const,
          mcp_servers: [],
          agent_architecture: 'single' as const,
          delegation_rules: [],
          communication_protocol: 'direct' as const,
          telemetry_enabled: true,
          tracing_level: 'basic' as const,
          metrics_collection: ['tokens', 'execution_time', 'success_rate'],
          execution_mode: 'local' as const,
          resource_limits: {},
          error_handling: {}
        };
        
        console.log('Setting config:', newConfig);
        setConfig(newConfig);
        setCurrentStep(1);
        setError(null);
      } catch (err) {
        console.error('Error initializing config:', err);
        setError('Failed to initialize agent configuration');
      }
    }
  }, [ollamaAgent]);

  const handleAdapt = async () => {
    if (!ollamaAgent || !config.name?.trim()) return;
    
    setAdapting(true);
    setError(null);
    
    try {
      const strandsAgent = await strandsAgentService.adaptOllamaAgentToStrands(
        ollamaAgent,
        config
      );
      
      onAgentAdapted(strandsAgent);
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to adapt agent');
    } finally {
      setAdapting(false);
    }
  };

  const updateConfig = (updates: Partial<StrandsAgentConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  if (!ollamaAgent) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] bg-gray-900 border-gray-700 text-white flex flex-col">
        <DialogHeader className="border-b border-gray-700 pb-4 flex-shrink-0">
          <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
            <ArrowRight className="h-6 w-6 text-blue-400" />
            Adapt to Strands Intelligence Agent
          </DialogTitle>
          <p className="text-sm text-gray-400 mt-2">
            Convert "{ollamaAgent?.name || 'Unknown Agent'}" to a Strands agent with advanced reasoning capabilities
          </p>
        </DialogHeader>

        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <Tabs value={`step-${currentStep}`} onValueChange={(value) => setCurrentStep(parseInt(value.split('-')[1]))} className="flex-1 flex flex-col min-h-0">
            <TabsList className="grid w-full grid-cols-4 bg-gray-800 mb-4 flex-shrink-0">
              <TabsTrigger value="step-1" className="data-[state=active]:bg-gray-700">
                <Info className="h-4 w-4 mr-2" />
                Basic Setup
              </TabsTrigger>
              <TabsTrigger value="step-2" className="data-[state=active]:bg-gray-700">
                <Brain className="h-4 w-4 mr-2" />
                Reasoning
              </TabsTrigger>
              <TabsTrigger value="step-3" className="data-[state=active]:bg-gray-700">
                <Settings className="h-4 w-4 mr-2" />
                Advanced
              </TabsTrigger>
              <TabsTrigger value="step-4" className="data-[state=active]:bg-gray-700">
                <CheckCircle className="h-4 w-4 mr-2" />
                Review
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto px-1 min-h-0">
              {/* Step 1: Basic Setup */}
              <TabsContent value="step-1" className="mt-0 space-y-6">
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Bot className="h-5 w-5 text-green-400" />
                      Original Ollama Agent
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Name:</span>
                        <div className="text-white font-medium">{ollamaAgent?.name || 'Unknown'}</div>
                      </div>
                      <div>
                        <span className="text-gray-400">Role:</span>
                        <div className="text-white font-medium">{ollamaAgent?.role || 'Assistant'}</div>
                      </div>
                      <div>
                        <span className="text-gray-400">Model:</span>
                        <div className="text-white font-medium">{ollamaAgent?.model || 'Unknown'}</div>
                      </div>
                      <div>
                        <span className="text-gray-400">Temperature:</span>
                        <div className="text-white font-medium">{ollamaAgent?.temperature || 0.7}</div>
                      </div>
                      <div>
                        <span className="text-gray-400">Max Tokens:</span>
                        <div className="text-white font-medium">{ollamaAgent?.max_tokens || 1000}</div>
                      </div>
                      <div>
                        <span className="text-gray-400">Capabilities:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {(ollamaAgent?.capabilities || []).map((cap) => (
                            <Badge key={cap} variant="secondary" className="text-xs">
                              {cap}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Guardrails Configuration */}
                    <div className="border-t border-gray-600 pt-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="h-4 w-4 text-red-400" />
                        <span className="text-gray-400 text-sm font-medium">Security & Guardrails</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Status:</span>
                          <div className="flex items-center gap-2 mt-1">
                            {ollamaAgent?.guardrails?.enabled ? (
                              <Badge variant="outline" className="text-xs border-green-500/30 text-green-400">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Enabled
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs border-gray-500/30 text-gray-400">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Basic
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-400">Safety Level:</span>
                          <div className="text-white font-medium capitalize mt-1">
                            {ollamaAgent?.guardrails?.safety_level || 'medium'}
                          </div>
                        </div>
                      </div>
                      {ollamaAgent?.guardrails?.enabled && (
                        <div className="mt-3">
                          <div className="text-xs text-gray-400 mb-1">Active Filters & Rules:</div>
                          <div className="flex flex-wrap gap-1">
                            {(ollamaAgent.guardrails.content_filters || []).map((filter, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs border-red-500/30 text-red-400">
                                {filter}
                              </Badge>
                            ))}
                            {(ollamaAgent.guardrails.rules || []).length > 0 && (
                              <Badge variant="outline" className="text-xs border-yellow-500/30 text-yellow-400">
                                {(ollamaAgent.guardrails.rules || []).length} custom rules
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Additional Configuration */}
                    {(ollamaAgent?.personality || ollamaAgent?.expertise) && (
                      <div className="border-t border-gray-600 pt-3">
                        <div className="grid grid-cols-1 gap-3 text-sm">
                          {ollamaAgent?.personality && (
                            <div>
                              <span className="text-gray-400">Personality:</span>
                              <p className="text-gray-300 text-sm mt-1">{ollamaAgent.personality}</p>
                            </div>
                          )}
                          {ollamaAgent?.expertise && (
                            <div>
                              <span className="text-gray-400">Expertise:</span>
                              <p className="text-gray-300 text-sm mt-1">{ollamaAgent.expertise}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {ollamaAgent?.description && (
                      <div className="border-t border-gray-600 pt-3">
                        <span className="text-gray-400 text-sm">Description:</span>
                        <p className="text-gray-300 text-sm mt-1">{ollamaAgent.description}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Brain className="h-5 w-5 text-blue-400" />
                      Strands Agent Configuration
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name" className="text-gray-300">Agent Name</Label>
                        <Input
                          id="name"
                          value={config.name || ''}
                          onChange={(e) => updateConfig({ name: e.target.value })}
                          className="bg-gray-800 border-gray-600 text-white"
                          placeholder="Enter Strands agent name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="role" className="text-gray-300">Role</Label>
                        <Input
                          id="role"
                          value={config.role || ''}
                          onChange={(e) => updateConfig({ role: e.target.value })}
                          className="bg-gray-800 border-gray-600 text-white"
                          placeholder="Enter agent role"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="description" className="text-gray-300">Description</Label>
                      <Textarea
                        id="description"
                        value={config.description || ''}
                        onChange={(e) => updateConfig({ description: e.target.value })}
                        className="bg-gray-800 border-gray-600 text-white"
                        placeholder="Describe what this Strands agent will do"
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="system_prompt" className="text-gray-300">System Prompt</Label>
                      <Textarea
                        id="system_prompt"
                        value={config.system_prompt || ''}
                        onChange={(e) => updateConfig({ system_prompt: e.target.value })}
                        className="bg-gray-800 border-gray-600 text-white"
                        placeholder="System prompt for the Strands agent"
                        rows={4}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="temperature" className="text-gray-300">
                          Temperature: {config.temperature}
                        </Label>
                        <Slider
                          value={[config.temperature || 0.7]}
                          onValueChange={(value) => updateConfig({ temperature: value[0] })}
                          max={2}
                          min={0}
                          step={0.1}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="max_tokens" className="text-gray-300">Max Tokens</Label>
                        <Input
                          id="max_tokens"
                          type="number"
                          value={config.max_tokens || 1000}
                          onChange={(e) => updateConfig({ max_tokens: parseInt(e.target.value) })}
                          className="bg-gray-800 border-gray-600 text-white"
                          min={100}
                          max={4000}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Step 2: Reasoning Configuration */}
              <TabsContent value="step-2" className="mt-0 space-y-6">
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Brain className="h-5 w-5 text-blue-400" />
                      Strands Reasoning Configuration
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-gray-300">Reasoning Pattern</Label>
                      <Select 
                        value={config.reasoning_pattern} 
                        onValueChange={(value) => updateConfig({ reasoning_pattern: value as any })}
                      >
                        <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600">
                          <SelectItem value="sequential">Sequential</SelectItem>
                          <SelectItem value="adaptive">Adaptive</SelectItem>
                          <SelectItem value="parallel">Parallel</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-gray-300">Reflection Enabled</Label>
                        <p className="text-xs text-gray-400">Allow agent to reflect on its reasoning</p>
                      </div>
                      <Switch
                        checked={config.reflection_enabled}
                        onCheckedChange={(checked) => updateConfig({ reflection_enabled: checked })}
                      />
                    </div>

                    <div>
                      <Label className="text-gray-300">
                        Chain of Thought Depth: {config.chain_of_thought_depth}
                      </Label>
                      <Slider
                        value={[config.chain_of_thought_depth || 3]}
                        onValueChange={(value) => updateConfig({ chain_of_thought_depth: value[0] })}
                        max={10}
                        min={1}
                        step={1}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label className="text-gray-300">Agent Architecture</Label>
                      <Select 
                        value={config.agent_architecture} 
                        onValueChange={(value) => updateConfig({ agent_architecture: value as any })}
                      >
                        <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600">
                          <SelectItem value="single">Single Agent</SelectItem>
                          <SelectItem value="supervisor">Supervisor</SelectItem>
                          <SelectItem value="swarm">Swarm</SelectItem>
                          <SelectItem value="hierarchical">Hierarchical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Step 3: Advanced Configuration */}
              <TabsContent value="step-3" className="mt-0 space-y-6">
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Settings className="h-5 w-5 text-gray-400" />
                      Advanced Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-gray-300">Telemetry Enabled</Label>
                        <p className="text-xs text-gray-400">Collect performance metrics and traces</p>
                      </div>
                      <Switch
                        checked={config.telemetry_enabled}
                        onCheckedChange={(checked) => updateConfig({ telemetry_enabled: checked })}
                      />
                    </div>

                    <div>
                      <Label className="text-gray-300">Tracing Level</Label>
                      <Select 
                        value={config.tracing_level} 
                        onValueChange={(value) => updateConfig({ tracing_level: value as any })}
                      >
                        <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600">
                          <SelectItem value="basic">Basic</SelectItem>
                          <SelectItem value="detailed">Detailed</SelectItem>
                          <SelectItem value="debug">Debug</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-gray-300">Execution Mode</Label>
                      <Select 
                        value={config.execution_mode} 
                        onValueChange={(value) => updateConfig({ execution_mode: value as any })}
                      >
                        <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600">
                          <SelectItem value="local">Local</SelectItem>
                          <SelectItem value="cloud">Cloud</SelectItem>
                          <SelectItem value="hybrid">Hybrid</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Step 4: Review */}
              <TabsContent value="step-4" className="mt-0 space-y-6">
                <Card className="bg-blue-900/20 border-blue-500/30">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-blue-400" />
                      Adaptation Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-blue-300 text-sm">
                      Ready to convert "{ollamaAgent?.name || 'Unknown Agent'}" to a Strands intelligence agent with advanced reasoning capabilities.
                    </p>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-2 gap-6">
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white text-sm">Basic Configuration</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div><span className="text-gray-400">Name:</span> {config.name}</div>
                      <div><span className="text-gray-400">Role:</span> {config.role}</div>
                      <div><span className="text-gray-400">Model:</span> {ollamaAgent?.model || 'Unknown'}</div>
                      <div><span className="text-gray-400">Temperature:</span> {config.temperature}</div>
                      <div><span className="text-gray-400">Max Tokens:</span> {config.max_tokens}</div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white text-sm">Strands Features</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div><span className="text-gray-400">Reasoning:</span> {config.reasoning_pattern}</div>
                      <div><span className="text-gray-400">Reflection:</span> {config.reflection_enabled ? 'Enabled' : 'Disabled'}</div>
                      <div><span className="text-gray-400">CoT Depth:</span> {config.chain_of_thought_depth}</div>
                      <div><span className="text-gray-400">Architecture:</span> {config.agent_architecture}</div>
                      <div><span className="text-gray-400">Telemetry:</span> {config.telemetry_enabled ? 'Enabled' : 'Disabled'}</div>
                    </CardContent>
                  </Card>
                </div>

                {error && (
                  <Card className="bg-red-900/20 border-red-500/30">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 text-red-400">
                        <AlertCircle className="h-5 w-5" />
                        <span className="font-medium">Adaptation Error</span>
                      </div>
                      <p className="text-red-300 text-sm mt-1">{error}</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-700 pt-4 pb-2 flex items-center justify-between flex-shrink-0 bg-gray-900">
          <div className="flex items-center gap-2">
            {currentStep > 1 && (
              <Button
                variant="outline"
                onClick={() => setCurrentStep(currentStep - 1)}
                disabled={adapting}
              >
                Previous
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose} disabled={adapting}>
              Cancel
            </Button>
            
            {currentStep < 4 ? (
              <Button
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={!config.name?.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleAdapt}
                disabled={adapting || !config.name?.trim()}
                className="bg-green-600 hover:bg-green-700"
              >
                {adapting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Adapting...
                  </>
                ) : (
                  <>
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Create Strands Agent
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};