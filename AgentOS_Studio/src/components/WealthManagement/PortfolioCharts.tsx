
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Activity, PieChart as PieChartIcon, BarChart3, Target } from 'lucide-react';

const chartConfig = {
  portfolio: {
    label: "Portfolio Value",
    color: "hsl(var(--chart-1))",
  },
  benchmark: {
    label: "S&P 500",
    color: "hsl(var(--chart-2))",
  },
  returns: {
    label: "Returns",
    color: "hsl(var(--chart-3))",
  },
} as const;

export const PortfolioCharts = () => {
  const [timeframe, setTimeframe] = useState('1Y');
  const [selectedMetric, setSelectedMetric] = useState('performance');

  const performanceData = [
    { month: 'Jan', portfolio: 985000, benchmark: 975000, returns: 2.3 },
    { month: 'Feb', portfolio: 1020000, benchmark: 995000, returns: 3.8 },
    { month: 'Mar', portfolio: 995000, benchmark: 985000, returns: 1.2 },
    { month: 'Apr', portfolio: 1050000, benchmark: 1010000, returns: 4.2 },
    { month: 'May', portfolio: 1080000, benchmark: 1025000, returns: 5.1 },
    { month: 'Jun', portfolio: 1095000, benchmark: 1035000, returns: 5.8 },
    { month: 'Jul', portfolio: 1120000, benchmark: 1055000, returns: 6.5 },
    { month: 'Aug', portfolio: 1105000, benchmark: 1045000, returns: 6.1 },
    { month: 'Sep', portfolio: 1135000, benchmark: 1065000, returns: 7.2 },
    { month: 'Oct', portfolio: 1150000, benchmark: 1075000, returns: 7.8 },
    { month: 'Nov', portfolio: 1175000, benchmark: 1090000, returns: 8.5 },
    { month: 'Dec', portfolio: 1200000, benchmark: 1100000, returns: 9.2 }
  ];

  const allocationData = [
    { name: 'Equities', value: 45, amount: 540000, color: '#0ea5e9' },
    { name: 'Fixed Income', value: 25, amount: 300000, color: '#10b981' },
    { name: 'Real Estate', value: 15, amount: 180000, color: '#f59e0b' },
    { name: 'Commodities', value: 8, amount: 96000, color: '#ef4444' },
    { name: 'Cash', value: 7, amount: 84000, color: '#8b5cf6' }
  ];

  const sectorData = [
    { sector: 'Technology', allocation: 22, performance: 12.5, risk: 'Medium' },
    { sector: 'Healthcare', allocation: 18, performance: 8.3, risk: 'Low' },
    { sector: 'Financial Services', allocation: 15, performance: 6.7, risk: 'Medium' },
    { sector: 'Consumer Goods', allocation: 12, performance: 4.2, risk: 'Low' },
    { sector: 'Energy', allocation: 10, performance: 15.8, risk: 'High' },
    { sector: 'Real Estate', allocation: 8, performance: 7.1, risk: 'Medium' },
    { sector: 'Utilities', allocation: 7, performance: 3.9, risk: 'Low' },
    { sector: 'Materials', allocation: 8, performance: 9.4, risk: 'High' }
  ];

  const riskMetrics = [
    { metric: 'Portfolio Beta', value: '1.12', change: '+0.05', trend: 'up' },
    { metric: 'Sharpe Ratio', value: '1.34', change: '+0.12', trend: 'up' },
    { metric: 'Max Drawdown', value: '-8.2%', change: '-1.3%', trend: 'down' },
    { metric: 'Value at Risk (95%)', value: '$45,200', change: '+$2,100', trend: 'up' },
    { metric: 'Volatility (30d)', value: '12.8%', change: '-2.1%', trend: 'down' },
    { metric: 'Correlation to S&P', value: '0.87', change: '+0.03', trend: 'up' }
  ];

  const timeframes = ['1D', '1W', '1M', '3M', '6M', '1Y', '3Y', '5Y'];

  return (
    <div className="space-y-6">
      {/* Portfolio Performance Overview */}
      <Card className="bg-beam-dark-accent/70 border-gray-700">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-white flex items-center">
              <Activity className="mr-2 h-5 w-5 text-true-red" />
              Portfolio Performance Analysis
            </CardTitle>
            <div className="flex gap-2">
              {timeframes.map((tf) => (
                <Button
                  key={tf}
                  variant={timeframe === tf ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimeframe(tf)}
                  className={timeframe === tf ? "bg-true-red hover:bg-true-red/80" : "border-gray-600 text-gray-300"}
                >
                  {tf}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
            <div className="p-4 rounded-lg bg-beam-dark-accent/30 border border-green-700/30">
              <div className="text-sm text-gray-400">Total Portfolio Value</div>
              <div className="text-2xl font-bold text-green-400">$1,200,000</div>
              <div className="text-sm text-green-400 flex items-center">
                <TrendingUp className="h-4 w-4 mr-1" />
                +9.2% YTD
              </div>
            </div>
            <div className="p-4 rounded-lg bg-beam-dark-accent/30 border border-blue-700/30">
              <div className="text-sm text-gray-400">Outperformance vs Benchmark</div>
              <div className="text-2xl font-bold text-blue-400">+4.8%</div>
              <div className="text-sm text-blue-400">vs S&P 500</div>
            </div>
            <div className="p-4 rounded-lg bg-beam-dark-accent/30 border border-amber-700/30">
              <div className="text-sm text-gray-400">Monthly Return</div>
              <div className="text-2xl font-bold text-amber-400">+2.1%</div>
              <div className="text-sm text-gray-400">December 2024</div>
            </div>
            <div className="p-4 rounded-lg bg-beam-dark-accent/30 border border-purple-700/30">
              <div className="text-sm text-gray-400">Risk-Adjusted Return</div>
              <div className="text-2xl font-bold text-purple-400">1.34</div>
              <div className="text-sm text-gray-400">Sharpe Ratio</div>
            </div>
          </div>

          <ChartContainer config={chartConfig} className="h-80">
            <AreaChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="portfolio"
                stroke="#0ea5e9"
                fill="#0ea5e9"
                fillOpacity={0.3}
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="benchmark"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.2}
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Asset Allocation */}
        <Card className="bg-beam-dark-accent/70 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <PieChartIcon className="mr-2 h-5 w-5 text-true-red" />
              Asset Allocation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ChartContainer config={chartConfig} className="h-64">
                <PieChart>
                  <Pie
                    data={allocationData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {allocationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
              
              <div className="space-y-3">
                {allocationData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-beam-dark-accent/30">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm text-gray-300">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-white">{item.value}%</div>
                      <div className="text-xs text-gray-400">${item.amount.toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Risk Metrics */}
        <Card className="bg-beam-dark-accent/70 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Target className="mr-2 h-5 w-5 text-true-red" />
              Risk Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3">
              {riskMetrics.map((metric, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-beam-dark-accent/30 border border-gray-700/50">
                  <div className="flex-1">
                    <div className="text-sm text-gray-300">{metric.metric}</div>
                    <div className="text-lg font-medium text-white">{metric.value}</div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-medium flex items-center ${
                      metric.trend === 'up' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {metric.trend === 'up' ? (
                        <TrendingUp className="h-3 w-3 mr-1" />
                      ) : (
                        <TrendingDown className="h-3 w-3 mr-1" />
                      )}
                      {metric.change}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sector Analysis */}
      <Card className="bg-beam-dark-accent/70 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <BarChart3 className="mr-2 h-5 w-5 text-true-red" />
            Sector Performance Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-80 mb-4">
            <BarChart data={sectorData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="sector" stroke="#9ca3af" angle={-45} textAnchor="end" height={80} />
              <YAxis stroke="#9ca3af" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="allocation" fill="#0ea5e9" name="Allocation %" />
              <Bar dataKey="performance" fill="#10b981" name="Performance %" />
            </BarChart>
          </ChartContainer>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {sectorData.map((sector, index) => (
              <div key={index} className="p-3 rounded-lg bg-beam-dark-accent/30 border border-gray-700/50">
                <div className="text-sm font-medium text-white">{sector.sector}</div>
                <div className="flex justify-between items-center mt-2">
                  <div>
                    <div className="text-xs text-gray-400">Allocation</div>
                    <div className="text-sm font-medium text-blue-400">{sector.allocation}%</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">Performance</div>
                    <div className="text-sm font-medium text-green-400">+{sector.performance}%</div>
                  </div>
                  <Badge 
                    className={`text-xs ${
                      sector.risk === 'Low' ? 'bg-green-900/20 text-green-300 border-green-700/30' :
                      sector.risk === 'Medium' ? 'bg-amber-900/20 text-amber-300 border-amber-700/30' :
                      'bg-red-900/20 text-red-300 border-red-700/30'
                    }`}
                  >
                    {sector.risk}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
