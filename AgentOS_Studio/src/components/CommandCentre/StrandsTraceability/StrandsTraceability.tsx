import React, { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Brain, Network, BarChart3, Zap, Activity } from 'lucide-react';

import { StrandsOverview } from './components/StrandsOverview';
import { StrandsWorkflowView } from './components/StrandsWorkflowView';
import { StrandsReasoningView } from './components/StrandsReasoningView';
import { StrandsAnalyticsView } from './components/StrandsAnalyticsView';
import { StrandsPerformanceView } from './components/StrandsPerformanceView';

import { StrandsTraceabilityProps } from './types';
import { getMockTraceByProject, getMockAnalytics, getMockVisualization } from './mockData';

export const StrandsTraceability: React.FC<StrandsTraceabilityProps> = ({
  selectedProject,
  projectData,
  currentIndustry,
  onNodeClick
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  // Get mock data based on selected project
  const executionTrace = useMemo(() => 
    getMockTraceByProject(selectedProject), 
    [selectedProject]
  );
  
  const analytics = useMemo(() => getMockAnalytics(), []);
  const visualization = useMemo(() => getMockVisualization(), []);

  const handleNodeClick = (nodeId: string) => {
    setSelectedNode(nodeId === selectedNode ? null : nodeId);
    onNodeClick?.(nodeId);
  };

  // Get project display name
  const getProjectDisplayName = (projectId: string) => {
    const projectNames = {
      'hydrogen-production': 'Hydrogen Production',
      'industrial-forecasting': 'Financial Forecasting & Scenario Analysis',
      'process-engineering': 'Process Engineering',
      'default': 'Air Separation Units'
    };
    return projectNames[projectId as keyof typeof projectNames] || projectId;
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg border-gray-800/30 bg-gradient-to-br from-beam-dark-accent/70 to-beam-dark-accent/40 backdrop-blur-md">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500/30 to-blue-500/30 border border-purple-500/20">
              <Brain size={24} className="text-purple-400" />
            </div>
            <div>
              <CardTitle className="text-xl font-medium text-white">
                Strands Intelligence Traceability
              </CardTitle>
              <CardDescription className="text-gray-300">
                {getProjectDisplayName(selectedProject)} • Advanced multi-agent workflow analysis
              </CardDescription>
            </div>
          </div>
          
          {/* Execution Status Banner */}
          <div className="mt-4 p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-green-400 font-medium">
                  Execution: {executionTrace.executionId}
                </span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-300">
                  Status: {executionTrace.status}
                </span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-300">
                  Duration: {Math.round(executionTrace.metrics.totalExecutionTime / 1000)}s
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Confidence:</span>
                <span className="text-sm font-medium text-green-400">
                  {Math.round(executionTrace.metrics.averageConfidence * 100)}%
                </span>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-5 mb-6 bg-beam-dark/70 border border-gray-700/50 rounded-xl p-1 gap-1">
              <TabsTrigger 
                value="overview" 
                className="rounded-lg flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md"
              >
                <Activity size={16} />
                <span className="font-medium">Overview</span>
              </TabsTrigger>
              <TabsTrigger 
                value="workflow" 
                className="rounded-lg flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md"
              >
                <Network size={16} />
                <span className="font-medium">Workflow</span>
              </TabsTrigger>
              <TabsTrigger 
                value="reasoning" 
                className="rounded-lg flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md"
              >
                <Brain size={16} />
                <span className="font-medium">Reasoning</span>
              </TabsTrigger>
              <TabsTrigger 
                value="analytics" 
                className="rounded-lg flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md"
              >
                <BarChart3 size={16} />
                <span className="font-medium">Analytics</span>
              </TabsTrigger>
              <TabsTrigger 
                value="performance" 
                className="rounded-lg flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md"
              >
                <Zap size={16} />
                <span className="font-medium">Performance</span>
              </TabsTrigger>
            </TabsList>
            
            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-0">
              <StrandsOverview 
                executionTrace={executionTrace}
                analytics={analytics}
                onNodeClick={handleNodeClick}
              />
            </TabsContent>
            
            {/* Workflow Visualization Tab */}
            <TabsContent value="workflow" className="mt-0">
              <StrandsWorkflowView 
                executionTrace={executionTrace}
                visualization={visualization}
                selectedNode={selectedNode}
                onNodeClick={handleNodeClick}
              />
            </TabsContent>
            
            {/* Reasoning Analysis Tab */}
            <TabsContent value="reasoning" className="mt-0">
              <StrandsReasoningView 
                executionTrace={executionTrace}
                selectedNode={selectedNode}
                onNodeClick={handleNodeClick}
              />
            </TabsContent>
            
            {/* Analytics Tab */}
            <TabsContent value="analytics" className="mt-0">
              <StrandsAnalyticsView 
                analytics={analytics}
                executionTrace={executionTrace}
              />
            </TabsContent>
            
            {/* Performance Tab */}
            <TabsContent value="performance" className="mt-0">
              <StrandsPerformanceView 
                executionTrace={executionTrace}
                analytics={analytics}
                onNodeClick={handleNodeClick}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};