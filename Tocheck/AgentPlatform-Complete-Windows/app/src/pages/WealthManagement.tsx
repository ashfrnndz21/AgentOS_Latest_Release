
import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  WealthAgentsPanel, 
  PortfolioCharts, 
  InvestmentRecommendations, 
  FinancialHealthInsights,
  MarketResearchDashboard,
  RMWorkflowDashboard,
  InteractiveNewsAnalysis,
  AgentTraceabilityPanel,
  InteractiveChatOverlay
} from '@/components/WealthManagement';
import { BarChart3, Brain, TrendingUp, Shield, Globe, Users, Newspaper, Workflow, Search } from 'lucide-react';

export default function WealthManagement() {
  const [activeTab, setActiveTab] = useState('workflow');
  const [workflowMode, setWorkflowMode] = useState('rm'); // 'rm' or 'client'

  return (
    <Layout>
      <div className="space-y-4 bg-black min-h-screen w-full max-w-full overflow-x-hidden pl-1 pr-4 py-4">
        <div className="bg-gradient-to-r from-beam-dark to-beam-dark-accent rounded-xl p-4 md:p-6 text-white">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl md:text-3xl font-bold mb-2 flex items-center flex-wrap">
                <Brain className="mr-3 h-6 w-6 md:h-8 md:w-8 text-true-red flex-shrink-0" />
                <span>AI Wealth Management Centre</span>
              </h1>
              <p className="text-gray-300 text-sm md:text-base">Advanced AI-powered portfolio management with real-time market research</p>
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <Badge className="bg-green-900/20 text-green-300 border-green-700/30 text-xs">
                6 Agents Active
              </Badge>
              <Badge className="bg-blue-900/20 text-blue-300 border-blue-700/30 text-xs">
                Real-time Research
              </Badge>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant={workflowMode === 'rm' ? "default" : "outline"}
                  onClick={() => setWorkflowMode('rm')}
                  className={workflowMode === 'rm' ? "bg-true-red hover:bg-true-red/80 text-xs" : "border-gray-600 text-xs"}
                >
                  RM View
                </Button>
                <Button
                  size="sm"
                  variant={workflowMode === 'client' ? "default" : "outline"}
                  onClick={() => setWorkflowMode('client')}
                  className={workflowMode === 'client' ? "bg-true-red hover:bg-true-red/80 text-xs" : "border-gray-600 text-xs"}
                >
                  Client View
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-full">
          <div className="overflow-x-auto">
            <TabsList className="bg-beam-dark-accent/50 border border-gray-700 w-max min-w-full flex">
              <TabsTrigger value="workflow" className="flex items-center gap-1 text-xs px-2 py-1 whitespace-nowrap">
                <Workflow className="h-3 w-3 flex-shrink-0" />
                <span className="hidden md:inline">{workflowMode === 'rm' ? 'RM Workflow' : 'Client Dashboard'}</span>
                <span className="md:hidden">Work</span>
              </TabsTrigger>
              <TabsTrigger value="portfolio" className="flex items-center gap-1 text-xs px-2 py-1 whitespace-nowrap">
                <BarChart3 className="h-3 w-3 flex-shrink-0" />
                <span className="hidden md:inline">Portfolio</span>
                <span className="md:hidden">Port</span>
              </TabsTrigger>
              <TabsTrigger value="research" className="flex items-center gap-1 text-xs px-2 py-1 whitespace-nowrap">
                <Globe className="h-3 w-3 flex-shrink-0" />
                <span className="hidden md:inline">Market Intel</span>
                <span className="md:hidden">Mkt</span>
              </TabsTrigger>
              <TabsTrigger value="news" className="flex items-center gap-1 text-xs px-2 py-1 whitespace-nowrap">
                <Newspaper className="h-3 w-3 flex-shrink-0" />
                <span className="hidden md:inline">News</span>
                <span className="md:hidden">News</span>
              </TabsTrigger>
              <TabsTrigger value="recommendations" className="flex items-center gap-1 text-xs px-2 py-1 whitespace-nowrap">
                <TrendingUp className="h-3 w-3 flex-shrink-0" />
                <span className="hidden md:inline">AI Rec</span>
                <span className="md:hidden">AI</span>
              </TabsTrigger>
              <TabsTrigger value="insights" className="flex items-center gap-1 text-xs px-2 py-1 whitespace-nowrap">
                <Shield className="h-3 w-3 flex-shrink-0" />
                <span className="hidden md:inline">Health</span>
                <span className="md:hidden">Hlth</span>
              </TabsTrigger>
              <TabsTrigger value="traceability" className="flex items-center gap-1 text-xs px-2 py-1 whitespace-nowrap">
                <Search className="h-3 w-3 flex-shrink-0" />
                <span className="hidden md:inline">Trace</span>
                <span className="md:hidden">Trc</span>
              </TabsTrigger>
            </TabsList>
          </div>

            <TabsContent value="workflow" className="mt-6">
              {workflowMode === 'rm' ? (
                <RMWorkflowDashboard />
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-1">
                    <WealthAgentsPanel />
                  </div>
                  <div className="lg:col-span-2">
                    <PortfolioCharts />
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="portfolio" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <WealthAgentsPanel />
                </div>
                <div className="lg:col-span-2">
                  <PortfolioCharts />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="research" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <WealthAgentsPanel />
                </div>
                <div className="lg:col-span-2">
                  <MarketResearchDashboard />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="news" className="mt-6">
              <InteractiveNewsAnalysis />
            </TabsContent>

            <TabsContent value="recommendations" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <WealthAgentsPanel />
                </div>
                <div className="lg:col-span-2">
                  <InvestmentRecommendations />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="insights" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <WealthAgentsPanel />
                </div>
                <div className="lg:col-span-2">
                  <FinancialHealthInsights />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="traceability" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <WealthAgentsPanel />
                </div>
                <div className="lg:col-span-2">
                  <AgentTraceabilityPanel />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Interactive Chat Overlay - always present */}
          <InteractiveChatOverlay />
        </div>
      </Layout>
    );
  }
