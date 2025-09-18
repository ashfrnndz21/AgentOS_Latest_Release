
import React from 'react';
import { Database, Cpu, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InfoPanel } from '../AgentCard';
import { PerformanceMetrics } from '../PerformanceMetrics';
import { GuardrailsPanel } from '../GuardrailsPanel';
import { Agent } from './types';

interface AgentDetailsPanelProps {
  selectedAgent: Agent;
  subView: string;
  setSubView: (view: string) => void;
}

export const AgentDetailsPanel: React.FC<AgentDetailsPanelProps> = ({ 
  selectedAgent,
  subView,
  setSubView
}) => {
  return (
    <Card className="bg-beam-dark-accent/70 border-gray-700">
      <CardHeader className="pb-0">
        <CardTitle className="text-xl text-white">{selectedAgent.name}</CardTitle>
        <CardDescription className="text-gray-400">{selectedAgent.owner}</CardDescription>
        
        <Tabs value={subView} onValueChange={setSubView} className="mt-4">
          <TabsList className="bg-beam-dark-accent/80 border-b border-gray-700">
            <TabsTrigger value="overview" className="data-[state=active]:text-beam-blue data-[state=active]:bg-beam-dark-accent/40">
              Overview
            </TabsTrigger>
            <TabsTrigger value="performance" className="data-[state=active]:text-beam-blue data-[state=active]:bg-beam-dark-accent/40">
              Performance
            </TabsTrigger>
            <TabsTrigger value="guardrails" className="data-[state=active]:text-beam-blue data-[state=active]:bg-beam-dark-accent/40">
              Guardrails
            </TabsTrigger>
          </TabsList>
          
          <CardContent className="pt-4">
            <TabsContent value="overview" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoPanel title="Tools & Capabilities">
                  <ul className="space-y-2 text-sm text-gray-300">
                    {selectedAgent.tools.map((tool, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-beam-blue"></span>
                        <span>{tool}</span>
                      </li>
                    ))}
                  </ul>
                </InfoPanel>
                
                <InfoPanel title="Data Accessibility">
                  <ul className="space-y-2 text-sm text-gray-300">
                    {selectedAgent.data.map((data, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <Database size={14} className="text-beam-blue" />
                        <span>{data}</span>
                      </li>
                    ))}
                  </ul>
                </InfoPanel>
              </div>
            </TabsContent>
            
            <TabsContent value="performance" className="mt-0">
              <PerformanceMetrics />
            </TabsContent>
            
            <TabsContent value="guardrails" className="mt-0">
              <InfoPanel title="Guardrails">
                <ul className="space-y-2 text-sm text-gray-300">
                  {selectedAgent.guardrails.map((guardrail, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <Lock size={14} className="text-beam-blue" />
                      <span>{guardrail}</span>
                    </li>
                  ))}
                </ul>
              </InfoPanel>
            </TabsContent>
          </CardContent>
        </Tabs>
      </CardHeader>
    </Card>
  );
};
