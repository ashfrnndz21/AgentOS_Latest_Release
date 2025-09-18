
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChartLine, Network, Layers3, Sparkles } from 'lucide-react';
import { SimulationResults } from './SimulationResults';

interface SimulationPanelProps {
  onSimulationComplete?: (data: any) => void;
}

export const SimulationPanel: React.FC<SimulationPanelProps> = ({ onSimulationComplete }) => {
  const [simulationType, setSimulationType] = useState('traffic');
  const [trafficGrowthRate, setTrafficGrowthRate] = useState([5]);
  const [capacityConstraint, setCapacityConstraint] = useState([80]);
  const [forecastPeriod, setForecastPeriod] = useState('6');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResults, setSimulationResults] = useState<boolean>(false);
  
  const handleRunSimulation = () => {
    // Mock simulation execution
    setIsSimulating(true);
    
    // After 2 seconds, show results
    setTimeout(() => {
      setIsSimulating(false);
      setSimulationResults(true);
      onSimulationComplete?.({
        type: simulationType,
        parameters: { trafficGrowthRate, capacityConstraint, forecastPeriod },
        timestamp: new Date().toISOString()
      });
    }, 2000);
  };
  
  const resetSimulation = () => {
    setSimulationResults(false);
  };
  
  return (
    <div className="glass-panel backdrop-blur-md bg-beam-dark-accent/30 border border-gray-700/50 rounded-xl p-6 shadow-lg">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-xl font-bold text-white">Network Simulation & Forecasting</h2>
          
          <div className="flex flex-wrap gap-3">
            <Button 
              variant="default" 
              className="bg-ptt-red hover:bg-ptt-red/90"
              onClick={simulationResults ? resetSimulation : handleRunSimulation}
              disabled={isSimulating}
            >
              {isSimulating ? 'Simulating...' : simulationResults ? 'New Simulation' : 'Run Simulation'}
              {!isSimulating && !simulationResults && <Sparkles className="ml-2 h-4 w-4" />}
            </Button>
          </div>
        </div>
        
        {!simulationResults ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-4 bg-beam-dark-accent/50 border-gray-700 rounded-lg">
              <h3 className="text-lg font-medium text-white mb-4">Simulation Parameters</h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="simulation-type" className="text-sm text-gray-300">Simulation Type</Label>
                  <Select value={simulationType} onValueChange={setSimulationType}>
                    <SelectTrigger id="simulation-type" className="w-full bg-beam-dark-accent/50 border-gray-700 mt-1">
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent className="bg-beam-dark border-gray-700">
                      <SelectItem value="traffic">Traffic Growth</SelectItem>
                      <SelectItem value="failure">Failure Scenarios</SelectItem>
                      <SelectItem value="expansion">Network Expansion</SelectItem>
                      <SelectItem value="optimization">Capacity Optimization</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="forecast-period" className="text-sm text-gray-300">Forecast Period (months)</Label>
                  <Select value={forecastPeriod} onValueChange={setForecastPeriod}>
                    <SelectTrigger id="forecast-period" className="w-full bg-beam-dark-accent/50 border-gray-700 mt-1">
                      <SelectValue placeholder="Select Period" />
                    </SelectTrigger>
                    <SelectContent className="bg-beam-dark border-gray-700">
                      <SelectItem value="3">3 Months</SelectItem>
                      <SelectItem value="6">6 Months</SelectItem>
                      <SelectItem value="12">12 Months</SelectItem>
                      <SelectItem value="24">24 Months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="text-sm text-gray-300">Traffic Growth Rate (%)</Label>
                  <div className="flex items-center gap-4 mt-1">
                    <Slider
                      value={trafficGrowthRate}
                      onValueChange={setTrafficGrowthRate}
                      max={20}
                      step={1}
                      className="flex-1"
                    />
                    <span className="text-white min-w-[40px] text-center">{trafficGrowthRate[0]}%</span>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm text-gray-300">Capacity Constraint (%)</Label>
                  <div className="flex items-center gap-4 mt-1">
                    <Slider
                      value={capacityConstraint}
                      onValueChange={setCapacityConstraint}
                      max={100}
                      step={5}
                      className="flex-1"
                    />
                    <span className="text-white min-w-[40px] text-center">{capacityConstraint[0]}%</span>
                  </div>
                </div>
              </div>
            </Card>
            
            <Card className="p-4 bg-beam-dark-accent/50 border-gray-700 rounded-lg">
              <h3 className="text-lg font-medium text-white mb-4">Agent Selection</h3>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2 p-3 bg-beam-dark-accent/30 rounded-lg border border-gray-700/50 hover:border-ptt-red/50 cursor-pointer">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-ptt-red/20">
                    <Network size={16} className="text-ptt-blue" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white">Network Topology Agent</div>
                    <div className="text-xs text-gray-400">Analyzes network structure and connectivity</div>
                  </div>
                  <div className="h-4 w-4 rounded-full bg-green-500"></div>
                </div>
                
                <div className="flex items-center gap-2 p-3 bg-beam-dark-accent/30 rounded-lg border border-gray-700/50 hover:border-ptt-red/50 cursor-pointer">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-ptt-red/20">
                    <ChartLine size={16} className="text-ptt-blue" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white">Traffic Forecast Agent</div>
                    <div className="text-xs text-gray-400">Predicts traffic growth patterns</div>
                  </div>
                  <div className="h-4 w-4 rounded-full bg-green-500"></div>
                </div>
                
                <div className="flex items-center gap-2 p-3 bg-beam-dark-accent/30 rounded-lg border border-gray-700/50 hover:border-ptt-red/50 cursor-pointer">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-ptt-red/20">
                    <Layers3 size={16} className="text-ptt-blue" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white">Capacity Analysis Agent</div>
                    <div className="text-xs text-gray-400">Evaluates network capacity utilization</div>
                  </div>
                  <div className="h-4 w-4 rounded-full bg-green-500"></div>
                </div>
              </div>
            </Card>
            
            <Card className="p-4 bg-beam-dark-accent/50 border-gray-700 rounded-lg">
              <h3 className="text-lg font-medium text-white mb-4">Scenario Configuration</h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="scenario-name" className="text-sm text-gray-300">Scenario Name</Label>
                  <Input id="scenario-name" placeholder="Enter scenario name" className="bg-beam-dark-accent/30 border-gray-700 mt-1" />
                </div>
                
                <div>
                  <Label htmlFor="network-subset" className="text-sm text-gray-300">Network Subset</Label>
                  <Select defaultValue="all">
                    <SelectTrigger id="network-subset" className="w-full bg-beam-dark-accent/50 border-gray-700 mt-1">
                      <SelectValue placeholder="Select Network Subset" />
                    </SelectTrigger>
                    <SelectContent className="bg-beam-dark border-gray-700">
                      <SelectItem value="all">All Network</SelectItem>
                      <SelectItem value="core">Core Network</SelectItem>
                      <SelectItem value="metro">Metro Networks</SelectItem>
                      <SelectItem value="access">Access Network</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="pt-2">
                  <div className="flex items-center">
                    <input type="checkbox" id="save-scenario" className="mr-2" />
                    <Label htmlFor="save-scenario" className="text-sm text-gray-300">Save scenario for future reference</Label>
                  </div>
                </div>
                
                <div className="pt-2">
                  <div className="flex items-center">
                    <input type="checkbox" id="compare-historical" className="mr-2" />
                    <Label htmlFor="compare-historical" className="text-sm text-gray-300">Compare with historical data</Label>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        ) : (
          <SimulationResults 
            simulationType={simulationType}
            trafficGrowthRate={trafficGrowthRate[0]}
            capacityConstraint={capacityConstraint[0]}
            forecastPeriod={parseInt(forecastPeriod)}
          />
        )}
      </div>
    </div>
  );
};
