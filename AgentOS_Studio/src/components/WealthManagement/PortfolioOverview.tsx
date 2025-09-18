
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, DollarSign, Target, AlertTriangle } from 'lucide-react';

export const PortfolioOverview = () => {
  const portfolioData = {
    totalValue: 2847650,
    monthlyChange: 4.2,
    targetAllocation: {
      stocks: 60,
      bonds: 30,
      alternatives: 10
    },
    currentAllocation: {
      stocks: 62.3,
      bonds: 27.8,
      alternatives: 9.9
    },
    topHoldings: [
      { name: 'S&P 500 Index Fund', allocation: 25.4, change: 2.1 },
      { name: 'International Equity Fund', allocation: 18.7, change: -0.8 },
      { name: 'Corporate Bond Fund', allocation: 15.2, change: 0.4 },
      { name: 'REIT Fund', allocation: 8.9, change: 3.2 }
    ]
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-beam-dark-accent/70 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Portfolio Value</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(portfolioData.totalValue)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-true-red" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-beam-dark-accent/70 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Monthly Performance</p>
                <p className="text-2xl font-bold text-green-400">+{portfolioData.monthlyChange}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-beam-dark-accent/70 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Risk Score</p>
                <p className="text-2xl font-bold text-amber-400">Moderate</p>
              </div>
              <Target className="h-8 w-8 text-amber-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Asset Allocation */}
      <Card className="bg-beam-dark-accent/70 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            Asset Allocation
            <Badge className="bg-amber-900/20 text-amber-300 border-amber-700/30">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Rebalancing Suggested
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Stocks</span>
                <span className="text-white">{portfolioData.currentAllocation.stocks}% / {portfolioData.targetAllocation.stocks}%</span>
              </div>
              <Progress 
                value={portfolioData.currentAllocation.stocks} 
                className="h-2"
              />
              <p className="text-xs text-amber-400">2.3% over target</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Bonds</span>
                <span className="text-white">{portfolioData.currentAllocation.bonds}% / {portfolioData.targetAllocation.bonds}%</span>
              </div>
              <Progress 
                value={portfolioData.currentAllocation.bonds} 
                className="h-2"
              />
              <p className="text-xs text-blue-400">2.2% under target</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Alternatives</span>
                <span className="text-white">{portfolioData.currentAllocation.alternatives}% / {portfolioData.targetAllocation.alternatives}%</span>
              </div>
              <Progress 
                value={portfolioData.currentAllocation.alternatives} 
                className="h-2"
              />
              <p className="text-xs text-green-400">On target</p>
            </div>
          </div>

          <div className="flex justify-end">
            <Button className="bg-true-red hover:bg-true-red/90 text-white">
              Auto-Rebalance Portfolio
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Top Holdings */}
      <Card className="bg-beam-dark-accent/70 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Top Holdings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {portfolioData.topHoldings.map((holding, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-beam-dark-accent/30">
                <div>
                  <p className="text-white font-medium">{holding.name}</p>
                  <p className="text-sm text-gray-400">{holding.allocation}% of portfolio</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${
                    holding.change >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {holding.change >= 0 ? '+' : ''}{holding.change}%
                  </span>
                  {holding.change >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-400" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-400" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
