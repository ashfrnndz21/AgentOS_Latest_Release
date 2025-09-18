
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Network, Info } from 'lucide-react';

import { OverviewTab } from './OverviewTab';
import { GraphTab } from './GraphTab';
import { AgentTraceabilityProps } from './types';

export const AgentTraceability: React.FC<AgentTraceabilityProps> = ({
  decisionNodes,
  lineageNodes,
  lineageEdges,
  decisionPathMetadata,
  dataLineageMetadata,
  selectedNode,
  onNodeClick,
  projectName = "Untitled Project",
  agents = []
}) => {
  const [traceabilityTab, setTraceabilityTab] = useState('overview');

  // Derived metrics from the node data
  const totalAgents = agents.length || 1;
  const guardrailNodes = decisionNodes.filter(node => node.type === 'alternate');
  const toolNodes = decisionNodes.filter(node => node.type === 'tool');
  const databaseAccesses = toolNodes.reduce((count, node) => 
    count + (node.toolDetails?.databases?.length || 0), 0);
  
  // Mock data for denied accesses (would come from actual logs in real app)
  const deniedToolAccesses = 2;
  const deniedDatabaseAccesses = 3;
  const averageDecisionTime = "1.8s";
  const totalTaskTime = "12.4s";
  
  return (
    <div className="space-y-6">
      <Card className="shadow-lg border-gray-800/30 bg-gradient-to-br from-beam-dark-accent/70 to-beam-dark-accent/40 backdrop-blur-md">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500/30 to-indigo-500/30 border border-blue-500/20">
              <Network size={20} className="text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-xl font-medium text-white">{projectName}: Agent Decision Traceability</CardTitle>
              <CardDescription className="text-gray-300">Visualize and analyze the reasoning process and guardrail activations</CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="overview" value={traceabilityTab} onValueChange={setTraceabilityTab} className="w-full">
            <TabsList className="grid grid-cols-2 mb-6 bg-beam-dark/70 border border-gray-700/50 rounded-xl p-1 gap-1">
              <TabsTrigger 
                value="overview" 
                className="rounded-lg flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md"
              >
                <Info size={16} />
                <span className="font-medium">Overview</span>
              </TabsTrigger>
              <TabsTrigger 
                value="graph" 
                className="rounded-lg flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md"
              >
                <Network size={16} />
                <span className="font-medium">Agentic Decision Path</span>
              </TabsTrigger>
            </TabsList>
            
            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-0">
              <OverviewTab 
                totalAgents={totalAgents}
                toolNodes={toolNodes}
                guardrailNodes={guardrailNodes}
                databaseAccesses={databaseAccesses}
                deniedToolAccesses={deniedToolAccesses}
                deniedDatabaseAccesses={deniedDatabaseAccesses}
                averageDecisionTime={averageDecisionTime}
                totalTaskTime={totalTaskTime}
                onNodeClick={onNodeClick}
              />
            </TabsContent>
            
            {/* Workflow Graph Tab */}
            <TabsContent value="graph" className="mt-0">
              <GraphTab 
                decisionNodes={decisionNodes}
                lineageNodes={lineageNodes}
                lineageEdges={lineageEdges}
                decisionPathMetadata={decisionPathMetadata}
                dataLineageMetadata={dataLineageMetadata}
                selectedNode={selectedNode}
                onNodeClick={onNodeClick}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
