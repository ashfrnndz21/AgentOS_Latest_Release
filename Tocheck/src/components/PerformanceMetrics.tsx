
import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  AreaChart, 
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { Progress } from '@/components/ui/progress';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent
} from '@/components/ui/chart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown, Clock, User, Brain, AlertCircle, Check, Zap } from 'lucide-react';

// Sample data for demonstration
const monthlyPerformanceData = [
  { name: 'Jan', satisfaction: 85, accuracy: 82, responseTime: 1.8 },
  { name: 'Feb', satisfaction: 87, accuracy: 84, responseTime: 1.6 },
  { name: 'Mar', satisfaction: 89, accuracy: 86, responseTime: 1.5 },
  { name: 'Apr', satisfaction: 86, accuracy: 85, responseTime: 1.4 },
  { name: 'May', satisfaction: 90, accuracy: 88, responseTime: 1.3 },
  { name: 'Jun', satisfaction: 92, accuracy: 89, responseTime: 1.2 },
];

const dailyData = [
  { name: 'Mon', queries: 245, success: 230, errors: 15 },
  { name: 'Tue', queries: 320, success: 310, errors: 10 },
  { name: 'Wed', queries: 280, success: 270, errors: 10 },
  { name: 'Thu', queries: 305, success: 290, errors: 15 },
  { name: 'Fri', queries: 370, success: 360, errors: 10 },
  { name: 'Sat', queries: 180, success: 175, errors: 5 },
  { name: 'Sun', queries: 150, success: 145, errors: 5 },
];

const radarData = [
  { subject: 'Accuracy', A: 89, fullMark: 100 },
  { subject: 'Helpfulness', A: 92, fullMark: 100 },
  { subject: 'Speed', A: 95, fullMark: 100 },
  { subject: 'Consistency', A: 87, fullMark: 100 },
  { subject: 'Reasoning', A: 83, fullMark: 100 },
  { subject: 'Creativity', A: 80, fullMark: 100 },
];

const benchmarkData = [
  { name: 'Response Time', value: 1.2, benchmark: 1.5, unit: 's' },
  { name: 'Accuracy', value: 89, benchmark: 85, unit: '%' },
  { name: 'User Satisfaction', value: 92, benchmark: 88, unit: '%' },
  { name: 'Task Completion', value: 94, benchmark: 90, unit: '%' },
  { name: 'Error Rate', value: 3, benchmark: 5, unit: '%' },
];

