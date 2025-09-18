import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Network, 
  Play, 
  Pause, 
  RotateCcw, 
  Settings, 
  Zap,
  Eye,
  Code,
  Database
} from 'lucide-react';
import { InteractiveAgentFlowDiagram } from './InteractiveAgentFlowDiagram';
import { TechnicalBuildingBlocks } from './TechnicalBuildingBlocks';
import { ComponentLibrary } from './ComponentLibrary';
import { AgentOSArchitectureDesign } from '../SystemFlow/AgentOSArchitectureDesign';

export const ArchitectureDesignDashboard: React.FC = () => {
  const [activeView, setActiveView] = useState<'flow' | 'blocks' | 'system' | 'components'>('flow');
  const [isSimulating, setIsSimulating] = useState(false);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Network className="w-8 h-8 text-blue-400" />
            Architecture Design Studio
          </h1>
          <p className="text-gray-400 mt-2">
            Design, visualize, and simulate your multi-agent system architecture
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-green-400 border-green-400">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
            Live System
          </Badge>
          
          <Button
            variant={isSimulating ? "default" : "outline"}
            onClick={() => setIsSimulating(!isSimulating)}
            className="flex items-center gap-2"
          >
            {isSimulating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isSimulating ? 'Stop Simulation' : 'Start Simulation'}
          </Button>
          
          <Button variant="outline" size="icon">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <Tabs value={activeView} onValueChange={(value) => setActiveView(value as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-gray-800">
          <TabsTrigger value="flow" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Agent Flow
          </TabsTrigger>
          <TabsTrigger value="blocks" className="flex items-center gap-2">
            <Code className="w-4 h-4" />
            Building Blocks
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            System View
          </TabsTrigger>
          <TabsTrigger value="components" className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Components
          </TabsTrigger>
        </TabsList>

        <TabsContent value="flow" className="space-y-6">
          <InteractiveAgentFlowDiagram isSimulating={isSimulating} />
        </TabsContent>

        <TabsContent value="blocks" className="space-y-6">
          <TechnicalBuildingBlocks isSimulating={isSimulating} />
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <AgentOSArchitectureDesign />
        </TabsContent>

        <TabsContent value="components" className="space-y-6">
          <ComponentLibrary />
        </TabsContent>
      </Tabs>
    </div>
  );
};