
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Cpu, Wrench, Database, Shield, Zap, BarChart2 } from 'lucide-react';

interface AgentModel {
  name: string;
  provider: string;
  paramSize: string;
  contextLength: string;
  latency: string;
  role: string;
}

interface Agent {
  name: string;
  model: AgentModel;
  description: string;
}

interface AgentsTabProps {
  agents: Agent[];
}

export const AgentsTab: React.FC<AgentsTabProps> = ({ agents }) => {
  return (
    <div className="space-y-4">
      <Card className="bg-beam-dark/70 border border-gray-700/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-md font-medium text-white">Agents</CardTitle>
          <CardDescription className="text-gray-300">
            Details of agents used in this project
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4">
            {agents.length > 0 ? agents.map((agent, index) => (
              <div key={index} className="p-4 bg-gray-800/40 rounded-lg border border-gray-700/30">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-indigo-500/20 border border-indigo-500/30">
                    <Cpu size={18} className="text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-md font-medium text-white">{agent.name}</h3>
                    <p className="text-xs text-gray-300">{agent.description}</p>
                  </div>
                </div>
                
                <Separator className="my-3 bg-gray-700/30" />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex flex-col p-3 bg-gray-900/40 rounded-lg border border-gray-700/30">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">Model</span>
                      <Badge className="bg-blue-900/30 text-blue-300 border-blue-600/30">
                        {agent.model.provider}
                      </Badge>
                    </div>
                    <div className="text-sm font-medium text-white mt-1">{agent.model.name}</div>
                  </div>
                  
                  <div className="flex flex-col p-3 bg-gray-900/40 rounded-lg border border-gray-700/30">
                    <span className="text-xs text-gray-400">Parameters</span>
                    <div className="text-sm font-medium text-white mt-1">{agent.model.paramSize}</div>
                  </div>
                  
                  <div className="flex flex-col p-3 bg-gray-900/40 rounded-lg border border-gray-700/30">
                    <span className="text-xs text-gray-400">Context Length</span>
                    <div className="text-sm font-medium text-white mt-1">{agent.model.contextLength}</div>
                  </div>
                  
                  <div className="flex flex-col p-3 bg-gray-900/40 rounded-lg border border-gray-700/30">
                    <span className="text-xs text-gray-400">Average Latency</span>
                    <div className="text-sm font-medium text-white mt-1">{agent.model.latency}</div>
                  </div>
                  
                  <div className="flex flex-col p-3 bg-gray-900/40 rounded-lg border border-gray-700/30 md:col-span-2">
                    <span className="text-xs text-gray-400">Role in Workflow</span>
                    <div className="text-sm text-white mt-1">{agent.model.role}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-purple-900/20 text-xs text-purple-300">
                    <Wrench size={12} />
                    <span>Tool Access</span>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-900/20 text-xs text-blue-300">
                    <Database size={12} />
                    <span>Data Access</span>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-900/20 text-xs text-amber-300">
                    <Shield size={12} />
                    <span>Guardrails</span>
                  </div>
                </div>
              </div>
            )) : (
              <div className="p-4 bg-gray-800/40 rounded-lg border border-gray-700/30 text-center">
                <Cpu size={40} className="text-gray-500 mx-auto mb-2" />
                <p className="text-gray-400">No agent information available</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-beam-dark/70 border border-gray-700/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-md font-medium text-white">Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 bg-gray-800/40 rounded-lg border border-gray-700/30">
              <div className="flex items-center gap-2 mb-2">
                <Zap size={14} className="text-yellow-400" />
                <span className="text-xs font-medium text-gray-300">Avg. Response Time</span>
              </div>
              <div className="text-xl font-medium text-white">780ms</div>
              <div className="flex items-center mt-1">
                <span className="text-xs text-green-400">↓ 12% from last week</span>
              </div>
            </div>
            
            <div className="p-3 bg-gray-800/40 rounded-lg border border-gray-700/30">
              <div className="flex items-center gap-2 mb-2">
                <BarChart2 size={14} className="text-blue-400" />
                <span className="text-xs font-medium text-gray-300">Tokens / Request</span>
              </div>
              <div className="text-xl font-medium text-white">2,450</div>
              <div className="flex items-center mt-1">
                <span className="text-xs text-red-400">↑ 5% from last week</span>
              </div>
            </div>
            
            <div className="p-3 bg-gray-800/40 rounded-lg border border-gray-700/30">
              <div className="flex items-center gap-2 mb-2">
                <Shield size={14} className="text-green-400" />
                <span className="text-xs font-medium text-gray-300">Guardrail Efficiency</span>
              </div>
              <div className="text-xl font-medium text-white">94%</div>
              <div className="flex items-center mt-1">
                <span className="text-xs text-green-400">↑ 2% from last week</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
