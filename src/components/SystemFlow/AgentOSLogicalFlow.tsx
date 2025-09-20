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

  // Define grouped flow sections in a 4x2 grid layout for single screen view
  // Grid: 4 columns x 2 rows with proper spacing
  // Container: ~1200px wide, sections: 180px wide with 80px gaps
  const flowSections = [
    // Top Row (4 columns)
    {
      id: 'user-interface',
      title: 'User Interface',
      position: { x: 40, y: 80 },
      width: 180,
      height: 140,
      color: 'border-blue-500/50 bg-blue-500/10',
      nodes: [
        { id: 'sidebar', name: 'Sidebar', icon: Monitor, color: 'bg-blue-500' },
        { id: 'main-content', name: 'Main Content', icon: Users, color: 'bg-blue-600' }
      ],
      services: [
        { name: 'React', icon: Globe, color: 'bg-blue-400' },
        { name: 'Vite', icon: Zap, color: 'bg-blue-300' }
      ]
    },
    {
      id: 'industry-context',
      title: 'Industry Context',
      position: { x: 260, y: 80 },
      width: 180,
      height: 140,
      color: 'border-purple-500/50 bg-purple-500/10',
      nodes: [
        { id: 'industry-provider', name: 'Industry Provider', icon: Settings, color: 'bg-purple-500' },
        { id: 'theme-config', name: 'Theme Config', icon: Shield, color: 'bg-purple-600' }
      ],
      services: [
        { name: 'Supabase', icon: Database, color: 'bg-purple-400' },
        { name: 'React Query', icon: Network, color: 'bg-purple-300' }
      ]
    },
    {
      id: 'agent-dashboard',
      title: 'Agent Dashboard',
      position: { x: 480, y: 80 },
      width: 180,
      height: 140,
      color: 'border-cyan-500/50 bg-cyan-500/10',
      nodes: [
        { id: 'agents-table', name: 'Agents Table', icon: Bot, color: 'bg-cyan-500' },
        { id: 'agent-monitoring', name: 'Agent Monitoring', icon: BarChart3, color: 'bg-cyan-600' }
      ],
      services: [
        { name: 'SQLite', icon: Database, color: 'bg-cyan-400' },
        { name: 'Flask API', icon: Server, color: 'bg-cyan-300' }
      ]
    },
    {
      id: 'command-centre',
      title: 'Agent Command Centre',
      position: { x: 700, y: 80 },
      width: 180,
      height: 140,
      color: 'border-green-500/50 bg-green-500/10',
      nodes: [
        { id: 'create-agent', name: 'Create Agent', icon: Plus, color: 'bg-green-500' },
        { id: 'quick-actions', name: 'Quick Actions', icon: Zap, color: 'bg-green-600' }
      ],
      services: [
        { name: 'AgentCore', icon: Bot, color: 'bg-green-400' },
        { name: 'Strands', icon: Network, color: 'bg-green-300' }
      ]
    },
    // Bottom Row (4 columns)
    {
      id: 'mcp-gateway',
      title: 'MCP Gateway',
      position: { x: 40, y: 280 },
      width: 180,
      height: 140,
      color: 'border-orange-500/50 bg-orange-500/10',
      nodes: [
        { id: 'mcp-settings', name: 'MCP Settings', icon: Server, color: 'bg-orange-500' },
        { id: 'mcp-dashboard', name: 'MCP Dashboard', icon: Network, color: 'bg-orange-600' }
      ],
      services: [
        { name: 'MCP Protocol', icon: Network, color: 'bg-orange-400' },
        { name: 'WebSockets', icon: Activity, color: 'bg-orange-300' }
      ]
    },
    {
      id: 'multi-agent-workspace',
      title: 'Multi-Agent Workspace',
      position: { x: 260, y: 280 },
      width: 180,
      height: 140,
      color: 'border-teal-500/50 bg-teal-500/10',
      nodes: [
        { id: 'agent-palette', name: 'Agent Palette', icon: Globe, color: 'bg-teal-500' },
        { id: 'properties-panel', name: 'Properties Panel', icon: Settings, color: 'bg-teal-600' }
      ],
      services: [
        { name: 'LangChain', icon: Network, color: 'bg-teal-400' },
        { name: 'ChromaDB', icon: Database, color: 'bg-teal-300' }
      ]
    },
    {
      id: 'agentcore-observability',
      title: 'AgentCore Observability',
      position: { x: 480, y: 280 },
      width: 180,
      height: 140,
      color: 'border-red-500/50 bg-red-500/10',
      nodes: [
        { id: 'real-agent-monitoring', name: 'Real Agent Monitoring', icon: Activity, color: 'bg-red-500' },
        { id: 'deployment-control', name: 'Deployment Control', icon: Cloud, color: 'bg-red-600' }
      ],
      services: [
        { name: 'AWS Bedrock', icon: Brain, color: 'bg-red-400' },
        { name: 'Pinecone', icon: Database, color: 'bg-red-300' }
      ]
    },
    {
      id: 'enhanced-orchestration',
      title: 'Enhanced LLM Orchestration',
      position: { x: 700, y: 280 },
      width: 180,
      height: 140,
      color: 'border-purple-600/50 bg-purple-600/10',
      nodes: [
        { id: 'llm-analysis', name: 'LLM Analysis Engine', icon: Brain, color: 'bg-purple-500' },
        { id: 'orchestration-monitor', name: 'Orchestration Monitor', icon: Monitor, color: 'bg-purple-600' }
      ],
      services: [
        { name: 'llama3.2:1b', icon: Brain, color: 'bg-purple-400' },
        { name: 'Port 5014', icon: Server, color: 'bg-purple-300' }
      ]
    }

  ];

  // Define main flow connections optimized for 4x2 grid layout
  const sectionConnections = [
    // Top row connections
    { from: 'user-interface', to: 'industry-context', label: 'Context', type: 'user' },
    { from: 'industry-context', to: 'agent-dashboard', label: 'Templates', type: 'data' },
    { from: 'agent-dashboard', to: 'command-centre', label: 'Create', type: 'user' },
    
    // Vertical flows (top to bottom)
    { from: 'user-interface', to: 'mcp-gateway', label: 'Tools', type: 'control' },
    { from: 'industry-context', to: 'multi-agent-workspace', label: 'Deploy', type: 'data' },
    { from: 'agent-dashboard', to: 'agentcore-observability', label: 'Monitor', type: 'control' },
    { from: 'command-centre', to: 'enhanced-orchestration', label: 'Query', type: 'user' },
    
    // Enhanced Orchestration connections
    { from: 'enhanced-orchestration', to: 'multi-agent-workspace', label: 'Route', type: 'control' },
    { from: 'enhanced-orchestration', to: 'agentcore-observability', label: 'Execute', type: 'control' }

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
            AgentOS Logical Flow
          </CardTitle>
          <p className="text-gray-400 text-sm mt-1">
            Interactive visualization of how AgentOS components connect and communicate
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

  // Helper function to get node functions
  function getNodeFunctions(nodeId: string): string[] {
    const functions: { [key: string]: string[] } = {
      'sidebar': ['Navigation menu', 'Industry-specific routing', 'User interface'],
      'main-content': ['Page rendering', 'Component routing', 'Content display'],
      'industry-provider': ['Industry context management', 'Theme configuration', 'Settings provider'],
      'theme-config': ['UI theming', 'Brand customization', 'Color schemes'],
      'create-agent': ['Agent creation wizard', 'Configuration forms', 'Deployment setup'],
      'quick-actions': ['Rapid agent creation', 'Template selection', 'Workflow shortcuts'],
      'agents-table': ['Agent listing', 'Status display', 'Management interface'],
      'agent-monitoring': ['Performance metrics', 'Health monitoring', 'Real-time status'],
      'mcp-settings': ['MCP server configuration', 'Connection management', 'Tool settings'],
      'mcp-dashboard': ['MCP server overview', 'Tool registry', 'Connection status'],
      'agent-palette': ['Pre-built agent templates', 'Drag & drop interface', 'Agent library'],
      'properties-panel': ['Agent configuration', 'Parameter settings', 'Connection setup'],
      'real-agent-monitoring': ['Live agent tracking', 'Performance analytics', 'Error monitoring'],
      'deployment-control': ['Agent lifecycle', 'Start/stop controls', 'Resource management'],
      'general-settings': ['Application settings', 'User preferences', 'System configuration'],
      'logo-settings': ['Brand customization', 'Logo upload', 'Visual identity'],
      'aws-bedrock': ['Foundation models', 'Claude AI integration', 'Model inference'],
      'aws-lambda': ['Serverless functions', 'Event processing', 'Microservices'],
      'aws-s3': ['Object storage', 'Static assets', 'Data persistence'],
      'aws-dynamodb': ['NoSQL database', 'Agent state storage', 'Configuration data'],
      'aws-cloudwatch': ['Monitoring & logging', 'Performance metrics', 'Error tracking'],
      'aws-iam': ['Identity management', 'Access control', 'Security policies'],
      'aws-guardrails': ['Content filtering', 'Safety controls', 'Compliance monitoring'],
      'agentcore': ['Agent orchestration', 'Workflow management', 'State coordination'],
      'strands': ['Multi-agent workflows', 'Complex reasoning', 'Agent coordination'],
      'langgraph': ['Graph-based workflows', 'State machines', 'Agent orchestration'],
      'llm-analysis': ['Query context analysis', 'Agent capability evaluation', 'Contextual matching', '5-stage processing'],
      'orchestration-monitor': ['Real-time processing visualization', 'Performance metrics', 'Session management', 'Memory optimization']
    };
    
    return functions[nodeId] || ['Core functionality', 'System integration', 'Data processing'];
  }
};

export default AgentOSLogicalFlow;