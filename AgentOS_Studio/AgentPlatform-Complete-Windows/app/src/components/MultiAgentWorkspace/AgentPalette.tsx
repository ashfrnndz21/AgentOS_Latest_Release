import React, { useState } from 'react';
import { Bot, Brain, Shield, Database, GitBranch, MessageSquare, Search, Code, FileText, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AgentPaletteProps {
  onAddAgent: (agentType: string) => void;
  onAddUtility: (nodeType: string) => void;
}

export const AgentPalette: React.FC<AgentPaletteProps> = ({ onAddAgent, onAddUtility }) => {
  const [collapsed, setCollapsed] = useState(false);

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
          <TabsList className="grid w-full grid-cols-2 bg-beam-dark">
            <TabsTrigger value="agents" className="text-gray-300 data-[state=active]:text-white">Agents</TabsTrigger>
            <TabsTrigger value="utilities" className="text-gray-300 data-[state=active]:text-white">Utilities</TabsTrigger>
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
        </Tabs>
      </div>
    </div>
  );
};