import React, { useState, useEffect } from 'react';
import { Bot, RefreshCw, AlertCircle, Eye, Info, Users, BarChart3, Briefcase, Headphones, Code, BookOpen, FileText, Network, Cpu, Target, Lightbulb, ArrowRight, X, Key, CheckCircle, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

interface StrandsAgentPaletteProps {
  onAddAgent: (agentType: string, agentData?: any) => void;
  onAddUtility: (nodeType: string, utilityData?: any) => void;
  onSelectMCPTool?: (tool: any) => void;
  onSelectStrandsTool?: (tool: any) => void;
}

// Professional agent icons mapping
const getProfessionalAgentIcon = (role: string, capabilities: string[]): { icon: React.ComponentType<any>, color: string } => {
  const roleLower = role.toLowerCase();

  // Business & Customer Management
  if (roleLower.includes('cvm') || roleLower.includes('customer') || roleLower.includes('business'))
    return { icon: Briefcase, color: 'text-blue-500' };

  // Analytics & Data
  if (roleLower.includes('analyst') || roleLower.includes('analysis') || roleLower.includes('data'))
    return { icon: BarChart3, color: 'text-green-500' };

  // Communication & Support
  if (roleLower.includes('chat') || roleLower.includes('conversation') || roleLower.includes('support'))
    return { icon: Headphones, color: 'text-purple-500' };

  // Technical & Development
  if (roleLower.includes('coder') || roleLower.includes('developer') || roleLower.includes('technical'))
    return { icon: Code, color: 'text-orange-500' };

  // Research & Knowledge
  if (roleLower.includes('researcher') || roleLower.includes('research') || roleLower.includes('knowledge'))
    return { icon: BookOpen, color: 'text-indigo-500' };

  // Content & Writing
  if (roleLower.includes('writer') || roleLower.includes('content') || roleLower.includes('creative'))
    return { icon: FileText, color: 'text-pink-500' };

  // Coordination & Management
  if (roleLower.includes('coordinator') || roleLower.includes('manager') || roleLower.includes('orchestrat'))
    return { icon: Target, color: 'text-red-500' };

  // Telecommunications
  if (roleLower.includes('telecom') || roleLower.includes('telco') || roleLower.includes('network'))
    return { icon: Network, color: 'text-cyan-500' };

  // AI & Intelligence
  if (roleLower.includes('ai') || roleLower.includes('intelligent') || roleLower.includes('smart'))
    return { icon: Brain, color: 'text-violet-500' };

  // Expert & Specialist
  if (roleLower.includes('expert') || roleLower.includes('specialist'))
    return { icon: Lightbulb, color: 'text-yellow-500' };

  return { icon: Bot, color: 'text-gray-500' }; // Default
};

export const StrandsAgentPaletteWorking: React.FC<StrandsAgentPaletteProps> = ({
  onAddAgent,
  onAddUtility,
  onSelectMCPTool,
  onSelectStrandsTool
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [orchestrationAgents, setOrchestrationAgents] = useState<any[]>([]);
  const [orchestrationLoading, setOrchestrationLoading] = useState(false);
  const [activeTooltipAgentId, setActiveTooltipAgentId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('a2a-agents');

  // Load A2A Orchestration agents
  const loadOrchestrationAgents = async () => {
    console.log('🔄 StrandsAgentPalette: Loading A2A Orchestration agents...');
    setOrchestrationLoading(true);
    try {
      const response = await fetch('http://localhost:5008/api/a2a/orchestration-agents');
      if (response.ok) {
        const data = await response.json();
        console.log('✅ StrandsAgentPalette: Loaded orchestration agents:', data);
        setOrchestrationAgents(data.agents || []);
      } else {
        console.error('❌ Failed to load orchestration agents:', response.status);
        setOrchestrationAgents([]);
      }
    } catch (error) {
      console.error('❌ Error loading orchestration agents:', error);
      setOrchestrationAgents([]);
    } finally {
      setOrchestrationLoading(false);
    }
  };

  // Handle agent deletion (for orchestration agents)
  const handleDeleteAgent = async (agentId: string, agentName: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent triggering the onClick of the parent div
    
    // Confirmation dialog
    const confirmed = window.confirm(`Are you sure you want to remove the agent "${agentName}" from orchestration? This will unregister it from A2A.`);
    
    if (!confirmed) {
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:5008/api/a2a/agents/${agentId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        // Reload the agents list
        await loadOrchestrationAgents();
        console.log(`✅ Agent ${agentName} removed from orchestration successfully`);
      } else {
        console.error('❌ Failed to remove agent from orchestration');
        alert('Failed to remove agent from orchestration. Please try again.');
      }
    } catch (error) {
      console.error('❌ Error removing agent from orchestration:', error);
      alert('Failed to remove agent from orchestration. Please check your connection and try again.');
    }
  };

  const handleTooltipToggle = (agentId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent triggering drag or other events
    setActiveTooltipAgentId(prev => prev === agentId ? null : agentId);
  };

  useEffect(() => {
    loadOrchestrationAgents();

    // Refresh every 30 seconds
    const interval = setInterval(() => {
      loadOrchestrationAgents();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`bg-slate-800/40 backdrop-blur-lg border-r border-slate-600/30 flex flex-col transition-all duration-300 ${
      collapsed ? 'w-16' : 'w-80'
    }`}>
      {/* Header */}
      <div className="p-4 border-b border-slate-600/30">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <>
              <h2 className="text-lg font-semibold text-white">Agent Palette</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCollapsed(true)}
                className="text-slate-400 hover:text-white"
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </>
          )}
          {collapsed && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCollapsed(false)}
              className="text-slate-400 hover:text-white"
            >
              <ArrowRight className="h-4 w-4 rotate-180" />
            </Button>
          )}
        </div>
        {!collapsed && (
          <p className="text-sm text-slate-400 mt-1">Drag agents to build workflows</p>
        )}
      </div>

      {!collapsed && (
        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-2 m-2">
              <TabsTrigger value="a2a-agents" className="text-xs">A2A Agents</TabsTrigger>
              <TabsTrigger value="strands-agents" className="text-xs">Strands Agents</TabsTrigger>
            </TabsList>

            <TabsContent value="a2a-agents" className="flex-1 overflow-hidden">
              <div className="p-2 h-full overflow-y-auto">
                {orchestrationLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <RefreshCw className="h-6 w-6 text-slate-400 animate-spin" />
                  </div>
                ) : orchestrationAgents.length === 0 ? (
                  <div className="text-center text-slate-400 py-8">
                    <Bot className="h-12 w-12 mx-auto mb-2 text-slate-500" />
                    <p className="text-sm">No orchestration agents found</p>
                    <p className="text-xs text-slate-500 mt-1">Register agents for A2A orchestration</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {orchestrationAgents.map((agent) => {
                      const { icon: IconComponent, color } = getProfessionalAgentIcon(agent.name, agent.capabilities || []);
                      const isMainOrchestrator = agent.id === 'main-system-orchestrator';
                      
                      return (
                        <Card
                          key={agent.id}
                          className={`group relative cursor-pointer hover:bg-slate-700/50 transition-all duration-200 border-slate-600/30 ${
                            isMainOrchestrator ? 'border-purple-400/50 bg-purple-900/20' : ''
                          }`}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData('application/json', JSON.stringify({
                              type: 'a2a-agent',
                              agent: agent
                            }));
                          }}
                        >
                          <div className="p-3">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg border ${
                                isMainOrchestrator ? 'bg-purple-900/20 border-purple-400/30' : 'bg-blue-900/20 border-blue-400/30'
                              }`}>
                                <IconComponent className={`h-4 w-4 ${isMainOrchestrator ? 'text-purple-400' : 'text-blue-400'}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className={`text-sm font-medium truncate ${
                                  isMainOrchestrator ? 'text-purple-300' : 'text-white'
                                }`}>
                                  {agent.name}
                                </h4>
                                <p className="text-xs text-slate-400 truncate">
                                  {agent.model || 'Unknown Model'}
                                </p>
                              </div>
                              <div className="flex items-center gap-1">
                                <Badge variant="outline" className={`text-xs ${
                                  isMainOrchestrator ? 'border-purple-400/30 text-purple-400' : 'border-green-400/30 text-green-400'
                                }`}>
                                  {isMainOrchestrator ? 'Orchestrator' : 'A2A'}
                                </Badge>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => handleDeleteAgent(agent.id, agent.name, e)}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300 hover:bg-red-500/20"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="strands-agents" className="flex-1 overflow-hidden">
              <div className="p-2 h-full overflow-y-auto">
                <div className="text-center text-slate-400 py-8">
                  <Bot className="h-12 w-12 mx-auto mb-2 text-slate-500" />
                  <p className="text-sm">Strands agents coming soon</p>
                  <p className="text-xs text-slate-500 mt-1">Use A2A agents for now</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
};

