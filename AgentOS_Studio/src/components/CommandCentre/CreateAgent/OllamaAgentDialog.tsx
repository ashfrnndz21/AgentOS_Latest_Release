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
  Zap
} from 'lucide-react';
import { useOllamaModels } from '@/hooks/useOllamaModels';
import { ollamaAgentService, OllamaAgentConfig } from '@/lib/services/OllamaAgentService';
import { useToast } from '@/hooks/use-toast';
import { EnhancedCapabilities } from './steps/EnhancedCapabilities';
import { EnhancedGuardrails } from './steps/EnhancedGuardrails';

interface OllamaAgentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAgentCreated?: (agent: OllamaAgentConfig) => void;
}

export const OllamaAgentDialog: React.FC<OllamaAgentDialogProps> = ({
  open,
  onOpenChange,
  onAgentCreated
}) => {
  const { models, isLoading, error, ollamaStatus, refreshModels } = useOllamaModels();
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    description: '',
    model: '',
    personality: '',
    expertise: '',
    systemPrompt: '',
    temperature: 0.7,
    maxTokens: 1000,
    tools: [] as string[],
    memory: {
      shortTerm: true,
      longTerm: false,
      contextual: true
    },
    ragEnabled: false,
    knowledgeBases: [] as string[],
    behavior: {
      response_style: 'professional',
      communication_tone: 'helpful'
    }
  });

  // Enhanced capabilities state
  const [enhancedCapabilities, setEnhancedCapabilities] = useState({
    conversation: {
      enabled: true,
      level: 'intermediate' as const
    },
    analysis: {
      enabled: true,
      level: 'intermediate' as const
    },
    creativity: {
      enabled: true,
      level: 'basic' as const
    },
    reasoning: {
      enabled: true,
      level: 'intermediate' as const
    }
  });

  // Enhanced guardrails state
  const [enhancedGuardrails, setEnhancedGuardrails] = useState({
    global: false,
    local: false,
    piiRedaction: {
      enabled: true,
      strategy: 'placeholder' as const,
      customTypes: ['Employee ID', 'Badge Number'] as string[],
      customPatterns: ['\\bEMP-\\d{6}\\b'] as string[],
      maskCharacter: '*',
      placeholderText: '[REDACTED]'
    },
    contentFilter: {
      enabled: true,
      level: 'moderate' as const,
      customKeywords: ['confidential', 'internal'] as string[],
      allowedDomains: [] as string[],
      blockedPhrases: [] as string[]
    },
    behaviorLimits: {
      enabled: false,
      customLimits: [] as string[],
      responseMaxLength: 2000,
      requireApproval: false
    },
    customRules: [] as any[]
  });

  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  // Agent templates for Ollama agents
  const agentTemplates = [
    {
      id: 'assistant',
      name: 'Personal Assistant',
      role: 'AI Personal Assistant',
      expertise: 'task management, scheduling, information retrieval, general assistance',
      personality: 'Helpful, organized, and proactive. I assist with daily tasks and provide clear, actionable guidance.',
      description: 'A versatile personal assistant for productivity and daily task management.',
      category: 'Productivity',
      systemPrompt: 'You are a helpful personal assistant. Provide clear, organized, and actionable responses to help users with their tasks and questions.'
    },
    {
      id: 'analyst',
      name: 'Data Analyst',
      role: 'Data Analysis Specialist',
      expertise: 'data analysis, statistics, pattern recognition, insights generation',
      personality: 'Analytical, detail-oriented, and methodical. I break down complex data into clear insights.',
      description: 'Specialized in analyzing data, identifying patterns, and generating actionable insights.',
      category: 'Analytics',
      systemPrompt: 'You are a data analysis expert. Analyze information systematically, identify patterns, and provide clear, data-driven insights and recommendations.'
    },
    {
      id: 'creative',
      name: 'Creative Writer',
      role: 'Creative Content Specialist',
      expertise: 'creative writing, storytelling, content creation, brainstorming',
      personality: 'Creative, imaginative, and inspiring. I help bring ideas to life through engaging content.',
      description: 'Expert in creative writing, storytelling, and innovative content creation.',
      category: 'Creative',
      systemPrompt: 'You are a creative writing expert. Generate engaging, original content with creativity and flair. Help users brainstorm and develop their creative ideas.'
    },
    {
      id: 'technical',
      name: 'Technical Expert',
      role: 'Technical Consultant',
      expertise: 'software development, system architecture, troubleshooting, technical guidance',
      personality: 'Precise, logical, and solution-focused. I provide clear technical guidance and best practices.',
      description: 'Specialized in technical problem-solving and software development guidance.',
      category: 'Technical',
      systemPrompt: 'You are a technical expert. Provide accurate, detailed technical guidance with best practices. Break down complex technical concepts into understandable explanations.'
    },
    {
      id: 'educator',
      name: 'Learning Coach',
      role: 'Educational Specialist',
      expertise: 'teaching, curriculum design, learning strategies, knowledge transfer',
      personality: 'Patient, encouraging, and knowledgeable. I make complex topics easy to understand.',
      description: 'Expert in education and learning, helping users understand and master new concepts.',
      category: 'Education',
      systemPrompt: 'You are an educational expert. Explain concepts clearly, provide examples, and adapt your teaching style to help users learn effectively.'
    }
  ];

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      const defaultModel = models.length > 0 ? models[0].id : '';
      setFormData({
        name: '',
        role: '',
        description: '',
        model: defaultModel,
        personality: '',
        expertise: '',
        systemPrompt: 'You are a helpful AI assistant. Provide clear, accurate, and helpful responses.',
        temperature: 0.7,
        maxTokens: 1000,
        tools: [],
        memory: {
          shortTerm: true,
          longTerm: false,
          contextual: true
        },
        ragEnabled: false,
        knowledgeBases: [],
        behavior: {
          response_style: 'professional',
          communication_tone: 'helpful'
        }
      });

      // Reset enhanced capabilities
      setEnhancedCapabilities({
        conversation: {
          enabled: true,
          level: 'intermediate'
        },
        analysis: {
          enabled: true,
          level: 'intermediate'
        },
        creativity: {
          enabled: true,
          level: 'basic'
        },
        reasoning: {
          enabled: true,
          level: 'intermediate'
        }
      });

      // Reset enhanced guardrails
      setEnhancedGuardrails({
        global: false,
        local: false,
        piiRedaction: {
          enabled: true,
          strategy: 'placeholder',
          customTypes: ['Employee ID', 'Badge Number'],
          customPatterns: ['\\bEMP-\\d{6}\\b'],
          maskCharacter: '*',
          placeholderText: '[REDACTED]'
        },
        contentFilter: {
          enabled: true,
          level: 'moderate',
          customKeywords: ['confidential', 'internal'],
          allowedDomains: [],
          blockedPhrases: []
        },
        behaviorLimits: {
          enabled: false,
          customLimits: [],
          responseMaxLength: 2000,
          requireApproval: false
        },
        customRules: []
      });

      setSelectedTemplate(null);
      setActiveTab('basic');
    }
  }, [open, models]);

  const handleTemplateSelect = (template: any) => {
    setSelectedTemplate(template);
    setFormData(prev => ({
      ...prev,
      name: template.name,
      role: template.role,
      description: template.description,
      expertise: template.expertise,
      personality: template.personality,
      systemPrompt: template.systemPrompt
    }));
  };

  // Auto-select first model when models load
  useEffect(() => {
    if (models.length > 0 && !formData.model) {
      setFormData(prev => ({ ...prev, model: models[0].id }));
    }
  }, [models, formData.model]);

  const handleInputChange = (field: string, value: any) => {
    console.log(`🔄 Field changed: ${field} = ${value}`);
    if (field === 'model') {
      console.log('📱 Model selected:', value);
      // Show immediate toast feedback for model selection
      toast({
        title: "Model Selected",
        description: `Selected: ${value}`,
      });
    }
    setFormData(prev => ({ ...prev, [field]: value }));
    console.log('📋 Updated formData:', { ...formData, [field]: value });
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

  const handleCreateAgent = async () => {
    // Enhanced validation with specific model check
    const requiredFields = ['name', 'role', 'personality', 'expertise'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]?.toString().trim());
    
    // Special validation for model
    if (!formData.model || formData.model.trim() === '') {
      toast({
        title: "Model Selection Required",
        description: "Please select a model from the Model tab before creating the agent.",
        variant: "destructive"
      });
      return;
    }
    
    if (missingFields.length > 0) {
      toast({
        title: "Validation Error",
        description: `Please fill in: ${missingFields.join(', ')}`,
        variant: "destructive"
      });
      return;
    }

    // Final validation log
    console.log('=== AGENT CREATION VALIDATION ===');
    console.log('Selected model:', formData.model);
    console.log('All required fields filled:', { 
      name: formData.name, 
      role: formData.role, 
      model: formData.model,
      personality: formData.personality,
      expertise: formData.expertise
    });
    console.log('=== VALIDATION PASSED ===');

    setIsCreating(true);

    try {
      console.log('🚀 CREATING AGENT WITH CONFIG:');
      console.log('Model being sent:', formData.model);
      console.log('Full form data:', formData);
      
      // Show model selection in toast
      toast({
        title: "Creating Agent",
        description: `Using model: ${formData.model}`,
      });
      
      const agentConfig = await ollamaAgentService.createAgent({
        name: formData.name,
        role: formData.role,
        description: formData.description,
        model: formData.model,
        personality: formData.personality,
        expertise: formData.expertise,
        systemPrompt: formData.systemPrompt,
        temperature: formData.temperature,
        maxTokens: formData.maxTokens,
        tools: formData.tools,
        memory: formData.memory,
        ragEnabled: formData.ragEnabled,
        knowledgeBases: formData.knowledgeBases,
        enhancedCapabilities,
        enhancedGuardrails,
        behavior: formData.behavior
      });

      console.log('✅ AGENT CREATED SUCCESSFULLY:');
      console.log('Returned agent model:', agentConfig.model);
      console.log('Full agent config:', agentConfig);

      // Show success with model confirmation
      toast({
        title: "Agent Created Successfully!",
        description: `${agentConfig.name} is ready with model: ${agentConfig.model || 'No model configured'}`,
      });
      
      // Show warning if model is missing
      if (!agentConfig.model || agentConfig.model.trim() === '') {
        toast({
          title: "⚠️ Model Configuration Issue",
          description: "Agent was created but no model was saved. Please check the configuration.",
          variant: "destructive"
        });
      }

      onAgentCreated?.(agentConfig);
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

  const canCreateAgent = () => {
    return formData.name.trim() && 
           formData.role.trim() && 
           formData.model && 
           formData.personality.trim() && 
           formData.expertise.trim();
  };

  const canProceedToNextTab = () => {
    switch (activeTab) {
      case 'basic':
        const canProceed = selectedTemplate && formData.name.trim() && formData.role.trim();
        console.log('Basic tab validation:', { selectedTemplate: !!selectedTemplate, name: formData.name.trim(), role: formData.role.trim(), canProceed });
        return canProceed;
      case 'model':
        return formData.model;
      case 'behavior':
        return formData.personality.trim() && formData.expertise.trim();
      case 'advanced':
        return canCreateAgent();
      default:
        return false;
    }
  };

  const selectedModel = models.find(m => m.id === formData.model);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Bot className="text-purple-400" />
            Create Ollama Agent
          </DialogTitle>
        </DialogHeader>

        {/* Ollama Status */}
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
          ) : error ? (
            <Alert className="border-red-500 bg-red-500/10">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <AlertDescription className="flex items-center justify-between">
                <span>{error}</span>
                <Button size="sm" variant="outline" onClick={refreshModels}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="border-green-500 bg-green-500/10">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <AlertDescription className="flex items-center justify-between">
                <span>Ollama is running with {models.length} models available</span>
                <Button size="sm" variant="outline" onClick={refreshModels}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </AlertDescription>
            </Alert>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 bg-gray-800">
            <TabsTrigger value="basic" className="data-[state=active]:bg-purple-600 relative">
              <Bot className="h-4 w-4 mr-2" />
              Basic
              {selectedTemplate && formData.name.trim() && formData.role.trim() && (
                <CheckCircle className="h-3 w-3 text-green-400 absolute -top-1 -right-1" />
              )}
            </TabsTrigger>
            <TabsTrigger value="model" className="data-[state=active]:bg-purple-600 relative">
              <Cpu className="h-4 w-4 mr-2" />
              Model
              {formData.model && (
                <CheckCircle className="h-3 w-3 text-green-400 absolute -top-1 -right-1" />
              )}
            </TabsTrigger>
            <TabsTrigger value="behavior" className="data-[state=active]:bg-purple-600 relative">
              <MessageSquare className="h-4 w-4 mr-2" />
              Behavior
              {formData.personality.trim() && formData.expertise.trim() && (
                <CheckCircle className="h-3 w-3 text-green-400 absolute -top-1 -right-1" />
              )}
            </TabsTrigger>
            <TabsTrigger value="advanced" className="data-[state=active]:bg-purple-600 relative">
              <Settings className="h-4 w-4 mr-2" />
              Advanced
              {canCreateAgent() && (
                <CheckCircle className="h-3 w-3 text-green-400 absolute -top-1 -right-1" />
              )}
            </TabsTrigger>
          </TabsList>

          {/* Progress Indicator */}
          <div className="flex items-center justify-center space-x-2 py-2">
            {['basic', 'model', 'behavior', 'advanced'].map((tab, index) => (
              <div key={tab} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  activeTab === tab 
                    ? 'bg-purple-600 text-white' 
                    : canProceedToNextTab() && ['basic', 'model', 'behavior'].indexOf(activeTab) >= index
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-700 text-gray-400'
                }`}>
                  {canProceedToNextTab() && ['basic', 'model', 'behavior'].indexOf(activeTab) > index ? (
                    <CheckCircle size={16} />
                  ) : (
                    index + 1
                  )}
                </div>
                {index < 3 && (
                  <div className={`w-12 h-0.5 transition-colors ${
                    ['basic', 'model', 'behavior'].indexOf(activeTab) > index ? 'bg-green-600' : 'bg-gray-700'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Debug Panel - Shows current form state */}
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 text-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Debug Info:</span>
              <Badge variant={formData.model ? "default" : "destructive"} className="text-xs">
                {formData.model ? "Model Selected" : "No Model"}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-2 text-gray-300">
              <div>Name: <span className="text-white">{formData.name || 'Not set'}</span></div>
              <div>Role: <span className="text-white">{formData.role || 'Not set'}</span></div>
              <div>Model: <span className={formData.model ? "text-green-400" : "text-red-400"}>
                {formData.model || 'Not selected'}
              </span></div>
              <div>Temperature: <span className="text-white">{formData.temperature}</span></div>
            </div>
          </div>

          {/* Basic Configuration */}
          <TabsContent value="basic" className="space-y-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle>Agent Templates</CardTitle>
                <CardDescription>Choose a template or create a custom agent</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {agentTemplates.map((template) => (
                    <div
                      key={template.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                        selectedTemplate?.id === template.id
                          ? 'border-purple-500 bg-purple-500/10'
                          : 'border-gray-600 hover:border-gray-500'
                      }`}
                      onClick={() => handleTemplateSelect(template)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                          <Bot size={16} className="text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-white">{template.name}</h4>
                          <p className="text-sm text-purple-400">{template.role}</p>
                          <p className="text-xs text-gray-400 mt-1">{template.description}</p>
                          <Badge variant="outline" className="mt-2 text-xs">
                            {template.category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Custom Option */}
                  <div
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedTemplate?.id === 'custom'
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-gray-600 hover:border-gray-500'
                    }`}
                    onClick={() => {
                      setSelectedTemplate({ id: 'custom', name: 'Custom Agent', role: '', expertise: '', personality: '', description: '', category: 'Custom', systemPrompt: 'You are a helpful AI assistant. Provide clear, accurate, and helpful responses.' });
                      // Clear form data for custom agent
                      setFormData(prev => ({
                        ...prev,
                        name: '',
                        role: '',
                        description: '',
                        expertise: '',
                        personality: '',
                        systemPrompt: 'You are a helpful AI assistant. Provide clear, accurate, and helpful responses.'
                      }));
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0">
                        <Zap size={16} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-white">Custom Agent</h4>
                        <p className="text-sm text-gray-400">Build from scratch</p>
                        <p className="text-xs text-gray-400 mt-1">Create a completely custom agent</p>
                        <Badge variant="outline" className="mt-2 text-xs">
                          Custom
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {selectedTemplate && (
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle>Agent Identity</CardTitle>
                  <CardDescription>Define your agent's basic information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Agent Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="e.g., Customer Support Agent"
                      className="bg-gray-700 border-gray-600"
                    />
                  </div>

                  <div>
                    <Label htmlFor="role">Professional Role</Label>
                    <Input
                      id="role"
                      value={formData.role}
                      onChange={(e) => handleInputChange('role', e.target.value)}
                      placeholder="e.g., AI Assistant Specialist"
                      className="bg-gray-700 border-gray-600"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Brief description of the agent's capabilities and purpose"
                      className="bg-gray-700 border-gray-600"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Model Configuration */}
          <TabsContent value="model" className="space-y-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle>Model Selection</CardTitle>
                <CardDescription>Choose the Ollama model for your agent</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {models.length > 0 ? (
                  <div className="grid gap-3">
                    {models.map((model) => (
                      <div
                        key={model.id}
                        className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                          formData.model === model.id
                            ? 'border-purple-500 bg-purple-500/10'
                            : 'border-gray-600 hover:border-gray-500'
                        }`}
                        onClick={() => handleInputChange('model', model.id)}
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
                          <div className="flex items-center gap-2">
                            {model.capabilities && (
                              <div className="text-right text-xs text-gray-400">
                                <div>Reasoning: {model.capabilities.reasoning}/10</div>
                                <div>Speed: {model.capabilities.speed}/10</div>
                                <div>Knowledge: {model.capabilities.knowledge}/10</div>
                              </div>
                            )}
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

            {selectedModel && (
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle>Selected Model: {selectedModel.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Family:</span>
                      <span className="ml-2 text-white">{selectedModel.family}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Size:</span>
                      <span className="ml-2 text-white">{selectedModel.size}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Context Window:</span>
                      <span className="ml-2 text-white">{selectedModel.contextWindow?.toLocaleString()} tokens</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Cost:</span>
                      <span className="ml-2 text-green-400">Free (Local)</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Behavior Configuration */}
          <TabsContent value="behavior" className="space-y-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle>Personality & Expertise</CardTitle>
                <CardDescription>Define how your agent communicates and what it specializes in</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="personality">Personality & Communication Style</Label>
                  <Textarea
                    id="personality"
                    value={formData.personality}
                    onChange={(e) => handleInputChange('personality', e.target.value)}
                    placeholder="Describe how the agent communicates and behaves (e.g., Professional, friendly, analytical...)"
                    className="bg-gray-700 border-gray-600"
                    rows={3}
                  />
                  <p className="text-sm text-gray-400 mt-1">
                    This defines the agent's communication style and personality
                  </p>
                </div>

                <div>
                  <Label htmlFor="expertise">Areas of Expertise</Label>
                  <Textarea
                    id="expertise"
                    value={formData.expertise}
                    onChange={(e) => handleInputChange('expertise', e.target.value)}
                    placeholder="List the agent's areas of expertise (e.g., customer service, technical support, creative writing...)"
                    className="bg-gray-700 border-gray-600"
                    rows={3}
                  />
                  <p className="text-sm text-gray-400 mt-1">
                    Specify the domains and topics the agent excels at
                  </p>
                </div>

                <div>
                  <Label htmlFor="systemPrompt">System Prompt</Label>
                  <Textarea
                    id="systemPrompt"
                    value={formData.systemPrompt}
                    onChange={(e) => handleInputChange('systemPrompt', e.target.value)}
                    placeholder="Define your agent's role, personality, and instructions..."
                    rows={4}
                    className="bg-gray-700 border-gray-600"
                  />
                  <p className="text-sm text-gray-400 mt-1">
                    This prompt defines how your agent behaves and responds
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle>Response Behavior</CardTitle>
                <CardDescription>Configure how your agent generates responses</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Temperature: {formData.temperature}</Label>
                  <Slider
                    value={[formData.temperature]}
                    onValueChange={(value) => handleInputChange('temperature', value[0])}
                    max={2}
                    min={0}
                    step={0.1}
                    className="mt-2"
                  />
                  <p className="text-sm text-gray-400 mt-1">
                    Lower values make responses more focused, higher values more creative
                  </p>
                </div>

                <div>
                  <Label>Max Tokens: {formData.maxTokens}</Label>
                  <Slider
                    value={[formData.maxTokens]}
                    onValueChange={(value) => handleInputChange('maxTokens', value[0])}
                    max={4000}
                    min={100}
                    step={100}
                    className="mt-2"
                  />
                  <p className="text-sm text-gray-400 mt-1">
                    Maximum length of generated responses
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle>Memory Configuration</CardTitle>
                <CardDescription>Configure how your agent remembers information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Short-term Memory</Label>
                    <p className="text-sm text-gray-400">Remember recent conversation context</p>
                  </div>
                  <Switch
                    checked={formData.memory.shortTerm}
                    onCheckedChange={(checked) => handleNestedChange('memory', 'shortTerm', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Long-term Memory</Label>
                    <p className="text-sm text-gray-400">Persist information across sessions</p>
                  </div>
                  <Switch
                    checked={formData.memory.longTerm}
                    onCheckedChange={(checked) => handleNestedChange('memory', 'longTerm', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Contextual Memory</Label>
                    <p className="text-sm text-gray-400">Understand conversation flow and references</p>
                  </div>
                  <Switch
                    checked={formData.memory.contextual}
                    onCheckedChange={(checked) => handleNestedChange('memory', 'contextual', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Advanced Configuration */}
          <TabsContent value="advanced" className="space-y-4">
            <Tabs defaultValue="capabilities" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3 bg-gray-800">
                <TabsTrigger value="capabilities" className="data-[state=active]:bg-purple-600">
                  Capabilities
                </TabsTrigger>
                <TabsTrigger value="guardrails" className="data-[state=active]:bg-purple-600">
                  Guardrails
                </TabsTrigger>
                <TabsTrigger value="rag" className="data-[state=active]:bg-purple-600">
                  RAG & Preview
                </TabsTrigger>
              </TabsList>

              <TabsContent value="capabilities">
                <EnhancedCapabilities
                  capabilities={enhancedCapabilities}
                  onUpdate={setEnhancedCapabilities}
                />
              </TabsContent>

              <TabsContent value="guardrails">
                <EnhancedGuardrails
                  guardrails={enhancedGuardrails}
                  onUpdate={setEnhancedGuardrails}
                />
              </TabsContent>

              <TabsContent value="rag" className="space-y-4">
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle>RAG Integration</CardTitle>
                    <CardDescription>Connect your agent to document knowledge bases</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Enable RAG</Label>
                        <p className="text-sm text-gray-400">Allow agent to search and use document knowledge</p>
                      </div>
                      <Switch
                        checked={formData.ragEnabled}
                        onCheckedChange={(checked) => handleInputChange('ragEnabled', checked)}
                      />
                    </div>

                    {formData.ragEnabled && (
                      <Alert className="border-blue-500 bg-blue-500/10">
                        <Database className="h-4 w-4 text-blue-400" />
                        <AlertDescription>
                          RAG integration will allow your agent to search and reference uploaded documents
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>

                {/* Agent Preview */}
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle>Agent Preview</CardTitle>
                    <CardDescription>Review your agent configuration</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                        <Bot size={20} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-white">{formData.name || 'Unnamed Agent'}</h4>
                        <p className="text-sm text-purple-400">{formData.role || 'No role defined'}</p>
                        <p className="text-xs text-gray-400 mt-1">{formData.description || 'No description'}</p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {formData.model || 'No model'}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            Ollama Agent
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-700">
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="text-gray-300">Temperature:</span>
                          <span className="ml-2 text-white">{formData.temperature}</span>
                        </div>
                        <div>
                          <span className="text-gray-300">Max Tokens:</span>
                          <span className="ml-2 text-white">{formData.maxTokens}</span>
                        </div>
                        <div>
                          <span className="text-gray-300">RAG Enabled:</span>
                          <span className="ml-2 text-white">{formData.ragEnabled ? 'Yes' : 'No'}</span>
                        </div>
                        <div>
                          <span className="text-gray-300">PII Protection:</span>
                          <span className="ml-2 text-white">
                            {enhancedGuardrails.piiRedaction.enabled 
                              ? `${enhancedGuardrails.piiRedaction.strategy} (${enhancedGuardrails.piiRedaction.customTypes.length + enhancedGuardrails.piiRedaction.customPatterns.length} custom)`
                              : 'Disabled'
                            }
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-700">
                      <h5 className="text-sm font-medium text-white mb-2">Active Capabilities</h5>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(enhancedCapabilities).map(([name, config]) => 
                          config.enabled && (
                            <Badge key={name} variant="secondary" className="text-xs capitalize">
                              {name} ({config.level})
                            </Badge>
                          )
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-700">
                      <h5 className="text-sm font-medium text-white mb-2">Safety Features</h5>
                      <div className="flex flex-wrap gap-1">
                        {enhancedGuardrails.global && <Badge variant="outline" className="text-xs">Global Guardrails</Badge>}
                        {enhancedGuardrails.local && <Badge variant="outline" className="text-xs">Local Guardrails</Badge>}
                        {enhancedGuardrails.piiRedaction.enabled && (
                          <Badge variant="outline" className="text-xs">
                            PII Protection ({enhancedGuardrails.piiRedaction.customTypes.length + enhancedGuardrails.piiRedaction.customPatterns.length} custom)
                          </Badge>
                        )}
                        {enhancedGuardrails.contentFilter.enabled && (
                          <Badge variant="outline" className="text-xs">
                            Content Filter ({enhancedGuardrails.contentFilter.customKeywords.length} keywords)
                          </Badge>
                        )}
                        {enhancedGuardrails.behaviorLimits.enabled && (
                          <Badge variant="outline" className="text-xs">
                            Behavior Limits ({enhancedGuardrails.behaviorLimits.customLimits.length} custom)
                          </Badge>
                        )}
                        {enhancedGuardrails.customRules.length > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {enhancedGuardrails.customRules.filter(r => r.enabled).length} Custom Rules
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Validation Status */}
                    <div className="mt-4 pt-4 border-t border-gray-700">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-2">
                          {formData.name?.trim() ? <CheckCircle size={12} className="text-green-400" /> : <AlertCircle size={12} className="text-red-400" />}
                          <span>Name</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {formData.role?.trim() ? <CheckCircle size={12} className="text-green-400" /> : <AlertCircle size={12} className="text-red-400" />}
                          <span>Role</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {formData.model ? <CheckCircle size={12} className="text-green-400" /> : <AlertCircle size={12} className="text-red-400" />}
                          <span>Model</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {formData.personality?.trim() ? <CheckCircle size={12} className="text-green-400" /> : <AlertCircle size={12} className="text-red-400" />}
                          <span>Personality</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Agent Preview */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle>Agent Preview</CardTitle>
                <CardDescription>Review your agent configuration</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                    <Bot size={20} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-white">{formData.name || 'Unnamed Agent'}</h4>
                    <p className="text-sm text-purple-400">{formData.role || 'No role defined'}</p>
                    <p className="text-xs text-gray-400 mt-1">{formData.description || 'No description'}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {formData.model || 'No model'}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        Ollama Agent
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-gray-300">Temperature:</span>
                      <span className="ml-2 text-white">{formData.temperature}</span>
                    </div>
                    <div>
                      <span className="text-gray-300">Max Tokens:</span>
                      <span className="ml-2 text-white">{formData.maxTokens}</span>
                    </div>
                    <div>
                      <span className="text-gray-300">RAG Enabled:</span>
                      <span className="ml-2 text-white">{formData.ragEnabled ? 'Yes' : 'No'}</span>
                    </div>
                    <div>
                      <span className="text-gray-300">PII Protection:</span>
                      <span className="ml-2 text-white">{enhancedGuardrails.piiRedaction.enabled ? 'Enabled' : 'Disabled'}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-700">
                  <h5 className="text-sm font-medium text-white mb-2">Active Capabilities</h5>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(enhancedCapabilities).map(([name, config]) => 
                      config.enabled && (
                        <Badge key={name} variant="secondary" className="text-xs capitalize">
                          {name} ({config.level})
                        </Badge>
                      )
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-700">
                  <h5 className="text-sm font-medium text-white mb-2">Safety Features</h5>
                  <div className="flex flex-wrap gap-1">
                    {enhancedGuardrails.global && <Badge variant="outline" className="text-xs">Global Guardrails</Badge>}
                    {enhancedGuardrails.local && <Badge variant="outline" className="text-xs">Local Guardrails</Badge>}
                    {enhancedGuardrails.piiRedaction.enabled && <Badge variant="outline" className="text-xs">PII Protection</Badge>}
                    {enhancedGuardrails.contentFilter.enabled && <Badge variant="outline" className="text-xs">Content Filter</Badge>}
                    {enhancedGuardrails.behaviorLimits.enabled && <Badge variant="outline" className="text-xs">Behavior Limits</Badge>}
                  </div>
                </div>

                {/* Validation Status */}
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      {formData.name?.trim() ? <CheckCircle size={12} className="text-green-400" /> : <AlertCircle size={12} className="text-red-400" />}
                      <span>Name</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {formData.role?.trim() ? <CheckCircle size={12} className="text-green-400" /> : <AlertCircle size={12} className="text-red-400" />}
                      <span>Role</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {formData.model ? <CheckCircle size={12} className="text-green-400" /> : <AlertCircle size={12} className="text-red-400" />}
                      <span>Model</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {formData.personality?.trim() ? <CheckCircle size={12} className="text-green-400" /> : <AlertCircle size={12} className="text-red-400" />}
                      <span>Personality</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {formData.expertise?.trim() ? <CheckCircle size={12} className="text-green-400" /> : <AlertCircle size={12} className="text-red-400" />}
                      <span>Expertise</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {canCreateAgent() ? <CheckCircle size={12} className="text-green-400" /> : <AlertCircle size={12} className="text-red-400" />}
                      <span>Ready to Create</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex justify-between pt-4 border-t border-gray-700">
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isCreating}>
              Cancel
            </Button>
            {activeTab !== 'basic' && (
              <Button 
                variant="outline" 
                onClick={() => {
                  const tabs = ['basic', 'model', 'behavior', 'advanced'];
                  const currentIndex = tabs.indexOf(activeTab);
                  if (currentIndex > 0) {
                    setActiveTab(tabs[currentIndex - 1]);
                  }
                }}
                disabled={isCreating}
              >
                ← Back
              </Button>
            )}
          </div>
          
          <div className="flex gap-2">
            {activeTab !== 'advanced' ? (
              <Button 
                onClick={() => {
                  console.log('Next button clicked!');
                  const tabs = ['basic', 'model', 'behavior', 'advanced'];
                  const currentIndex = tabs.indexOf(activeTab);
                  if (currentIndex < tabs.length - 1) {
                    setActiveTab(tabs[currentIndex + 1]);
                  }
                }}
                disabled={!canProceedToNextTab()}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Next → {canProceedToNextTab() ? '✓' : '✗'}
              </Button>
            ) : (
              <Button
                onClick={handleCreateAgent}
                disabled={isCreating || ollamaStatus !== 'running' || !canCreateAgent()}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating Agent...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Create Agent
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