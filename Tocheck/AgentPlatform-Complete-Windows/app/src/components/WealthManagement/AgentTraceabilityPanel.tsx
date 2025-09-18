
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Brain, MessageSquare, TrendingUp, Search, Shield, Activity, ChevronDown, ChevronRight, Eye, Clock, Target } from 'lucide-react';

interface AgentReasoning {
  agentId: string;
  agentName: string;
  recommendation: string;
  confidence: number;
  reasoning: {
    dataPoints: string[];
    analysisSteps: string[];
    riskFactors: string[];
    supportingEvidence: string[];
  };
  sources: {
    type: string;
    title: string;
    relevance: number;
    timestamp: string;
  }[];
  decisionPath: {
    step: string;
    action: string;
    outcome: string;
    confidence: number;
  }[];
}

export const AgentTraceabilityPanel = () => {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set());

  const agentReasonings: AgentReasoning[] = [
    {
      agentId: 'market-research-agent',
      agentName: 'AI Market Research Agent',
      recommendation: 'Strong Buy - AI Infrastructure ETF',
      confidence: 96,
      reasoning: {
        dataPoints: [
          'NVIDIA revenue up 206% YoY in Q3 2024',
          'AI chip demand increased 73% globally',
          'Microsoft, Google, Amazon increasing AI capex by 60%',
          'Patent filings in AI hardware up 145% this year'
        ],
        analysisSteps: [
          'Scraped 2,847 news articles and financial reports',
          'Analyzed earnings calls from top 50 tech companies',
          'Cross-referenced government AI spending initiatives',
          'Evaluated supply chain improvements and bottlenecks'
        ],
        riskFactors: [
          'Potential China trade restrictions on semiconductors',
          'High valuations in AI sector (P/E ratios above historical norms)',
          'Competition from custom chip development by major tech firms'
        ],
        supportingEvidence: [
          'SEC filings show 340% increase in AI infrastructure investments',
          'Job postings for AI hardware engineers up 89%',
          'Venture capital AI hardware funding reached $12B in 2024'
        ]
      },
      sources: [
        { type: 'SEC Filing', title: 'NVIDIA Q3 2024 10-Q', relevance: 98, timestamp: '2024-12-09 14:30' },
        { type: 'News', title: 'Reuters: AI Chip Shortage Easing', relevance: 92, timestamp: '2024-12-09 11:15' },
        { type: 'Analyst Report', title: 'Goldman Sachs AI Infrastructure Outlook', relevance: 89, timestamp: '2024-12-08 16:45' },
        { type: 'Market Data', title: 'Bloomberg Terminal: Semiconductor Index', relevance: 85, timestamp: '2024-12-09 15:00' }
      ],
      decisionPath: [
        { step: 'Data Collection', action: 'Scanned 2,847 sources', outcome: 'Identified 23 high-relevance signals', confidence: 94 },
        { step: 'Sentiment Analysis', action: 'Analyzed market sentiment', outcome: 'Bullish sentiment score: 8.3/10', confidence: 91 },
        { step: 'Risk Assessment', action: 'Evaluated downside scenarios', outcome: 'Max drawdown risk: 15-20%', confidence: 88 },
        { step: 'Final Recommendation', action: 'Generated investment thesis', outcome: 'Strong Buy with 28-35% target', confidence: 96 }
      ]
    },
    {
      agentId: 'trend-analysis-agent',
      agentName: 'Predictive Trend Analyzer',
      recommendation: 'Sector Rotation into Energy',
      confidence: 78,
      reasoning: {
        dataPoints: [
          'Energy sector correlation with tech dropping to 0.23',
          'Oil prices showing technical breakout pattern',
          'Renewable energy stocks oversold by 32%',
          'Energy ETF options showing unusual call volume'
        ],
        analysisSteps: [
          'Applied ML pattern recognition across 15 sectors',
          'Analyzed historical sector rotation cycles',
          'Evaluated geopolitical energy market drivers',
          'Cross-validated with options flow data'
        ],
        riskFactors: [
          'Potential recession could dampen energy demand',
          'Green energy policy uncertainty',
          'Volatile commodity price environment'
        ],
        supportingEvidence: [
          'Historical data shows 78% accuracy in sector rotation predictions',
          'Energy sector P/E ratios at 5-year lows',
          'Institutional money flow showing early rotation signs'
        ]
      },
      sources: [
        { type: 'Market Data', title: 'Energy Sector Performance Analysis', relevance: 94, timestamp: '2024-12-09 13:20' },
        { type: 'Options Flow', title: 'Unusual Energy Options Activity', relevance: 87, timestamp: '2024-12-09 12:45' },
        { type: 'Technical Analysis', title: 'Sector Rotation Indicators', relevance: 82, timestamp: '2024-12-09 10:30' }
      ],
      decisionPath: [
        { step: 'Pattern Detection', action: 'Identified rotation signals', outcome: 'Found 5 confirming indicators', confidence: 82 },
        { step: 'Historical Validation', action: 'Backtested similar patterns', outcome: '78% historical accuracy', confidence: 79 },
        { step: 'Risk Modeling', action: 'Assessed downside risks', outcome: 'Risk-adjusted return positive', confidence: 75 },
        { step: 'Timing Analysis', action: 'Optimized entry timing', outcome: 'Next 3-6 months favorable', confidence: 78 }
      ]
    }
  ];

  const toggleStep = (stepIndex: number) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(stepIndex)) {
      newExpanded.delete(stepIndex);
    } else {
      newExpanded.add(stepIndex);
    }
    setExpandedSteps(newExpanded);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-400';
    if (confidence >= 70) return 'text-amber-400';
    return 'text-red-400';
  };

  const selectedReasoning = agentReasonings.find(r => r.agentId === selectedAgent);

  return (
    <div className="space-y-4">
      <Card className="bg-beam-dark-accent/70 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Brain className="mr-2 h-5 w-5 text-true-red" />
            Agent Decision Traceability
          </CardTitle>
          <p className="text-sm text-gray-400">Drill down into AI reasoning and confidence levels</p>
        </CardHeader>
        <CardContent className="space-y-3">
          {agentReasonings.map((reasoning) => (
            <div key={reasoning.agentId} className="p-4 rounded-lg bg-beam-dark-accent/30 border border-gray-700/50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-medium text-white">{reasoning.agentName}</h4>
                  <p className="text-sm text-gray-400">{reasoning.recommendation}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Confidence</p>
                    <p className={`text-lg font-bold ${getConfidenceColor(reasoning.confidence)}`}>
                      {reasoning.confidence}%
                    </p>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        size="sm" 
                        className="bg-true-red hover:bg-true-red/80"
                        onClick={() => setSelectedAgent(reasoning.agentId)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Reasoning
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] bg-beam-dark border-gray-700">
                      <DialogHeader>
                        <DialogTitle className="text-white flex items-center">
                          <Brain className="mr-2 h-5 w-5 text-true-red" />
                          {reasoning.agentName} - Decision Analysis
                        </DialogTitle>
                      </DialogHeader>
                      
                      <Tabs defaultValue="reasoning" className="w-full">
                        <TabsList className="bg-beam-dark-accent/50 border border-gray-700">
                          <TabsTrigger value="reasoning">Reasoning Process</TabsTrigger>
                          <TabsTrigger value="sources">Data Sources</TabsTrigger>
                          <TabsTrigger value="path">Decision Path</TabsTrigger>
                        </TabsList>

                        <TabsContent value="reasoning" className="mt-4">
                          <ScrollArea className="h-[400px] pr-4">
                            <div className="space-y-4">
                              <div className="p-4 rounded-lg bg-beam-dark-accent/30 border border-green-700/30">
                                <h4 className="font-medium text-green-400 mb-2">Key Data Points</h4>
                                <ul className="space-y-1">
                                  {reasoning.reasoning.dataPoints.map((point, index) => (
                                    <li key={index} className="text-sm text-gray-300 flex items-start">
                                      <div className="w-1 h-1 bg-green-400 rounded-full mt-2 mr-2 flex-shrink-0" />
                                      {point}
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              <div className="p-4 rounded-lg bg-beam-dark-accent/30 border border-blue-700/30">
                                <h4 className="font-medium text-blue-400 mb-2">Analysis Steps</h4>
                                <ul className="space-y-1">
                                  {reasoning.reasoning.analysisSteps.map((step, index) => (
                                    <li key={index} className="text-sm text-gray-300 flex items-start">
                                      <div className="w-1 h-1 bg-blue-400 rounded-full mt-2 mr-2 flex-shrink-0" />
                                      {step}
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              <div className="p-4 rounded-lg bg-beam-dark-accent/30 border border-amber-700/30">
                                <h4 className="font-medium text-amber-400 mb-2">Risk Factors</h4>
                                <ul className="space-y-1">
                                  {reasoning.reasoning.riskFactors.map((risk, index) => (
                                    <li key={index} className="text-sm text-gray-300 flex items-start">
                                      <div className="w-1 h-1 bg-amber-400 rounded-full mt-2 mr-2 flex-shrink-0" />
                                      {risk}
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              <div className="p-4 rounded-lg bg-beam-dark-accent/30 border border-purple-700/30">
                                <h4 className="font-medium text-purple-400 mb-2">Supporting Evidence</h4>
                                <ul className="space-y-1">
                                  {reasoning.reasoning.supportingEvidence.map((evidence, index) => (
                                    <li key={index} className="text-sm text-gray-300 flex items-start">
                                      <div className="w-1 h-1 bg-purple-400 rounded-full mt-2 mr-2 flex-shrink-0" />
                                      {evidence}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </ScrollArea>
                        </TabsContent>

                        <TabsContent value="sources" className="mt-4">
                          <ScrollArea className="h-[400px] pr-4">
                            <div className="space-y-3">
                              {reasoning.sources.map((source, index) => (
                                <div key={index} className="p-3 rounded-lg bg-beam-dark-accent/30 border border-gray-700/50">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline" className="text-xs">
                                        {source.type}
                                      </Badge>
                                      <span className="text-sm font-medium text-white">{source.title}</span>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-xs text-gray-400">Relevance</p>
                                      <p className={`text-sm font-medium ${getConfidenceColor(source.relevance)}`}>
                                        {source.relevance}%
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-gray-400">
                                    <Clock className="h-3 w-3" />
                                    {source.timestamp}
                                  </div>
                                  <Progress value={source.relevance} className="h-1 mt-2" />
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                        </TabsContent>

                        <TabsContent value="path" className="mt-4">
                          <ScrollArea className="h-[400px] pr-4">
                            <div className="space-y-3">
                              {reasoning.decisionPath.map((step, index) => (
                                <div key={index} className="relative">
                                  <div className="flex items-start gap-4">
                                    <div className="flex flex-col items-center">
                                      <div className={`w-3 h-3 rounded-full ${
                                        step.confidence >= 90 ? 'bg-green-500' :
                                        step.confidence >= 70 ? 'bg-amber-500' :
                                        'bg-red-500'
                                      }`} />
                                      {index < reasoning.decisionPath.length - 1 && (
                                        <div className="w-px h-16 bg-gray-700 mt-2" />
                                      )}
                                    </div>
                                    
                                    <div className="flex-1 pb-8">
                                      <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-medium text-white">{step.step}</h4>
                                        <span className={`text-sm font-medium ${getConfidenceColor(step.confidence)}`}>
                                          {step.confidence}%
                                        </span>
                                      </div>
                                      
                                      <p className="text-sm text-gray-400 mb-1">
                                        <strong>Action:</strong> {step.action}
                                      </p>
                                      <p className="text-sm text-gray-300">
                                        <strong>Outcome:</strong> {step.outcome}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                        </TabsContent>
                      </Tabs>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              <Progress value={reasoning.confidence} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
