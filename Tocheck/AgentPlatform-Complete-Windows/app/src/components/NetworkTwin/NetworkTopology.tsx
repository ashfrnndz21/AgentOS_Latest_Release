
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChartBar, Radio, MapPin, Signal, Map, BarChart3 } from 'lucide-react';
import { NetworkGraph } from './NetworkGraph';
import { GeospatialMap } from './GeospatialMap';

export const NetworkTopology = () => {
  const [selectedView, setSelectedView] = useState('physical');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedModel, setSelectedModel] = useState('churn');
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  
  return (
    <div className="glass-panel backdrop-blur-md bg-beam-dark-accent/30 border border-gray-700/50 rounded-xl p-6 shadow-lg">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-xl font-bold text-white">Network Cell Site Visualization</h2>
          
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Label htmlFor="view-type" className="text-sm text-gray-300">View Type:</Label>
              <Select value={selectedView} onValueChange={setSelectedView}>
                <SelectTrigger id="view-type" className="w-[180px] bg-beam-dark-accent/50 border-gray-700">
                  <SelectValue placeholder="Select View" />
                </SelectTrigger>
                <SelectContent className="bg-beam-dark border-gray-700">
                  <SelectItem value="physical">Physical Network</SelectItem>
                  <SelectItem value="district">By District</SelectItem>
                  <SelectItem value="state">By State</SelectItem>
                  <SelectItem value="capacity">Capacity Heat Map</SelectItem>
                  <SelectItem value="geospatial">Jakarta Map</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <Label htmlFor="model" className="text-sm text-gray-300">Model:</Label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger id="model" className="w-[180px] bg-beam-dark-accent/50 border-gray-700">
                  <SelectValue placeholder="Select Model" />
                </SelectTrigger>
                <SelectContent className="bg-beam-dark border-gray-700">
                  <SelectItem value="churn">Churn Model</SelectItem>
                  <SelectItem value="propensity">Propensity Model</SelectItem>
                  <SelectItem value="arpu">ARPU Model</SelectItem>
                  <SelectItem value="apra">APRA Model</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {selectedView === 'district' && (
              <div className="flex items-center gap-2">
                <Label htmlFor="district" className="text-sm text-gray-300">District:</Label>
                <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                  <SelectTrigger id="district" className="w-[180px] bg-beam-dark-accent/50 border-gray-700">
                    <SelectValue placeholder="Select District" />
                  </SelectTrigger>
                  <SelectContent className="bg-beam-dark border-gray-700">
                    <SelectItem value="all">All Districts</SelectItem>
                    <SelectItem value="central">Central District</SelectItem>
                    <SelectItem value="north">Northern District</SelectItem>
                    <SelectItem value="south">Southern District</SelectItem>
                    <SelectItem value="east">Eastern District</SelectItem>
                    <SelectItem value="west">Western District</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {selectedView === 'state' && (
              <div className="flex items-center gap-2">
                <Label htmlFor="region" className="text-sm text-gray-300">State:</Label>
                <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                  <SelectTrigger id="region" className="w-[180px] bg-beam-dark-accent/50 border-gray-700">
                    <SelectValue placeholder="Select State" />
                  </SelectTrigger>
                  <SelectContent className="bg-beam-dark border-gray-700">
                    <SelectItem value="all">All States</SelectItem>
                    <SelectItem value="north">Northern State</SelectItem>
                    <SelectItem value="central">Central State</SelectItem>
                    <SelectItem value="east">Eastern State</SelectItem>
                    <SelectItem value="west">Western State</SelectItem>
                    <SelectItem value="south">Southern State</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 bg-beam-dark-accent/50 border-gray-700 rounded-lg col-span-1">
            <h3 className="text-lg font-medium text-white mb-4">Cell Site Types</h3>
            <div className="space-y-3">
              <Button variant="ghost" className="w-full justify-start hover:bg-ptt-red/10">
                <Radio className="mr-2 h-4 w-4 text-ptt-blue" />
                <span>Macro Cell Sites (256)</span>
              </Button>
              <Button variant="ghost" className="w-full justify-start hover:bg-ptt-red/10">
                <Signal className="mr-2 h-4 w-4 text-ptt-blue" />
                <span>Micro Cell Sites (142)</span>
              </Button>
              <Button variant="ghost" className="w-full justify-start hover:bg-ptt-red/10">
                <MapPin className="mr-2 h-4 w-4 text-ptt-blue" />
                <span>Small Cells (72)</span>
              </Button>
              {selectedView === 'geospatial' && (
                <>
                  <Button variant="ghost" className="w-full justify-start hover:bg-ptt-red/10">
                    <Map className="mr-2 h-4 w-4 text-ptt-blue" />
                    <span>Jakarta Map</span>
                  </Button>
                  <Button variant="ghost" className="w-full justify-start hover:bg-ptt-red/10">
                    <BarChart3 className="mr-2 h-4 w-4 text-ptt-blue" />
                    <span>Congestion Heatmap</span>
                  </Button>
                </>
              )}
              <Button variant="ghost" className="w-full justify-start hover:bg-ptt-red/10">
                <ChartBar className="mr-2 h-4 w-4 text-ptt-blue" />
                <span>Performance Statistics</span>
              </Button>
            </div>
          </Card>
          
          <Card className="p-4 bg-beam-dark-accent/50 border-gray-700 rounded-lg col-span-3 min-h-[500px] flex items-center justify-center relative">
            {selectedView === 'geospatial' ? (
              <GeospatialMap 
                model={selectedModel}
                viewType={selectedView}
              />
            ) : (
              <NetworkGraph 
                viewType={selectedView} 
                region={selectedRegion} 
                model={selectedModel}
                district={selectedDistrict}
              />
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
