import { useState, useEffect } from 'react';
import { 
  FileText, 
  FileEdit, 
  Code, 
  Search, 
  Globe, 
  Terminal, 
  Database, 
  Brain, 
  MessageSquare, 
  User,
  Zap,
  Settings,
  Cloud,
  Mic,
  Image,
  BarChart,
  Shield,
  Workflow,
  Bot,
  Calendar,
  Mail,
  Phone,
  Video,
  Map,
  Calculator,
  Clock,
  Archive,
  Download,
  Upload
} from 'lucide-react';

export interface StrandsNativeTool {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: any;
  color: string;
  requiresApi: boolean;
  apiConfig?: {
    name: string;
    fields: Array<{
      key: string;
      label: string;
      type: 'text' | 'password' | 'select' | 'number';
      required: boolean;
      placeholder?: string;
      options?: string[];
      description?: string;
    }>;
  };
  complexity: 'simple' | 'moderate' | 'advanced';
  tags: string[];
  documentation?: string;
}

// Local Tools (No API Required)
const LOCAL_STRANDS_TOOLS: StrandsNativeTool[] = [
  // File Operations
  {
    id: 'file_read',
    name: 'File Reader',
    description: 'Read and analyze file contents with syntax highlighting support',
    category: 'file',
    icon: FileText,
    color: '#8b5cf6',
    requiresApi: false,
    complexity: 'simple',
    tags: ['file', 'read', 'text', 'analysis'],
    documentation: 'Reads file contents and provides structured output with metadata'
  },
  {
    id: 'file_write',
    name: 'File Writer',
    description: 'Create and write files with automatic formatting and validation',
    category: 'file',
    icon: FileEdit,
    color: '#8b5cf6',
    requiresApi: false,
    complexity: 'simple',
    tags: ['file', 'write', 'create', 'save'],
    documentation: 'Creates new files or overwrites existing ones with content validation'
  },
  {
    id: 'editor',
    name: 'Code Editor',
    description: 'Advanced code editing with syntax highlighting and validation',
    category: 'file',
    icon: Code,
    color: '#8b5cf6',
    requiresApi: false,
    complexity: 'moderate',
    tags: ['code', 'edit', 'syntax', 'validation'],
    documentation: 'Provides advanced code editing capabilities with language-specific features'
  },
  {
    id: 'python_repl',
    name: 'Python REPL',
    description: 'Execute Python code in a secure sandboxed environment',
    category: 'code',
    icon: Terminal,
    color: '#f59e0b',
    requiresApi: false,
    complexity: 'moderate',
    tags: ['python', 'execute', 'code', 'repl'],
    documentation: 'Runs Python code with safety controls and result capture'
  },
  {
    id: 'shell',
    name: 'Shell Command',
    description: 'Execute system commands with safety controls and output capture',
    category: 'system',
    icon: Terminal,
    color: '#6b7280',
    requiresApi: false,
    complexity: 'advanced',
    tags: ['shell', 'command', 'system', 'execute'],
    documentation: 'Executes shell commands with configurable safety restrictions'
  },
  {
    id: 'local_memory',
    name: 'Local Memory',
    description: 'Store and retrieve data in local memory for workflow context',
    category: 'memory',
    icon: Database,
    color: '#10b981',
    requiresApi: false,
    complexity: 'simple',
    tags: ['memory', 'storage', 'local', 'context'],
    documentation: 'Provides local memory storage for maintaining context across workflow steps'
  },
  {
    id: 'handoff_to_user',
    name: 'Human Handoff',
    description: 'Transfer control to human operator with context preservation',
    category: 'communication',
    icon: User,
    color: '#f97316',
    requiresApi: false,
    complexity: 'simple',
    tags: ['human', 'handoff', 'escalation', 'control'],
    documentation: 'Seamlessly transfers workflow control to human operators'
  },
  {
    id: 'batch',
    name: 'Batch Processor',
    description: 'Execute multiple operations in parallel with result aggregation',
    category: 'workflow',
    icon: Workflow,
    color: '#3b82f6',
    requiresApi: false,
    complexity: 'advanced',
    tags: ['batch', 'parallel', 'processing', 'aggregation'],
    documentation: 'Processes multiple operations concurrently and aggregates results'
  },
  {
    id: 'calculator',
    name: 'Calculator',
    description: 'Perform mathematical calculations and data analysis',
    category: 'utility',
    icon: Calculator,
    color: '#06b6d4',
    requiresApi: false,
    complexity: 'simple',
    tags: ['math', 'calculation', 'analysis', 'numbers'],
    documentation: 'Provides mathematical computation capabilities with formula support'
  },
  {
    id: 'timer',
    name: 'Timer & Scheduler',
    description: 'Schedule tasks and manage time-based operations',
    category: 'utility',
    icon: Clock,
    color: '#84cc16',
    requiresApi: false,
    complexity: 'moderate',
    tags: ['time', 'schedule', 'timer', 'delay'],
    documentation: 'Manages timing operations and task scheduling within workflows'
  }
];

