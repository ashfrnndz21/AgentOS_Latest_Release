
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Newspaper, TrendingUp, TrendingDown, AlertCircle, ExternalLink, Clock, Eye, Brain, Zap } from 'lucide-react';

const chartConfig = {
  sentiment: {
    label: "Market Sentiment",
    color: "hsl(var(--chart-1))",
  },
  volume: {
    label: "News Volume",
    color: "hsl(var(--chart-2))",
  },
} as const;

export const InteractiveNewsAnalysis = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sentimentFilter, setSentimentFilter] = useState('all');
  const [realTimeData, setRealTimeData] = useState({
    lastUpdate: new Date(),
    articlesProcessed: 2847,
    sentimentScore: 0.62,
    volatilityIndex: 23.4
  });

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeData(prev => ({
        ...prev,
        lastUpdate: new Date(),
        articlesProcessed: prev.articlesProcessed + Math.floor(Math.random() * 15),
        sentimentScore: Math.max(0, Math.min(1, prev.sentimentScore + (Math.random() - 0.5) * 0.1)),
        volatilityIndex: Math.max(0, prev.volatilityIndex + (Math.random() - 0.5) * 2)
      }));
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const newsCategories = ['all', 'markets', 'crypto', 'earnings', 'policy', 'geopolitical'];
  const sentimentFilters = ['all', 'positive', 'neutral', 'negative'];

  const breakingNews = [
    {
      id: 1,
      headline: 'Federal Reserve Signals Potential Rate Cuts in Q2 2025',
      source: 'Reuters',
      timestamp: '2 minutes ago',
      sentiment: 'positive',
      impact: 'high',
      marketReaction: '+1.2%',
      aiAnalysis: 'Bullish signal for growth stocks and real estate. Bond yields likely to decline.',
      relevantStocks: ['SPY', 'QQQ', 'TLT', 'REITs'],
      category: 'policy'
    },
    {
      id: 2,
      headline: 'NVIDIA Reports Record Q4 Revenue, Beats Estimates by 15%',
      source: 'Bloomberg',
      timestamp: '8 minutes ago',
      sentiment: 'positive',
      impact: 'high',
      marketReaction: '+6.8%',
      aiAnalysis: 'Strong momentum in AI infrastructure. Semiconductor sector likely to rally.',
      relevantStocks: ['NVDA', 'AMD', 'TSM', 'AVGO'],
      category: 'earnings'
    },
    {
      id: 3,
      headline: 'China Manufacturing PMI Falls Below 50, Signals Contraction',
      source: 'Financial Times',
      timestamp: '15 minutes ago',
      sentiment: 'negative',
      impact: 'medium',
      marketReaction: '-0.8%',
      aiAnalysis: 'Bearish for commodities and China-exposed stocks. Safe-haven flows expected.',
      relevantStocks: ['FXI', 'ASHR', 'GLD', 'DXY'],
      category: 'geopolitical'
    },
    {
      id: 4,
      headline: 'Bitcoin ETF Sees Record $2.3B Inflow in Single Day',
      source: 'CoinDesk',
      timestamp: '22 minutes ago',
      sentiment: 'positive',
      impact: 'medium',
      marketReaction: '+4.5%',
      aiAnalysis: 'Institutional adoption accelerating. Crypto-related stocks likely to benefit.',
      relevantStocks: ['MSTR', 'COIN', 'RIOT', 'MARA'],
      category: 'crypto'
    },
    {
      id: 5,
      headline: 'European Central Bank Maintains Dovish Stance Amid Inflation Concerns',
      source: 'WSJ',
      timestamp: '35 minutes ago',
      sentiment: 'neutral',
      impact: 'medium',
      marketReaction: '+0.3%',
      aiAnalysis: 'Mixed signals for EUR/USD. European equities may see modest gains.',
      relevantStocks: ['EZU', 'FEZ', 'IEUR', 'EWG'],
      category: 'policy'
    }
  ];

  const sentimentTrend = [
    { time: '9:00', sentiment: 0.45, volume: 234 },
    { time: '9:30', sentiment: 0.52, volume: 289 },
    { time: '10:00', sentiment: 0.48, volume: 356 },
    { time: '10:30', sentiment: 0.61, volume: 423 },
    { time: '11:00', sentiment: 0.58, volume: 387 },
    { time: '11:30', sentiment: 0.65, volume: 445 },
    { time: '12:00', sentiment: 0.62, volume: 398 },
    { time: '12:30', sentiment: 0.59, volume: 367 },
    { time: '13:00', sentiment: 0.67, volume: 456 },
    { time: '13:30', sentiment: 0.63, volume: 401 }
  ];

  const marketImpactData = [
    { sector: 'Technology', sentiment: 0.72, articles: 156, change: '+2.1%' },
    { sector: 'Healthcare', sentiment: 0.58, articles: 89, change: '+0.8%' },
    { sector: 'Financial', sentiment: 0.65, articles: 134, change: '+1.5%' },
    { sector: 'Energy', sentiment: 0.43, articles: 78, change: '-1.2%' },
    { sector: 'Consumer', sentiment: 0.61, articles: 92, change: '+0.9%' },
    { sector: 'Industrial', sentiment: 0.55, articles: 67, change: '+0.4%' }
  ];

  const filteredNews = breakingNews.filter(article => {
    const categoryMatch = selectedCategory === 'all' || article.category === selectedCategory;
    const sentimentMatch = sentimentFilter === 'all' || article.sentiment === sentimentFilter;
    return categoryMatch && sentimentMatch;
  });

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-400 bg-green-900/20 border-green-700/30';
      case 'negative': return 'text-red-400 bg-red-900/20 border-red-700/30';
      case 'neutral': return 'text-gray-400 bg-gray-900/20 border-gray-700/30';
      default: return 'text-gray-400 bg-gray-900/20 border-gray-700/30';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-amber-400';
      case 'low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Real-Time Market Sentiment Dashboard */}
      <Card className="bg-beam-dark-accent/70 border-gray-700">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-white flex items-center">
              <Brain className="mr-2 h-5 w-5 text-true-red" />
              AI-Powered Market Sentiment Analysis
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge className="bg-green-900/20 text-green-300 border-green-700/30 animate-pulse">
                <Zap className="h-3 w-3 mr-1" />
                Live
              </Badge>
              <span className="text-xs text-gray-400">
                Updated: {realTimeData.lastUpdate.toLocaleTimeString()}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 rounded-lg bg-beam-dark-accent/30 border border-blue-700/30">
              <div className="text-sm text-gray-400">Articles Processed</div>
              <div className="text-2xl font-bold text-blue-400">{realTimeData.articlesProcessed.toLocaleString()}</div>
              <div className="text-xs text-gray-400">Last 24 hours</div>
            </div>
            <div className="p-4 rounded-lg bg-beam-dark-accent/30 border border-green-700/30">
              <div className="text-sm text-gray-400">Market Sentiment</div>
              <div className="text-2xl font-bold text-green-400">{(realTimeData.sentimentScore * 100).toFixed(1)}%</div>
              <div className="text-xs text-gray-400">Bullish overall</div>
            </div>
            <div className="p-4 rounded-lg bg-beam-dark-accent/30 border border-amber-700/30">
              <div className="text-sm text-gray-400">Volatility Index</div>
              <div className="text-2xl font-bold text-amber-400">{realTimeData.volatilityIndex.toFixed(1)}</div>
              <div className="text-xs text-gray-400">Market uncertainty</div>
            </div>
            <div className="p-4 rounded-lg bg-beam-dark-accent/30 border border-purple-700/30">
              <div className="text-sm text-gray-400">AI Confidence</div>
              <div className="text-2xl font-bold text-purple-400">94.2%</div>
              <div className="text-xs text-gray-400">Prediction accuracy</div>
            </div>
          </div>

          <ChartContainer config={chartConfig} className="h-64">
            <AreaChart data={sentimentTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9ca3af" />
              <YAxis domain={[0, 1]} stroke="#9ca3af" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="sentiment"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Breaking News Feed */}
        <Card className="lg:col-span-2 bg-beam-dark-accent/70 border-gray-700">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-white flex items-center">
                <Newspaper className="mr-2 h-5 w-5 text-true-red" />
                Real-Time Market News
              </CardTitle>
              <div className="flex gap-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-beam-dark-accent border border-gray-700 text-white text-sm rounded px-3 py-1"
                >
                  {newsCategories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
                <select
                  value={sentimentFilter}
                  onChange={(e) => setSentimentFilter(e.target.value)}
                  className="bg-beam-dark-accent border border-gray-700 text-white text-sm rounded px-3 py-1"
                >
                  {sentimentFilters.map(filter => (
                    <option key={filter} value={filter}>
                      {filter.charAt(0).toUpperCase() + filter.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {filteredNews.map((article) => (
              <Card key={article.id} className="bg-beam-dark-accent/50 border-gray-700/50 hover:border-true-red/30 transition-colors">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h4 className="font-medium text-white mb-2 leading-tight">{article.headline}</h4>
                      <div className="flex items-center gap-3 text-sm text-gray-400">
                        <span>{article.source}</span>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {article.timestamp}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge className={getSentimentColor(article.sentiment)}>
                        {article.sentiment}
                      </Badge>
                      <div className={`text-sm font-medium ${getImpactColor(article.impact)}`}>
                        {article.marketReaction}
                      </div>
                    </div>
                  </div>

                  <div className="mb-3 p-3 rounded-lg bg-beam-dark-accent/30 border-l-2 border-true-red/30">
                    <div className="flex items-start gap-2">
                      <Brain className="h-4 w-4 text-true-red mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">AI Analysis</div>
                        <p className="text-sm text-gray-300">{article.aiAnalysis}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">Relevant:</span>
                      <div className="flex gap-1">
                        {article.relevantStocks.slice(0, 3).map((stock, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs py-0 px-2 border-gray-600 text-gray-400">
                            {stock}
                          </Badge>
                        ))}
                        {article.relevantStocks.length > 3 && (
                          <Badge variant="outline" className="text-xs py-0 px-2 border-gray-600 text-gray-400">
                            +{article.relevantStocks.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>

        {/* Sector Impact Analysis */}
        <Card className="bg-beam-dark-accent/70 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <TrendingUp className="mr-2 h-5 w-5 text-true-red" />
              Sector Impact Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {marketImpactData.map((sector, index) => (
              <div key={index} className="p-3 rounded-lg bg-beam-dark-accent/30 border border-gray-700/50">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium text-white">{sector.sector}</h4>
                  <div className={`text-sm font-medium ${
                    sector.change.startsWith('+') ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {sector.change}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Sentiment</span>
                    <span className="text-white">{(sector.sentiment * 100).toFixed(0)}%</span>
                  </div>
                  <Progress 
                    value={sector.sentiment * 100} 
                    className="h-2"
                  />
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>{sector.articles} articles</span>
                    <span>Last 4 hours</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
