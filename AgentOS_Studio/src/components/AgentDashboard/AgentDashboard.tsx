
import React, { useState } from 'react';
import { ArrowRight, BarChart2, Lock, Shield, Database, Cpu, AlertTriangle, User, Clock } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { InfoPanel } from '../AgentCard';
import { GuardrailsPanel } from '../GuardrailsPanel';
import { PerformanceMetrics } from '../PerformanceMetrics';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { agents } from './agentsData';
import { AgentsTable } from './AgentsTable';
import { AgentDetailsPanel } from './AgentDetailsPanel';
import { ModelMetadata } from './ModelMetadata';
import { Agent } from './types';

export function AgentDashboard() {
  const [selectedAgent, setSelectedAgent] = useState<Agent>(agents[0]);
  const [subView, setSubView] = useState('overview');

  // Create a handler function that accepts an Agent parameter
  const handleAgentSelect = (agent: Agent) => {
    setSelectedAgent(agent);
  };

  return (
    <div className="flex flex-col gap-6 max-w-full min-w-0">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-beam-dark-accent/70 border-gray-700 text-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart2 size={18} className="text-beam-blue" />
              <CardTitle className="text-base font-medium">Active Agents</CardTitle>
            </div>
            <div className="text-3xl font-bold">24</div>
            <CardDescription className="text-gray-400">Across 5 departments</CardDescription>
          </CardContent>
        </Card>
        
        <Card className="bg-beam-dark-accent/70 border-gray-700 text-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield size={18} className="text-beam-blue" />
              <CardTitle className="text-base font-medium">Governance Status</CardTitle>
            </div>
            <div className="text-3xl font-bold text-green-400">Strong</div>
            <CardDescription className="text-gray-400">All policies enforced</CardDescription>
          </CardContent>
        </Card>
        
        <Card className="bg-beam-dark-accent/70 border-gray-700 text-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={18} className="text-beam-blue" />
              <CardTitle className="text-base font-medium">Issues</CardTitle>
            </div>
            <div className="text-3xl font-bold text-amber-400">2</div>
            <CardDescription className="text-gray-400">Require attention</CardDescription>
          </CardContent>
        </Card>
      </div>
      
      {/* Model Metadata Section - Ensure it's visible and prominent */}
      <ModelMetadata agents={agents} />
      
      {/* Agent Table */}
      <AgentsTable 
        agents={agents}
        selectedAgent={selectedAgent}
        setSelectedAgent={handleAgentSelect}
      />
      
      {/* Agent Details Panel */}
      {selectedAgent && (
        <AgentDetailsPanel
          selectedAgent={selectedAgent}
          subView={subView}
          setSubView={setSubView}
        />
      )}
    </div>
  );
}
