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
  X
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
      name: 'AgentOS Dashboard',
      icon: Monitor,
      color: 'bg-blue-500',
      details: ['Industry Selection Hub', 'AgentOS Navigation', 'Real-time Status Overview'],
      parent: 'user-interaction'
    },
    {
      id: 'theming',
      name: 'AgentOS Theming Engine',
      icon: Settings,
      color: 'bg-blue-400',
      details: ['Custom AgentOS Branding', 'Industry-specific Themes', 'UI Customization'],
      parent: 'user-interaction'
    },

    // Agent Command Centre Sub-components
    {
      id: 'agent-creation',
      name: 'AgentOS Agent Creation',
      icon: Plus,
      color: 'bg-green-600',
      details: ['Simple Agent Mode', 'Advanced Agent Mode', 'AgentOS Step Wizard'],
      parent: 'agent-command-centre'
    },
    {
      id: 'quick-actions',
      name: 'AgentOS Quick Actions',
      icon: Zap,
      color: 'bg-green-500',
      details: ['Create Agent', 'AWS Strands Workflow', 'Multi-Agent Workspace'],
      parent: 'agent-command-centre'
    },
    {
      id: 'project-management',
      name: 'AgentOS Project Management',
      icon: Database,
      color: 'bg-green-400',
      details: ['Project Data Hub', 'Agent Traceability', 'Cost Analysis Dashboard'],
      parent: 'agent-command-centre'
    },

    // MCP Gateway Sub-components
    {
      id: 'server-management',
      name: 'AgentOS MCP Server Management',
      icon: Server,
      color: 'bg-orange-600',
      details: ['MCP Server Registry', 'Connection Health Monitor', 'Auto Discovery Engine'],
      parent: 'mcp-gateway'
    },
    {
      id: 'tool-registry',
      name: 'AgentOS Tool Registry',
      icon: Code,
      color: 'bg-orange-500',
      details: ['Tool Catalog System', 'Verification Engine', 'Category Management'],
      parent: 'mcp-gateway'
    },
    {
      id: 'gateway-analytics',
      name: 'AgentOS Gateway Analytics',
      icon: BarChart3,
      color: 'bg-orange-400',
      details: ['Usage Metrics Dashboard', 'Performance Analytics', 'Success Rate Tracking'],
      parent: 'mcp-gateway'
    },

    // Multi-Agent Workspace Sub-components
    {
      id: 'workspace-selector',
      name: 'AgentOS Workspace Selector',
      icon: Globe,
      color: 'bg-cyan-600',
      details: ['Wealth Management OS', 'Telco CVM OS', 'Network Twin OS'],
      parent: 'multi-agent-workspace'
    },
    {
      id: 'agent-palette',
      name: 'AgentOS Agent Palette',
      icon: Bot,
      color: 'bg-cyan-500',
      details: ['Pre-configured Agents', 'Drag & Drop Interface', 'Agent Templates'],
      parent: 'multi-agent-workspace'
    },
    {
      id: 'properties-panel',
      name: 'AgentOS Properties Panel',
      icon: Settings,
      color: 'bg-cyan-400',
      details: ['Agent Configuration', 'Connection Management', 'Parameter Settings'],
      parent: 'multi-agent-workspace'
    },

    // Agent Runtime Engine Sub-components
    {
      id: 'execution-engine',
      name: 'AgentOS Execution Engine',
      icon: Zap,
      color: 'bg-purple-600',
      details: ['Task Processing Engine', 'Concurrent Execution', 'Load Balancing'],
      parent: 'agent-runtime'
    },
    {
      id: 'memory-manager',
      name: 'AgentOS Memory Manager',
      icon: Database,
      color: 'bg-purple-500',
      details: ['Context Storage System', 'Memory Store Management', 'State Preservation'],
      parent: 'agent-runtime'
    },
    {
      id: 'framework-adapters',
      name: 'AgentOS Framework Adapters',
      icon: Network,
      color: 'bg-purple-400',
      details: ['AWS Bedrock AgentCore', 'AWS Strands Integration', 'Custom Framework Support'],
      parent: 'agent-runtime'
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
      title: 'AgentOS User Interface Layer',
      description: 'Frontend interfaces and user experience components for the AgentOS platform',
      icon: Users,
      color: 'blue',
      architecture: [
        'AgentOS React Frontend Application',
        'AgentOS Authentication & Authorization System',
        'Industry-specific AgentOS Theming Engine',
        'AgentOS Responsive Dashboard Framework',
        'Real-time AgentOS Status Monitoring Interface'
      ],
      services: [
        'AgentOS React Frontend Framework',
        'AgentOS Authentication Service',
        'AgentOS Local Storage Management',
        'AgentOS Industry Context Service'
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
              AgentOS Architecture Blueprint
            </CardTitle>
            <p className="text-gray-400 text-sm mt-1">
              Complete AgentOS platform architecture with Enhanced LLM Orchestration v2.0 and logical flow visualization
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
              
              {/* User Layer */}
              <div 
                className="border-2 border-blue-500/50 rounded-lg bg-blue-500/10 p-6 cursor-pointer hover:bg-blue-500/20 transition-all duration-300"
                onClick={() => setSelectedLayer('user-interaction')}
              >
                <h3 className="text-blue-400 font-medium mb-4 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  AgentOS User Interface Layer
                  <span className="text-xs text-gray-400 ml-auto">Click to explore</span>
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {detailedComponents.filter(c => c.parent === 'user-interaction').map(component => (
                    <ComponentCard key={component.id} component={component} isAnimating={isAnimating} />
                  ))}
                </div>
              </div>

              {/* Command Centre Layer */}
              <div 
                className="border-2 border-green-500/50 rounded-lg bg-green-500/10 p-6 cursor-pointer hover:bg-green-500/20 transition-all duration-300"
                onClick={() => setSelectedLayer('agent-command-centre')}
              >
                <h3 className="text-green-400 font-medium mb-4 flex items-center gap-2">
                  <Command className="w-4 h-4" />
                  AgentOS Command Centre
                  <span className="text-xs text-gray-400 ml-auto">Click to explore</span>
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {detailedComponents.filter(c => c.parent === 'agent-command-centre').map(component => (
                    <ComponentCard key={component.id} component={component} isAnimating={isAnimating} />
                  ))}
                </div>
              </div>

              {/* Integration Layer */}
              <div className="grid grid-cols-2 gap-6">
                {/* MCP Gateway */}
                <div 
                  className="border-2 border-orange-500/50 rounded-lg bg-orange-500/10 p-6 cursor-pointer hover:bg-orange-500/20 transition-all duration-300"
                  onClick={() => setSelectedLayer('mcp-gateway')}
                >
                  <h3 className="text-orange-400 font-medium mb-4 flex items-center gap-2">
                    <Server className="w-4 h-4" />
                    AgentOS MCP Gateway
                    <span className="text-xs text-gray-400 ml-auto">Click to explore</span>
                  </h3>
                  <div className="space-y-3">
                    {detailedComponents.filter(c => c.parent === 'mcp-gateway').map(component => (
                      <ComponentCard key={component.id} component={component} isAnimating={isAnimating} compact />
                    ))}
                  </div>
                </div>

                {/* Multi-Agent Workspace */}
                <div 
                  className="border-2 border-cyan-500/50 rounded-lg bg-cyan-500/10 p-6 cursor-pointer hover:bg-cyan-500/20 transition-all duration-300"
                  onClick={() => setSelectedLayer('multi-agent-workspace')}
                >
                  <h3 className="text-cyan-400 font-medium mb-4 flex items-center gap-2">
                    <Bot className="w-4 h-4" />
                    AgentOS Multi-Agent Workspace
                    <span className="text-xs text-gray-400 ml-auto">Click to explore</span>
                  </h3>
                  <div className="space-y-3">
                    {detailedComponents.filter(c => c.parent === 'multi-agent-workspace').map(component => (
                      <ComponentCard key={component.id} component={component} isAnimating={isAnimating} compact />
                    ))}
                  </div>
                </div>
              </div>

              {/* Runtime Layer */}
              <div 
                className="border-2 border-purple-500/50 rounded-lg bg-purple-500/10 p-6 cursor-pointer hover:bg-purple-500/20 transition-all duration-300"
                onClick={() => setSelectedLayer('agent-runtime')}
              >
                <h3 className="text-purple-400 font-medium mb-4 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  AgentOS Runtime Engine
                  <span className="text-xs text-gray-400 ml-auto">Click to explore</span>
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {detailedComponents.filter(c => c.parent === 'agent-runtime').map(component => (
                    <ComponentCard key={component.id} component={component} isAnimating={isAnimating} />
                  ))}
                </div>
              </div>

              {/* Enhanced LLM Orchestration Layer */}
              <div 
                className="border-2 border-purple-600/50 rounded-lg bg-purple-600/10 p-6 cursor-pointer hover:bg-purple-600/20 transition-all duration-300"
                onClick={() => setSelectedLayer('enhanced-orchestration')}
              >
                <h3 className="text-purple-300 font-medium mb-4 flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  Enhanced LLM Orchestration v2.0
                  <span className="text-xs text-gray-400 ml-auto">Click to explore</span>
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {detailedComponents.filter(c => c.parent === 'enhanced-orchestration').map(component => (
                    <ComponentCard key={component.id} component={component} isAnimating={isAnimating} />
                  ))}
                </div>
              </div>

              {/* Management & Infrastructure Layer */}
              <div className="grid grid-cols-2 gap-6">
                {/* Agent Control Panel */}
                <div 
                  className="border-2 border-red-500/50 rounded-lg bg-red-500/10 p-6 cursor-pointer hover:bg-red-500/20 transition-all duration-300"
                  onClick={() => setSelectedLayer('agent-control-panel')}
                >
                  <h3 className="text-red-400 font-medium mb-4 flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    AgentOS Control Panel
                    <span className="text-xs text-gray-400 ml-auto">Click to explore</span>
                  </h3>
                  <div className="space-y-3">
                    {detailedComponents.filter(c => c.parent === 'agent-control-panel').map(component => (
                      <ComponentCard key={component.id} component={component} isAnimating={isAnimating} compact />
                    ))}
                  </div>
                </div>

                {/* AWS Services */}
                <div 
                  className="border-2 border-amber-500/50 rounded-lg bg-amber-500/10 p-6 cursor-pointer hover:bg-amber-500/20 transition-all duration-300"
                  onClick={() => setSelectedLayer('aws-services')}
                >
                  <h3 className="text-amber-400 font-medium mb-4 flex items-center gap-2">
                    <Cloud className="w-4 h-4" />
                    AgentOS Core Services
                    <span className="text-xs text-gray-400 ml-auto">Click to explore</span>
                  </h3>
                  <div className="space-y-3">
                    {detailedComponents.filter(c => c.parent === 'aws-services').map(component => (
                      <ComponentCard key={component.id} component={component} isAnimating={isAnimating} compact />
                    ))}
                  </div>
                </div>
              </div>

              {/* Industry Solutions Layer */}
              <div 
                className="border-2 border-indigo-500/50 rounded-lg bg-indigo-500/10 p-6 cursor-pointer hover:bg-indigo-500/20 transition-all duration-300"
                onClick={() => setSelectedLayer('industry-solutions')}
              >
                <h3 className="text-indigo-400 font-medium mb-4 flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  AgentOS Industry Solutions
                  <span className="text-xs text-gray-400 ml-auto">Click to explore</span>
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {detailedComponents.filter(c => c.parent === 'industry-solutions').map(component => (
                    <ComponentCard key={component.id} component={component} isAnimating={isAnimating} />
                  ))}
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