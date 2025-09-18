import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { 
  Plus, 
  Bot, 
  Sparkles, 
  User, 
  Settings, 
  Check, 
  X, 
  Loader2, 
  FileText, 
  Brain, 
  MessageSquare, 
  Shield, 
  CheckCircle, 
  AlertCircle,
  Play,
  Cpu,
  Database
} from 'lucide-react';
import { EnhancedCapabilities } from '@/components/CommandCentre/CreateAgent/steps/EnhancedCapabilities';
import { EnhancedGuardrails } from '@/components/CommandCentre/CreateAgent/steps/EnhancedGuardrails';

interface AgentTemplate {
  id: string;
  name: string;
  role: string;
  expertise: string;
  personality: string;
  description: string;
  category: string;
}

interface DocumentAgentCreatorProps {
  availableModels: string[];
  onAgentCreated: () => void;
}

export const DocumentAgentCreator: React.FC<DocumentAgentCreatorProps> = ({
  availableModels,
  onAgentCreated
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [selectedTemplate, setSelectedTemplate] = useState<AgentTemplate | null>(null);
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    description: '',
    model: '',
    personality: '',
    expertise: '',
    document_preferences: {
      analysis_style: 'detailed',
      citation_style: 'professional',
      response_format: 'structured',
      max_chunks: 5,
      context_window: 4000
    },
    behavior: {
      temperature: 0.7,
      max_tokens: 1000,
      response_style: 'professional'
    }
  });

  // Enhanced capabilities state for document agents
  const [enhancedCapabilities, setEnhancedCapabilities] = useState({
    conversation: {
      enabled: true,
      level: 'advanced' as const
    },
    analysis: {
      enabled: true,
      level: 'advanced' as const
    },
    creativity: {
      enabled: true,
      level: 'intermediate' as const
    },
    reasoning: {
      enabled: true,
      level: 'advanced' as const
    }
  });

  // Enhanced guardrails state for document agents
  const [enhancedGuardrails, setEnhancedGuardrails] = useState({
    global: true,
    local: true,
    piiRedaction: {
      enabled: true,
      strategy: 'placeholder' as const,
      customTypes: ['Document ID', 'Case Number'] as string[],
      customPatterns: [] as string[],
      maskCharacter: '*',
      placeholderText: '[CONFIDENTIAL]'
    },
    contentFilter: {
      enabled: true,
      level: 'moderate' as const,
      customKeywords: [] as string[],
      allowedDomains: [] as string[],
      blockedPhrases: [] as string[]
    },
    behaviorLimits: {
      enabled: true,
      customLimits: ['No legal advice', 'No medical diagnosis'] as string[],
      responseMaxLength: 3000,
      requireApproval: false
    },
    customRules: [] as any[]
  });

  // Agent templates
  const agentTemplates: AgentTemplate[] = [
    {
      id: 'legal-specialist',
      name: 'Legal Specialist',
      role: 'Legal Document Analyst',
      expertise: 'contract analysis, legal compliance, regulatory review, risk assessment',
      personality: 'Professional, meticulous, and thorough. I focus on legal implications, compliance requirements, and potential risks.',
      description: 'Specialized in legal document analysis with expertise in contracts, compliance, and regulatory matters.',
      category: 'Legal'
    },
    {
      id: 'financial-analyst',
      name: 'Financial Analyst',
      role: 'Financial Document Advisor',
      expertise: 'financial analysis, investment evaluation, risk management, market research',
      personality: 'Analytical, data-driven, and strategic. I provide clear financial insights and actionable recommendations.',
      description: 'Expert in financial document analysis, investment strategies, and market evaluation.',
      category: 'Finance'
    },
    {
      id: 'technical-expert',
      name: 'Technical Expert',
      role: 'Technical Documentation Specialist',
      expertise: 'technical writing, software documentation, API guides, system architecture',
      personality: 'Clear, precise, and educational. I explain complex technical concepts in accessible terms.',
      description: 'Specialized in technical documentation, software guides, and system analysis.',
      category: 'Technical'
    },
    {
      id: 'research-scholar',
      name: 'Research Scholar',
      role: 'Academic Research Assistant',
      expertise: 'academic research, literature review, citation analysis, methodology evaluation',
      personality: 'Scholarly, methodical, and comprehensive. I provide detailed analysis with proper academic rigor.',
      description: 'PhD-level research assistant for academic papers, studies, and scientific documents.',
      category: 'Academic'
    },
    {
      id: 'business-consultant',
      name: 'Business Consultant',
      role: 'Business Strategy Analyst',
      expertise: 'business strategy, market analysis, competitive intelligence, operational efficiency',
      personality: 'Strategic, pragmatic, and results-oriented. I focus on actionable business insights.',
      description: 'Expert in business document analysis, strategy development, and market intelligence.',
      category: 'Business'
    }
  ];

  const resetForm = () => {
    const defaultModel = availableModels.find(model => model.includes('mistral')) || availableModels[0] || 'mistral';
    
    setFormData({
      name: '',
      role: '',
      description: '',
      model: defaultModel,
      personality: '',
      expertise: '',
      document_preferences: {
        analysis_style: 'detailed',
        citation_style: 'professional',
        response_format: 'structured',
        max_chunks: 5,
        context_window: 4000
      },
      behavior: {
        temperature: 0.7,
        max_tokens: 1000,
        response_style: 'professional'
      }
    });

    // Reset enhanced capabilities for document agents
    setEnhancedCapabilities({
      conversation: {
        enabled: true,
        level: 'advanced'
      },
      analysis: {
        enabled: true,
        level: 'advanced'
      },
      creativity: {
        enabled: true,
        level: 'intermediate'
      },
      reasoning: {
        enabled: true,
        level: 'advanced'
      }
    });

    // Reset enhanced guardrails for document agents
    setEnhancedGuardrails({
      global: true,
      local: true,
      piiRedaction: {
        enabled: true,
        strategy: 'placeholder',
        customTypes: ['Document ID', 'Case Number', 'Patient ID'],
        customPatterns: ['\\bDOC-\\d{6}\\b', '\\bPT-\\d{8}\\b'],
        maskCharacter: '*',
        placeholderText: '[CONFIDENTIAL]'
      },
      contentFilter: {
        enabled: true,
        level: 'moderate',
        customKeywords: ['confidential', 'proprietary'],
        allowedDomains: [],
        blockedPhrases: ['share externally']
      },
      behaviorLimits: {
        enabled: true,
        customLimits: ['No legal advice', 'No medical diagnosis'],
        responseMaxLength: 3000,
        requireApproval: false
      },
      customRules: []
    });

    setSelectedTemplate(null);
    setActiveTab('basic');
  };

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

  const handleTemplateSelect = (template: AgentTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      ...formData,
      name: template.name,
      role: template.role,
      description: template.description,
      expertise: template.expertise,
      personality: template.personality
    });
    setActiveTab('model');
  };

  const handleCreateAgent = async () => {
    setIsCreating(true);
    
    try {
      console.log('🚀 Creating agent with data:', formData);
      
      // Validate required fields
      const requiredFields = ['name', 'role', 'model', 'personality', 'expertise'];
      const missingFields = requiredFields.filter(field => !formData[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }
      
      const response = await fetch('http://localhost:5002/api/document-agents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          enhancedCapabilities,
          enhancedGuardrails
        })
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Agent created successfully:', result);
        
        // Reset and close
        resetForm();
        setIsOpen(false);
        onAgentCreated();
        
        // Show success message
        alert(`✅ Agent "${formData.name}" created successfully!`);
      } else {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch (parseError) {
          // If we can't parse JSON, use the response text
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
        }
        
        console.error('❌ Server error:', errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('❌ Failed to create agent:', error);
      
      let userMessage = 'Failed to create agent';
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        userMessage = 'Cannot connect to backend server. Please ensure the backend is running on localhost:5002';
      } else if (error instanceof Error) {
        userMessage = error.message;
      }
      
      alert(`❌ ${userMessage}`);
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-2"
          onClick={() => {
            resetForm();
            setIsOpen(true);
          }}
        >
          <Plus size={16} />
          Create Custom Agent
        </Button>
      </DialogTrigger>
      
      <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <FileText className="text-purple-400" />
            Create Document Agent
          </DialogTitle>
          <DialogDescription>
            Create a specialized agent for document analysis and chat
          </DialogDescription>
        </DialogHeader>

        {/* Status Alert */}
        <Alert className="border-green-500 bg-green-500/10">
          <CheckCircle className="h-4 w-4 text-green-400" />
          <AlertDescription>
            Backend is ready with {availableModels.length} models available
          </AlertDescription>
        </Alert>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 bg-gray-800">
            <TabsTrigger value="basic" className="data-[state=active]:bg-purple-600">
              <Bot className="h-4 w-4 mr-2" />
              Basic
            </TabsTrigger>
            <TabsTrigger value="model" className="data-[state=active]:bg-purple-600">
              <Cpu className="h-4 w-4 mr-2" />
              Model
            </TabsTrigger>
            <TabsTrigger value="behavior" className="data-[state=active]:bg-purple-600">
              <MessageSquare className="h-4 w-4 mr-2" />
              Behavior
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
                          <Sparkles size={16} className="text-white" />
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
                      setSelectedTemplate({ id: 'custom', name: 'Custom Agent', role: '', expertise: '', personality: '', description: '', category: 'Custom' });
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0">
                        <User size={16} className="text-white" />
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
                      placeholder="e.g., Dr. Sarah Chen"
                      className="bg-gray-700 border-gray-600"
                    />
                  </div>

                  <div>
                    <Label htmlFor="role">Professional Role</Label>
                    <Input
                      id="role"
                      value={formData.role}
                      onChange={(e) => handleInputChange('role', e.target.value)}
                      placeholder="e.g., Legal Contract Analyst"
                      className="bg-gray-700 border-gray-600"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Brief description of the agent's capabilities and background"
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
                <CardDescription>Choose the Ollama model for your document agent</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {availableModels.length > 0 ? (
                  <div className="grid gap-3">
                    {availableModels.map((model) => (
                      <div
                        key={model}
                        className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                          formData.model === model
                            ? 'border-purple-500 bg-purple-500/10'
                            : 'border-gray-600 hover:border-gray-500'
                        }`}
                        onClick={() => handleInputChange('model', model)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Cpu className="text-blue-400" size={20} />
                            <div>
                              <h4 className="font-medium text-white">{model}</h4>
                              <p className="text-sm text-gray-400">
                                {model.includes('mistral') && 'Recommended for document analysis'}
                                {model.includes('phi3') && 'Fast and efficient model'}
                                {model.includes('llama') && 'Powerful general-purpose model'}
                                {model.includes('code') && 'Specialized for code analysis'}
                                {!model.includes('mistral') && !model.includes('phi3') && !model.includes('llama') && !model.includes('code') && 'General-purpose model'}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                {model.includes('mistral') && <Badge variant="secondary">Recommended</Badge>}
                                {model.includes('1b') && <Badge variant="outline">Fast</Badge>}
                                {model.includes('code') && <Badge variant="outline">Code</Badge>}
                                <span className="text-xs text-gray-500">Local Model</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right text-xs text-gray-400">
                            <div>Cost: <span className="text-green-400">Free</span></div>
                            <div>Speed: Fast</div>
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

            {formData.model && (
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle>Selected Model: {formData.model}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Type:</span>
                      <span className="ml-2 text-white">Local Ollama Model</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Cost:</span>
                      <span className="ml-2 text-green-400">Free</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Specialization:</span>
                      <span className="ml-2 text-white">Document Analysis</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Performance:</span>
                      <span className="ml-2 text-white">Optimized for RAG</span>
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
                    placeholder="Describe how the agent communicates and behaves (e.g., Professional, analytical, supportive...)"
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
                    placeholder="List the agent's areas of expertise (e.g., contract analysis, legal compliance, risk assessment...)"
                    className="bg-gray-700 border-gray-600"
                    rows={3}
                  />
                  <p className="text-sm text-gray-400 mt-1">
                    Specify the domains and topics the agent excels at
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
                  <Label>Temperature: {formData.behavior.temperature}</Label>
                  <Slider
                    value={[formData.behavior.temperature]}
                    onValueChange={(value) => handleNestedChange('behavior', 'temperature', value[0])}
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
                  <Label>Max Tokens: {formData.behavior.max_tokens}</Label>
                  <Slider
                    value={[formData.behavior.max_tokens]}
                    onValueChange={(value) => handleNestedChange('behavior', 'max_tokens', value[0])}
                    max={4000}
                    min={100}
                    step={100}
                    className="mt-2"
                  />
                  <p className="text-sm text-gray-400 mt-1">
                    Maximum length of generated responses
                  </p>
                </div>

                <div>
                  <Label htmlFor="responseStyle">Response Style</Label>
                  <Select 
                    value={formData.behavior.response_style} 
                    onValueChange={(value) => handleNestedChange('behavior', 'response_style', value)}
                  >
                    <SelectTrigger className="bg-gray-700 border-gray-600">
                      <SelectValue placeholder="Select response style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="academic">Academic</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Advanced Configuration */}
          <TabsContent value="advanced" className="space-y-4">
            <Tabs defaultValue="document" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4 bg-gray-800">
                <TabsTrigger value="document" className="data-[state=active]:bg-purple-600">
                  Document
                </TabsTrigger>
                <TabsTrigger value="capabilities" className="data-[state=active]:bg-purple-600">
                  Capabilities
                </TabsTrigger>
                <TabsTrigger value="guardrails" className="data-[state=active]:bg-purple-600">
                  Guardrails
                </TabsTrigger>
                <TabsTrigger value="preview" className="data-[state=active]:bg-purple-600">
                  Preview
                </TabsTrigger>
              </TabsList>

              <TabsContent value="document">
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle>Document Processing</CardTitle>
                    <CardDescription>Configure how your agent processes documents</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label>Max Document Chunks: {formData.document_preferences.max_chunks}</Label>
                      <Slider
                        value={[formData.document_preferences.max_chunks]}
                        onValueChange={(value) => handleNestedChange('document_preferences', 'max_chunks', value[0])}
                        max={20}
                        min={1}
                        step={1}
                        className="mt-2"
                      />
                      <p className="text-sm text-gray-400 mt-1">
                        Number of document chunks to retrieve for context
                      </p>
                    </div>

                    <div>
                      <Label>Context Window: {formData.document_preferences.context_window}</Label>
                      <Slider
                        value={[formData.document_preferences.context_window]}
                        onValueChange={(value) => handleNestedChange('document_preferences', 'context_window', value[0])}
                        max={8000}
                        min={1000}
                        step={500}
                        className="mt-2"
                      />
                      <p className="text-sm text-gray-400 mt-1">
                        Maximum context length for document analysis
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="analysisStyle">Analysis Style</Label>
                        <Select 
                          value={formData.document_preferences.analysis_style} 
                          onValueChange={(value) => handleNestedChange('document_preferences', 'analysis_style', value)}
                        >
                          <SelectTrigger className="bg-gray-700 border-gray-600">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="detailed">Detailed</SelectItem>
                            <SelectItem value="summary">Summary</SelectItem>
                            <SelectItem value="bullet-points">Bullet Points</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="citationStyle">Citation Style</Label>
                        <Select 
                          value={formData.document_preferences.citation_style} 
                          onValueChange={(value) => handleNestedChange('document_preferences', 'citation_style', value)}
                        >
                          <SelectTrigger className="bg-gray-700 border-gray-600">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="professional">Professional</SelectItem>
                            <SelectItem value="academic">Academic</SelectItem>
                            <SelectItem value="simple">Simple</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

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

              <TabsContent value="preview">
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle>Agent Preview</CardTitle>
                    <CardDescription>Review your document agent configuration</CardDescription>
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
                            Document Agent
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-700">
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="text-gray-300">Temperature:</span>
                          <span className="ml-2 text-white">{formData.behavior.temperature}</span>
                        </div>
                        <div>
                          <span className="text-gray-300">Max Tokens:</span>
                          <span className="ml-2 text-white">{formData.behavior.max_tokens}</span>
                        </div>
                        <div>
                          <span className="text-gray-300">Max Chunks:</span>
                          <span className="ml-2 text-white">{formData.document_preferences.max_chunks}</span>
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

            {/* Review Section */}
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
                        Document Agent
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-gray-300">Temperature:</span>
                      <span className="ml-2 text-white">{formData.behavior.temperature}</span>
                    </div>
                    <div>
                      <span className="text-gray-300">Max Tokens:</span>
                      <span className="ml-2 text-white">{formData.behavior.max_tokens}</span>
                    </div>
                    <div>
                      <span className="text-gray-300">Max Chunks:</span>
                      <span className="ml-2 text-white">{formData.document_preferences.max_chunks}</span>
                    </div>
                    <div>
                      <span className="text-gray-300">Analysis Style:</span>
                      <span className="ml-2 text-white">{formData.document_preferences.analysis_style}</span>
                    </div>
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
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isCreating}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              console.log('🚀 Create Agent button clicked');
              console.log('🚀 Form data:', formData);
              console.log('🚀 Can create agent?', canCreateAgent());
              handleCreateAgent();
            }}
            disabled={isCreating || !canCreateAgent()}
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
        </div>
      </DialogContent>
    </Dialog>
  );
};