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

export const StrandsAgentPaletteSimple: React.FC<StrandsAgentPaletteProps> = ({
  onAddAgent,
  onAddUtility,
  onSelectMCPTool,
  onSelectStrandsTool
}) => {
  const [orchestrationAgents, setOrchestrationAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('a2a-agents');

  // Load orchestration agents
  const loadOrchestrationAgents = async () => {
    try {
      const response = await fetch('http://localhost:5008/api/a2a/orchestration-agents');
      if (response.ok) {
        const agents = await response.json();
        setOrchestrationAgents(agents);
      } else {
        console.error('Failed to load orchestration agents');
      }
    } catch (error) {
      console.error('Error loading orchestration agents:', error);
    } finally {
      setLoading(false);
    }
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
    <div className="w-80 bg-slate-800/40 backdrop-blur-lg border-r border-slate-600/30 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-600/30">
        <h2 className="text-lg font-semibold text-white mb-2">Agent Palette</h2>
        <p className="text-sm text-slate-400">Drag agents to build workflows</p>
      </div>

      {/* Tabs */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-2 m-2">
            <TabsTrigger value="a2a-agents" className="text-xs">A2A Agents</TabsTrigger>
            <TabsTrigger value="strands-agents" className="text-xs">Strands Agents</TabsTrigger>
          </TabsList>

          <TabsContent value="a2a-agents" className="flex-1 overflow-hidden">
            <div className="p-2 h-full overflow-y-auto">
              {loading ? (
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
                  {orchestrationAgents.map((agent) => (
                    <Card
                      key={agent.id}
                      className="p-3 cursor-pointer hover:bg-slate-700/50 transition-colors border-slate-600/30"
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('application/json', JSON.stringify({
                          type: 'a2a-agent',
                          agent: agent
                        }));
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-900/20 rounded-lg border border-blue-400/30">
                          <Bot className="h-4 w-4 text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-white truncate">
                            {agent.name}
                          </h4>
                          <p className="text-xs text-slate-400 truncate">
                            {agent.model || 'Unknown Model'}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs border-green-400/30 text-green-400">
                          A2A
                        </Badge>
                      </div>
                    </Card>
                  ))}
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
    </div>
  );
};

