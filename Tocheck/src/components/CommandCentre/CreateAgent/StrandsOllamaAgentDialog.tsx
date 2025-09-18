import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { 
  Bot, 
  Cpu, 
  Settings, 
  MessageSquare, 
  Shield, 
  Database, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  RefreshCw,
  Play,
  Zap,
  Brain,
  Network,
  Eye,
  Target
} from 'lucide-react';
import { useOllamaModels } from '@/hooks/useOllamaModels';
import { useRealStrandsAgents } from '@/hooks/useRealStrandsAgents';
import { RealStrandsAgentConfig } from '@/lib/services/RealStrandsService';
import { useToast } from '@/hooks/use-toast';

interface StrandsOllamaAgentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAgentCreated?: (agent: any) => void;
}

export const StrandsOllamaAgentDialog: React.FC<StrandsOllamaAgentDialogProps> = ({
  open,
  onOpenChange,
  onAgentCreated
}) => {
  const { models, isLoading, error, ollamaStatus, refreshModels } = useOllamaModels();
  const { createAgent } = useRealStrandsAgents();
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState<Partial<RealStrandsAgentConfig>>({
    name: '',
    description: '',
    model: {
      provider: 'ollama',
      model_name: '',
      host: 'http://localhost:11434'
    },
    reasoning_patterns: {
      chain_of_thought: true,
      tree_of_thought: false,
      reflection: true,
      self_critique: false,
      multi_step_reasoning: true,
      analogical_reasoning: false
    },
    memory: {
      working_memory: true,
      episodic_memory: true,
      semantic_memory: false,
      memory_consolidation: true,
      context_window_management: true
    },
    tools: [],
    guardrails: {
      content_filter: true,
      reasoning_validator: true,
      output_sanitizer: true,
      ethical_constraints: false
    },
    performance_config: {
      max_reasoning_depth: 5,
      reflection_cycles: 2,
      temperature: 0.7,
      max_tokens: 2000
    },
    performance_profile: 'balanced',
    local_memory: {
      enabled: true,
      max_memory_size: 1000
    }
  });

  const [isCreating, setIsCreating] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  // Reset form when dialog opens
  useEffect(() => {
    if (open && models.length > 0) {
      setFormData(prev => ({
        ...prev,
        model: {
          ...prev.model!,
          model_name: models[0].id
        }
      }));
    }
  }, [open, models]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (parent: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent as keyof typeof prev],
        [field]: value
      }
    }));
  };

  const handleReasoningPatternChange = (pattern: string, enabled: boolean) => {
    setFormData(prev => ({
      ...prev,
      reasoning_patterns: {
        ...prev.reasoning_patterns!,
        [pattern]: enabled
      }
    }));
  };

  const handleMemoryChange = (memoryType: string, enabled: boolean) => {
    setFormData(prev => ({
      ...prev,
      memory: {
        ...prev.memory!,
        [memoryType]: enabled
      }
    }));
  };

  const handleCreateAgent = async () => {
    if (!formData.name?.trim()) {
      toast({
        title: "Validation Error",
        description: "Agent name is required",
        variant: "destructive"
      });
      return;
    }

    if (!formData.model?.model_name) {
      toast({
        title: "Validation Error", 
        description: "Please select an Ollama model",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);

    try {
      const agent = await createAgent(formData as RealStrandsAgentConfig);

      toast({
        title: "Real Strands Agent Created!",
        description: `${formData.name} is ready with Strands framework and Ollama model`,
      });

      onAgentCreated?.(agent);
      onOpenChange(false);

    } catch (error) {
      toast({
        title: "Failed to Create Agent",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const selectedModel = models.find(m => m.id === formData.model?.model_name);
  const enabledReasoningPatterns = Object.entries(formData.reasoning_patterns || {})
    .filter(([_, enabled]) => enabled)
    .map(([pattern, _]) => pattern);

  const reasoningPatternInfo = {
    chain_of_thought: { name: 'Chain-of-Thought', complexity: 'Basic', icon: '🔗' },
    tree_of_thought: { name: 'Tree-of-Thought', complexity: 'Advanced', icon: '🌳' },
    reflection: { name: 'Reflection', complexity: 'Intermediate', icon: '🪞' },
    self_critique: { name: 'Self-Critique', complexity: 'Advanced', icon: '🔍' },
    multi_step_reasoning: { name: 'Multi-Step', complexity: 'Intermediate', icon: '📋' },
    analogical_reasoning: { name: 'Analogical', complexity: 'Advanced', icon: '🔄' }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="flex items-center gap-2">
              <Brain className="text-purple-400" />
              <span className="text-purple-400">Strands</span>
              <span className="text-gray-400">×</span>
              <Bot className="text-blue-400" />
              <span className="text-blue-400">Ollama</span>
            </div>
            <span className="text-white">Advanced Reasoning Agent</span>
          </DialogTitle>
        </DialogHeader>

        {/* Status Banner */}
        <div className="mb-4">
          {isLoading ? (
            <Alert className="border-blue-500 bg-blue-500/10">
              <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
              <AlertDescription>Loading Ollama models...</AlertDescription>
            </Alert>
          ) : ollamaStatus === 'not_running' ? (
            <Alert className="border-red-500 bg-red-500/10">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <AlertDescription className="flex items-center justify-between">
                <span>Ollama is not running. Please start Ollama to create agents.</span>
                <Button size="sm" variant="outline" onClick={refreshModels}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="border-green-500 bg-green-500/10">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <span>Ollama ready with {models.length} models • Strands reasoning patterns available</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-purple-500/20 text-purple-300">
                      Advanced Reasoning
                    </Badge>
                    <Badge variant="secondary" className="bg-blue-500/20 text-blue-300">
                      Local Execution
                    </Badge>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-5 bg-gray-800">
            <TabsTrigger value="basic" className="data-[state=active]:bg-purple-600">
              <Bot className="h-4 w-4 mr-2" />
              Basic
            </TabsTrigger>
            <TabsTrigger value="model" className="data-[state=active]:bg-purple-600">
              <Cpu className="h-4 w-4 mr-2" />
              Model
            </TabsTrigger>
            <TabsTrigger value="reasoning" className="data-[state=active]:bg-purple-600">
              <Brain className="h-4 w-4 mr-2" />
              Reasoning
            </TabsTrigger>
            <TabsTrigger value="memory" className="data-[state=active]:bg-purple-600">
              <Database className="h-4 w-4 mr-2" />
              Memory
            </TabsTrigger>
            <TabsTrigger value="advanced" className="data-[state=active]:bg-purple-600">
              <Settings className="h-4 w-4 mr-2" />
              Advanced
            </TabsTrigger>
          </TabsList>

          {/* Basic Configuration */}
          <TabsContent value="basic" className="space-y-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="text-purple-400" />
                  Strands-Ollama Agent Identity
                </CardTitle>
                <CardDescription>
                  Create an advanced reasoning agent that combines Strands patterns with local Ollama models
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Agent Name</Label>
                  <Input
                    id="name"
                    value={formData.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g., Strategic Analysis Agent"
                    className="bg-gray-700 border-gray-600"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description || ''}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe your agent's purpose and capabilities..."
                    rows={3}
                    className="bg-gray-700 border-gray-600"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <Card className="bg-gray-700 border-gray-600">
                    <CardContent className="p-4 text-center">
                      <Brain className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                      <h4 className="font-medium text-purple-300">Advanced Reasoning</h4>
                      <p className="text-xs text-gray-400">Chain-of-Thought, Tree-of-Thought, Reflection</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gray-700 border-gray-600">
                    <CardContent className="p-4 text-center">
                      <Bot className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                      <h4 className="font-medium text-blue-300">Local Execution</h4>
                      <p className="text-xs text-gray-400">Privacy-preserving, no API costs</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gray-700 border-gray-600">
                    <CardContent className="p-4 text-center">
                      <Database className="h-8 w-8 text-green-400 mx-auto mb-2" />
                      <h4 className="font-medium text-green-300">Persistent Memory</h4>
                      <p className="text-xs text-gray-400">Long-term learning and knowledge</p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Model Configuration */}
          <TabsContent value="model" className="space-y-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle>Ollama Model Selection</CardTitle>
                <CardDescription>Choose the local model for your reasoning agent</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {models.length > 0 ? (
                  <div className="grid gap-3">
                    {models.map((model) => (
                      <div
                        key={model.id}
                        className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                          formData.model?.model_name === model.id
                            ? 'border-purple-500 bg-purple-500/10'
                            : 'border-gray-600 hover:border-gray-500'
                        }`}
                        onClick={() => handleNestedChange('model', 'model_name', model.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Cpu className="text-blue-400" size={20} />
                            <div>
                              <h4 className="font-medium text-white">{model.name}</h4>
                              <p className="text-sm text-gray-400">{model.description}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="secondary">{model.badge}</Badge>
                                <span className="text-xs text-gray-500">{model.size}</span>
                                <span className="text-xs text-gray-500">
                                  {model.contextWindow?.toLocaleString()} tokens
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-gray-400 space-y-1">
                              <div>Reasoning: {model.capabilities?.reasoning || 7}/10</div>
                              <div>Speed: {model.capabilities?.speed || 8}/10</div>
                              <div>Memory: {model.capabilities?.knowledge || 6}/10</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <Cpu size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No Ollama models available</p>
                    <p className="text-sm">Make sure Ollama is running and you have models installed</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle>Performance Profile</CardTitle>
                <CardDescription>Optimize for your use case</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  {(['speed', 'balanced', 'quality'] as const).map((profile) => (
                    <div
                      key={profile}
                      className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                        formData.performance_profile === profile
                          ? 'border-purple-500 bg-purple-500/10'
                          : 'border-gray-600 hover:border-gray-500'
                      }`}
                      onClick={() => handleInputChange('performance_profile', profile)}
                    >
                      <div className="text-center">
                        <div className="text-lg font-medium capitalize">{profile}</div>
                        <div className="text-sm text-gray-400 mt-1">
                          {profile === 'speed' && 'Fast responses, basic reasoning'}
                          {profile === 'balanced' && 'Good balance of speed and quality'}
                          {profile === 'quality' && 'Deep reasoning, slower responses'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reasoning Patterns */}
          <TabsContent value="reasoning" className="space-y-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="text-purple-400" />
                  Strands Reasoning Patterns
                </CardTitle>
                <CardDescription>
                  Select advanced reasoning capabilities for your agent
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(reasoningPatternInfo).map(([pattern, info]) => (
                  <div key={pattern} className="flex items-center justify-between p-4 rounded-lg border border-gray-600">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{info.icon}</span>
                      <div>
                        <Label className="text-white">{info.name}</Label>
                        <p className="text-sm text-gray-400">
                          {pattern === 'chain_of_thought' && 'Step-by-step logical reasoning'}
                          {pattern === 'tree_of_thought' && 'Explore multiple solution paths'}
                          {pattern === 'reflection' && 'Self-evaluate and improve reasoning'}
                          {pattern === 'self_critique' && 'Critical analysis of outputs'}
                          {pattern === 'multi_step_reasoning' && 'Break complex problems down'}
                          {pattern === 'analogical_reasoning' && 'Use past experiences for new problems'}
                        </p>
                        <Badge 
                          variant="secondary" 
                          className={`mt-1 ${
                            info.complexity === 'Basic' ? 'bg-green-500/20 text-green-300' :
                            info.complexity === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-300' :
                            'bg-red-500/20 text-red-300'
                          }`}
                        >
                          {info.complexity}
                        </Badge>
                      </div>
                    </div>
                    <Switch
                      checked={formData.reasoning_patterns?.[pattern as keyof typeof formData.reasoning_patterns] || false}
                      onCheckedChange={(checked) => handleReasoningPatternChange(pattern, checked)}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle>Performance Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Reasoning Depth: {formData.performance_config?.max_reasoning_depth}</Label>
                  <Slider
                    value={[formData.performance_config?.max_reasoning_depth || 5]}
                    onValueChange={(value) => handleNestedChange('performance_config', 'max_reasoning_depth', value[0])}
                    max={10}
                    min={1}
                    step={1}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Reflection Cycles: {formData.performance_config?.reflection_cycles}</Label>
                  <Slider
                    value={[formData.performance_config?.reflection_cycles || 2]}
                    onValueChange={(value) => handleNestedChange('performance_config', 'reflection_cycles', value[0])}
                    max={5}
                    min={1}
                    step={1}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Temperature: {formData.performance_config?.temperature}</Label>
                  <Slider
                    value={[formData.performance_config?.temperature || 0.7]}
                    onValueChange={(value) => handleNestedChange('performance_config', 'temperature', value[0])}
                    max={2}
                    min={0}
                    step={0.1}
                    className="mt-2"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Memory Configuration */}
          <TabsContent value="memory" className="space-y-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="text-green-400" />
                  Memory Systems
                </CardTitle>
                <CardDescription>Configure how your agent stores and retrieves information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { key: 'working_memory', name: 'Working Memory', desc: 'Short-term context for current reasoning', icon: '🧠' },
                  { key: 'episodic_memory', name: 'Episodic Memory', desc: 'Specific experiences and events', icon: '📚' },
                  { key: 'semantic_memory', name: 'Semantic Memory', desc: 'General knowledge and facts', icon: '🔍' },
                  { key: 'memory_consolidation', name: 'Memory Consolidation', desc: 'Strengthen important memories over time', icon: '💎' },
                  { key: 'context_window_management', name: 'Context Management', desc: 'Intelligent token usage optimization', icon: '⚡' }
                ].map((memory) => (
                  <div key={memory.key} className="flex items-center justify-between p-4 rounded-lg border border-gray-600">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{memory.icon}</span>
                      <div>
                        <Label className="text-white">{memory.name}</Label>
                        <p className="text-sm text-gray-400">{memory.desc}</p>
                      </div>
                    </div>
                    <Switch
                      checked={formData.memory?.[memory.key as keyof typeof formData.memory] || false}
                      onCheckedChange={(checked) => handleMemoryChange(memory.key, checked)}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Advanced Configuration */}
          <TabsContent value="advanced" className="space-y-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle>Guardrails & Safety</CardTitle>
                <CardDescription>Configure safety measures and output validation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { key: 'content_filter', name: 'Content Filter', desc: 'Filter inappropriate content' },
                  { key: 'reasoning_validator', name: 'Reasoning Validator', desc: 'Validate logical consistency' },
                  { key: 'output_sanitizer', name: 'Output Sanitizer', desc: 'Clean and format outputs' },
                  { key: 'ethical_constraints', name: 'Ethical Constraints', desc: 'Apply ethical guidelines' }
                ].map((guardrail) => (
                  <div key={guardrail.key} className="flex items-center justify-between">
                    <div>
                      <Label>{guardrail.name}</Label>
                      <p className="text-sm text-gray-400">{guardrail.desc}</p>
                    </div>
                    <Switch
                      checked={formData.guardrails?.[guardrail.key as keyof typeof formData.guardrails] || false}
                      onCheckedChange={(checked) => handleNestedChange('guardrails', guardrail.key, checked)}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle>Local Memory Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Local Memory</Label>
                    <p className="text-sm text-gray-400">Store memories locally for persistence</p>
                  </div>
                  <Switch
                    checked={formData.local_memory?.enabled || false}
                    onCheckedChange={(checked) => handleNestedChange('local_memory', 'enabled', checked)}
                  />
                </div>

                {formData.local_memory?.enabled && (
                  <div>
                    <Label>Max Memory Size: {formData.local_memory?.max_memory_size || 1000} items</Label>
                    <Slider
                      value={[formData.local_memory?.max_memory_size || 1000]}
                      onValueChange={(value) => handleNestedChange('local_memory', 'max_memory_size', value[0])}
                      max={10000}
                      min={100}
                      step={100}
                      className="mt-2"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Summary and Actions */}
        <div className="border-t border-gray-700 pt-4">
          <div className="mb-4">
            <h4 className="font-medium mb-2">Agent Summary</h4>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="bg-purple-500/20 text-purple-300">
                {enabledReasoningPatterns.length} Reasoning Patterns
              </Badge>
              <Badge variant="secondary" className="bg-blue-500/20 text-blue-300">
                {selectedModel?.name || 'No Model'}
              </Badge>
              <Badge variant="secondary" className="bg-green-500/20 text-green-300">
                {Object.values(formData.memory || {}).filter(Boolean).length} Memory Systems
              </Badge>
              <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-300">
                {formData.performance_profile} Performance
              </Badge>
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateAgent}
              disabled={isCreating || ollamaStatus !== 'running' || !formData.name?.trim() || !formData.model?.model_name}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating Agent...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Create Strands-Ollama Agent
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};