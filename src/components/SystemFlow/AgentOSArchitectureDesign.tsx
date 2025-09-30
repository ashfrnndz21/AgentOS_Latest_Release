import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AgentOSLogicalFlow from './AgentOSLogicalFlow';
import { 
  Command, 
  Server, 
  Bot, 
  Users, 
  Activity, 
  Zap, 
  Play, 
  Pause, 
  ArrowRight,
  Database,
  Cloud,
  Settings,
  Monitor,
  ShoppingBag,
  Globe,
  Network,
  Workflow,
  Shield,
  Plus,
  Code,
  BarChart3,
  Brain,
  TrendingUp,
  X,
  Target,
  FileText
} from 'lucide-react';

export const AgentOSArchitectureDesign: React.FC = () => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'overview' | 'detailed'>('overview');

  // Detailed sub-components for each major component
  const detailedComponents = [
    // User Interaction Layer
    {
      id: 'authentication',
      name: 'AgentOS Authentication',
      icon: Shield,
      color: 'bg-blue-600',
      details: ['AgentOS Login System', 'Role-based Access Control', 'Session Management'],
      parent: 'user-interaction'
    },
    {
      id: 'dashboard',
      name: 'Main System Orchestrator Card',
      icon: Monitor,
      color: 'bg-blue-500',
      details: ['Query Input Interface', 'Agent Selection Display', 'Response Formatting', 'Configuration Panel'],
      parent: 'user-interaction'
    },
    {
      id: 'theming',
      name: 'A2A Orchestration Monitor',
      icon: Settings,
      color: 'bg-blue-400',
      details: ['Real-time Agent Coordination', 'Handover Tracking', 'Execution Metrics', 'Verification Display'],
      parent: 'user-interaction'
    },

    // Main System Orchestrator Layer
    {
      id: 'query-analysis',
      name: 'Query Analysis Engine',
      icon: Brain,
      color: 'bg-purple-600',
      details: ['Query Type Detection', 'Task Decomposition', 'Complexity Analysis', 'Workflow Pattern Selection'],
      parent: 'main-orchestrator'
    },
    {
      id: 'agent-selection',
      name: 'Agent Selection System',
      icon: Target,
      color: 'bg-purple-500',
      details: ['Agent Discovery', 'Relevance Scoring', 'Capability Matching', 'Dynamic Selection'],
      parent: 'main-orchestrator'
    },
    {
      id: 'response-synthesis',
      name: 'Response Synthesis Engine',
      icon: Code,
      color: 'bg-purple-400',
      details: ['Content Aggregation', 'Format Optimization', 'JSON Detection', 'Quality Enhancement'],
      parent: 'main-orchestrator'
    },

    // A2A Service Layer
    {
      id: 'agent-registration',
      name: 'Agent Registration System',
      icon: Users,
      color: 'bg-orange-600',
      details: ['Agent Discovery', 'Capability Mapping', 'Status Tracking', 'Health Monitoring'],
      parent: 'a2a-service'
    },
    {
      id: 'handover-management',
      name: 'Handover Management',
      icon: ArrowRight,
      color: 'bg-orange-500',
      details: ['Task Transitions', 'Context Preservation', 'Verification Markers', 'Error Recovery'],
      parent: 'a2a-service'
    },
    {
      id: 'message-routing',
      name: 'Message Routing Engine',
      icon: Network,
      color: 'bg-orange-400',
      details: ['Message Queue', 'Routing Logic', 'Delivery Confirmation', 'Metrics Collection'],
      parent: 'a2a-service'
    },

    // Backend Services Layer
    {
      id: 'ollama-api',
      name: 'Ollama API Service',
      icon: Server,
      color: 'bg-cyan-600',
      details: ['Model Management', 'Response Generation', 'Health Monitoring', 'Agent Configuration'],
      parent: 'backend-services'
    },
    {
      id: 'strands-sdk',
      name: 'Strands SDK Integration',
      icon: Bot,
      color: 'bg-cyan-500',
      details: ['Tool Registration', 'Workflow Execution', 'Agent Framework', 'Integration Layer'],
      parent: 'backend-services'
    },
    {
      id: 'database-layer',
      name: 'Database & Storage',
      icon: Database,
      color: 'bg-cyan-400',
      details: ['SQLite Storage', 'Session Management', 'Agent Registry', 'Performance Metrics'],
      parent: 'backend-services'
    },

    // Additional Platform Components
    {
      id: 'ollama-terminal',
      name: 'Ollama Terminal',
      icon: Server,
      color: 'bg-blue-600',
      details: ['Direct Model Access', 'Command Line Interface', 'Model Testing', 'Debug Tools'],
      parent: 'platform-components'
    },
    {
      id: 'document-chat',
      name: 'Document Chat',
      icon: FileText,
      color: 'bg-blue-500',
      details: ['Document Processing', 'RAG Integration', 'Context-Aware Chat', 'File Management'],
      parent: 'platform-components'
    },
    {
      id: 'mcp-gateway',
      name: 'MCP Gateway',
      icon: Network,
      color: 'bg-blue-400',
      details: ['Model Context Protocol', 'Tool Integration', 'Server Management', 'Connection Hub'],
      parent: 'platform-components'
    },
    {
      id: 'ai-marketplace',
      name: 'AI Marketplace',
      icon: ShoppingBag,
      color: 'bg-purple-600',
      details: ['Agent Marketplace', 'Tool Discovery', 'Template Library', 'Community Sharing'],
      parent: 'platform-components'
    },
    {
      id: 'multi-agent-workspace',
      name: 'Multi Agent Workspace',
      icon: Users,
      color: 'bg-purple-500',
      details: ['Collaborative Environment', 'Agent Coordination', 'Workspace Management', 'Real-time Collaboration'],
      parent: 'platform-components'
    },
    {
      id: 'agent-command-centre',
      name: 'Agent Command Centre',
      icon: Command,
      color: 'bg-purple-400',
      details: ['Agent Creation', 'Quick Actions', 'Project Management', 'Cost Analysis'],
      parent: 'platform-components'
    },

    // Agent Ecosystem Layer
    {
      id: 'weather-agent',
      name: 'Weather Agent',
      icon: Globe,
      color: 'bg-green-600',
      details: ['Weather Data Retrieval', 'Meteorological Analysis', 'Climate Information', 'Forecast Services'],
      parent: 'agent-ecosystem'
    },
    {
      id: 'creative-assistant',
      name: 'Creative Assistant',
      icon: Brain,
      color: 'bg-green-500',
      details: ['Creative Writing', 'Poetry Generation', 'Storytelling', 'Content Creation'],
      parent: 'agent-ecosystem'
    },
    {
      id: 'calculator-agent',
      name: 'Calculator Agent',
      icon: BarChart3,
      color: 'bg-green-400',
      details: ['Mathematical Computations', 'Data Analysis', 'Statistical Operations', 'Numerical Processing'],
      parent: 'agent-ecosystem'
    },

    // Agent Control Panel Sub-components
    {
      id: 'runtime-monitor',
      name: 'AgentOS Runtime Monitor',
      icon: Activity,
      color: 'bg-red-600',
      details: ['Real-time Agent Status', 'Performance Metrics', 'Health Check System'],
      parent: 'agent-control-panel'
    },
    {
      id: 'deployment-manager',
      name: 'AgentOS Deployment Manager',
      icon: Cloud,
      color: 'bg-red-500',
      details: ['Deploy/Stop/Start Controls', 'Lifecycle Management', 'Auto Scaling'],
      parent: 'agent-control-panel'
    },
    {
      id: 'identity-manager',
      name: 'AgentOS Identity Manager',
      icon: Shield,
      color: 'bg-red-400',
      details: ['Workload Identity Management', 'Credential Storage', 'Access Control'],
      parent: 'agent-control-panel'
    },

    // AWS Services Sub-components
    {
      id: 'bedrock-services',
      name: 'AWS Bedrock Services',
      icon: Brain,
      color: 'bg-amber-600',
      details: ['Foundation Models', 'Claude Integration', 'Custom Model Support'],
      parent: 'aws-services'
    },
    {
      id: 'compute-services',
      name: 'AWS Compute Services',
      icon: Zap,
      color: 'bg-amber-500',
      details: ['Lambda Functions', 'Step Functions', 'Auto Scaling Groups'],
      parent: 'aws-services'
    },
    {
      id: 'data-services',
      name: 'AWS Data Services',
      icon: Database,
      color: 'bg-amber-400',
      details: ['S3 Storage', 'DynamoDB', 'CloudWatch Monitoring'],
      parent: 'aws-services'
    },

    // Enhanced LLM Orchestration Sub-components
    {
      id: 'enhanced-orchestration',
      name: 'Enhanced LLM Orchestration',
      icon: Brain,
      color: 'bg-purple-600',
      details: ['5-Stage Intelligent Processing', '3-Stage LLM Reasoning', 'Dynamic Agent Selection', 'Memory-Optimized Design'],
      parent: 'enhanced-orchestration'
    },
    {
      id: 'orchestration-monitor',
      name: 'Orchestration Monitor',
      icon: Monitor,
      color: 'bg-purple-500',
      details: ['Real-time Processing Visualization', 'Detailed Reasoning Display', 'Performance Metrics', 'Session Management'],
      parent: 'enhanced-orchestration'
    },
    {
      id: 'llm-analysis-engine',
      name: 'LLM Analysis Engine',
      icon: Zap,
      color: 'bg-purple-400',
      details: ['Query Context Analysis', 'Agent Capability Evaluation', 'Contextual Matching', 'Confidence Scoring'],
      parent: 'enhanced-orchestration'
    },

    // Industry Solutions Sub-components
    {
      id: 'banking-os',
      name: 'AgentOS Banking Solutions',
      icon: TrendingUp,
      color: 'bg-indigo-600',
      details: ['Risk Analytics Engine', 'Wealth Management Platform', 'Compliance Framework'],
      parent: 'industry-solutions'
    },
    {
      id: 'telco-os',
      name: 'AgentOS Telco Solutions',
      icon: Network,
      color: 'bg-indigo-500',
      details: ['Network Twin Platform', 'Customer Value Management', 'Operations Center'],
      parent: 'industry-solutions'
    },
    {
      id: 'healthcare-os',
      name: 'AgentOS Healthcare Solutions',
      icon: Users,
      color: 'bg-indigo-400',
      details: ['Patient Care Platform', 'Clinical Support System', 'Healthcare Compliance'],
      parent: 'industry-solutions'
    }
  ];

  // Layer definitions for popups
  const layerDefinitions = {
    'user-interaction': {
      title: 'AgentOS Frontend Interface Layer',
      description: 'React-based user interface components for multi-agent orchestration',
      icon: Users,
      color: 'blue',
      architecture: [
        'Main System Orchestrator Card - Primary orchestration interface',
        'A2A Orchestration Monitor - Real-time agent coordination visualization',
        'Configuration Panel - Dynamic system parameter management',
        'Agent Output Display - Formatted, verified agent responses',
        'Health Monitoring Dashboard - Service status and performance metrics'
      ],
      services: [
        'React Frontend Framework (Port 5173)',
        'Real-time Orchestration Interface',
        'Dynamic Configuration Management',
        'Agent Verification Display System'
      ]
    },
    'main-orchestrator': {
      title: 'Main System Orchestrator (Port 5031)',
      description: 'Central orchestration engine for multi-agent coordination and task management',
      icon: Brain,
      color: 'purple',
      architecture: [
        'Query Analysis Engine - Intelligent query processing and task decomposition',
        'Agent Selection System - Dynamic agent discovery and relevance scoring',
        'Response Synthesis Engine - Content aggregation and format optimization',
        'Session Management - Orchestration session tracking and history',
        'Verification System - Authenticity markers for all agent outputs'
      ],
      services: [
        'Main System Orchestrator API (Port 5031)',
        'Query Analysis Service',
        'Agent Selection Algorithm',
        'Response Synthesis Engine',
        'Session Management System'
      ]
    },
    'a2a-service': {
      title: 'A2A Service (Port 5008)',
      description: 'Agent-to-Agent communication hub for seamless task handovers and coordination',
      icon: Network,
      color: 'orange',
      architecture: [
        'Agent Registration System - Agent discovery and capability mapping',
        'Handover Management - Seamless task transitions between agents',
        'Message Routing Engine - Message queue and delivery confirmation',
        'Connection Tracking - Agent connection status and metrics',
        'Verification Markers - Proof of authentic agent outputs'
      ],
      services: [
        'A2A Service API (Port 5008)',
        'Agent Registration Service',
        'Message Routing Engine',
        'Handover Management System',
        'Connection Health Monitor'
      ]
    },
    'backend-services': {
      title: 'Backend Services Layer',
      description: 'Core backend services supporting the multi-agent orchestration platform',
      icon: Server,
      color: 'cyan',
      architecture: [
        'Ollama API Service (Port 5002) - LLM integration and model management',
        'Strands SDK Integration (Port 5006) - Tool registration and workflow execution',
        'Database & Storage - SQLite storage for sessions, agents, and metrics',
        'Health Monitoring - Service status and performance tracking',
        'Configuration Management - Runtime parameter updates'
      ],
      services: [
        'Ollama API Service (Port 5002)',
        'Strands SDK API (Port 5006)',
        'SQLite Database Layer',
        'Health Monitoring System',
        'Configuration Management API'
      ]
    },
    'agent-ecosystem': {
      title: 'Agent Ecosystem',
      description: 'Specialized AI agents with domain-specific capabilities and verification',
      icon: Bot,
      color: 'green',
      architecture: [
        'Weather Agent - Meteorological data retrieval and analysis',
        'Creative Assistant - Creative writing, poetry, and storytelling',
        'Calculator Agent - Mathematical computations and data analysis',
        'Verification System - Authenticity markers for all agent outputs',
        'Capability Mapping - Domain expertise and skill matching'
      ],
      services: [
        'Weather Agent (qwen3:1.7b)',
        'Creative Assistant (qwen3:1.7b)',
        'Calculator Agent (qwen3:1.7b)',
        'Agent Verification System',
        'Capability Registry Service'
      ]
    },
    'platform-components': {
      title: 'Platform Components',
      description: 'Additional platform features and tools for comprehensive agent management',
      icon: Settings,
      color: 'blue',
      architecture: [
        'Ollama Terminal - Direct model access and command line interface',
        'Document Chat - RAG integration and document processing',
        'MCP Gateway - Model Context Protocol integration and tool management',
        'AI Marketplace - Agent marketplace and community sharing',
        'Multi Agent Workspace - Collaborative environment for agent coordination',
        'Agent Command Centre - Agent creation and project management'
      ],
      services: [
        'Ollama Terminal Interface',
        'Document Processing Service',
        'MCP Gateway API',
        'AI Marketplace Platform',
        'Multi Agent Workspace Engine',
        'Agent Command Centre API'
      ]
    },
    'agent-command-centre': {
      title: 'AgentOS Command Centre',
      description: 'Central hub for agent creation and management within the AgentOS ecosystem',
      icon: Command,
      color: 'green',
      architecture: [
        'AgentOS Agent Creation Wizard',
        'AgentOS Quick Action Engine',
        'AgentOS Project Management System',
        'AgentOS Cost Analysis & Tracking',
        'AgentOS Template Management Framework'
      ],
      services: [
        'AgentOS Agent Creation API',
        'AgentOS Project Data Management Service',
        'AgentOS Template Storage System',
        'AgentOS Cost Tracking Service'
      ]
    },
    'mcp-gateway': {
      title: 'AgentOS MCP Gateway',
      description: 'Model Context Protocol integration and tool management for AgentOS agents',
      icon: Server,
      color: 'orange',
      architecture: [
        'AgentOS MCP Server Discovery Engine',
        'AgentOS Tool Registry & Verification System',
        'AgentOS Gateway Load Balancer',
        'AgentOS Analytics & Monitoring Dashboard',
        'AgentOS Health Check & Failover System'
      ],
      services: [
        'AgentOS MCP Server Registry',
        'AgentOS Tool Discovery Service',
        'AgentOS Gateway Health Monitoring',
        'AgentOS Connection Management Service'
      ]
    },
    'multi-agent-workspace': {
      title: 'AgentOS Multi-Agent Workspace',
      description: 'Collaborative environment for multi-agent workflows within AgentOS',
      icon: Bot,
      color: 'cyan',
      architecture: [
        'AgentOS Workspace Management System',
        'AgentOS Agent Palette & Template Library',
        'AgentOS Drag & Drop Interface Engine',
        'AgentOS Properties Configuration Panel',
        'AgentOS Real-time Collaboration Framework'
      ],
      services: [
        'AgentOS Workspace State Management',
        'AgentOS Agent Template System',
        'AgentOS Drag & Drop Engine',
        'AgentOS Properties Configuration Service'
      ]
    },
    'agent-runtime': {
      title: 'AgentOS Runtime Engine',
      description: 'Core execution environment for AI agents within the AgentOS platform',
      icon: Zap,
      color: 'purple',
      architecture: [
        'AgentOS Multi-threaded Execution Engine',
        'AgentOS Memory Management System',
        'AgentOS Framework Adapter Layer',
        'AgentOS Task Queue & Scheduler',
        'AgentOS Context Preservation Engine'
      ],
      services: [
        'AWS Bedrock - Foundation Models',
        'AWS AgentCore - Agent Framework',
        'AWS Strands - Workflow Engine',
        'AgentOS Memory Store Management',
        'AgentOS Task Execution Service'
      ]
    },
    'agent-control-panel': {
      title: 'AgentOS Control Panel',
      description: 'Monitoring and lifecycle management for agents within AgentOS',
      icon: Activity,
      color: 'red',
      architecture: [
        'AgentOS Real-time Monitoring Dashboard',
        'AgentOS Deployment Automation System',
        'AgentOS Identity & Access Management',
        'AgentOS Performance Analytics Engine',
        'AgentOS Automated Scaling Framework'
      ],
      services: [
        'AgentOS Monitoring Dashboard Service',
        'AgentOS Deployment Management API',
        'AgentOS Performance Analytics Service',
        'AgentOS Health Check System'
      ]
    },
    'aws-services': {
      title: 'AgentOS Core Services',
      description: 'Core AWS services powering the AgentOS platform infrastructure',
      icon: Cloud,
      color: 'amber',
      architecture: [
        'AgentOS AWS Bedrock Integration Layer',
        'AgentOS Serverless Computing Framework',
        'AgentOS Managed Database Services',
        'AgentOS Monitoring & Observability Platform',
        'AgentOS Security & Compliance Framework'
      ],
      services: [
        'AWS Bedrock - Foundation Models',
        'AWS AgentCore - Agent Framework',
        'AWS Strands - Workflow Engine',
        'Model Context Protocol (MCP)',
        'AgentOS Runtime Environment'
      ]
    },
    'enhanced-orchestration': {
      title: 'Enhanced LLM Orchestration',
      description: 'Advanced AI-powered orchestration system with intelligent agent selection and memory optimization',
      icon: Brain,
      color: 'purple',
      architecture: [
        '5-Stage Intelligent Processing Pipeline',
        '3-Stage LLM Reasoning Engine',
        'Dynamic Agent Selection System',
        'Memory-Optimized Session Management',
        'Real-time Orchestration Monitoring'
      ],
      services: [
        'Enhanced Orchestration API (Port 5014)',
        'LLM Analysis Engine (llama3.2:1b)',
        'Agent Registry Integration',
        'Session Management & Cleanup',
        'Performance Monitoring & Analytics'
      ]
    },
    'industry-solutions': {
      title: 'AgentOS Industry Solutions',
      description: 'Specialized AgentOS solutions tailored for different industry verticals',
      icon: Globe,
      color: 'indigo',
      architecture: [
        'AgentOS Banking & Financial Services Platform',
        'AgentOS Telecommunications Operations Center',
        'AgentOS Healthcare Management System',
        'AgentOS Industry-specific AI Models',
        'AgentOS Compliance & Regulatory Framework'
      ],
      services: [
        'AgentOS Banking - Wealth Management Platform',
        'AgentOS Telco - Customer Value Management',
        'AgentOS Healthcare - Patient Care System',
        'AgentOS Industry-specific Templates',
        'AgentOS Compliance & Risk Management'
      ]
    }
  };

  // Layer Popup Component
  const LayerPopup: React.FC<{ layerId: string; onClose: () => void }> = ({ layerId, onClose }) => {
    const layer = layerDefinitions[layerId as keyof typeof layerDefinitions];
    if (!layer) return null;

    const IconComponent = layer.icon;
    const layerComponents = detailedComponents.filter(c => c.parent === layerId);

    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-white">
              <div className={`p-3 rounded-lg bg-${layer.color}-600`}>
                <IconComponent className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{layer.title}</h2>
                <p className="text-gray-400 text-sm font-normal">{layer.description}</p>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Components in this Layer */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Network className="w-5 h-5" />
                AgentOS Components
              </h3>
              <div className="space-y-3">
                {layerComponents.map(component => {
                  const ComponentIcon = component.icon;
                  return (
                    <div key={component.id} className="p-4 bg-gray-800 rounded-lg border border-gray-600">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`p-2 rounded-lg ${component.color}`}>
                          <ComponentIcon className="w-4 h-4 text-white" />
                        </div>
                        <h4 className="font-medium text-white">{component.name}</h4>
                      </div>
                      <div className="space-y-1">
                        {component.details.map(detail => (
                          <div key={detail} className="flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full ${component.color.replace('bg-', 'bg-')} opacity-75`}></div>
                            <span className="text-xs text-gray-300">{detail}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Architecture & Services */}
            <div className="space-y-6">
              {/* Architecture */}
              <div>
                <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                  <Code className="w-5 h-5" />
                  AgentOS Architecture
                </h3>
                <div className="space-y-2">
                  {layer.architecture.map((item, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                      <div className={`w-2 h-2 rounded-full bg-${layer.color}-500`}></div>
                      <span className="text-sm text-gray-300">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* AWS Services */}
              <div>
                <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                  <Cloud className="w-5 h-5" />
                  AgentOS Services
                </h3>
                <div className="space-y-2">
                  {layer.services.map((service, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                      <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                      <span className="text-sm text-gray-300">{service}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  // Component Card for elevated design
  const ComponentCard: React.FC<{
    component: any;
    isAnimating: boolean;
    compact?: boolean;
  }> = ({ component, isAnimating, compact = false }) => {
    const IconComponent = component.icon;
    const isSelected = selectedComponent === component.id;
    
    return (
      <div
        className={`relative group cursor-pointer transition-all duration-300 ${
          isSelected ? 'scale-105 z-30' : 'z-20'
        }`}
        onClick={() => setSelectedComponent(isSelected ? null : component.id)}
      >
        {/* Glow effect */}
        <div className={`absolute inset-0 rounded-lg ${component.color} opacity-20 blur-lg ${
          isSelected ? 'opacity-40 blur-xl' : ''
        } ${isAnimating ? 'animate-pulse' : ''}`}></div>
        
        {/* Main Component Card */}
        <div className={`relative ${compact ? 'p-3' : 'p-4'} rounded-lg border-2 ${
          isSelected ? 'border-purple-400 shadow-lg shadow-purple-400/30' : 'border-gray-600/50'
        } bg-gray-900/90 backdrop-blur-sm hover:border-gray-500 transition-all ${compact ? 'min-h-[140px]' : 'min-h-[160px]'}`}>
          
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className={`${compact ? 'p-2' : 'p-3'} rounded-lg ${component.color} relative`}>
                <IconComponent className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} text-white`} />
                
                {/* Status indicator */}
                <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className={`${compact ? 'text-sm' : 'text-sm'} font-medium text-white leading-tight`}>
                  {component.name}
                </h4>
              </div>
            </div>
            
            {/* Key Features - Show All */}
            <div className="space-y-1.5 pl-2">
              {component.details.map((detail, index) => (
                <div key={detail} className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${component.color.replace('bg-', 'bg-')} opacity-75`}></div>
                  <span className="text-xs text-gray-300 leading-tight">
                    {detail}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Hover tooltip */}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-40">
          Click for AgentOS details
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <div>
            <CardTitle className="text-white flex items-center gap-2">
              <Network className="w-5 h-5" />
              AgentOS Studio Strands - Multi-Agent Orchestration Architecture
            </CardTitle>
            <p className="text-gray-400 text-sm mt-1">
              Complete multi-agent orchestration platform with A2A communication, Main System Orchestrator, and intelligent agent coordination
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="architecture" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-800">
              <TabsTrigger value="architecture" className="flex items-center gap-2">
                <Database className="w-4 h-4" />
                Architecture Blueprint
              </TabsTrigger>
              <TabsTrigger value="logical-flow" className="flex items-center gap-2">
                <Workflow className="w-4 h-4" />
                AgentOS Logical Flow
              </TabsTrigger>
            </TabsList>

            <TabsContent value="architecture" className="space-y-6 mt-6">
              <div className="flex flex-row items-center justify-between mb-4">
                <div></div>
                <div className="flex gap-2">
                  <Button
                    variant={viewMode === 'overview' ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode('overview')}
                    className="text-white"
                  >
                    Overview
                  </Button>
                  <Button
                    variant={viewMode === 'detailed' ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode('detailed')}
                    className="text-white"
                  >
                    Detailed
                  </Button>
                  <Button
                    variant={isAnimating ? "default" : "outline"}
                    size="sm"
                    onClick={() => setIsAnimating(!isAnimating)}
                    className="text-white"
                  >
                    {isAnimating ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                    {isAnimating ? 'Pause Flow' : 'Start Flow'}
                  </Button>
                </div>
              </div>

              {/* Enhanced Architecture Visualization */}
          <div className="relative bg-gradient-to-br from-indigo-950 via-purple-950 to-gray-900 rounded-lg border-2 border-purple-500/30 p-8 min-h-[800px]">
            
            {/* AWS Cloud Container */}
            <div className="absolute top-4 left-4 right-4 h-16 border-2 border-orange-500/50 rounded-lg bg-orange-500/10 flex items-center px-4">
              <div className="flex items-center gap-2">
                <Cloud className="w-5 h-5 text-orange-400" />
                <span className="text-orange-400 font-medium">AgentOS Cloud Infrastructure</span>
              </div>
            </div>

            {/* Main Architecture Sections */}
            <div className="mt-24 space-y-8">
              
              {/* Frontend Interface Layer */}
              <div 
                className="border-2 border-blue-500/50 rounded-lg bg-blue-500/10 p-6 cursor-pointer hover:bg-blue-500/20 transition-all duration-300"
                onClick={() => setSelectedLayer('user-interaction')}
              >
                <h3 className="text-blue-400 font-medium mb-4 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  AgentOS Frontend Interface Layer (Port 5173)
                  <span className="text-xs text-gray-400 ml-auto">Click to explore</span>
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {detailedComponents.filter(c => c.parent === 'user-interaction').map(component => (
                    <ComponentCard key={component.id} component={component} isAnimating={isAnimating} />
                  ))}
                </div>
              </div>

              {/* Main System Orchestrator Layer */}
              <div 
                className="border-2 border-purple-500/50 rounded-lg bg-purple-500/10 p-6 cursor-pointer hover:bg-purple-500/20 transition-all duration-300"
                onClick={() => setSelectedLayer('main-orchestrator')}
              >
                <h3 className="text-purple-400 font-medium mb-4 flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  Main System Orchestrator (Port 5031)
                  <span className="text-xs text-gray-400 ml-auto">Click to explore</span>
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {detailedComponents.filter(c => c.parent === 'main-orchestrator').map(component => (
                    <ComponentCard key={component.id} component={component} isAnimating={isAnimating} />
                  ))}
                </div>
              </div>

              {/* A2A Service & Backend Services Layer */}
              <div className="grid grid-cols-2 gap-6">
                {/* A2A Service */}
                <div 
                  className="border-2 border-orange-500/50 rounded-lg bg-orange-500/10 p-6 cursor-pointer hover:bg-orange-500/20 transition-all duration-300"
                  onClick={() => setSelectedLayer('a2a-service')}
                >
                  <h3 className="text-orange-400 font-medium mb-4 flex items-center gap-2">
                    <Network className="w-4 h-4" />
                    A2A Service (Port 5008)
                    <span className="text-xs text-gray-400 ml-auto">Click to explore</span>
                  </h3>
                  <div className="space-y-3">
                    {detailedComponents.filter(c => c.parent === 'a2a-service').map(component => (
                      <ComponentCard key={component.id} component={component} isAnimating={isAnimating} compact />
                    ))}
                  </div>
                </div>

                {/* Backend Services */}
                <div 
                  className="border-2 border-cyan-500/50 rounded-lg bg-cyan-500/10 p-6 cursor-pointer hover:bg-cyan-500/20 transition-all duration-300"
                  onClick={() => setSelectedLayer('backend-services')}
                >
                  <h3 className="text-cyan-400 font-medium mb-4 flex items-center gap-2">
                    <Server className="w-4 h-4" />
                    Backend Services Layer
                    <span className="text-xs text-gray-400 ml-auto">Click to explore</span>
                  </h3>
                  <div className="space-y-3">
                    {detailedComponents.filter(c => c.parent === 'backend-services').map(component => (
                      <ComponentCard key={component.id} component={component} isAnimating={isAnimating} compact />
                    ))}
                  </div>
                </div>
              </div>

              {/* Agent Ecosystem Layer */}
              <div 
                className="border-2 border-green-500/50 rounded-lg bg-green-500/10 p-6 cursor-pointer hover:bg-green-500/20 transition-all duration-300"
                onClick={() => setSelectedLayer('agent-ecosystem')}
              >
                <h3 className="text-green-400 font-medium mb-4 flex items-center gap-2">
                  <Bot className="w-4 h-4" />
                  Agent Ecosystem (Ollama Core Port 11434)
                  <span className="text-xs text-gray-400 ml-auto">Click to explore</span>
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {detailedComponents.filter(c => c.parent === 'agent-ecosystem').map(component => (
                    <ComponentCard key={component.id} component={component} isAnimating={isAnimating} />
                  ))}
                </div>
              </div>

              {/* Platform Components Layer */}
              <div 
                className="border-2 border-blue-600/50 rounded-lg bg-blue-600/10 p-6 cursor-pointer hover:bg-blue-600/20 transition-all duration-300"
                onClick={() => setSelectedLayer('platform-components')}
              >
                <h3 className="text-blue-300 font-medium mb-4 flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Platform Components
                  <span className="text-xs text-gray-400 ml-auto">Click to explore</span>
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {detailedComponents.filter(c => c.parent === 'platform-components').map(component => (
                    <ComponentCard key={component.id} component={component} isAnimating={isAnimating} />
                  ))}
                </div>
              </div>

              {/* System Flow Information */}
              <div className="border-2 border-gray-600/50 rounded-lg bg-gray-600/10 p-6">
                <h3 className="text-gray-300 font-medium mb-4 flex items-center gap-2">
                  <Workflow className="w-4 h-4" />
                  Multi-Agent Orchestration Workflow
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                  <div className="p-3 bg-gray-800/50 rounded-lg">
                    <div className="text-blue-400 font-medium mb-2">1. Query Analysis</div>
                    <div className="text-gray-300 text-xs">User submits query → Orchestrator analyzes task type, complexity, and requirements</div>
                  </div>
                  <div className="p-3 bg-gray-800/50 rounded-lg">
                    <div className="text-purple-400 font-medium mb-2">2. Agent Selection</div>
                    <div className="text-gray-300 text-xs">System discovers agents → Scores relevance → Selects optimal agents</div>
                  </div>
                  <div className="p-3 bg-gray-800/50 rounded-lg">
                    <div className="text-orange-400 font-medium mb-2">3. A2A Execution</div>
                    <div className="text-gray-300 text-xs">Agents execute sequentially → A2A manages handovers → Context preserved</div>
                  </div>
                  <div className="p-3 bg-gray-800/50 rounded-lg">
                    <div className="text-green-400 font-medium mb-2">4. Response Synthesis</div>
                    <div className="text-gray-300 text-xs">Orchestrator aggregates outputs → Formats response → Displays verification</div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Selected Component Details */}
          {selectedComponent && (
            <div className="mt-6 p-4 bg-gray-800 rounded-lg border border-gray-600">
              {(() => {
                const component = detailedComponents.find(c => c.id === selectedComponent);
                if (!component) return null;
                const IconComponent = component.icon;
                
                return (
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`p-3 rounded-lg ${component.color}`}>
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-white">{component.name}</h3>
                        <Badge variant="secondary" className="mt-1">
                          AgentOS Component
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-sm font-medium text-gray-300 mb-3">Key Features</h4>
                        <div className="space-y-2">
                          {component.details.map((detail, index) => (
                            <div key={detail} className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${component.color.replace('bg-', 'bg-')}`}></div>
                              <span className="text-sm text-gray-300">{detail}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-300 mb-3">AgentOS Integration</h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <span className="text-sm text-gray-300">Fully integrated with AgentOS platform</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            <span className="text-sm text-gray-300">Real-time monitoring and analytics</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                            <span className="text-sm text-gray-300">Scalable cloud-native architecture</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

              {/* Layer Details Popup */}
              {selectedLayer && (
                <LayerPopup layerId={selectedLayer} onClose={() => setSelectedLayer(null)} />
              )}
            </TabsContent>

            <TabsContent value="logical-flow" className="space-y-6 mt-6">
              <AgentOSLogicalFlow />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgentOSArchitectureDesign;