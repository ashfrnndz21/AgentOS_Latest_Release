import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Pause, 
  RotateCcw,
  Users,
  Server,
  Bot,
  Activity,
  Database,
  Cloud,
  Globe,
  Settings,
  Zap,
  Network,
  Monitor,
  Shield,
  BarChart3,
  Plus,
  Brain
} from 'lucide-react';



export const AgentOSLogicalFlow: React.FC = () => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [activeFlow, setActiveFlow] = useState<string[]>([]);

  // Define grouped flow sections for Multi-Agent Orchestration System
  // Updated to reflect actual AgentOS Studio Strands architecture
  const flowSections = [
    // Top Row - Frontend & Orchestration
    {
      id: 'frontend-interface',
      title: 'Frontend Interface',
      position: { x: 40, y: 80 },
      width: 180,
      height: 140,
      color: 'border-blue-500/50 bg-blue-500/10',
      nodes: [
        { id: 'orchestrator-card', name: 'Orchestrator Card', icon: Monitor, color: 'bg-blue-500' },
        { id: 'a2a-monitor', name: 'A2A Monitor', icon: Network, color: 'bg-blue-600' }
      ],
      services: [
        { name: 'React', icon: Globe, color: 'bg-blue-400' },
        { name: 'Port 5173', icon: Zap, color: 'bg-blue-300' }
      ]
    },
    {
      id: 'main-orchestrator',
      title: 'Main Orchestrator',
      position: { x: 260, y: 80 },
      width: 180,
      height: 140,
      color: 'border-purple-500/50 bg-purple-500/10',
      nodes: [
        { id: 'query-analysis', name: 'Query Analysis', icon: Brain, color: 'bg-purple-500' },
        { id: 'agent-selection', name: 'Agent Selection', icon: Shield, color: 'bg-purple-600' }
      ],
      services: [
        { name: 'Port 5031', icon: Server, color: 'bg-purple-400' },
        { name: 'Response Synthesis', icon: Network, color: 'bg-purple-300' }
      ]
    },
    {
      id: 'a2a-service',
      title: 'A2A Service',
      position: { x: 480, y: 80 },
      width: 180,
      height: 140,
      color: 'border-orange-500/50 bg-orange-500/10',
      nodes: [
        { id: 'agent-registry', name: 'Agent Registry', icon: Bot, color: 'bg-orange-500' },
        { id: 'handover-mgr', name: 'Handover Manager', icon: BarChart3, color: 'bg-orange-600' }
      ],
      services: [
        { name: 'Port 5008', icon: Database, color: 'bg-orange-400' },
        { name: 'Message Routing', icon: Server, color: 'bg-orange-300' }
      ]
    },
    {
      id: 'backend-services',
      title: 'Backend Services',
      position: { x: 700, y: 80 },
      width: 180,
      height: 140,
      color: 'border-cyan-500/50 bg-cyan-500/10',
      nodes: [
        { id: 'ollama-api', name: 'Ollama API', icon: Brain, color: 'bg-cyan-500' },
        { id: 'strands-sdk', name: 'Strands SDK', icon: Plus, color: 'bg-cyan-600' }
      ],
      services: [
        { name: 'Port 5002', icon: Bot, color: 'bg-cyan-400' },
        { name: 'Port 5006', icon: Network, color: 'bg-cyan-300' }
      ]
    },
    // Bottom Row - Agent Ecosystem & Platform Components
    {
      id: 'ollama-terminal',
      title: 'Ollama Terminal',
      position: { x: 40, y: 280 },
      width: 180,
      height: 140,
      color: 'border-blue-500/50 bg-blue-500/10',
      nodes: [
        { id: 'terminal-interface', name: 'Terminal Interface', icon: Server, color: 'bg-blue-500' },
        { id: 'model-testing', name: 'Model Testing', icon: Activity, color: 'bg-blue-600' }
      ],
      services: [
        { name: 'Direct Access', icon: Brain, color: 'bg-blue-400' },
        { name: 'CLI Tools', icon: Zap, color: 'bg-blue-300' }
      ]
    },
    {
      id: 'document-chat',
      title: 'Document Chat',
      position: { x: 260, y: 280 },
      width: 180,
      height: 140,
      color: 'border-green-500/50 bg-green-500/10',
      nodes: [
        { id: 'rag-integration', name: 'RAG Integration', icon: Globe, color: 'bg-green-500' },
        { id: 'file-management', name: 'File Management', icon: Database, color: 'bg-green-600' }
      ],
      services: [
        { name: 'Document Processing', icon: Brain, color: 'bg-green-400' },
        { name: 'Context Chat', icon: Network, color: 'bg-green-300' }
      ]
    },
    {
      id: 'mcp-gateway',
      title: 'MCP Gateway',
      position: { x: 480, y: 280 },
      width: 180,
      height: 140,
      color: 'border-orange-500/50 bg-orange-500/10',
      nodes: [
        { id: 'tool-integration', name: 'Tool Integration', icon: Settings, color: 'bg-orange-500' },
        { id: 'server-mgmt', name: 'Server Management', icon: Shield, color: 'bg-orange-600' }
      ],
      services: [
        { name: 'MCP Protocol', icon: Network, color: 'bg-orange-400' },
        { name: 'Connection Hub', icon: Server, color: 'bg-orange-300' }
      ]
    },
    {
      id: 'ai-marketplace',
      title: 'AI Marketplace',
      position: { x: 700, y: 280 },
      width: 180,
      height: 140,
      color: 'border-purple-500/50 bg-purple-500/10',
      nodes: [
        { id: 'agent-marketplace', name: 'Agent Marketplace', icon: Bot, color: 'bg-purple-500' },
        { id: 'template-library', name: 'Template Library', icon: BarChart3, color: 'bg-purple-600' }
      ],
      services: [
        { name: 'Tool Discovery', icon: Brain, color: 'bg-purple-400' },
        { name: 'Community Sharing', icon: Network, color: 'bg-purple-300' }
      ]
    }

  ];

  // Define main flow connections for Multi-Agent Orchestration System
  const sectionConnections = [
    // Top row connections - Orchestration Flow
    { from: 'frontend-interface', to: 'main-orchestrator', label: 'Query', type: 'user' },
    { from: 'main-orchestrator', to: 'a2a-service', label: 'Agent Selection', type: 'control' },
    { from: 'a2a-service', to: 'backend-services', label: 'Execute', type: 'control' },
    
    // Vertical flows (top to bottom) - Platform Components
    { from: 'frontend-interface', to: 'ollama-terminal', label: 'Direct Access', type: 'user' },
    { from: 'main-orchestrator', to: 'document-chat', label: 'Document Query', type: 'control' },
    { from: 'a2a-service', to: 'mcp-gateway', label: 'Tool Integration', type: 'control' },
    { from: 'backend-services', to: 'ai-marketplace', label: 'Agent Discovery', type: 'data' },
    
    // Platform Component connections
    { from: 'ollama-terminal', to: 'document-chat', label: 'Model Access', type: 'data' },
    { from: 'document-chat', to: 'mcp-gateway', label: 'Tool Request', type: 'data' },
    { from: 'mcp-gateway', to: 'ai-marketplace', label: 'Tool Discovery', type: 'data' }

  ];

  // Animation effect
  useEffect(() => {
    if (isAnimating) {
      const interval = setInterval(() => {
        const randomConnection = sectionConnections[Math.floor(Math.random() * sectionConnections.length)];
        setActiveFlow([randomConnection.from, randomConnection.to]);
        
        setTimeout(() => {
          setActiveFlow([]);
        }, 1500);
      }, 2500);

      return () => clearInterval(interval);
    }
  }, [isAnimating]);

  // Get connection path between sections with advanced curves
  const getSectionConnectionPath = (fromSection: any, toSection: any): string => {
    const fromX = fromSection.position.x + fromSection.width / 2;
    const fromY = fromSection.position.y + fromSection.height;
    const toX = toSection.position.x + toSection.width / 2;
    const toY = toSection.position.y;
    
    // Calculate control points for smooth S-curves
    const deltaX = toX - fromX;
    const deltaY = toY - fromY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    // Create more sophisticated curves based on direction
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal flow - use S-curve
      const midX = fromX + deltaX / 2;
      const controlOffset = Math.min(60, distance / 4);
      return `M ${fromX} ${fromY} C ${fromX} ${fromY + controlOffset}, ${midX} ${fromY + controlOffset}, ${midX} ${fromY + deltaY / 2} S ${toX} ${toY - controlOffset}, ${toX} ${toY}`;
    } else {
      // Vertical flow - use gentle curve
      const controlOffset = Math.min(80, distance / 3);
      return `M ${fromX} ${fromY} C ${fromX + controlOffset} ${fromY}, ${toX - controlOffset} ${toY}, ${toX} ${toY}`;
    }
  };

  // Section component with enhanced visuals
  const SectionComponent: React.FC<{ section: any }> = ({ section }) => {
    const isInActiveFlow = activeFlow.includes(section.id);
    
    return (
      <div
        className={`absolute rounded-lg border-2 ${section.color} p-4 transition-all duration-500 backdrop-blur-sm ${
          isInActiveFlow 
            ? 'shadow-xl shadow-purple-400/40 border-purple-400 scale-105 bg-opacity-20' 
            : 'hover:shadow-lg hover:scale-102 bg-opacity-10'
        }`}
        style={{ 
          left: section.position.x, 
          top: section.position.y,
          width: section.width,
          height: section.height
        }}
      >
        {/* Animated background gradient for active sections */}
        {isInActiveFlow && (
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-500/20 via-transparent to-purple-600/20 animate-pulse"></div>
        )}
        
        {/* Section title */}
        <h3 className={`relative text-white font-medium text-sm mb-3 text-center ${
          isInActiveFlow ? 'text-purple-200' : ''
        }`}>
          {section.title}
        </h3>
        
        {/* Nodes within section */}
        <div className={`relative grid gap-3 mb-3 ${
          section.nodes.length <= 2 ? 'grid-cols-2' : 
          section.nodes.length <= 3 ? 'grid-cols-3' : 'grid-cols-4'
        }`}>
          {section.nodes.map((node: any) => {
            const IconComponent = node.icon;
            const isSelected = selectedNode === node.id;
            
            return (
              <div
                key={node.id}
                className={`cursor-pointer transition-all duration-300 transform ${
                  isSelected ? 'scale-110 z-10' : 'hover:scale-105'
                } ${isInActiveFlow ? 'animate-pulse' : ''}`}
                onClick={() => setSelectedNode(isSelected ? null : node.id)}
              >
                <div className={`relative rounded-lg border-2 ${
                  isSelected 
                    ? 'border-purple-400 shadow-xl shadow-purple-400/50 bg-purple-500/20' 
                    : 'border-gray-600/50 hover:border-gray-400'
                } ${node.color} bg-opacity-90 backdrop-blur-sm transition-all duration-300 p-3 h-16 group`}>
                  
                  {/* Glow effect for selected nodes */}
                  {isSelected && (
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-400/30 to-purple-600/30 animate-pulse"></div>
                  )}
                  
                  <div className="relative flex flex-col items-center gap-2 h-full justify-center">
                    <IconComponent className={`w-5 h-5 text-white transition-all duration-300 ${
                      isSelected ? 'scale-110' : 'group-hover:scale-105'
                    }`} />
                    <span className={`text-xs font-medium text-white text-center leading-tight transition-all duration-300 ${
                      isSelected ? 'text-purple-100' : ''
                    }`}>
                      {node.name}
                    </span>
                  </div>
                  
                  {/* Enhanced status indicator */}
                  <div className={`absolute top-2 right-2 w-3 h-3 rounded-full transition-all duration-300 ${
                    isSelected ? 'bg-purple-400 animate-ping' : 'bg-green-400'
                  }`}>
                    <div className={`absolute inset-0 rounded-full ${
                      isSelected ? 'bg-purple-400' : 'bg-green-400'
                    } animate-pulse`}></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Underlying Services */}
        {section.services && (
          <div className="relative">
            <div className="text-xs text-gray-400 mb-2 text-center">Powered by:</div>
            <div className="flex justify-center gap-2">
              {section.services.map((service: any, index: number) => {
                const ServiceIcon = service.icon;
                return (
                  <div
                    key={index}
                    className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${service.color} bg-opacity-20 border border-current border-opacity-30 transition-all duration-300 hover:bg-opacity-30`}
                  >
                    <ServiceIcon className="w-3 h-3 text-white" />
                    <span className="text-white font-medium">{service.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-white flex items-center gap-2">
            <Network className="w-5 h-5" />
            Multi-Agent Orchestration Flow
          </CardTitle>
          <p className="text-gray-400 text-sm mt-1">
            Interactive visualization of A2A communication, agent coordination, and orchestration workflow
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={isAnimating ? "default" : "outline"}
            size="sm"
            onClick={() => setIsAnimating(!isAnimating)}
            className="text-white"
          >
            {isAnimating ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
            {isAnimating ? 'Pause Flow' : 'Start Flow'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedNode(null);
              setActiveFlow([]);
            }}
            className="text-white"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Flow Diagram */}
        <div className="relative bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 rounded-lg border-2 border-gray-700 p-6 h-[700px] overflow-x-auto overflow-y-hidden">
          <div className="min-w-[1200px] h-full">
          
          {/* Title */}
          <div className="text-center mb-4">
            <h2 className="text-xl font-bold text-white mb-1">AgentOS Architecture Flow</h2>
            <p className="text-gray-400 text-sm">Interactive component connections and data flow</p>
          </div>
          
          {/* SVG for section connections with advanced effects */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 10 }}>
            <defs>
              {/* Gradient definitions for connections */}
              <linearGradient id="activeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#A855F7" stopOpacity="1" />
                <stop offset="100%" stopColor="#C084FC" stopOpacity="0.8" />
              </linearGradient>
              <linearGradient id="inactiveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#4B5563" stopOpacity="0.3" />
                <stop offset="50%" stopColor="#6B7280" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#4B5563" stopOpacity="0.3" />
              </linearGradient>
              
              {/* Glow filter for active connections */}
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              
              {/* Animated dash pattern */}
              <pattern id="animatedDash" patternUnits="userSpaceOnUse" width="20" height="4">
                <rect width="20" height="4" fill="none"/>
                <rect width="10" height="4" fill="currentColor" opacity="0.8">
                  <animateTransform attributeName="transform" type="translate" 
                    values="0,0; 20,0; 0,0" dur="2s" repeatCount="indefinite"/>
                </rect>
              </pattern>
            </defs>
            
            {sectionConnections.map((connection, index) => {
              const fromSection = flowSections.find(s => s.id === connection.from);
              const toSection = flowSections.find(s => s.id === connection.to);
              
              if (!fromSection || !toSection) return null;
              
              const isActive = activeFlow.includes(connection.from) && activeFlow.includes(connection.to);
              const pathId = `path-${index}`;
              
              return (
                <g key={index}>
                  {/* Background glow for active connections */}
                  {isActive && (
                    <path
                      d={getSectionConnectionPath(fromSection, toSection)}
                      stroke="url(#activeGradient)"
                      strokeWidth="4"
                      fill="none"
                      opacity="0.2"
                      filter="url(#glow)"
                      className="animate-pulse"
                    />
                  )}
                  
                  {/* Main connection path */}
                  <path
                    id={pathId}
                    d={getSectionConnectionPath(fromSection, toSection)}
                    stroke={isActive ? 'url(#activeGradient)' : 'url(#inactiveGradient)'}
                    strokeWidth={isActive ? 2.5 : 1.5}
                    fill="none"
                    strokeDasharray={
                      connection.type === 'data' ? '12,6' : 
                      connection.type === 'control' ? '18,8' : 'none'
                    }
                    className={isActive ? 'animate-pulse' : 'transition-all duration-500'}
                    opacity={isActive ? 1 : 0.6}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  
                  {/* Animated flow particles for active connections */}
                  {isActive && (
                    <>
                      <circle r="4" fill="#A855F7" opacity="0.8">
                        <animateMotion dur="3s" repeatCount="indefinite">
                          <mpath href={`#${pathId}`}/>
                        </animateMotion>
                      </circle>
                      <circle r="3" fill="#C084FC" opacity="0.6">
                        <animateMotion dur="3s" begin="0.5s" repeatCount="indefinite">
                          <mpath href={`#${pathId}`}/>
                        </animateMotion>
                      </circle>
                      <circle r="2" fill="#DDD6FE" opacity="0.8">
                        <animateMotion dur="3s" begin="1s" repeatCount="indefinite">
                          <mpath href={`#${pathId}`}/>
                        </animateMotion>
                      </circle>
                    </>
                  )}
                  
                  {/* Enhanced arrow marker */}
                  <g transform={`translate(${toSection.position.x + toSection.width / 2}, ${toSection.position.y})`}>
                    <polygon
                      points="-8,-8 8,-8 0,0"
                      fill={isActive ? '#A855F7' : '#6B7280'}
                      stroke={isActive ? '#8B5CF6' : '#4B5563'}
                      strokeWidth="1"
                      className={isActive ? 'animate-pulse' : ''}
                      filter={isActive ? 'url(#glow)' : 'none'}
                    />
                  </g>
                  
                  {/* Connection label with background */}
                  <g transform={`translate(${(fromSection.position.x + fromSection.width / 2 + toSection.position.x + toSection.width / 2) / 2}, ${(fromSection.position.y + fromSection.height + toSection.position.y) / 2})`}>
                    <rect
                      x="-30" y="-10" width="60" height="20" rx="10"
                      fill={isActive ? '#1F2937' : '#374151'}
                      stroke={isActive ? '#8B5CF6' : '#6B7280'}
                      strokeWidth="1"
                      opacity="0.9"
                      className={isActive ? 'animate-pulse' : ''}
                    />
                    <text
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill={isActive ? '#A855F7' : '#9CA3AF'}
                      fontSize="11"
                      fontWeight="500"
                      className={`${isActive ? 'animate-pulse' : ''}`}
                    >
                      {connection.label}
                    </text>
                  </g>
                </g>
              );
            })}
          </svg>

          {/* Flow Sections */}
          {flowSections.map(section => (
            <SectionComponent key={section.id} section={section} />
          ))}

          </div>

          {/* Legend */}
          <div className="absolute bottom-4 right-4 bg-gray-800/90 backdrop-blur-sm rounded-lg p-3 border border-gray-600">
            <h4 className="text-white font-medium mb-2 text-sm">Flow Types</h4>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-gray-500"></div>
                <span className="text-xs text-gray-300">User</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-gray-500" style={{ background: 'repeating-linear-gradient(to right, #6B7280 0, #6B7280 6px, transparent 6px, transparent 9px)' }}></div>
                <span className="text-xs text-gray-300">Data</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-gray-500" style={{ background: 'repeating-linear-gradient(to right, #6B7280 0, #6B7280 9px, transparent 9px, transparent 12px)' }}></div>
                <span className="text-xs text-gray-300">Control</span>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Node Details */}
        {selectedNode && (
          <div className="mt-6 p-4 bg-gray-800 rounded-lg border border-gray-600">
            {(() => {
              // Find the node in any section
              let selectedNodeData = null;
              let parentSection = null;
              
              for (const section of flowSections) {
                const node = section.nodes.find(n => n.id === selectedNode);
                if (node) {
                  selectedNodeData = node;
                  parentSection = section;
                  break;
                }
              }
              
              if (!selectedNodeData || !parentSection) return null;
              
              const IconComponent = selectedNodeData.icon;
              
              return (
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-3 rounded-lg ${selectedNodeData.color}`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">{selectedNodeData.name}</h3>
                      <Badge variant="secondary" className="mt-1">
                        {parentSection.title}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-300 mb-3">Component Role</h4>
                      <p className="text-sm text-gray-300 mb-4">
                        This component is part of the <strong>{parentSection.title}</strong> layer in the AgentOS architecture.
                      </p>
                      
                      <h4 className="text-sm font-medium text-gray-300 mb-3">Key Functions</h4>
                      <div className="space-y-2">
                        {getNodeFunctions(selectedNode).map((func, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${selectedNodeData.color.replace('bg-', 'bg-')}`}></div>
                            <span className="text-sm text-gray-300">{func}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-300 mb-3">AgentOS Integration</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          <span className="text-sm text-gray-300">Active in AgentOS platform</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          <span className="text-sm text-gray-300">Real-time data processing</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                          <span className="text-sm text-gray-300">Cloud-native architecture</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </CardContent>
    </Card>
  );

  // Helper function to get node functions for Multi-Agent Orchestration System
  function getNodeFunctions(nodeId: string): string[] {
    const functions: { [key: string]: string[] } = {
      // Frontend Interface Layer
      'orchestrator-card': ['Query input interface', 'Agent selection display', 'Response formatting', 'Configuration panel'],
      'a2a-monitor': ['Real-time agent coordination', 'Handover tracking', 'Execution metrics', 'Verification display'],
      
      // Main Orchestrator Layer
      'query-analysis': ['Query type detection', 'Task decomposition', 'Complexity analysis', 'Workflow pattern selection'],
      'agent-selection': ['Agent discovery', 'Relevance scoring', 'Capability matching', 'Dynamic selection'],
      
      // A2A Service Layer
      'agent-registry': ['Agent discovery', 'Capability mapping', 'Status tracking', 'Health monitoring'],
      'handover-mgr': ['Task transitions', 'Context preservation', 'Verification markers', 'Error recovery'],
      
      // Backend Services Layer
      'ollama-api': ['Model management', 'Response generation', 'Health monitoring', 'Agent configuration'],
      'strands-sdk': ['Tool registration', 'Workflow execution', 'Agent framework', 'Integration layer'],
      
      // Agent Ecosystem Layer
      'weather-data': ['Weather data retrieval', 'Meteorological analysis', 'Climate information', 'Forecast services'],
      'meteorological': ['Weather pattern analysis', 'Climate data processing', 'Forecast generation', 'Data validation'],
      'creative-writing': ['Creative content generation', 'Poetry creation', 'Storytelling', 'Content optimization'],
      'poetry-gen': ['Poem generation', 'Rhyme schemes', 'Creative expression', 'Artistic content'],
      'math-compute': ['Mathematical calculations', 'Numerical processing', 'Formula evaluation', 'Computation engine'],
      'data-analysis': ['Statistical analysis', 'Data processing', 'Trend analysis', 'Report generation'],
      
      // Platform Components Layer
      'terminal-interface': ['Command line interface', 'Direct model access', 'Debug tools', 'System monitoring'],
      'model-testing': ['Model validation', 'Performance testing', 'Response evaluation', 'Quality assurance'],
      'rag-integration': ['Retrieval augmented generation', 'Document processing', 'Context extraction', 'Knowledge base'],
      'file-management': ['Document storage', 'File organization', 'Version control', 'Access management'],
      'tool-integration': ['Tool registration', 'API integration', 'Service discovery', 'Connection management'],
      'server-mgmt': ['Server configuration', 'Health monitoring', 'Load balancing', 'Resource management'],
      'agent-marketplace': ['Agent discovery', 'Template sharing', 'Community features', 'Rating system'],
      'template-library': ['Pre-built templates', 'Custom templates', 'Version control', 'Documentation']
    };
    
    return functions[nodeId] || ['Core functionality', 'System integration', 'Data processing'];
  }
};

export default AgentOSLogicalFlow;