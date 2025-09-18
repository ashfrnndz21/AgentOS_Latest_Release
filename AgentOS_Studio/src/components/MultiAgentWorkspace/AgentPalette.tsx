import React, { useState, useEffect } from 'react';
import { Bot, Brain, Shield, Database, GitBranch, MessageSquare, Search, Code, FileText, Calculator, Server, Globe, Zap, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { mcpGatewayService, MCPTool } from '@/lib/services/MCPGatewayService';

interface AgentPaletteProps {
  onAddAgent: (agentType: string) => void;
  onAddUtility: (nodeType: string) => void;
  onSelectMCPTool?: (tool: MCPTool) => void;
}

export const AgentPalette: React.FC<AgentPaletteProps> = ({ onAddAgent, onAddUtility, onSelectMCPTool }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mcpTools, setMcpTools] = useState<MCPTool[]>([]);
  const [loading, setLoading] = useState(false);

  // Load MCP tools
  useEffect(() => {
    const loadMCPTools = async () => {
      try {
        setLoading(true);
        const tools = await mcpGatewayService.getTools();
        setMcpTools(tools);
      } catch (error) {
        console.error('Failed to load MCP tools:', error);
      } finally {
        setLoading(false);
      }
    };
    loadMCPTools();
  }, []);

  const agentTypes = [
    { name: 'Researcher Agent', icon: Search, description: 'Researches and gathers information' },
    { name: 'Coder Agent', icon: Code, description: 'Writes and reviews code' },
    { name: 'Writer Agent', icon: FileText, description: 'Creates content and documentation' },
    { name: 'Analyst Agent', icon: Calculator, description: 'Analyzes data and provides insights' },
    { name: 'Coordinator Agent', icon: Bot, description: 'Orchestrates other agents' },
    { name: 'Chat Agent', icon: MessageSquare, description: 'Handles conversations' },
  ];

  const utilityNodes = [
    { name: 'decision', icon: GitBranch, description: 'Decision point in workflow' },
    { name: 'memory', icon: Database, description: 'Shared memory storage' },
    { name: 'guardrail', icon: Shield, description: 'Safety and compliance checks' },
  ];

  const getCategoryIcon = (category: MCPTool['category']) => {
    switch (category) {
      case 'aws': return Database;
      case 'git': return Code;
      case 'filesystem': return Server;
      case 'api': return Globe;
      case 'text': return Zap;
      default: return Settings;
    }
  };

  if (collapsed) {
    return (
      <div className="w-12 bg-beam-dark-accent border-r border-gray-700 p-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setCollapsed(false)}
          className="w-full p-2 text-gray-400 hover:text-white"
        >
          <Bot className="h-5 w-5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="w-80 bg-beam-dark-accent border-r border-gray-700 flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Agent Palette</h2>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setCollapsed(true)}
            className="text-gray-400 hover:text-white"
          >
            ←
          </Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        <Tabs defaultValue="agents" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-beam-dark">
            <TabsTrigger value="agents" className="text-gray-300 data-[state=active]:text-white text-xs">Agents</TabsTrigger>
            <TabsTrigger value="utilities" className="text-gray-300 data-[state=active]:text-white text-xs">Utilities</TabsTrigger>
            <TabsTrigger value="mcp-tools" className="text-gray-300 data-[state=active]:text-white text-xs">MCP Tools</TabsTrigger>
          </TabsList>
          
          <TabsContent value="agents" className="space-y-3 mt-4">
            {agentTypes.map((agent) => (
              <Card 
                key={agent.name}
                className="p-3 bg-beam-dark border-gray-700 hover:border-beam-blue cursor-pointer transition-colors"
                onClick={() => onAddAgent(agent.name)}
              >
                <div className="flex items-start gap-3">
                  <agent.icon className="h-6 w-6 text-beam-blue mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-white">{agent.name}</h3>
                    <p className="text-xs text-gray-400 mt-1">{agent.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>
          
          <TabsContent value="utilities" className="space-y-3 mt-4">
            {utilityNodes.map((node) => (
              <Card 
                key={node.name}
                className="p-3 bg-beam-dark border-gray-700 hover:border-beam-blue cursor-pointer transition-colors"
                onClick={() => onAddUtility(node.name)}
              >
                <div className="flex items-start gap-3">
                  <node.icon className="h-6 w-6 text-amber-400 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-white capitalize">{node.name}</h3>
                    <p className="text-xs text-gray-400 mt-1">{node.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="mcp-tools" className="space-y-3 mt-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-beam-blue mx-auto"></div>
                <p className="text-gray-400 text-sm mt-2">Loading MCP tools...</p>
              </div>
            ) : mcpTools.length === 0 ? (
              <div className="text-center py-8">
                <Server className="h-12 w-12 text-gray-500 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">No MCP tools available</p>
                <p className="text-gray-500 text-xs mt-1">Connect to MCP Gateway first</p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-xs text-gray-400 mb-3">
                  Drag tools to agents to add capabilities
                </div>
                {mcpTools.map((tool) => {
                  const IconComponent = getCategoryIcon(tool.category);
                  return (
                    <Card 
                      key={`${tool.serverId}-${tool.id}`}
                      className="p-2 bg-beam-dark border-gray-700 hover:border-beam-blue cursor-grab active:cursor-grabbing transition-colors"
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('application/json', JSON.stringify({
                          type: 'mcp-tool',
                          tool: tool
                        }));
                      }}
                      onClick={() => onSelectMCPTool?.(tool)}
                    >
                      <div className="flex items-start gap-2">
                        <IconComponent className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1 mb-1">
                            <h3 className="text-xs font-medium text-white truncate">{tool.name}</h3>
                            {tool.verified && (
                              <Badge variant="outline" className="text-xs px-1 py-0 h-4 bg-green-500/20 text-green-400 border-green-500/30">
                                ✓
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 line-clamp-2">{tool.description}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <Badge variant="outline" className="text-xs px-1 py-0 h-4">
                              {tool.category}
                            </Badge>
                            <Badge variant="outline" className="text-xs px-1 py-0 h-4">
                              {tool.usageComplexity}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};