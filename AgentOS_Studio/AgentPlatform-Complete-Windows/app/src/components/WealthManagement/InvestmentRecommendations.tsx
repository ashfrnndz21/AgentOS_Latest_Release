
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Brain, Target, Lightbulb, CheckCircle, Globe, BarChart3, AlertTriangle, Star } from 'lucide-react';

export const InvestmentRecommendations = () => {
  const [riskTolerance, setRiskTolerance] = React.useState([65]);

  const marketInsights = [
    {
      title: 'AI Semiconductor Surge',
      description: 'Web research indicates 73% increase in AI chip demand',
      confidence: 94,
      impact: 'High',
      sources: ['Reuters', 'TechCrunch', 'SEC Filings'],
      sentiment: 'Bullish'
    },
    {
      title: 'Energy Transition Momentum',
      description: 'Government incentives driving renewable energy adoption',
      confidence: 87,
      impact: 'Medium',
      sources: ['Bloomberg', 'IEA Reports', 'Policy Tracker'],
      sentiment: 'Positive'
    },
    {
      title: 'Bond Market Volatility',
      description: 'Fed policy uncertainty creating opportunities in duration trades',
      confidence: 79,
      impact: 'Medium',
      sources: ['Fed Minutes', 'Bond Trader Forums', 'Economic Data'],
      sentiment: 'Cautious'
    }
  ];

  const recommendations = [
    {
      id: 1,
      title: 'AI Infrastructure Investment Theme',
      description: 'Multi-agent research identifies explosive growth in AI infrastructure companies',
      confidence: 96,
      impact: 'Very High',
      timeframe: '6-18 months',
      rationale: 'Web crawling detected 340% increase in AI infrastructure job postings, $12B in recent funding, and analyst upgrades across the sector',
      action: 'Allocate $25,000 across NVDA, AMD, and emerging AI infrastructure ETFs',
      status: 'high-conviction',
      webSources: ['TechCrunch', 'VentureBeat', 'LinkedIn Job Data', 'Crunchbase'],
      marketData: {
        sector: 'Technology',
        expectedReturn: '28-35%',
        risk: 'Medium-High',
        allocation: '8-12%'
      },
      aiInsights: [
        'Patent filings in AI chips up 145% YoY',
        'Major cloud providers increasing capex 60%',
        'Supply chain bottlenecks easing Q2 2025'
      ]
    },
    {
      id: 2,
      title: 'ESG Transition Opportunity',
      description: 'Research agents identify undervalued clean energy stocks with strong fundamentals',
      confidence: 91,
      impact: 'High',
      timeframe: '3-12 months',
      rationale: 'Sentiment analysis shows improving investor confidence in renewable energy, while valuations remain attractive post-correction',
      action: 'Add $18,000 to clean energy ETFs and select wind/solar companies',
      status: 'recommended',
      webSources: ['CleanTechnica', 'Energy Transition News', 'ESG Forums', 'Government Policy Sites'],
      marketData: {
        sector: 'Clean Energy',
        expectedReturn: '18-25%',
        risk: 'Medium',
        allocation: '5-8%'
      },
      aiInsights: [
        'Government incentives extended through 2027',
        'Energy storage costs down 23% this year',
        'Corporate renewable commitments accelerating'
      ]
    },
    {
      id: 3,
      title: 'Defensive Repositioning Signal',
      description: 'Risk algorithms detect increased correlation across asset classes - recommend defensive allocation',
      confidence: 88,
      impact: 'Medium',
      timeframe: '1-6 months',
      rationale: 'Multi-source analysis indicates rising geopolitical tensions and potential market volatility ahead',
      action: 'Increase cash position to 15% and add defensive sectors (utilities, consumer staples)',
      status: 'risk-management',
      webSources: ['Financial Times', 'Geopolitical Risk Trackers', 'VIX Analysis', 'Central Bank Communications'],
      marketData: {
        sector: 'Defensive',
        expectedReturn: '6-12%',
        risk: 'Low',
        allocation: '20-25%'
      },
      aiInsights: [
        'Correlation between stocks and bonds increasing',
        'Safe-haven demand showing early signs',
        'Options market pricing in higher volatility'
      ]
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'high-conviction':
        return <Badge className="bg-green-900/20 text-green-300 border-green-700/30"><Star className="h-3 w-3 mr-1" />High Conviction</Badge>;
      case 'recommended':
        return <Badge className="bg-blue-900/20 text-blue-300 border-blue-700/30">AI Recommended</Badge>;
      case 'risk-management':
        return <Badge className="bg-amber-900/20 text-amber-300 border-amber-700/30"><AlertTriangle className="h-3 w-3 mr-1" />Risk Alert</Badge>;
      default:
        return <Badge variant="outline">Under Review</Badge>;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-400';
    if (confidence >= 80) return 'text-amber-400';
    return 'text-red-400';
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'Bullish': return 'text-green-400';
      case 'Positive': return 'text-blue-400';
      case 'Cautious': return 'text-amber-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Market Intelligence Overview */}
      <Card className="bg-beam-dark-accent/70 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Globe className="mr-2 h-5 w-5 text-true-red" />
            Real-Time Market Intelligence
          </CardTitle>
          <p className="text-sm text-gray-400">AI agents have analyzed 2,847 sources in the last 24 hours</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {marketInsights.map((insight, index) => (
              <div key={index} className="p-4 rounded-lg bg-beam-dark-accent/30 border border-gray-700/50">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-white text-sm">{insight.title}</h4>
                  <span className={`text-xs font-medium ${getSentimentColor(insight.sentiment)}`}>
                    {insight.sentiment}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mb-3">{insight.description}</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">AI Confidence</span>
                    <span className={getConfidenceColor(insight.confidence)}>{insight.confidence}%</span>
                  </div>
                  <Progress value={insight.confidence} className="h-1" />
                  <div className="text-xs text-gray-500">
                    Sources: {insight.sources.join(', ')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Risk Tolerance Adjuster */}
      <Card className="bg-beam-dark-accent/70 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Target className="mr-2 h-5 w-5 text-true-red" />
            AI-Optimized Risk Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Conservative</span>
              <span className="text-white">Current: {riskTolerance[0]}% | AI Suggested: 68%</span>
              <span className="text-gray-400">Aggressive</span>
            </div>
            <Slider
              value={riskTolerance}
              onValueChange={setRiskTolerance}
              max={100}
              step={5}
              className="w-full"
            />
          </div>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div className="p-3 rounded-lg bg-beam-dark-accent/30">
              <p className="text-sm text-gray-400">Expected Return</p>
              <p className="text-lg font-bold text-green-400">{(6 + (riskTolerance[0] / 100) * 6).toFixed(1)}%</p>
            </div>
            <div className="p-3 rounded-lg bg-beam-dark-accent/30">
              <p className="text-sm text-gray-400">Volatility</p>
              <p className="text-lg font-bold text-amber-400">{(8 + (riskTolerance[0] / 100) * 12).toFixed(1)}%</p>
            </div>
            <div className="p-3 rounded-lg bg-beam-dark-accent/30">
              <p className="text-sm text-gray-400">Sharpe Ratio</p>
              <p className="text-lg font-bold text-blue-400">{(0.8 + (riskTolerance[0] / 100) * 0.6).toFixed(2)}</p>
            </div>
            <div className="p-3 rounded-lg bg-beam-dark-accent/30">
              <p className="text-sm text-gray-400">Max Drawdown</p>
              <p className="text-lg font-bold text-red-400">{(5 + (riskTolerance[0] / 100) * 20).toFixed(1)}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI-Generated Recommendations */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white flex items-center">
            <Brain className="mr-2 h-6 w-6 text-true-red" />
            AI Investment Recommendations
          </h3>
          <Badge className="bg-true-red/20 text-true-red border-true-red/30">
            <BarChart3 className="h-3 w-3 mr-1" />
            Updated 12 min ago
          </Badge>
        </div>

        {recommendations.map((rec) => (
          <Card key={rec.id} className="bg-beam-dark-accent/70 border-gray-700 hover:border-true-red/50 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-white text-lg flex items-center">
                    <Lightbulb className="mr-2 h-5 w-5 text-amber-400" />
                    {rec.title}
                  </CardTitle>
                  <p className="text-gray-400 mt-1">{rec.description}</p>
                </div>
                {getStatusBadge(rec.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-400">AI Confidence</p>
                  <p className={`text-lg font-bold ${getConfidenceColor(rec.confidence)}`}>
                    {rec.confidence}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Expected Impact</p>
                  <p className="text-lg font-bold text-white">{rec.impact}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Timeframe</p>
                  <p className="text-lg font-bold text-white">{rec.timeframe}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Allocation</p>
                  <p className="text-lg font-bold text-blue-400">{rec.marketData.allocation}</p>
                </div>
              </div>

              {/* Market Data */}
              <div className="p-3 rounded-lg bg-beam-dark-accent/30 border border-gray-700/50">
                <h4 className="text-sm font-medium text-white mb-2">Market Analysis</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-gray-400">Sector: </span>
                    <span className="text-white">{rec.marketData.sector}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Expected Return: </span>
                    <span className="text-green-400">{rec.marketData.expectedReturn}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Risk Level: </span>
                    <span className="text-amber-400">{rec.marketData.risk}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Web Sources: </span>
                    <span className="text-blue-400">{rec.webSources.length}</span>
                  </div>
                </div>
              </div>

              {/* AI Insights */}
              <div className="p-3 rounded-lg bg-beam-dark-accent/30 border border-gray-700/50">
                <h4 className="text-sm font-medium text-white mb-2">Key AI Insights</h4>
                <ul className="space-y-1">
                  {rec.aiInsights.map((insight, index) => (
                    <li key={index} className="text-xs text-gray-300 flex items-center">
                      <div className="w-1 h-1 bg-true-red rounded-full mr-2"></div>
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-3 rounded-lg bg-beam-dark-accent/30 border border-gray-700/50">
                <p className="text-sm text-gray-300 mb-2"><strong>Rationale:</strong> {rec.rationale}</p>
                <p className="text-sm text-green-400"><strong>Suggested Action:</strong> {rec.action}</p>
                <p className="text-xs text-gray-500 mt-2">
                  Research Sources: {rec.webSources.join(', ')}
                </p>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-700/50">
                  View Research
                </Button>
                <Button className="bg-true-red hover:bg-true-red/90 text-white">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Implement Strategy
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
