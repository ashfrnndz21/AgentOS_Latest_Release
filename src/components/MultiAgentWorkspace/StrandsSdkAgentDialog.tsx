import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, Code, Zap, CheckCircle, AlertCircle, Settings, Loader2, Download, RefreshCw, ArrowLeft } from 'lucide-react';
import { strandsSdkService } from '@/lib/services/StrandsSdkService';
import StrandsToolConfigDialog from './StrandsToolConfigDialog';
import { StrandsToolConfigurationDialog } from './StrandsToolConfigurationDialog';

interface StrandsSdkAgentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAgentCreated?: () => void;
}

interface OllamaConfiguration {
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  keep_alive?: string;
  stop_sequences?: string[];
  top_k?: number;
}

interface StrandsSdkAgentConfig {
  name: string;
  description: string;
  model_id: string;
  host: string;
  system_prompt: string;
  tools: string[];
  ollama_config: OllamaConfiguration;
  validate_execution?: boolean;
  a2a_enabled?: boolean;
  response_style?: 'concise' | 'detailed' | 'conversational' | 'technical';
  show_thinking?: boolean;
  show_tool_details?: boolean;
  include_examples?: boolean;
  include_citations?: boolean;
  include_warnings?: boolean;
}

const OLLAMA_MODELS = [
  // Working models (verified through testing)
  'llama3.2:latest',    // ✅ Working
  'llama3.2:1b',        // ✅ Working (fast, responsive)
  'phi3:latest',        // ✅ Working
  'phi4-mini-reasoning:latest',  // ✅ Available
  'deepseek-r1:latest', // ✅ Available
  'gpt-oss:20b',        // ✅ Available
  'calebfahlgren/natural-functions:latest', // ✅ Available
  'nomic-embed-text:latest'      // ✅ Available
  // Removed broken models: mistral:latest, qwen2.5:latest, llama3.1:latest
];

// Models that support tools in Strands SDK (verified through testing)
const MODELS_WITH_TOOL_SUPPORT = [
  'qwen3:1.7b',                    // ✅ Verified working with tools (excellent JSON generation)
  'phi4-mini-reasoning:3.8b',      // ✅ Verified working with tools (reasoning model)
  'phi4-mini-reasoning:latest',    // ✅ Verified working with tools
  'llama3.1:latest',               // ✅ Verified working with tools
  'llama3.2:latest',               // ✅ Verified working with tools
  'llama3.2:1b',                   // ✅ Verified working with tools
  'qwen2.5:latest'                 // ✅ Verified working with tools
  // Note: Only include models that are actually tested and working
];

// Models that don't support tools (verified through testing)
const MODELS_WITHOUT_TOOL_SUPPORT = [
  'phi3:latest',
  'deepseek-r1:latest',
  'gpt-oss:20b',
  'calebfahlgren/natural-functions:latest',
  'nomic-embed-text:latest'
];

const AVAILABLE_TOOLS = [
  // Core AI Tools
  'think',
  'memory',
  'use_llm',
  
  // Utility Tools
  'calculator',
  'current_time',
  'environment',
  'sleep',
  'stop',
  
  // File Operations
  'file_read',
  'file_write',
  'file_operations', // Legacy alias
  'editor',
  
  // Web & Data
  'web_search',
  'tavily',
  'http_request',
  'rss',
  'exa',
  'bright_data',
  
  // Code & Development
  'python_repl',
  'code_execution',
  'code_interpreter',
  'shell',
  
  // Browser & Automation
  'browser',
  'use_computer',
  
  // Media & Communication
  'generate_image',
  'generate_image_stability',
  'image_reader',
  'speak',
  'slack',
  
  // Workflow & Automation
  'workflow',
  'agent_graph',
  'use_agent',
  'handoff_to_user',
  'cron',
  'journal',
  'retrieve',
  'load_tool',
  'batch',
  'graph',
  'swarm',
  
  // Cloud & Infrastructure
  'use_aws',
  'mcp_client',
  
  // Memory Systems
  'agent_core_memory',
  'mem0_memory',
  
  // Video & Advanced Media
  'nova_reels',
  
  // Visualization
  'diagram',
  
  // Multi-Agent Collaboration
  'a2a_discover_agent',
  'a2a_list_discovered_agents',
  'a2a_send_message',
  'coordinate_agents',
  'agent_handoff',
  
  // Database
  'database_query',
  
  // Weather
  'weather_api'
];

