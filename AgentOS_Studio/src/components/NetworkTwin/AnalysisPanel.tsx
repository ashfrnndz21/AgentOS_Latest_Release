
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChartPie, Database, TrendingUp, Layers, Users } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  Scatter,
  ScatterChart,
  ZAxis
} from 'recharts';

export const AnalysisPanel = () => {
  const [analysisType, setAnalysisType] = useState('customer-network');
  const [timeframe, setTimeframe] = useState('6m');
  
  // Mock data for cross-dimensional analysis
  const customerChurnData = [
    { month: 'Jan', NetworkQuality: 85, ChurnRate: 2.1 },
    { month: 'Feb', NetworkQuality: 82, ChurnRate: 2.3 },
    { month: 'Mar', NetworkQuality: 78, ChurnRate: 2.8 },
    { month: 'Apr', NetworkQuality: 75, ChurnRate: 3.2 },
    { month: 'May', NetworkQuality: 72, ChurnRate: 3.5 },
    { month: 'Jun', NetworkQuality: 70, ChurnRate: 3.8 },
    { month: 'Jul', NetworkQuality: 73, ChurnRate: 3.6 },
    { month: 'Aug', NetworkQuality: 76, ChurnRate: 3.3 },
    { month: 'Sep', NetworkQuality: 79, ChurnRate: 2.9 },
    { month: 'Oct', NetworkQuality: 81, ChurnRate: 2.5 },
    { month: 'Nov', NetworkQuality: 83, ChurnRate: 2.3 },
    { month: 'Dec', NetworkQuality: 84, ChurnRate: 2.2 },
  ];
  
  const revenueCongestionData = [
    { congestion: 10, revenue: 95, name: 'Low' },
    { congestion: 20, revenue: 90, name: 'Low-Med' },
    { congestion: 30, revenue: 85, name: 'Medium' },
    { congestion: 40, revenue: 80, name: 'Med' },
    { congestion: 50, revenue: 75, name: 'Med-High' },
    { congestion: 60, revenue: 65, name: 'High' },
    { congestion: 70, revenue: 55, name: 'High' },
    { congestion: 80, revenue: 40, name: 'Very High' },
    { congestion: 90, revenue: 30, name: 'Critical' },
  ];
  
  const serviceAdoptionData = [
    { month: 'Jan', '4G': 55, '5G': 10, 'Fiber': 35 },
    { month: 'Feb', '4G': 53, '5G': 12, 'Fiber': 35 },
    { month: 'Mar', '4G': 51, '5G': 14, 'Fiber': 35 },
    { month: 'Apr', '4G': 49, '5G': 16, 'Fiber': 35 },
    { month: 'May', '4G': 47, '5G': 18, 'Fiber': 35 },
    { month: 'Jun', '4G': 45, '5G': 20, 'Fiber': 35 },
    { month: 'Jul', '4G': 43, '5G': 22, 'Fiber': 35 },
    { month: 'Aug', '4G': 41, '5G': 24, 'Fiber': 35 },
    { month: 'Sep', '4G': 39, '5G': 26, 'Fiber': 35 },
    { month: 'Oct', '4G': 37, '5G': 28, 'Fiber': 35 },
    { month: 'Nov', '4G': 35, '5G': 30, 'Fiber': 35 },
    { month: 'Dec', '4G': 33, '5G': 32, 'Fiber': 35 },
  ];
  
  return (
    <div className="glass-panel backdrop-blur-md bg-beam-dark-accent/30 border border-gray-700/50 rounded-xl p-6 shadow-lg">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-xl font-bold text-white">Cross-Dimensional Analysis</h2>
          
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Select value={analysisType} onValueChange={setAnalysisType}>
                <SelectTrigger className="w-[220px] bg-beam-dark-accent/50 border-gray-700">
                  <SelectValue placeholder="Analysis Type" />
                </SelectTrigger>
                <SelectContent className="bg-beam-dark border-gray-700">
                  <SelectItem value="customer-network">Customer & Network</SelectItem>
                  <SelectItem value="revenue-congestion">Revenue & Congestion</SelectItem>
                  <SelectItem value="service-adoption">Service Adoption Trends</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger className="w-[120px] bg-beam-dark-accent/50 border-gray-700">
                  <SelectValue placeholder="Timeframe" />
                </SelectTrigger>
                <SelectContent className="bg-beam-dark border-gray-700">
                  <SelectItem value="3m">3 Months</SelectItem>
                  <SelectItem value="6m">6 Months</SelectItem>
                  <SelectItem value="1y">1 Year</SelectItem>
                  <SelectItem value="2y">2 Years</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        {analysisType === 'customer-network' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="col-span-3 bg-beam-dark-accent/50 border-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Users className="h-5 w-5 text-ptt-blue" />
                <h3 className="text-lg font-medium text-white">Customer Churn vs. Network Quality</h3>
              </div>
              <p className="text-sm text-gray-400 mb-4">
                Analysis of correlation between network performance metrics and customer retention rates
              </p>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={customerChurnData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="month" stroke="#666" />
                    <YAxis yAxisId="left" stroke="#e61e2b" />
                    <YAxis yAxisId="right" orientation="right" stroke="#999" />
                    <Tooltip contentStyle={{ backgroundColor: '#1a0604', borderColor: '#333', color: '#fff' }} />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="NetworkQuality" stroke="#e61e2b" name="Network Quality (%)" />
                    <Line yAxisId="right" type="monotone" dataKey="ChurnRate" stroke="#999" name="Churn Rate (%)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="col-span-3 bg-beam-dark-accent/50 border-gray-700 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-beam-dark-accent/30 p-4 rounded-lg border border-gray-700/50">
                  <div className="text-sm text-gray-400 mb-1">Correlation Coefficient</div>
                  <div className="text-2xl font-bold text-white">-0.89</div>
                  <div className="text-xs text-gray-400">Strong negative correlation</div>
                </div>
                
                <div className="bg-beam-dark-accent/30 p-4 rounded-lg border border-gray-700/50">
                  <div className="text-sm text-gray-400 mb-1">Network Quality Threshold</div>
                  <div className="text-2xl font-bold text-white">78%</div>
                  <div className="text-xs text-gray-400">Minimum acceptable quality</div>
                </div>
                
                <div className="bg-beam-dark-accent/30 p-4 rounded-lg border border-gray-700/50">
                  <div className="text-sm text-gray-400 mb-1">Churn Impact</div>
                  <div className="text-2xl font-bold text-white">$2.1M</div>
                  <div className="text-xs text-gray-400">Monthly revenue at risk</div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {analysisType === 'revenue-congestion' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="col-span-3 bg-beam-dark-accent/50 border-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-5 w-5 text-ptt-blue" />
                <h3 className="text-lg font-medium text-white">Network Congestion vs. Revenue Impact</h3>
              </div>
              <p className="text-sm text-gray-400 mb-4">
                Analysis of how network congestion levels affect service revenue across regions
              </p>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart
                    margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis type="number" dataKey="congestion" name="Congestion (%)" stroke="#666" />
                    <YAxis type="number" dataKey="revenue" name="Revenue (%)" stroke="#666" />
                    <ZAxis type="category" dataKey="name" />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#1a0604', borderColor: '#333', color: '#fff' }} />
                    <Scatter name="Revenue-Congestion Correlation" data={revenueCongestionData} fill="#e61e2b" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="col-span-3 bg-beam-dark-accent/50 border-gray-700 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-beam-dark-accent/30 p-4 rounded-lg border border-gray-700/50">
                  <div className="text-sm text-gray-400 mb-1">Revenue Loss Rate</div>
                  <div className="text-2xl font-bold text-white">1.2%</div>
                  <div className="text-xs text-gray-400">Per 10% congestion increase</div>
                </div>
                
                <div className="bg-beam-dark-accent/30 p-4 rounded-lg border border-gray-700/50">
                  <div className="text-sm text-gray-400 mb-1">Critical Congestion Point</div>
                  <div className="text-2xl font-bold text-white">65%</div>
                  <div className="text-xs text-gray-400">Significant revenue impact</div>
                </div>
                
                <div className="bg-beam-dark-accent/30 p-4 rounded-lg border border-gray-700/50">
                  <div className="text-sm text-gray-400 mb-1">Most Affected Region</div>
                  <div className="text-2xl font-bold text-white">Central</div>
                  <div className="text-xs text-gray-400">Business district area</div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {analysisType === 'service-adoption' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="col-span-3 bg-beam-dark-accent/50 border-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Layers className="h-5 w-5 text-ptt-blue" />
                <h3 className="text-lg font-medium text-white">Technology Adoption Trends</h3>
              </div>
              <p className="text-sm text-gray-400 mb-4">
                Analysis of service adoption patterns and technology migration
              </p>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={serviceAdoptionData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="color4G" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#999" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#999" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="color5G" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#e61e2b" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#e61e2b" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorFiber" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f15761" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#f15761" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="month" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip contentStyle={{ backgroundColor: '#1a0604', borderColor: '#333', color: '#fff' }} />
                    <Legend />
                    <Area type="monotone" dataKey="4G" stackId="1" stroke="#999" fillOpacity={1} fill="url(#color4G)" />
                    <Area type="monotone" dataKey="5G" stackId="1" stroke="#e61e2b" fillOpacity={1} fill="url(#color5G)" />
                    <Area type="monotone" dataKey="Fiber" stackId="1" stroke="#f15761" fillOpacity={1} fill="url(#colorFiber)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="col-span-3 bg-beam-dark-accent/50 border-gray-700 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-beam-dark-accent/30 p-4 rounded-lg border border-gray-700/50">
                  <div className="text-sm text-gray-400 mb-1">5G Growth Rate</div>
                  <div className="text-2xl font-bold text-white">+22%</div>
                  <div className="text-xs text-gray-400">Year-over-year</div>
                </div>
                
                <div className="bg-beam-dark-accent/30 p-4 rounded-lg border border-gray-700/50">
                  <div className="text-sm text-gray-400 mb-1">4G to 5G Migration</div>
                  <div className="text-2xl font-bold text-white">2.3%</div>
                  <div className="text-xs text-gray-400">Monthly migration rate</div>
                </div>
                
                <div className="bg-beam-dark-accent/30 p-4 rounded-lg border border-gray-700/50">
                  <div className="text-sm text-gray-400 mb-1">Fiber Penetration</div>
                  <div className="text-2xl font-bold text-white">35%</div>
                  <div className="text-xs text-gray-400">Market share</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