// External Tools (API Required)
const EXTERNAL_STRANDS_TOOLS: StrandsNativeTool[] = [
  // Web & Search
  {
    id: 'tavily_search',
    name: 'Tavily Search',
    description: 'Real-time web search optimized for AI with result ranking',
    category: 'web',
    icon: Search,
    color: '#2563eb',
    requiresApi: true,
    apiConfig: {
      name: 'Tavily API Configuration',
      fields: [
        {
          key: 'api_key',
          label: 'Tavily API Key',
          type: 'password',
          required: true,
          placeholder: 'tvly-xxxxxxxxxxxxxxxx',
          description: 'Get your API key from https://tavily.com'
        },
        {
          key: 'max_results',
          label: 'Max Results',
          type: 'number',
          required: false,
          placeholder: '10',
          description: 'Maximum number of search results to return (1-20)'
        },
        {
          key: 'search_depth',
          label: 'Search Depth',
          type: 'select',
          required: false,
          options: ['basic', 'advanced'],
          description: 'Search depth level for result quality'
        }
      ]
    },
    complexity: 'moderate',
    tags: ['search', 'web', 'real-time', 'ai-optimized'],
    documentation: 'Provides AI-optimized web search with intelligent result ranking'
  },
  {
    id: 'exa_search',
    name: 'Exa Search',
    description: 'Neural search engine for finding high-quality web content',
    category: 'web',
    icon: Globe,
    color: '#2563eb',
    requiresApi: true,
    apiConfig: {
      name: 'Exa API Configuration',
      fields: [
        {
          key: 'api_key',
          label: 'Exa API Key',
          type: 'password',
          required: true,
          placeholder: 'exa_xxxxxxxxxxxxxxxx',
          description: 'Get your API key from https://exa.ai'
        },
        {
          key: 'num_results',
          label: 'Number of Results',
          type: 'number',
          required: false,
          placeholder: '10',
          description: 'Number of results to return (1-50)'
        },
        {
          key: 'use_autoprompt',
          label: 'Use Autoprompt',
          type: 'select',
          required: false,
          options: ['true', 'false'],
          description: 'Enable automatic query optimization'
        }
      ]
    },
    complexity: 'moderate',
    tags: ['search', 'neural', 'content', 'quality'],
    documentation: 'Neural search engine that finds high-quality, relevant web content'
  },
  // Memory & Knowledge
  {
    id: 'mem0_memory',
    name: 'Mem0 Memory',
    description: 'Persistent memory service with intelligent context management',
    category: 'memory',
    icon: Brain,
    color: '#10b981',
    requiresApi: true,
    apiConfig: {
      name: 'Mem0 Configuration',
      fields: [
        {
          key: 'api_key',
          label: 'Mem0 API Key',
          type: 'password',
          required: true,
          placeholder: 'm0-xxxxxxxxxxxxxxxx',
          description: 'Get your API key from https://mem0.ai'
        },
        {
          key: 'user_id',
          label: 'User ID',
          type: 'text',
          required: false,
          placeholder: 'user_123',
          description: 'Unique identifier for memory isolation'
        },
        {
          key: 'memory_type',
          label: 'Memory Type',
          type: 'select',
          required: false,
          options: ['episodic', 'semantic', 'procedural'],
          description: 'Type of memory storage to use'
        }
      ]
    },
    complexity: 'advanced',
    tags: ['memory', 'persistent', 'context', 'ai'],
    documentation: 'Provides intelligent, persistent memory with context understanding'
  },
  {
    id: 'agent_core_memory',
    name: 'Agent Core Memory',
    description: 'AWS Bedrock Agent memory service for enterprise workflows',
    category: 'memory',
    icon: Database,
    color: '#10b981',
    requiresApi: true,
    apiConfig: {
      name: 'AWS Agent Core Configuration',
      fields: [
        {
          key: 'aws_access_key_id',
          label: 'AWS Access Key ID',
          type: 'text',
          required: true,
          placeholder: 'AKIAXXXXXXXXXXXXXXXX',
          description: 'AWS access key for Bedrock Agent service'
        },
        {
          key: 'aws_secret_access_key',
          label: 'AWS Secret Access Key',
          type: 'password',
          required: true,
          placeholder: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
          description: 'AWS secret key for authentication'
        },
        {
          key: 'aws_region',
          label: 'AWS Region',
          type: 'select',
          required: true,
          options: ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1'],
          description: 'AWS region for Bedrock Agent service'
        },
        {
          key: 'memory_id',
          label: 'Memory ID',
          type: 'text',
          required: false,
          placeholder: 'memory-xxxxxxxx',
          description: 'Specific memory instance identifier'
        }
      ]
    },
    complexity: 'advanced',
    tags: ['aws', 'bedrock', 'enterprise', 'memory'],
    documentation: 'Enterprise-grade memory service using AWS Bedrock Agent'
  },
  // Communication
  {
    id: 'slack',
    name: 'Slack Integration',
    description: 'Send messages and interact with Slack workspaces',
    category: 'communication',
    icon: MessageSquare,
    color: '#f59e0b',
    requiresApi: true,
    apiConfig: {
      name: 'Slack Configuration',
      fields: [
        {
          key: 'bot_token',
          label: 'Bot Token',
          type: 'password',
          required: true,
          placeholder: 'xoxb-xxxxxxxxxxxxxxxx',
          description: 'Slack bot token from your app configuration'
        },
        {
          key: 'default_channel',
          label: 'Default Channel',
          type: 'text',
          required: false,
          placeholder: '#general',
          description: 'Default channel for messages'
        },
        {
          key: 'workspace_id',
          label: 'Workspace ID',
          type: 'text',
          required: false,
          placeholder: 'T1234567890',
          description: 'Slack workspace identifier'
        }
      ]
    },
    complexity: 'moderate',
    tags: ['slack', 'messaging', 'collaboration', 'notifications'],
    documentation: 'Integrates with Slack for messaging and collaboration features'
  },
  {
    id: 'email_sender',
    name: 'Email Sender',
    description: 'Send emails with templates and attachment support',
    category: 'communication',
    icon: Mail,
    color: '#f59e0b',
    requiresApi: true,
    apiConfig: {
      name: 'Email Configuration',
      fields: [
        {
          key: 'smtp_host',
          label: 'SMTP Host',
          type: 'text',
          required: true,
          placeholder: 'smtp.gmail.com',
          description: 'SMTP server hostname'
        },
        {
          key: 'smtp_port',
          label: 'SMTP Port',
          type: 'number',
          required: true,
          placeholder: '587',
          description: 'SMTP server port (usually 587 or 465)'
        },
        {
          key: 'username',
          label: 'Username',
          type: 'text',
          required: true,
          placeholder: 'your-email@gmail.com',
          description: 'Email account username'
        },
        {
          key: 'password',
          label: 'Password',
          type: 'password',
          required: true,
          placeholder: 'your-app-password',
          description: 'Email account password or app password'
        }
      ]
    },
    complexity: 'moderate',
    tags: ['email', 'smtp', 'notifications', 'communication'],
    documentation: 'Sends emails with support for templates and attachments'
  },
  // Cloud Services
  {
    id: 'use_aws',
    name: 'AWS Services',
    description: 'Interact with AWS services including S3, Lambda, and more',
    category: 'cloud',
    icon: Cloud,
    color: '#f97316',
    requiresApi: true,
    apiConfig: {
      name: 'AWS Configuration',
      fields: [
        {
          key: 'aws_access_key_id',
          label: 'AWS Access Key ID',
          type: 'text',
          required: true,
          placeholder: 'AKIAXXXXXXXXXXXXXXXX',
          description: 'AWS access key for service authentication'
        },
        {
          key: 'aws_secret_access_key',
          label: 'AWS Secret Access Key',
          type: 'password',
          required: true,
          placeholder: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
          description: 'AWS secret key for authentication'
        },
        {
          key: 'aws_region',
          label: 'Default Region',
          type: 'select',
          required: true,
          options: ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1', 'ap-northeast-1'],
          description: 'Default AWS region for operations'
        },
        {
          key: 'services',
          label: 'Enabled Services',
          type: 'select',
          required: false,
          options: ['s3', 'lambda', 'dynamodb', 'ses', 'sns', 'sqs'],
          description: 'AWS services to enable (comma-separated)'
        }
      ]
    },
    complexity: 'advanced',
    tags: ['aws', 'cloud', 'storage', 'compute'],
    documentation: 'Provides access to AWS services with comprehensive API coverage'
  },
  // AI & Analysis
  {
    id: 'speak',
    name: 'Text-to-Speech',
    description: 'Convert text to speech with voice customization',
    category: 'ai',
    icon: Mic,
    color: '#8b5cf6',
    requiresApi: true,
    apiConfig: {
      name: 'Text-to-Speech Configuration',
      fields: [
        {
          key: 'service_provider',
          label: 'Service Provider',
          type: 'select',
          required: true,
          options: ['openai', 'elevenlabs', 'aws-polly', 'google-tts'],
          description: 'TTS service provider to use'
        },
        {
          key: 'api_key',
          label: 'API Key',
          type: 'password',
          required: true,
          placeholder: 'sk-xxxxxxxxxxxxxxxx',
          description: 'API key for the selected TTS service'
        },
        {
          key: 'voice_id',
          label: 'Voice ID',
          type: 'text',
          required: false,
          placeholder: 'alloy',
          description: 'Voice identifier for speech generation'
        },
        {
          key: 'speed',
          label: 'Speech Speed',
          type: 'number',
          required: false,
          placeholder: '1.0',
          description: 'Speech speed multiplier (0.5-2.0)'
        }
      ]
    },
    complexity: 'moderate',
    tags: ['tts', 'speech', 'audio', 'voice'],
    documentation: 'Converts text to natural-sounding speech with voice options'
  },
  {
    id: 'image_generator',
    name: 'Image Generator',
    description: 'Generate images from text descriptions using AI',
    category: 'ai',
    icon: Image,
    color: '#8b5cf6',
    requiresApi: true,
    apiConfig: {
      name: 'Image Generation Configuration',
      fields: [
        {
          key: 'service_provider',
          label: 'Service Provider',
          type: 'select',
          required: true,
          options: ['openai-dall-e', 'stability-ai', 'midjourney', 'replicate'],
          description: 'Image generation service to use'
        },
        {
          key: 'api_key',
          label: 'API Key',
          type: 'password',
          required: true,
          placeholder: 'sk-xxxxxxxxxxxxxxxx',
          description: 'API key for the selected image service'
        },
        {
          key: 'model',
          label: 'Model',
          type: 'select',
          required: false,
          options: ['dall-e-3', 'dall-e-2', 'stable-diffusion-xl', 'midjourney-v6'],
          description: 'Specific model to use for generation'
        },
        {
          key: 'image_size',
          label: 'Image Size',
          type: 'select',
          required: false,
          options: ['256x256', '512x512', '1024x1024', '1792x1024'],
          description: 'Output image dimensions'
        }
      ]
    },
    complexity: 'moderate',
    tags: ['ai', 'image', 'generation', 'creative'],
    documentation: 'Generates high-quality images from text descriptions'
  },
  // Analytics & Monitoring
  {
    id: 'analytics_tracker',
    name: 'Analytics Tracker',
    description: 'Track events and metrics with popular analytics services',
    category: 'analytics',
    icon: BarChart,
    color: '#06b6d4',
    requiresApi: true,
    apiConfig: {
      name: 'Analytics Configuration',
      fields: [
        {
          key: 'service_provider',
          label: 'Analytics Service',
          type: 'select',
          required: true,
          options: ['google-analytics', 'mixpanel', 'amplitude', 'segment'],
          description: 'Analytics service provider'
        },
        {
          key: 'tracking_id',
          label: 'Tracking ID',
          type: 'text',
          required: true,
          placeholder: 'GA_MEASUREMENT_ID or API_KEY',
          description: 'Service-specific tracking identifier'
        },
        {
          key: 'api_secret',
          label: 'API Secret',
          type: 'password',
          required: false,
          placeholder: 'API secret if required',
          description: 'Additional authentication secret'
        }
      ]
    },
    complexity: 'moderate',
    tags: ['analytics', 'tracking', 'metrics', 'monitoring'],
    documentation: 'Tracks user events and workflow metrics across platforms'
  }
];