// Strands SDK Agent Templates - Focused on Strands capabilities
const STRANDS_TEMPLATES = [
  {
    id: 'creative',
    name: 'Creative Assistant',
    role: 'Content Creator',
    description: 'Expert in creative writing, storytelling, and innovative content creation.',
    category: 'Creative',
    systemPrompt: 'You are a creative assistant specialized in content creation, storytelling, and innovative thinking. Help users with creative writing, brainstorming, and artistic projects.',
    ollama_config: { temperature: 0.8, max_tokens: 2000 },
    tools: ['web_search', 'current_time'],
    response_style: 'conversational',
    show_thinking: true,
    show_tool_details: true
  },
  {
    id: 'technical',
    name: 'Technical Expert',
    role: 'Software Development Specialist',
    description: 'Focused on technical problem-solving and software development guidance.',
    category: 'Technical',
    systemPrompt: 'You are a technical expert specializing in software development, programming, and technical problem-solving. Provide precise, accurate technical guidance.',
    ollama_config: { temperature: 0.3, max_tokens: 1500 },
    tools: ['code_execution', 'file_operations', 'calculator']
  },
  {
    id: 'learning',
    name: 'Learning Coach',
    role: 'Educational Specialist',
    description: 'Expert in education and learning, helping users understand and master new concepts.',
    category: 'Education',
    systemPrompt: 'You are a learning coach and educational specialist. Help users understand complex topics, provide clear explanations, and guide their learning journey.',
    ollama_config: { temperature: 0.6, max_tokens: 1800 },
    tools: ['web_search', 'calculator', 'current_time']
  },
  {
    id: 'collaboration',
    name: 'Collaboration Agent',
    role: 'Multi-Agent Coordinator',
    description: 'Advanced agent with collaboration tools for multi-agent systems and deep thinking.',
    category: 'Collaboration',
    systemPrompt: 'You are a collaboration agent specialized in multi-agent coordination, deep thinking, and agent-to-agent communication. Use your tools to coordinate with other agents and perform complex reasoning tasks.',
    ollama_config: { temperature: 0.7, max_tokens: 2000 },
    tools: ['think', 'a2a_discover_agent', 'a2a_send_message', 'coordinate_agents', 'web_search'],
    a2a_enabled: true
  },
  {
    id: 'custom',
    name: 'Custom Agent',
    role: 'Build from scratch',
    description: 'Create a completely custom agent',
    category: 'Custom',
    systemPrompt: 'You are a helpful assistant.',
    ollama_config: { temperature: 0.7, max_tokens: 1000 },
    tools: []
  }
];

