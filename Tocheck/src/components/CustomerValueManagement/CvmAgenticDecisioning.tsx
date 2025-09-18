import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Brain, 
  Target, 
  TrendingDown, 
  BarChart3, 
  Users, 
  DollarSign, 
  AlertCircle,
  Play,
  Pause,
  RefreshCw,
  MessageSquare,
  Eye,
  Zap,
  Filter,
  Download
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SimulationResult {
  id: string;
  type: 'campaign' | 'profitability' | 'churn';
  status: 'running' | 'completed' | 'failed';
  progress: number;
  insights: string[];
  metrics: Record<string, any>;
  reasoning: string;
  recommendations: string[];
  timestamp: Date;
}

interface AgentDecision {
  agentId: string;
  agentName: string;
  decision: string;
  confidence: number;
  reasoning: string;
  impact: 'high' | 'medium' | 'low';
  data_sources: string[];
}

export const CvmAgenticDecisioning = () => {
  const [activeSimulation, setActiveSimulation] = useState<string | null>(null);
  const [simulations, setSimulations] = useState<SimulationResult[]>([]);
  const [agentDecisions, setAgentDecisions] = useState<AgentDecision[]>([]);
  const [selectedSegment, setSelectedSegment] = useState('all');
  const [isRunning, setIsRunning] = useState(false);
  const { toast } = useToast();

  // Sample data
  useEffect(() => {
    const sampleDecisions: AgentDecision[] = [
      {
        agentId: 'cvm-journey',
        agentName: 'Customer Journey Mapper',
        decision: 'Prioritize email touchpoints for high-value customers',
        confidence: 0.87,
        reasoning: 'Analysis shows 73% higher conversion rates through email vs SMS for customers with CLV > $2000',
        impact: 'high',
        data_sources: ['CRM', 'Transaction History', 'Behavioral Analytics']
      },
      {
        agentId: 'cvm-churn',
        agentName: 'Churn Prevention Agent',
        decision: 'Implement retention campaign for at-risk premium customers',
        confidence: 0.92,
        reasoning: 'Detected early churn signals in 156 premium customers with declining engagement',
        impact: 'high',
        data_sources: ['Usage Patterns', 'Support Interactions', 'Payment History']
      },
      {
        agentId: 'cvm-nba',
        agentName: 'Next Best Action Agent',
        decision: 'Cross-sell mobile insurance to family plan subscribers',
        confidence: 0.78,
        reasoning: 'Family plan users show 45% higher propensity for insurance products',
        impact: 'medium',
        data_sources: ['Subscription Data', 'Demographic Info', 'Purchase History']
      }
    ];
    setAgentDecisions(sampleDecisions);
  }, []);

  const runSimulation = (type: 'campaign' | 'profitability' | 'churn') => {
    setIsRunning(true);
    const newSimulation: SimulationResult = {
      id: `sim_${Date.now()}`,
      type,
      status: 'running',
      progress: 0,
      insights: [],
      metrics: {},
      reasoning: '',
      recommendations: [],
      timestamp: new Date()
    };

    setSimulations(prev => [newSimulation, ...prev]);
    setActiveSimulation(newSimulation.id);

    // Simulate progress
    const interval = setInterval(() => {
      setSimulations(prev => prev.map(sim => {
        if (sim.id === newSimulation.id && sim.status === 'running') {
          const newProgress = Math.min(sim.progress + Math.random() * 20, 100);
          if (newProgress >= 100) {
            clearInterval(interval);
            setIsRunning(false);
            toast({
              title: `${type} Simulation Complete`,
              description: "Analysis ready for review"
            });
            return {
              ...sim,
              status: 'completed' as const,
              progress: 100,
              insights: getSimulationInsights(type),
              metrics: getSimulationMetrics(type),
              reasoning: getSimulationReasoning(type),
              recommendations: getSimulationRecommendations(type)
            };
          }
          return { ...sim, progress: newProgress };
        }
        return sim;
      }));
    }, 500);

    return () => clearInterval(interval);
  };

  const getSimulationInsights = (type: string): string[] => {
    const insights = {
      campaign: [
        'Email campaigns show 34% higher ROI than SMS for premium customers',
        'Weekend campaigns have 23% lower engagement rates',
        'Personalized offers increase conversion by 45%'
      ],
      profitability: [
        'High-value customers generate 67% of total revenue from 23% of customer base',
        'Customer acquisition cost has increased 18% YoY',
        'Retention campaigns show 3.2x ROI compared to acquisition'
      ],
      churn: [
        'Support ticket volume is the strongest churn predictor (87% accuracy)',
        'Customers with declining usage show 4.3x higher churn probability',
        'Proactive retention reduces churn by 42% when applied early'
      ]
    };
    return insights[type as keyof typeof insights] || [];
  };

  const getSimulationMetrics = (type: string) => {
    const metrics = {
      campaign: { 
        potential_revenue: '$2.4M', 
        expected_conversion: '12.3%', 
        target_audience: '45,600',
        roi: '320%'
      },
      profitability: { 
        total_clv: '$156M', 
        avg_clv: '$2,840', 
        profitability_score: '78%',
        cost_per_acquisition: '$145'
      },
      churn: { 
        at_risk_customers: '2,340', 
        churn_probability: '23%', 
        retention_opportunity: '$890K',
        prevention_cost: '$67K'
      }
    };
    return metrics[type as keyof typeof metrics] || {};
  };

  const getSimulationReasoning = (type: string): string => {
    const reasoning = {
      campaign: 'Multi-agent analysis combining customer journey mapping, CLV prediction, and behavioral analytics indicates email campaigns targeting high-value segments during weekdays with personalized offers will maximize ROI.',
      profitability: 'Revenue optimization agent identified that focusing retention efforts on top 25% of customers while optimizing acquisition channels for similar profiles will improve overall profitability by 23%.',
      churn: 'Churn prevention agent analyzed 18 months of customer data using ensemble models and identified early warning signals that allow intervention 60 days before typical churn events.'
    };
    return reasoning[type as keyof typeof reasoning] || '';
  };

  const getSimulationRecommendations = (type: string): string[] => {
    const recommendations = {
      campaign: [
        'Launch personalized email campaign targeting customers with CLV > $2000',
        'Implement dynamic content based on customer journey stage',
        'A/B test subject lines focusing on value proposition vs urgency'
      ],
      profitability: [
        'Increase investment in retention campaigns by 35%',
        'Implement tiered service levels based on customer value',
        'Optimize acquisition spend toward lookalike audiences of high-value customers'
      ],
      churn: [
        'Deploy proactive retention campaign for identified at-risk customers',
        'Implement real-time monitoring for early churn signals',
        'Create specialized retention offers for premium customer segment'
      ]
    };
    return recommendations[type as keyof typeof recommendations] || [];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-yellow-500';
      case 'completed': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
            CVM Agentic Decisioning
          </h2>
          <p className="text-white/60 mt-1">
            AI-powered decision intelligence for customer value optimization
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Simulation Control Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Simulation Center
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  onClick={() => runSimulation('campaign')}
                  disabled={isRunning}
                  className="h-20 flex flex-col items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                >
                  <Target className="w-6 h-6" />
                  <span className="text-sm">Campaign Simulation</span>
                </Button>
                <Button
                  onClick={() => runSimulation('profitability')}
                  disabled={isRunning}
                  className="h-20 flex flex-col items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                >
                  <DollarSign className="w-6 h-6" />
                  <span className="text-sm">Profitability Analysis</span>
                </Button>
                <Button
                  onClick={() => runSimulation('churn')}
                  disabled={isRunning}
                  className="h-20 flex flex-col items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
                >
                  <TrendingDown className="w-6 h-6" />
                  <span className="text-sm">Churn Analysis</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Active Simulations */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Active Simulations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-80">
                {simulations.length === 0 ? (
                  <div className="text-center text-white/60 py-8">
                    <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No simulations running. Start a new analysis above.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {simulations.map((sim) => (
                      <div
                        key={sim.id}
                        className={`p-4 rounded-lg border cursor-pointer transition-all ${
                          activeSimulation === sim.id 
                            ? 'border-blue-500 bg-blue-500/10' 
                            : 'border-white/10 bg-white/5 hover:bg-white/10'
                        }`}
                        onClick={() => setActiveSimulation(sim.id)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${getStatusColor(sim.status)}`} />
                            <span className="text-white font-medium capitalize">
                              {sim.type} Analysis
                            </span>
                          </div>
                          <Badge variant="outline" className="border-white/20 text-white/80">
                            {sim.status}
                          </Badge>
                        </div>
                        
                        {sim.status === 'running' && (
                          <div className="mb-2">
                            <div className="w-full bg-white/10 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${sim.progress}%` }}
                              />
                            </div>
                            <p className="text-xs text-white/60 mt-1">{Math.round(sim.progress)}% complete</p>
                          </div>
                        )}

                        {sim.status === 'completed' && sim.insights.length > 0 && (
                          <div className="mt-3 space-y-2">
                            <p className="text-sm text-white/80">Key Insights:</p>
                            {sim.insights.slice(0, 2).map((insight, idx) => (
                              <p key={idx} className="text-xs text-white/60">• {insight}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Agent Decisions Panel */}
        <div className="space-y-6">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Live Agent Decisions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-80">
                <div className="space-y-4">
                  {agentDecisions.map((decision, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-white/5 border border-white/10">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white">{decision.agentName}</p>
                          <p className="text-xs text-white/60 mt-1">{decision.decision}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge className={`${getImpactColor(decision.impact)} text-white text-xs`}>
                            {decision.impact}
                          </Badge>
                          <span className="text-xs text-white/60">{Math.round(decision.confidence * 100)}%</span>
                        </div>
                      </div>
                      
                      <Separator className="my-2 bg-white/10" />
                      
                      <div className="space-y-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-white/80 hover:bg-white/10 h-8"
                        >
                          <MessageSquare className="w-3 h-3 mr-2" />
                          View Reasoning
                        </Button>
                        <div className="flex gap-1">
                          {decision.data_sources.map((source, sourceIdx) => (
                            <Badge key={sourceIdx} variant="outline" className="text-xs border-white/20 text-white/60">
                              {source}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Quick Metrics */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Real-time Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-white/80 text-sm">Active Campaigns</span>
                  <span className="text-white font-medium">12</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/80 text-sm">Avg CLV</span>
                  <span className="text-white font-medium">$2,840</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/80 text-sm">Churn Risk</span>
                  <span className="text-red-400 font-medium">2.3%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/80 text-sm">Revenue Impact</span>
                  <span className="text-green-400 font-medium">+$1.2M</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Detailed Results */}
      {activeSimulation && (
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Simulation Results & Reasoning</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="results" className="w-full">
              <TabsList className="grid grid-cols-3 mb-4 bg-white/10">
                <TabsTrigger value="results" className="text-white data-[state=active]:bg-white/20">
                  Results
                </TabsTrigger>
                <TabsTrigger value="reasoning" className="text-white data-[state=active]:bg-white/20">
                  AI Reasoning
                </TabsTrigger>
                <TabsTrigger value="recommendations" className="text-white data-[state=active]:bg-white/20">
                  Recommendations
                </TabsTrigger>
              </TabsList>

              <TabsContent value="results" className="space-y-4">
                {(() => {
                  const sim = simulations.find(s => s.id === activeSimulation);
                  if (!sim || sim.status !== 'completed') {
                    return <p className="text-white/60">Simulation in progress...</p>;
                  }
                  
                  return (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Object.entries(sim.metrics).map(([key, value]) => (
                        <div key={key} className="p-4 rounded-lg bg-white/5 border border-white/10">
                          <p className="text-xs text-white/60 uppercase tracking-wide">
                            {key.replace('_', ' ')}
                          </p>
                          <p className="text-lg font-bold text-white mt-1">{value}</p>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </TabsContent>

              <TabsContent value="reasoning" className="space-y-4">
                {(() => {
                  const sim = simulations.find(s => s.id === activeSimulation);
                  return (
                    <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                      <p className="text-white/80 leading-relaxed">
                        {sim?.reasoning || 'Analysis in progress...'}
                      </p>
                    </div>
                  );
                })()}
              </TabsContent>

              <TabsContent value="recommendations" className="space-y-4">
                {(() => {
                  const sim = simulations.find(s => s.id === activeSimulation);
                  return (
                    <div className="space-y-3">
                      {sim?.recommendations.map((rec, idx) => (
                        <div key={idx} className="p-4 rounded-lg bg-white/5 border border-white/10 flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-1">
                            <span className="text-white text-sm font-medium">{idx + 1}</span>
                          </div>
                          <p className="text-white/80">{rec}</p>
                        </div>
                      )) || <p className="text-white/60">Generating recommendations...</p>}
                    </div>
                  );
                })()}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};