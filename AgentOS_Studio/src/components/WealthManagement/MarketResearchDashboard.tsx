
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Globe, TrendingUp, TrendingDown, Search, Brain, AlertCircle, ExternalLink } from 'lucide-react';

export const MarketResearchDashboard = () => {
  const [researchData, setResearchData] = useState({
    lastUpdate: new Date(),
    sourcesScanned: 2847,
    signalsDetected: 23,
    highConfidenceSignals: 8
  });

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setResearchData(prev => ({
        ...prev,
        lastUpdate: new Date(),
        sourcesScanned: prev.sourcesScanned + Math.floor(Math.random() * 10),
        signalsDetected: prev.signalsDetected + (Math.random() > 0.8 ? 1 : 0)
      }));
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const trendingTopics = [
    {
      topic: 'AI Infrastructure Spending',
      sentiment: 'bullish',
      mentions: 1247,
      change: '+34%',
      sources: ['TechCrunch', 'VentureBeat', 'Crunchbase', 'LinkedIn'],
      keyPoints: [
        'Microsoft announces $10B AI datacenter expansion',
        'NVIDIA supply constraints easing in Q2',
        'Enterprise AI adoption accelerating 45% QoQ'
      ],
      relevantStocks: ['NVDA', 'MSFT', 'GOOGL', 'META'],
      confidence: 94
    },
    {
      topic: 'Clean Energy Policy Shifts',
      sentiment: 'positive',
      mentions: 892,
      change: '+18%',
      sources: ['Reuters', 'Bloomberg Green', 'Energy.gov', 'CleanTechnica'],
      keyPoints: [
        'IRA tax credits extended through 2027',
        'Grid modernization funding increased',
        'Corporate renewable commitments up 67%'
      ],
      relevantStocks: ['ENPH', 'SEDG', 'NEE', 'BEP'],
      confidence: 87
    },
    {
      topic: 'Federal Reserve Communications',
      sentiment: 'cautious',
      mentions: 1456,
      change: '+12%',
      sources: ['Fed Minutes', 'FOMC Speeches', 'Economic Data', 'Bond Forums'],
      keyPoints: [
        'Powell signals data-dependent approach',
        'Regional Fed presidents show division',
        'Market pricing 75bps cuts by year-end'
      ],
      relevantStocks: ['XLF', 'BRK.B', 'JPM', 'BAC'],
      confidence: 82
    },
    {
      topic: 'Geopolitical Risk Factors',
      sentiment: 'bearish',
      mentions: 734,
      change: '+28%',
      sources: ['Financial Times', 'WSJ', 'Foreign Affairs', 'Risk Intelligence'],
      keyPoints: [
        'Trade tensions escalating in key sectors',
        'Supply chain vulnerabilities exposed',
        'Safe-haven flows increasing'
      ],
      relevantStocks: ['GLD', 'TLT', 'VIX', 'DXY'],
      confidence: 79
    }
  ];

  const webIntelligence = [
    {
      source: 'Reddit WallStreetBets',
      signal: 'Unusual Options Activity',
      ticker: 'NVDA',
      strength: 'High',
      description: 'Massive call volume in Feb expiries, unusual retail positioning',
      timestamp: '15 min ago'
    },
    {
      source: 'LinkedIn Executive Posts',
      signal: 'Hiring Surge Signal',
      ticker: 'AI Sector',
      strength: 'Medium',
      description: 'AI engineers job postings up 340% across major tech companies',
      timestamp: '32 min ago'
    },
    {
      source: 'SEC Filings Monitor',
      signal: 'Insider Buying',
      ticker: 'ENPH',
      strength: 'Medium',
      description: 'CEO purchased $2.3M in shares, first insider buying in 8 months',
      timestamp: '1 hour ago'
    },
    {
      source: 'Economic Calendar',
      signal: 'Data Release Impact',
      ticker: 'USD',
      strength: 'High',
      description: 'CPI data beats expectations, dollar strength continues',
      timestamp: '2 hours ago'
    }
  ];

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish': return 'text-green-400 bg-green-900/20 border-green-700/30';
      case 'positive': return 'text-blue-400 bg-blue-900/20 border-blue-700/30';
      case 'cautious': return 'text-amber-400 bg-amber-900/20 border-amber-700/30';
      case 'bearish': return 'text-red-400 bg-red-900/20 border-red-700/30';
      default: return 'text-gray-400 bg-gray-900/20 border-gray-700/30';
    }
  };

  const getSignalStrengthColor = (strength: string) => {
    switch (strength) {
      case 'High': return 'text-red-400';
      case 'Medium': return 'text-amber-400';
      case 'Low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Research Status Header */}
      <Card className="bg-beam-dark-accent/70 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Brain className="mr-2 h-5 w-5 text-true-red" />
            AI Research Intelligence Center
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 rounded-lg bg-beam-dark-accent/30">
              <div className="text-2xl font-bold text-green-400">{researchData.sourcesScanned.toLocaleString()}</div>
              <div className="text-xs text-gray-400">Sources Scanned Today</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-beam-dark-accent/30">
              <div className="text-2xl font-bold text-blue-400">{researchData.signalsDetected}</div>
              <div className="text-xs text-gray-400">Signals Detected</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-beam-dark-accent/30">
              <div className="text-2xl font-bold text-amber-400">{researchData.highConfidenceSignals}</div>
              <div className="text-xs text-gray-400">High Confidence</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-beam-dark-accent/30">
              <div className="text-2xl font-bold text-true-red">94%</div>
              <div className="text-xs text-gray-400">Research Accuracy</div>
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-400 text-center">
            Last updated: {researchData.lastUpdate.toLocaleTimeString()} • 
            Next scan in: {60 - researchData.lastUpdate.getSeconds()} seconds
          </div>
        </CardContent>
      </Card>

      {/* Trending Market Topics */}
      <Card className="bg-beam-dark-accent/70 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <TrendingUp className="mr-2 h-5 w-5 text-true-red" />
            Trending Market Intelligence
          </CardTitle>
          <p className="text-sm text-gray-400">Real-time analysis of market-moving topics</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {trendingTopics.map((topic, index) => (
            <Card key={index} className="bg-beam-dark-accent/50 border-gray-700/50">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-white mb-1">{topic.topic}</h4>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getSentimentColor(topic.sentiment)}>
                        {topic.sentiment.charAt(0).toUpperCase() + topic.sentiment.slice(1)}
                      </Badge>
                      <span className="text-xs text-gray-400">
                        {topic.mentions} mentions ({topic.change})
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-white">{topic.confidence}%</div>
                    <div className="text-xs text-gray-400">Confidence</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <h5 className="text-xs font-medium text-gray-300 mb-1">Key Insights:</h5>
                    <ul className="space-y-1">
                      {topic.keyPoints.map((point, pointIndex) => (
                        <li key={pointIndex} className="text-xs text-gray-400 flex items-start">
                          <div className="w-1 h-1 bg-true-red rounded-full mt-2 mr-2 flex-shrink-0"></div>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-xs text-gray-400">Relevant: </span>
                      <span className="text-xs text-blue-400">{topic.relevantStocks.join(', ')}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400">Sources: </span>
                      <span className="text-xs text-gray-300">{topic.sources.length}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      {/* Web Intelligence Signals */}
      <Card className="bg-beam-dark-accent/70 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Globe className="mr-2 h-5 w-5 text-true-red" />
            Live Web Intelligence Signals
          </CardTitle>
          <p className="text-sm text-gray-400">Real-time signals from alternative data sources</p>
        </CardHeader>
        <CardContent className="space-y-3">
          {webIntelligence.map((signal, index) => (
            <div key={index} className="p-3 rounded-lg bg-beam-dark-accent/30 border border-gray-700/50 hover:border-true-red/30 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-white text-sm">{signal.signal}</h4>
                    <Badge variant="outline" className="text-xs py-0 px-2">
                      {signal.ticker}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-400 mb-1">{signal.description}</p>
                  <div className="text-xs text-gray-500">
                    Source: {signal.source} • {signal.timestamp}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-medium ${getSignalStrengthColor(signal.strength)}`}>
                    {signal.strength}
                  </div>
                  <div className="text-xs text-gray-400">Signal</div>
                </div>
              </div>
            </div>
          ))}
          
          <div className="text-center pt-4">
            <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-700/50">
              <ExternalLink className="mr-2 h-4 w-4" />
              View All Signals
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