export function StrandsSdkAgentDialog({ 
  open, 
  onOpenChange, 
  onAgentCreated 
}: StrandsSdkAgentDialogProps) {
  
  const [formData, setFormData] = useState<StrandsSdkAgentConfig>({
    name: '',
    description: '',
    model_id: 'llama3.2:1b',  // Use fast, working model by default
    host: 'http://localhost:11434',
    system_prompt: 'You are a helpful assistant.',
    tools: [],
    ollama_config: {
      temperature: 0.7,
      max_tokens: undefined,
      top_p: undefined,
      keep_alive: '5m',
      stop_sequences: [],
      top_k: undefined
    },
    validate_execution: false, // Default to fast creation
    a2a_enabled: true, // Default to A2A enabled for automatic orchestration
    response_style: 'conversational',
    show_thinking: true,
    show_tool_details: true,
    include_examples: false,
    include_citations: false,
    include_warnings: false
  });

  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [toolAvailability, setToolAvailability] = useState<Record<string, boolean>>({});
  const [availableTools, setAvailableTools] = useState<string[]>([]);
  const [toolConfigurations, setToolConfigurations] = useState<Record<string, any>>({});
  const [showToolConfigDialog, setShowToolConfigDialog] = useState<{tool: string, config: any} | null>(null);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<{[key: string]: number}>({});
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [installedModels, setInstalledModels] = useState<string[]>([]);
  const [showToolConfig, setShowToolConfig] = useState(false);
  const [toolConfig, setToolConfig] = useState<any>(null);
  const [showToolConfigurationDialog, setShowToolConfigurationDialog] = useState(false);
  const [selectedToolForConfig, setSelectedToolForConfig] = useState<string>('');
  const [showTemplateSelection, setShowTemplateSelection] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  // Response style preview function
  const getResponseStylePreview = (style: string) => {
    const previews = {
      concise: "**Answer:** The result is 42.",
      conversational: "Hi! I'd be happy to help you with that. The answer is 42. Let me know if you need anything else!",
      detailed: "**Detailed Analysis:**\nLet me break this down for you step by step. After analyzing the problem, I can confirm that the result is 42. This calculation involved several factors including...",
      technical: "**Technical Response:**\nBased on the computational analysis, the output value is 42. This result was derived using the following methodology: [technical details]..."
    };
    return previews[style as keyof typeof previews] || previews.conversational;
  };

  // Response style templates with descriptions
  const responseStyleTemplates = [
    {
      id: 'concise',
      name: 'Concise',
      description: 'Brief, direct answers',
      icon: '⚡',
      useCase: 'Quick answers, chatbots, mobile interfaces'
    },
    {
      id: 'conversational',
      name: 'Conversational',
      description: 'Natural, friendly tone',
      icon: '💬',
      useCase: 'Customer service, personal assistants, general chat'
    },
    {
      id: 'detailed',
      name: 'Detailed',
      description: 'Comprehensive explanations',
      icon: '📚',
      useCase: 'Educational content, tutorials, documentation'
    },
    {
      id: 'technical',
      name: 'Technical',
      description: 'Precise, professional language',
      icon: '🔧',
      useCase: 'Developer tools, technical documentation, APIs'
    }
  ];

  // Ensure formData is properly initialized
  useEffect(() => {
    if (!formData.system_prompt) {
      setFormData(prev => ({
        ...prev,
        system_prompt: prev.system_prompt || 'You are a helpful assistant.'
      }));
    }
  }, [formData.system_prompt]);

  const handleInputChange = (field: keyof StrandsSdkAgentConfig, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError(null);
  };

  const handleOllamaConfigChange = (field: keyof OllamaConfiguration, value: any) => {
    setFormData(prev => ({
      ...prev,
      ollama_config: {
        ...prev.ollama_config,
        [field]: value
      }
    }));
    setError(null);
  };

  const handleToolToggle = (tool: string) => {
    setFormData(prev => ({
      ...prev,
      tools: prev.tools.includes(tool)
        ? prev.tools.filter(t => t !== tool)
        : [...prev.tools, tool]
    }));
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    setShowTemplateSelection(false);
    
    // Apply template configuration
    const template = STRANDS_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      setFormData(prev => ({
        ...prev,
        name: template.name,
        description: template.description,
        system_prompt: template.systemPrompt,
        tools: template.tools,
        ollama_config: template.ollama_config,
        a2a_enabled: template.a2a_enabled || false
      }));
    }
  };

  const handleBackToTemplates = () => {
    setShowTemplateSelection(true);
    setSelectedTemplate(null);
  };

  // Check available and installed models
  const checkModels = async () => {
    try {
      // Check installed models
      const response = await fetch('http://localhost:11434/api/tags');
      if (response.ok) {
        const data = await response.json();
        const installed = data.models?.map((m: any) => m.name) || [];
        setInstalledModels(installed);
        console.log('Installed models:', installed);
      }
    } catch (error) {
      console.error('Failed to check models:', error);
    }
  };

  // Check if a model is installed (handles :latest suffix)
  const isModelInstalled = (modelId: string) => {
    return installedModels.some(installed => 
      installed === modelId || 
      installed === `${modelId}:latest` ||
      installed.startsWith(`${modelId}:`)
    );
  };

  // Check if a model supports tools
  const modelSupportsTools = (modelId: string) => {
    return MODELS_WITH_TOOL_SUPPORT.includes(modelId);
  };

  // Check if current configuration has tool conflicts
  const hasToolConflict = () => {
    return formData.tools.length > 0 && !modelSupportsTools(formData.model_id);
  };

  // Download a model
  const downloadModel = async (modelName: string) => {
    setIsDownloading(modelName);
    setDownloadProgress(prev => ({ ...prev, [modelName]: 0 }));
    
    try {
      // Add :latest if no tag specified
      const fullModelName = modelName.includes(':') ? modelName : `${modelName}:latest`;
      
      const response = await fetch('http://localhost:11434/api/pull', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: fullModelName }),
      });

      if (!response.ok) {
        throw new Error(`Failed to download ${modelName}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());
        
        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            if (data.total && data.completed) {
              const progress = (data.completed / data.total) * 100;
              setDownloadProgress(prev => ({ ...prev, [modelName]: progress }));
            }
          } catch (e) {
            // Ignore JSON parse errors
          }
        }
      }

      // Refresh model list
      await checkModels();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      
    } catch (error) {
      setError(`Failed to download ${modelName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsDownloading(null);
      setDownloadProgress(prev => ({ ...prev, [modelName]: 0 }));
    }
  };

  // Initialize model check
  React.useEffect(() => {
    if (open) {
      checkModels();
      fetchToolAvailability();
    }
  }, [open]);

  // Fetch tool availability from backend
  const fetchToolAvailability = async () => {
    try {
      const response = await fetch('http://localhost:5006/api/strands-sdk/tool-config');
      if (response.ok) {
        const data = await response.json();
        const tools = Object.keys(data.config || {});
        setAvailableTools(tools);
        
        // Mark tools as available based on backend working status
        const availability: Record<string, boolean> = {};
        tools.forEach(tool => {
          availability[tool] = data.config[tool]?.working || false;
        });
        setToolAvailability(availability);
      }
    } catch (error) {
      console.error('Failed to fetch tool availability:', error);
      // Fallback to hardcoded list
      setAvailableTools(AVAILABLE_TOOLS);
      const availability: Record<string, boolean> = {};
      AVAILABLE_TOOLS.forEach(tool => {
        availability[tool] = true;
      });
      setToolAvailability(availability);
    }
  };

  // Handle tool configuration
  const handleToolConfiguration = async (toolName: string) => {
    try {
      const response = await fetch(`http://localhost:5006/api/strands-sdk/tools/configuration/${toolName}`);
      if (response.ok) {
        const data = await response.json();
        if (data.configuration?.configurable) {
          setShowToolConfigDialog({
            tool: toolName,
            config: data.configuration
          });
        } else {
          alert(`${toolName} doesn't require configuration`);
        }
      }
    } catch (error) {
      console.error('Failed to fetch tool configuration:', error);
      alert('Failed to load tool configuration');
    }
  };

  // Save tool configuration
  const saveToolConfiguration = (toolName: string, config: any) => {
    setToolConfigurations(prev => ({
      ...prev,
      [toolName]: config
    }));
    setShowToolConfigDialog(null);
  };

  const handleCreateAgent = async () => {
    console.log('🚀 handleCreateAgent called');
    console.log('🚀 strandsSdkService available:', !!strandsSdkService);
    console.log('🚀 strandsSdkService.createAgent available:', !!strandsSdkService?.createAgent);
    try {
      setIsCreating(true);
      setError(null);

      // Validate required fields
      if (!formData.name.trim()) {
        throw new Error('Agent name is required');
      }

      if (!formData.system_prompt || typeof formData.system_prompt !== 'string' || !formData.system_prompt.trim()) {
        throw new Error('System prompt is required');
      }

      // Create agent using Strands SDK service with enhanced configuration
      console.log('🔄 formData:', formData);
      const createRequest = {
        name: formData.name,
        description: formData.description,
        model: formData.model_id, // Use 'model' for service interface
        systemPrompt: formData.system_prompt, // Use 'systemPrompt' for service interface
        tools: formData.tools,
        tool_configurations: toolConfigurations,
        temperature: formData.ollama_config.temperature,
        maxTokens: formData.ollama_config.max_tokens
      };

      console.log('🔄 Frontend creating agent with data:', createRequest);
      console.log('🔄 About to call strandsSdkService.createAgent...');
      console.log('🔄 strandsSdkService object:', strandsSdkService);
      console.log('🔄 strandsSdkService.createAgent method:', typeof strandsSdkService.createAgent);
      
      let createdAgent;
      try {
        console.log('🔄 About to call strandsSdkService.createAgent with:', createRequest);
        console.log('🔄 Service object before call:', strandsSdkService);
        console.log('🔄 Service createAgent method:', strandsSdkService.createAgent);
        console.log('🔄 Service createAgent type:', typeof strandsSdkService.createAgent);
        
      // Test if service method exists
      if (!strandsSdkService || !strandsSdkService.createAgent) {
        console.error('❌ Service or createAgent method not available');
        console.error('❌ strandsSdkService:', strandsSdkService);
        console.error('❌ strandsSdkService.createAgent:', strandsSdkService?.createAgent);
        throw new Error('Service or createAgent method not available');
      }
        
        createdAgent = await strandsSdkService.createAgent(createRequest);
        console.log('🔄 strandsSdkService.createAgent returned:', createdAgent);
      } catch (serviceError) {
        console.error('❌ strandsSdkService.createAgent threw an error:', serviceError);
        console.error('❌ Error details:', serviceError);
        console.error('❌ Error stack:', serviceError instanceof Error ? serviceError.stack : 'No stack');
        throw new Error(`Service call failed: ${serviceError instanceof Error ? serviceError.message : 'Unknown error'}`);
      }
      
      // Check if agent creation was successful
      if (!createdAgent) {
        throw new Error('Failed to create agent - no agent returned from service');
      }
      
      console.log('✅ Agent created successfully:', createdAgent);
      
      // If A2A is enabled, register the agent for A2A communication and Frontend Agent Bridge
      if (formData.a2a_enabled && createdAgent) {
        try {
          console.log(`🔄 Registering agent ${createdAgent.name} for A2A communication...`);
          
          const capabilities = strandsSdkService.extractCapabilities({
            name: createdAgent.name,
            description: createdAgent.description,
            tools: createdAgent.tools
          });

          console.log(`📋 Extracted capabilities for ${createdAgent.name}:`, capabilities);

          const registrationResult = await strandsSdkService.registerAgentForA2AWithBridge(
            createdAgent.id,
            {
              name: createdAgent.name,
              description: createdAgent.description,
              capabilities: capabilities
            }
          );

          if (registrationResult.success) {
            console.log(`✅ Agent ${createdAgent.name} successfully registered for A2A communication and orchestration`);
            console.log(`   - A2A Registered: ${registrationResult.a2aRegistered}`);
            console.log(`   - Bridge Registered: ${registrationResult.bridgeRegistered}`);
          } else {
            console.error('❌ Failed to register agent for A2A:', registrationResult.error);
            console.log(`   - A2A Registered: ${registrationResult.a2aRegistered}`);
            console.log(`   - Bridge Registered: ${registrationResult.bridgeRegistered}`);
            // Don't fail the entire creation if A2A registration fails
          }
        } catch (a2aError) {
          console.error('❌ Exception during A2A registration:', a2aError);
          // Don't fail the entire creation if A2A registration fails
        }
      } else {
        console.log(`ℹ️ A2A disabled for agent ${createdAgent?.name || 'unknown'}`);
      }
      
      setSuccess(true);
      
      // Reset form after short delay
      setTimeout(() => {
        setFormData({
          name: '',
          description: '',
          model_id: formData.model_id, // Preserve the user's selected model
          host: 'http://localhost:11434',
          system_prompt: 'You are a helpful assistant.',
          tools: [],
          ollama_config: {
            temperature: 0.7,
            max_tokens: undefined,
            top_p: undefined,
            keep_alive: '5m',
            stop_sequences: [],
            top_k: undefined
          },
          validate_execution: false,
          a2a_enabled: true // Keep A2A enabled by default
        });
        setSuccess(false);
        onOpenChange(false);
        onAgentCreated?.();
      }, 1500);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create agent');
    } finally {
      setIsCreating(false);
    }
  };

  const generateAdvancedCodePreview = () => {
    const configOptions = Object.entries(formData.ollama_config)
      .filter(([_, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => `    ${key}=${JSON.stringify(value)}`)
      .join(',\n');

    const toolsImport = formData.tools.length > 0 
      ? `from strands_tools import ${formData.tools.join(', ')}\n` 
      : '';

    const toolsConfig = formData.tools.length > 0 
      ? `,\n    tools=[${formData.tools.join(', ')}]` 
      : '';

    return `# Enhanced Strands SDK Agent with Full Configuration
from strands import Agent
from strands.models.ollama import OllamaModel
${toolsImport}
# Initialize Ollama model with advanced configuration
ollama_model = OllamaModel(
    host="${formData.host}",
    model_id="${formData.model_id}"${configOptions ? ',\n' + configOptions : ''}
)

# Create agent with system prompt${formData.tools.length > 0 ? ' and tools' : ''}
agent = Agent(
    model=ollama_model,
    system_prompt="""${formData.system_prompt}"""${toolsConfig}
)

# Execute agent
response = agent("Your input here")
print(response)

# Update configuration at runtime (optional)
agent.model.update_config(
    temperature=${formData.ollama_config.temperature || 0.7},
    keep_alive="${formData.ollama_config.keep_alive || '5m'}"
)`;
  };

  // Safety check to ensure formData is properly initialized
  if (!formData || typeof formData.system_prompt !== 'string') {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Sparkles className="h-5 w-5 text-purple-400" />
              Create Strands SDK Agent
              <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                Official SDK
              </Badge>
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
            <span className="ml-2 text-gray-300">Initializing...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Sparkles className="h-5 w-5 text-purple-400" />
              Create Strands SDK Agent
              <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                Official SDK
              </Badge>
            </DialogTitle>
          </DialogHeader>

        {/* Template Selection View */}
        {showTemplateSelection && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-lg font-semibold text-white mb-2">Strands SDK Agent Templates</h2>
              <p className="text-gray-400">Choose a template or create a custom Strands agent</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {STRANDS_TEMPLATES.map((template) => (
                <Card 
                  key={template.id} 
                  className="bg-gray-800 border-gray-700 hover:border-purple-500 cursor-pointer transition-colors"
                  onClick={() => handleTemplateSelect(template.id)}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Sparkles className="h-5 w-5 text-purple-400" />
                      {template.name}
                      <Badge variant="outline" className="ml-auto bg-purple-900/20 text-purple-300 border-purple-600">
                        {template.category}
                      </Badge>
                    </CardTitle>
                    <p className="text-sm text-gray-400">{template.description}</p>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Configuration View */}
        {!showTemplateSelection && (
          <div className="space-y-6">

            {/* Success Message */}
            {success && (
              <Card className="border-green-200 bg-green-50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="h-5 w-5" />
                    <div className="flex flex-col">
                      <span className="font-medium">Strands SDK agent created successfully!</span>
                      {formData.a2a_enabled && (
                        <span className="text-sm text-green-600 mt-1">
                          ✅ Agent registered for orchestration and A2A communication
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

        {/* Error Message */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tool Conflict Warning */}
        {hasToolConflict() && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-2 text-yellow-700">
                <AlertCircle className="h-5 w-5 mt-0.5" />
                <div>
                  <span className="font-medium">Tool Compatibility Issue</span>
                  <p className="text-sm mt-1">
                    The selected model "{formData.model_id}" doesn't support tools in Strands SDK. 
                    Please either remove the selected tools or choose a compatible model like: {MODELS_WITH_TOOL_SUPPORT.slice(0, 3).join(', ')}.
                  </p>
                  <div className="mt-2 flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setFormData(prev => ({ ...prev, tools: [] }))}
                      className="text-yellow-700 border-yellow-300 hover:bg-yellow-100"
                    >
                      Remove Tools
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setFormData(prev => ({ ...prev, model_id: 'llama3.2:1b' }))}
                      className="text-yellow-700 border-yellow-300 hover:bg-yellow-100"
                    >
                      Switch to llama3.2:1b
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Template Selection - Improved Visual Design */}
        {!selectedTemplate && (
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Strands SDK Agent Templates</CardTitle>
              <p className="text-gray-400">Choose a template or create a custom Strands agent</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {STRANDS_TEMPLATES.map((template) => (
                  <Card 
                    key={template.id}
                    className={`cursor-pointer transition-all hover:border-purple-500 ${
                      selectedTemplate?.id === template.id
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-gray-600 bg-gray-700'
                    }`}
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <CardContent className="p-4">
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
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

            {/* Back Button - Prominent */}
            <div className="flex items-center justify-between p-4 bg-gray-800 border border-gray-700 rounded-lg">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBackToTemplates}
                  className="text-gray-300 hover:text-white hover:bg-gray-700 flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Templates
                </Button>
                <div className="text-sm text-gray-400">
                  Configuring: {selectedTemplate ? STRANDS_TEMPLATES.find(t => t.id === selectedTemplate)?.name : 'Custom Agent'}
                </div>
              </div>
              <Badge variant="outline" className="bg-purple-900/20 text-purple-300 border-purple-600">
                {selectedTemplate ? STRANDS_TEMPLATES.find(t => t.id === selectedTemplate)?.category : 'Custom'}
              </Badge>
            </div>

            {/* Configuration Tabs - Strands Specific */}
            <Tabs defaultValue="basic" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-gray-800">
              <TabsTrigger value="basic" className="data-[state=active]:bg-purple-600">
                <Settings className="h-4 w-4 mr-2" />
                Basic
              </TabsTrigger>
              <TabsTrigger value="ollama" className="data-[state=active]:bg-purple-600">
                <Zap className="h-4 w-4 mr-2" />
                Ollama
              </TabsTrigger>
              <TabsTrigger value="tools" className="data-[state=active]:bg-purple-600">
                <Code className="h-4 w-4 mr-2" />
                Tools
              </TabsTrigger>
              <TabsTrigger value="preview" className="data-[state=active]:bg-purple-600">
                <Sparkles className="h-4 w-4 mr-2" />
                Preview
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-6">
              {/* Basic Configuration */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg text-white">Basic Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-white">Agent Name *</Label>
                      <Input
                        id="name"
                        placeholder="e.g., Data Analyst Agent"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="model" className="text-white">Model *</Label>
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <Select
                            value={formData.model_id}
                            onValueChange={(value) => handleInputChange('model_id', value)}
                          >
                            <SelectTrigger className="bg-gray-700 border-gray-600 text-white flex-1">
                              <SelectValue placeholder="Select model" />
                            </SelectTrigger>
                            <SelectContent>
                              {installedModels.length > 0 ? (
                                installedModels.map((model) => (
                                  <SelectItem key={model} value={model}>
                                    <div className="flex items-center gap-2">
                                      {model}
                                      <CheckCircle className="h-3 w-3 text-green-400" />
                                      {modelSupportsTools(model) && (
                                        <Badge variant="outline" className="text-xs text-blue-400 border-blue-400">
                                          Tools
                                        </Badge>
                                      )}
                                    </div>
                                  </SelectItem>
                                ))
                              ) : (
                                OLLAMA_MODELS.map((model) => (
                                  <SelectItem key={model} value={model}>
                                    <div className="flex items-center gap-2">
                                      {model}
                                      {isModelInstalled(model) && (
                                        <CheckCircle className="h-3 w-3 text-green-400" />
                                      )}
                                      {modelSupportsTools(model) && (
                                        <Badge variant="outline" className="text-xs text-blue-400 border-blue-400">
                                          Tools
                                        </Badge>
                                      )}
                                    </div>
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={checkModels}
                            className="border-gray-600 text-gray-300 hover:bg-gray-800"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        {/* Model Download Section */}
                        {formData.model_id && !isModelInstalled(formData.model_id) && (
                          <div className="p-3 bg-yellow-900/20 border border-yellow-600 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-yellow-400">Model not installed</p>
                                <p className="text-xs text-gray-400">Download {formData.model_id} to use this agent</p>
                              </div>
                              <Button
                                type="button"
                                size="sm"
                                onClick={() => downloadModel(formData.model_id)}
                                disabled={isDownloading === formData.model_id}
                                className="bg-purple-600 hover:bg-purple-700"
                              >
                                {isDownloading === formData.model_id ? (
                                  <>
                                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                    {Math.round(downloadProgress[formData.model_id] || 0)}%
                                  </>
                                ) : (
                                  <>
                                    <Download className="h-3 w-3 mr-1" />
                                    Download
                                  </>
                                )}
                              </Button>
                            </div>
                            {isDownloading === formData.model_id && (
                              <div className="mt-2">
                                <div className="w-full bg-gray-700 rounded-full h-2">
                                  <div 
                                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${downloadProgress[formData.model_id] || 0}%` }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {formData.model_id && isModelInstalled(formData.model_id) && (
                          <div className="p-2 bg-green-900/20 border border-green-600 rounded-lg">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-400" />
                              <span className="text-sm text-green-400">Model installed and ready</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-white">Description</Label>
                    <Input
                      id="description"
                      placeholder="Brief description of what this agent does"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="host" className="text-white">Ollama Host</Label>
                    <Input
                      id="host"
                      placeholder="http://localhost:11434"
                      value={formData.host}
                      onChange={(e) => handleInputChange('host', e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>

                  {/* A2A Collaboration Toggle */}
                  <div className="border-t border-gray-600 pt-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-white font-medium">Agent-to-Agent Collaboration</Label>
                        <p className="text-xs text-gray-400">
                          Enable this agent to communicate with other agents in the system
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Label htmlFor="a2a_enabled" className="text-sm text-gray-300">
                          Enable A2A
                        </Label>
                        <input
                          type="checkbox"
                          id="a2a_enabled"
                          checked={formData.a2a_enabled || false}
                          onChange={(e) => handleInputChange('a2a_enabled', e.target.checked)}
                          className="rounded border-gray-300"
                        />
                      </div>
                    </div>
                    {formData.a2a_enabled && (
                      <div className="mt-2 p-2 bg-blue-900/20 border border-blue-600 rounded-lg">
                        <p className="text-xs text-blue-300">
                          ✓ This agent will be automatically registered for A2A communication
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* System Prompt */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg text-white">System Prompt *</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Define the agent's role, behavior, and capabilities..."
                    value={formData.system_prompt || ''}
                    onChange={(e) => handleInputChange('system_prompt', e.target.value)}
                    rows={6}
                    className="resize-none bg-gray-700 border-gray-600 text-white"
                  />
                </CardContent>
              </Card>

              {/* Response Control */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg text-white">Response Control</CardTitle>
                  <CardDescription className="text-gray-400">
                    Control how the agent formats and presents its responses
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Response Style */}
                  <div className="space-y-3">
                    <Label className="text-white">Response Style</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {responseStyleTemplates.map((template) => (
                        <div
                          key={template.id}
                          className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                            formData.response_style === template.id
                              ? 'border-purple-500 bg-purple-500/10'
                              : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
                          }`}
                          onClick={() => handleInputChange('response_style', template.id)}
                        >
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-lg">{template.icon}</span>
                            <span className="text-white font-medium">{template.name}</span>
                          </div>
                          <p className="text-xs text-gray-400 mb-1">{template.description}</p>
                          <p className="text-xs text-gray-500">{template.useCase}</p>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400">Choose how the agent should format its responses</p>
                  </div>

                  {/* Response Options */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="show_thinking"
                        checked={formData.show_thinking || false}
                        onChange={(e) => handleInputChange('show_thinking', e.target.checked)}
                        className="rounded border-gray-600 bg-gray-700 text-purple-600 focus:ring-purple-500"
                      />
                      <Label htmlFor="show_thinking" className="text-white text-sm">
                        Show Thinking Process
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="show_tool_details"
                        checked={formData.show_tool_details || false}
                        onChange={(e) => handleInputChange('show_tool_details', e.target.checked)}
                        className="rounded border-gray-600 bg-gray-700 text-purple-600 focus:ring-purple-500"
                      />
                      <Label htmlFor="show_tool_details" className="text-white text-sm">
                        Show Tool Execution Details
                      </Label>
                    </div>
                  </div>

                  {/* Advanced Response Customization */}
                  <div className="mt-4 p-3 bg-gray-700/50 rounded-lg">
                    <Label className="text-sm text-gray-300 mb-3 block">Advanced Response Customization</Label>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="include_examples"
                          checked={formData.include_examples || false}
                          onChange={(e) => handleInputChange('include_examples', e.target.checked)}
                          className="rounded border-gray-600 bg-gray-700 text-purple-600 focus:ring-purple-500"
                        />
                        <Label htmlFor="include_examples" className="text-white text-sm">
                          Include Examples in Responses
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="include_citations"
                          checked={formData.include_citations || false}
                          onChange={(e) => handleInputChange('include_citations', e.target.checked)}
                          className="rounded border-gray-600 bg-gray-700 text-purple-600 focus:ring-purple-500"
                        />
                        <Label htmlFor="include_citations" className="text-white text-sm">
                          Include Source Citations
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="include_warnings"
                          checked={formData.include_warnings || false}
                          onChange={(e) => handleInputChange('include_warnings', e.target.checked)}
                          className="rounded border-gray-600 bg-gray-700 text-purple-600 focus:ring-purple-500"
                        />
                        <Label htmlFor="include_warnings" className="text-white text-sm">
                          Include Safety Warnings
                        </Label>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">
                    These options control what information is displayed to users in the agent's responses
                  </p>

                  {/* Response Style Preview */}
                  <div className="mt-4 p-3 bg-gray-700 rounded-lg">
                    <Label className="text-sm text-gray-300 mb-2 block">Response Style Preview</Label>
                    <div className="text-sm text-gray-200 bg-gray-800 p-3 rounded border">
                      {getResponseStylePreview(formData.response_style || 'conversational')}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ollama" className="space-y-6">
              {/* Ollama Configuration */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg text-white">Ollama Model Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="temperature" className="text-white">Temperature</Label>
                      <Input
                        id="temperature"
                        type="number"
                        step="0.1"
                        min="0"
                        max="2"
                        placeholder="0.7"
                        value={formData.ollama_config.temperature || ''}
                        onChange={(e) => handleOllamaConfigChange('temperature', parseFloat(e.target.value) || undefined)}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                      <p className="text-xs text-gray-400">Controls randomness (0.0 = deterministic, 2.0 = very random)</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="max_tokens" className="text-white">Max Tokens</Label>
                      <Input
                        id="max_tokens"
                        type="number"
                        min="1"
                        placeholder="Leave empty for unlimited"
                        value={formData.ollama_config.max_tokens || ''}
                        onChange={(e) => handleOllamaConfigChange('max_tokens', parseInt(e.target.value) || undefined)}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                      <p className="text-xs text-gray-400">Maximum number of tokens to generate</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="top_p" className="text-white">Top P</Label>
                      <Input
                        id="top_p"
                        type="number"
                        step="0.1"
                        min="0"
                        max="1"
                        placeholder="Leave empty for default"
                        value={formData.ollama_config.top_p || ''}
                        onChange={(e) => handleOllamaConfigChange('top_p', parseFloat(e.target.value) || undefined)}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                      <p className="text-xs text-gray-400">Controls diversity via nucleus sampling</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="top_k" className="text-white">Top K</Label>
                      <Input
                        id="top_k"
                        type="number"
                        min="1"
                        placeholder="Leave empty for default"
                        value={formData.ollama_config.top_k || ''}
                        onChange={(e) => handleOllamaConfigChange('top_k', parseInt(e.target.value) || undefined)}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                      <p className="text-xs text-gray-400">Limits token selection to top K choices</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="keep_alive" className="text-white">Keep Alive</Label>
                    <Input
                      id="keep_alive"
                      placeholder="5m"
                      value={formData.ollama_config.keep_alive || ''}
                      onChange={(e) => handleOllamaConfigChange('keep_alive', e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                    <p className="text-xs text-gray-400">How long the model stays loaded in memory (e.g., "5m", "1h")</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stop_sequences" className="text-white">Stop Sequences</Label>
                    <Input
                      id="stop_sequences"
                      placeholder="###,END,STOP (comma-separated)"
                      value={formData.ollama_config.stop_sequences?.join(',') || ''}
                      onChange={(e) => handleOllamaConfigChange('stop_sequences', e.target.value.split(',').filter(s => s.trim()))}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                    <p className="text-xs text-gray-400">Sequences that stop generation (comma-separated)</p>
                  </div>

                  {/* Validation Options */}
                  <div className="border-t border-gray-600 pt-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-white font-medium">Creation Validation</Label>
                        <p className="text-xs text-gray-400">
                          {formData.validate_execution 
                            ? "Thorough validation (slower, runs test execution)" 
                            : "Fast creation (recommended, skips test execution)"
                          }
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Label htmlFor="validate_execution" className="text-sm text-gray-300">
                          Test Execution
                        </Label>
                        <input
                          type="checkbox"
                          id="validate_execution"
                          checked={formData.validate_execution || false}
                          onChange={(e) => handleInputChange('validate_execution', e.target.checked)}
                          className="rounded border-gray-300"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tools" className="space-y-6">
              {/* Tools Selection */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg text-white">Available Tools</CardTitle>
                  <div className="text-sm text-gray-400">
                    ✅ Green = Working | ❌ Red = Not Implemented | ⚠️ Yellow = Checking
                  </div>
                  <div className="flex gap-4 text-sm mt-2">
                    <span className="text-green-400">
                      ✅ {availableTools.filter(tool => toolAvailability[tool]).length} Working Tools
                    </span>
                    <span className="text-red-400">
                      ❌ {availableTools.filter(tool => !toolAvailability[tool]).length} Not Implemented
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {availableTools.map((tool) => {
                      // Check if tool is available from backend
                      const isAvailable = toolAvailability[tool] || false;
                      
                      return (
                        <div key={tool} className={`flex items-center justify-between p-2 border rounded-lg ${
                          isAvailable 
                            ? 'border-green-600 bg-green-900/10' 
                            : 'border-red-600 bg-red-900/10'
                        }`}>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={tool}
                              checked={formData.tools.includes(tool)}
                              onChange={() => handleToolToggle(tool)}
                              className="rounded border-gray-300"
                              disabled={!isAvailable}
                            />
                            <Label 
                              htmlFor={tool} 
                              className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
                                isAvailable ? 'text-white' : 'text-gray-400'
                              }`}
                            >
                              {tool.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            {/* Availability Status Badge */}
                            <span className={`text-xs px-2 py-1 rounded ${
                              isAvailable 
                                ? 'bg-green-600 text-white' 
                                : 'bg-red-600 text-white'
                            }`}>
                              {isAvailable ? '✅ Working' : '❌ Not Implemented'}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToolConfiguration(tool)}
                              className="text-gray-400 hover:text-white"
                              disabled={!isAvailable}
                            >
                              <Settings className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {formData.tools.length > 0 && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-700">
                        <strong>Selected Tools:</strong> {formData.tools.join(', ')}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preview" className="space-y-4">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-white">
                    <Code className="h-5 w-5" />
                    Equivalent Strands SDK Code
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                    <code>{generateAdvancedCodePreview()}</code>
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>
            </Tabs>

            {/* Create Button */}
            <div className="flex justify-between items-center pt-4">
          <Button
            variant="outline"
            onClick={() => setShowToolConfig(true)}
            className="border-gray-600 text-gray-300 hover:bg-gray-800 flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            Configure Tool Detection
          </Button>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </Button>
          <Button
            onClick={() => {
              console.log('🎯 Create Agent button clicked');
              console.log('🎯 About to call handleCreateAgent');
              handleCreateAgent();
              console.log('🎯 handleCreateAgent call completed');
            }}
            disabled={
              !formData.name.trim() || 
              !formData.system_prompt || typeof formData.system_prompt !== 'string' || !formData.system_prompt.trim() || 
              isCreating ||
              !isModelInstalled(formData.model_id) ||
              hasToolConflict()
            }
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {isCreating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Strands Agent'
            )}
          </Button>
          </div>
        </div>
          </div>
        )}
        </DialogContent>
      </Dialog>

      {/* Tool Configuration Dialog */}
      <StrandsToolConfigDialog
        open={showToolConfig}
        onClose={() => setShowToolConfig(false)}
        onSave={(config) => {
          setToolConfig(config);
          setShowToolConfig(false);
        }}
        initialConfig={toolConfig}
        toolName={selectedToolForConfig}
      />

      {/* Advanced Tool Configuration Dialog */}
      <StrandsToolConfigurationDialog
        open={showToolConfigurationDialog}
        onOpenChange={setShowToolConfigurationDialog}
        toolName={selectedToolForConfig}
        onConfigurationSave={(toolName, configuration) => {
          console.log(`Tool configuration saved for ${toolName}:`, configuration);
          // Here you would typically save the configuration to your backend
          setShowToolConfigurationDialog(false);
        }}
      />

      {/* New Tool Configuration Dialog */}
      {showToolConfigDialog && (
        <Dialog open={!!showToolConfigDialog} onOpenChange={() => setShowToolConfigDialog(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Configure Tool: {showToolConfigDialog.tool}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-sm text-gray-600">
                {showToolConfigDialog.config.description}
              </div>
              {showToolConfigDialog.config.configurable ? (
                <div className="space-y-4">
                  {Object.entries(showToolConfigDialog.config.configuration || {}).map(([key, config]: [string, any]) => (
                    <div key={key} className="space-y-2">
                      <Label className="text-sm font-medium">{config.description}</Label>
                      {config.type === 'text' && (
                        <Input
                          placeholder={config.default}
                          onChange={(e) => {
                            // Update configuration
                            const newConfig = { ...toolConfigurations[showToolConfigDialog.tool] || {} };
                            newConfig[key] = e.target.value;
                            setToolConfigurations(prev => ({
                              ...prev,
                              [showToolConfigDialog.tool]: newConfig
                            }));
                          }}
                        />
                      )}
                      {config.type === 'number' && (
                        <Input
                          type="number"
                          placeholder={config.default?.toString()}
                          onChange={(e) => {
                            const newConfig = { ...toolConfigurations[showToolConfigDialog.tool] || {} };
                            newConfig[key] = Number(e.target.value);
                            setToolConfigurations(prev => ({
                              ...prev,
                              [showToolConfigDialog.tool]: newConfig
                            }));
                          }}
                        />
                      )}
                      {config.type === 'boolean' && (
                        <input
                          type="checkbox"
                          onChange={(e) => {
                            const newConfig = { ...toolConfigurations[showToolConfigDialog.tool] || {} };
                            newConfig[key] = e.target.checked;
                            setToolConfigurations(prev => ({
                              ...prev,
                              [showToolConfigDialog.tool]: newConfig
                            }));
                          }}
                        />
                      )}
                      {config.type === 'select' && (
                        <select
                          className="w-full p-2 border rounded"
                          onChange={(e) => {
                            const newConfig = { ...toolConfigurations[showToolConfigDialog.tool] || {} };
                            newConfig[key] = e.target.value;
                            setToolConfigurations(prev => ({
                              ...prev,
                              [showToolConfigDialog.tool]: newConfig
                            }));
                          }}
                        >
                          {config.options?.map((option: string) => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      )}
                      {config.type === 'array' && (
                        <Input
                          placeholder={Array.isArray(config.default) ? config.default.join(', ') : ''}
                          onChange={(e) => {
                            const newConfig = { ...toolConfigurations[showToolConfigDialog.tool] || {} };
                            newConfig[key] = e.target.value.split(',').map(s => s.trim());
                            setToolConfigurations(prev => ({
                              ...prev,
                              [showToolConfigDialog.tool]: newConfig
                            }));
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500">
                  This tool doesn't require configuration
                </div>
              )}
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowToolConfigDialog(null)}>
                Cancel
              </Button>
              <Button onClick={() => setShowToolConfigDialog(null)}>
                Save Configuration
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}