interface MetricCardProps {
  title: string;
  value: number | string;
  change?: number;
  changeText?: string;
  icon: React.ReactNode;
  unit?: string;
  className?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  change, 
  changeText,
  icon, 
  unit = '',
  className = ''
}) => {
  const isPositive = typeof change === 'number' ? change > 0 : false;
  const isNegative = typeof change === 'number' ? change < 0 : false;
  
  return (
    <div className={`glass-panel p-4 flex flex-col ${className}`}>
      <div className="flex justify-between items-start mb-2">
        <span className="text-gray-400 text-sm">{title}</span>
        <div className="p-2 rounded-full bg-beam-blue/20">{icon}</div>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-white">{value}{unit}</span>
        {change !== undefined && (
          <div className={`flex items-center text-xs ${
            isPositive ? 'text-green-400' : isNegative ? 'text-red-400' : 'text-gray-400'
          }`}>
            {isPositive && <ArrowUpRight size={14} />}
            {isNegative && <ArrowDownRight size={14} />}
            <span>{Math.abs(change)}{unit} {changeText || ''}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export function PerformanceMetrics() {
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month' | 'quarter'>('month');
  
  const effectivenessScore = 87;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-medium text-white">Performance Metrics</h2>
        
        <div className="flex gap-2">
          <button 
            onClick={() => setTimeframe('day')} 
            className={`px-3 py-1 text-sm rounded-md ${
              timeframe === 'day' ? 'bg-beam-blue text-white' : 'text-gray-400 hover:bg-white/5'
            }`}
          >
            Day
          </button>
          <button 
            onClick={() => setTimeframe('week')} 
            className={`px-3 py-1 text-sm rounded-md ${
              timeframe === 'week' ? 'bg-beam-blue text-white' : 'text-gray-400 hover:bg-white/5'
            }`}
          >
            Week
          </button>
          <button 
            onClick={() => setTimeframe('month')} 
            className={`px-3 py-1 text-sm rounded-md ${
              timeframe === 'month' ? 'bg-beam-blue text-white' : 'text-gray-400 hover:bg-white/5'
            }`}
          >
            Month
          </button>
          <button 
            onClick={() => setTimeframe('quarter')} 
            className={`px-3 py-1 text-sm rounded-md ${
              timeframe === 'quarter' ? 'bg-beam-blue text-white' : 'text-gray-400 hover:bg-white/5'
            }`}
          >
            Quarter
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard 
          title="AI Effectiveness Score" 
          value={effectivenessScore}
          unit="%" 
          change={+3}
          changeText="this month"
          icon={<Brain size={18} className="text-beam-blue" />}
          className="col-span-2 md:col-span-1"
        />
        <MetricCard 
          title="User Satisfaction" 
          value={92} 
          unit="%" 
          change={+4}
          icon={<User size={18} className="text-green-400" />}
        />
        <MetricCard 
          title="Accuracy Rate" 
          value={89} 
          unit="%" 
          change={+2}
          icon={<Check size={18} className="text-blue-400" />}
        />
        <MetricCard 
          title="Avg. Response Time" 
          value={1.2} 
          unit="s" 
          change={-0.3}
          icon={<Zap size={18} className="text-amber-400" />}
        />
      </div>
      
      <Tabs defaultValue="trends" className="w-full">
        <TabsList className="bg-beam-dark-accent/30 w-full justify-start mb-4">
          <TabsTrigger value="trends" className="data-[state=active]:bg-beam-blue data-[state=active]:text-white">
            Trends
          </TabsTrigger>
          <TabsTrigger value="usage" className="data-[state=active]:bg-beam-blue data-[state=active]:text-white">
            Usage
          </TabsTrigger>
          <TabsTrigger value="capabilities" className="data-[state=active]:bg-beam-blue data-[state=active]:text-white">
            Capabilities
          </TabsTrigger>
          <TabsTrigger value="benchmarks" className="data-[state=active]:bg-beam-blue data-[state=active]:text-white">
            Benchmarks
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="trends" className="space-y-4">
          <div className="glass-panel p-4">
            <h3 className="text-white font-medium mb-4">Performance Trends</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={monthlyPerformanceData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                  <XAxis dataKey="name" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f1f1f', 
                      borderColor: '#333',
                      color: '#fff'
                    }} 
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="satisfaction" 
                    name="User Satisfaction (%)" 
                    stroke="#34d399" 
                    activeDot={{ r: 8 }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="accuracy" 
                    name="Accuracy (%)" 
                    stroke="#3b82f6" 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="glass-panel p-4">
            <h3 className="text-white font-medium mb-4">Response Time</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={monthlyPerformanceData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                  <XAxis dataKey="name" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f1f1f', 
                      borderColor: '#333',
                      color: '#fff'
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="responseTime" 
                    name="Response Time (s)" 
                    stroke="#f59e0b" 
                    fill="#f59e0b33" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="usage" className="space-y-4">
          <div className="glass-panel p-4">
            <h3 className="text-white font-medium mb-4">Daily Usage Metrics</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={dailyData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                  <XAxis dataKey="name" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f1f1f', 
                      borderColor: '#333',
                      color: '#fff'
                    }} 
                  />
                  <Legend />
                  <Bar dataKey="queries" name="Total Queries" fill="#9b87f5" />
                  <Bar dataKey="success" name="Successful" fill="#34d399" />
                  <Bar dataKey="errors" name="Errors" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricCard 
              title="Total Queries" 
              value="1,850" 
              change={+12.5}
              changeText="%"
              icon={<TrendingUp size={18} className="text-beam-blue" />}
            />
            <MetricCard 
              title="Avg. Session Length" 
              value={4.7} 
              unit="min" 
              change={+0.8}
              icon={<Clock size={18} className="text-blue-400" />}
            />
            <MetricCard 
              title="Error Rate" 
              value={3.2} 
              unit="%" 
              change={-0.7}
              icon={<AlertCircle size={18} className="text-red-400" />}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="capabilities" className="space-y-4">
          <div className="glass-panel p-4">
            <h3 className="text-white font-medium mb-4">Agent Capabilities</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="#2a2a2a" />
                  <PolarAngleAxis dataKey="subject" stroke="#6b7280" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#6b7280" />
                  <Radar
                    name="Agent Performance"
                    dataKey="A"
                    stroke="#9b87f5"
                    fill="#9b87f5"
                    fillOpacity={0.6}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f1f1f', 
                      borderColor: '#333',
                      color: '#fff'
                    }} 
                  />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="benchmarks" className="space-y-4">
          <div className="glass-panel p-4">
            <h3 className="text-white font-medium mb-4">Performance Benchmarks</h3>
            <div className="space-y-6">
              {benchmarkData.map((item) => (
                <div key={item.name} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-white text-sm">{item.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">
                        {item.value}{item.unit}
                      </span>
                      <span className={`text-xs ${
                        (item.name === 'Error Rate' ? item.value < item.benchmark : item.value > item.benchmark) 
                          ? 'text-green-400' 
                          : 'text-red-400'
                      }`}>
                        {(item.name === 'Error Rate' ? item.value < item.benchmark : item.value > item.benchmark) 
                          ? <TrendingUp size={14} /> 
                          : <TrendingDown size={14} />
                        }
                      </span>
                    </div>
                  </div>
                  <div className="relative h-2 w-full bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-beam-blue rounded-full" 
                      style={{ width: `${(item.value / (item.benchmark * 1.5)) * 100}%` }}
                    ></div>
                    <div 
                      className="absolute top-0 h-full w-0.5 bg-white/50"
                      style={{ left: `${(item.benchmark / (item.benchmark * 1.5)) * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>0{item.unit}</span>
                    <span>Benchmark: {item.benchmark}{item.unit}</span>
                    <span>{item.benchmark * 1.5}{item.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