export function useStrandsNativeTools() {
  const [localTools, setLocalTools] = useState<StrandsNativeTool[]>([]);
  const [externalTools, setExternalTools] = useState<StrandsNativeTool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStrandsNativeTools();
  }, []);

  const loadStrandsNativeTools = async () => {
    try {
      setLoading(true);
      
      // Simulate loading delay for realistic UX
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setLocalTools(LOCAL_STRANDS_TOOLS);
      setExternalTools(EXTERNAL_STRANDS_TOOLS);
      setError(null);
    } catch (err) {
      console.error('Failed to load Strands native tools:', err);
      setError('Failed to load native tools');
      setLocalTools([]);
      setExternalTools([]);
    } finally {
      setLoading(false);
    }
  };

  const getToolById = (toolId: string): StrandsNativeTool | undefined => {
    return [...localTools, ...externalTools].find(tool => tool.id === toolId);
  };

  const getToolsByCategory = (category: string): StrandsNativeTool[] => {
    return [...localTools, ...externalTools].filter(tool => tool.category === category);
  };

  const searchTools = (query: string): StrandsNativeTool[] => {
    const searchTerm = query.toLowerCase();
    return [...localTools, ...externalTools].filter(tool => 
      tool.name.toLowerCase().includes(searchTerm) ||
      tool.description.toLowerCase().includes(searchTerm) ||
      tool.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  };

  const validateApiConfig = (tool: StrandsNativeTool, config: Record<string, any>): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!tool.apiConfig) {
      return { valid: true, errors: [] };
    }

    tool.apiConfig.fields.forEach(field => {
      if (field.required && (!config[field.key] || config[field.key].trim() === '')) {
        errors.push(`${field.label} is required`);
      }
      
      if (field.type === 'number' && config[field.key] && isNaN(Number(config[field.key]))) {
        errors.push(`${field.label} must be a valid number`);
      }
    });

    return { valid: errors.length === 0, errors };
  };

  return {
    localTools,
    externalTools,
    allTools: [...localTools, ...externalTools],
    loading,
    error,
    reload: loadStrandsNativeTools,
    getToolById,
    getToolsByCategory,
    searchTools,
    validateApiConfig
  };
}