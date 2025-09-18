
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChartBar, Download, FileDown, FilePlus } from 'lucide-react';
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
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface SimulationResultsProps {
  simulationType: string;
  trafficGrowthRate: number;
  capacityConstraint: number;
  forecastPeriod: number;
}

export const SimulationResults: React.FC<SimulationResultsProps> = ({
  simulationType,
  trafficGrowthRate,
  capacityConstraint,
  forecastPeriod
}) => {
  // Generate mock data for simulation results based on the parameters
  const generateTimeSeriesData = () => {
    return Array.from({ length: forecastPeriod + 1 }).map((_, i) => {
      const baseTraffic = 100;
      const trafficGrowth = baseTraffic * (1 + (trafficGrowthRate / 100) * i / forecastPeriod);
      const capacityLine = baseTraffic * (capacityConstraint / 100);
      
      return {
        name: `Month ${i}`,
        "Traffic": Math.round(trafficGrowth),
        "Capacity Threshold": capacityLine,
      };
    });
  };
  
  const generateRegionData = () => {
    return [
      { name: 'Northern', value: 25 + Math.floor(Math.random() * 15) },
      { name: 'Central', value: 35 + Math.floor(Math.random() * 20) },
      { name: 'Eastern', value: 15 + Math.floor(Math.random() * 10) },
      { name: 'Western', value: 20 + Math.floor(Math.random() * 12) },
      { name: 'Southern', value: 18 + Math.floor(Math.random() * 14) },
    ];
  };
  
  const generateNodeTypeData = () => {
    return [
      { name: 'Core Routers', "Utilization": 78 + Math.floor(trafficGrowthRate / 2) },
      { name: 'Dist. Switches', "Utilization": 65 + Math.floor(trafficGrowthRate / 3) },
      { name: 'Edge Nodes', "Utilization": 45 + Math.floor(trafficGrowthRate / 4) },
      { name: 'Cell Sites', "Utilization": 55 + Math.floor(trafficGrowthRate / 3.5) },
    ];
  };
  
  const timeSeriesData = generateTimeSeriesData();
  const regionData = generateRegionData();
  const nodeTypeData = generateNodeTypeData();
  
  const COLORS = ['#e61e2b', '#f15761', '#7a1915', '#b01722', '#240908'];
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-white">Simulation Results</h3>
          <p className="text-sm text-gray-400">
            {simulationType === 'traffic' ? 'Traffic Growth' : 
             simulationType === 'failure' ? 'Failure Scenarios' : 
             simulationType === 'expansion' ? 'Network Expansion' : 'Capacity Optimization'} 
            • Growth Rate: {trafficGrowthRate}% • Forecast: {forecastPeriod} months
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-beam-dark-accent/50">
            <Download className="mr-2 h-4 w-4" />
            Export Results
          </Button>
          <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-beam-dark-accent/50">
            <FilePlus className="mr-2 h-4 w-4" />
            Save Scenario
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="forecast" className="w-full">
        <TabsList className="grid grid-cols-3 mb-4 bg-beam-dark-accent/40 border border-gray-700/50 rounded-lg p-1 gap-1">
          <TabsTrigger value="forecast" className="rounded-md data-[state=active]:bg-beam-blue data-[state=active]:text-white">
            Traffic Forecast
          </TabsTrigger>
          <TabsTrigger value="utilization" className="rounded-md data-[state=active]:bg-beam-blue data-[state=active]:text-white">
            Utilization
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="rounded-md data-[state=active]:bg-beam-blue data-[state=active]:text-white">
            Recommendations
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="forecast" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-4 bg-beam-dark-accent/50 border-gray-700 rounded-lg col-span-3">
              <h4 className="text-base font-medium text-white mb-3">Traffic Growth Forecast</h4>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={timeSeriesData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorTraffic" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#e61e2b" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#e61e2b" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="name" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip contentStyle={{ backgroundColor: '#1a0604', borderColor: '#333', color: '#fff' }} />
                    <Legend />
                    <Area type="monotone" dataKey="Traffic" stroke="#e61e2b" fillOpacity={1} fill="url(#colorTraffic)" />
                    <Area type="monotone" dataKey="Capacity Threshold" stroke="#666" strokeDasharray="5 5" fill="none" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
            
            <Card className="p-4 bg-beam-dark-accent/50 border-gray-700 rounded-lg col-span-2">
              <h4 className="text-base font-medium text-white mb-3">Utilization by Node Type</h4>
              <div className="h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={nodeTypeData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="name" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip contentStyle={{ backgroundColor: '#1a0604', borderColor: '#333', color: '#fff' }} />
                    <Bar dataKey="Utilization" fill="#e61e2b" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
            
            <Card className="p-4 bg-beam-dark-accent/50 border-gray-700 rounded-lg">
              <h4 className="text-base font-medium text-white mb-3">Traffic Distribution by Region</h4>
              <div className="h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={regionData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {regionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1a0604', borderColor: '#333', color: '#fff' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="utilization" className="mt-0">
          <Card className="p-6 bg-beam-dark-accent/50 border-gray-700 rounded-lg">
            <h4 className="text-base font-medium text-white mb-4">Network Utilization Analysis</h4>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-beam-dark-accent/30 p-4 rounded-lg border border-gray-700/50">
                  <div className="text-sm text-gray-400 mb-1">Overall Network Utilization</div>
                  <div className="text-2xl font-bold text-white">{55 + Math.floor(trafficGrowthRate / 2)}%</div>
                  <div className="text-xs text-gray-500">+{trafficGrowthRate}% growth in {forecastPeriod} months</div>
                </div>
                
                <div className="bg-beam-dark-accent/30 p-4 rounded-lg border border-gray-700/50">
                  <div className="text-sm text-gray-400 mb-1">Peak Hour Utilization</div>
                  <div className="text-2xl font-bold text-white">{72 + Math.floor(trafficGrowthRate / 1.5)}%</div>
                  <div className="text-xs text-gray-500">Critical threshold: 85%</div>
                </div>
                
                <div className="bg-beam-dark-accent/30 p-4 rounded-lg border border-gray-700/50">
                  <div className="text-sm text-gray-400 mb-1">Congested Network Segments</div>
                  <div className="text-2xl font-bold text-white">{Math.floor(trafficGrowthRate / 2)}</div>
                  <div className="text-xs text-gray-500">Above {capacityConstraint}% capacity threshold</div>
                </div>
              </div>
              
              <div className="mt-6 space-y-4">
                <h5 className="text-sm font-medium text-white">Potential Bottlenecks</h5>
                
                <div className="space-y-2">
                  <div className="bg-beam-dark-accent/30 p-3 rounded-lg border border-gray-700/50">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-sm font-medium text-white">Core Router CR-12</div>
                        <div className="text-xs text-gray-400">Central Region</div>
                      </div>
                      <div className="text-ptt-blue font-bold">{85 + Math.floor(trafficGrowthRate / 3)}%</div>
                    </div>
                    <div className="mt-2 w-full bg-gray-700 rounded-full h-1.5">
                      <div className="bg-ptt-blue h-1.5 rounded-full" style={{ width: `${85 + Math.floor(trafficGrowthRate / 3)}%` }}></div>
                    </div>
                  </div>
                  
                  <div className="bg-beam-dark-accent/30 p-3 rounded-lg border border-gray-700/50">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-sm font-medium text-white">Backbone Link BL-05</div>
                        <div className="text-xs text-gray-400">North-Central Connection</div>
                      </div>
                      <div className="text-amber-400 font-bold">{78 + Math.floor(trafficGrowthRate / 2)}%</div>
                    </div>
                    <div className="mt-2 w-full bg-gray-700 rounded-full h-1.5">
                      <div className="bg-amber-400 h-1.5 rounded-full" style={{ width: `${78 + Math.floor(trafficGrowthRate / 2)}%` }}></div>
                    </div>
                  </div>
                  
                  <div className="bg-beam-dark-accent/30 p-3 rounded-lg border border-gray-700/50">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-sm font-medium text-white">Edge Gateway EG-28</div>
                        <div className="text-xs text-gray-400">Eastern Region</div>
                      </div>
                      <div className="text-green-400 font-bold">{70 + Math.floor(trafficGrowthRate / 4)}%</div>
                    </div>
                    <div className="mt-2 w-full bg-gray-700 rounded-full h-1.5">
                      <div className="bg-green-400 h-1.5 rounded-full" style={{ width: `${70 + Math.floor(trafficGrowthRate / 4)}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="recommendations" className="mt-0">
          <Card className="p-6 bg-beam-dark-accent/50 border-gray-700 rounded-lg">
            <h4 className="text-base font-medium text-white mb-4">AI-Generated Recommendations</h4>
            
            <div className="space-y-6">
              <div className="bg-beam-dark-accent/30 p-4 rounded-lg border border-gray-700/50">
                <h5 className="text-base font-medium text-white mb-2">Capacity Enhancement Recommendations</h5>
                <ul className="space-y-2 text-gray-300 text-sm">
                  <li className="flex items-start gap-2">
                    <div className="min-w-[24px] h-6 flex items-center justify-center rounded-full bg-ptt-red/20 text-ptt-blue">1</div>
                    <div>Upgrade Core Router CR-12 capacity by additional 40% to handle projected traffic growth in the next {forecastPeriod} months.</div>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="min-w-[24px] h-6 flex items-center justify-center rounded-full bg-ptt-red/20 text-ptt-blue">2</div>
                    <div>Implement link aggregation on Backbone Link BL-05 to increase bandwidth capacity by 25% before month 3.</div>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="min-w-[24px] h-6 flex items-center justify-center rounded-full bg-ptt-red/20 text-ptt-blue">3</div>
                    <div>Consider load balancing configuration updates on Edge Gateway EG-28 to optimize traffic distribution.</div>
                  </li>
                </ul>
              </div>
              
              <div className="bg-beam-dark-accent/30 p-4 rounded-lg border border-gray-700/50">
                <h5 className="text-base font-medium text-white mb-2">Traffic Optimization Strategies</h5>
                <ul className="space-y-2 text-gray-300 text-sm">
                  <li className="flex items-start gap-2">
                    <div className="min-w-[24px] h-6 flex items-center justify-center rounded-full bg-ptt-red/20 text-ptt-blue">1</div>
                    <div>Implement Quality of Service (QoS) policies to prioritize critical traffic during peak hours.</div>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="min-w-[24px] h-6 flex items-center justify-center rounded-full bg-ptt-red/20 text-ptt-blue">2</div>
                    <div>Deploy traffic shaping for high-bandwidth applications during the 18:00-22:00 timeframe to reduce congestion.</div>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="min-w-[24px] h-6 flex items-center justify-center rounded-full bg-ptt-red/20 text-ptt-blue">3</div>
                    <div>Consider implementing caching mechanisms at edge nodes to reduce redundant data transfers.</div>
                  </li>
                </ul>
              </div>
              
              <div className="bg-beam-dark-accent/30 p-4 rounded-lg border border-gray-700/50">
                <h5 className="text-base font-medium text-white mb-2">Investment Recommendations</h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                  <div className="p-3 bg-ptt-red/10 rounded-lg">
                    <div className="text-lg font-bold text-white">${Math.floor(80 + trafficGrowthRate * 15)}K</div>
                    <div className="text-xs text-gray-400">Immediate Investment</div>
                    <div className="text-xs text-gray-400 mt-1">High priority upgrades</div>
                  </div>
                  
                  <div className="p-3 bg-ptt-red/10 rounded-lg">
                    <div className="text-lg font-bold text-white">${Math.floor(150 + trafficGrowthRate * 25)}K</div>
                    <div className="text-xs text-gray-400">3-Month Plan</div>
                    <div className="text-xs text-gray-400 mt-1">Medium priority upgrades</div>
                  </div>
                  
                  <div className="p-3 bg-ptt-red/10 rounded-lg">
                    <div className="text-lg font-bold text-white">${Math.floor(320 + trafficGrowthRate * 40)}K</div>
                    <div className="text-xs text-gray-400">6-Month Plan</div>
                    <div className="text-xs text-gray-400 mt-1">Complete enhancement</div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
