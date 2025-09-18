import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { NetworkGraph } from '../NetworkGraph';
import { GeospatialMap } from '../GeospatialMap';
import { cellSites, getSitesByRegion, getSitesByDistrict } from '../data/networkTwinData';
import { 
  MapPin, 
  Network, 
  BarChart3, 
  Layers, 
  Eye,
  Activity,
  AlertTriangle,
  CheckCircle,
  TrendingUp
} from 'lucide-react';

interface InteractiveNetworkTopologyProps {
  cellSites: any[];
  onSiteClick?: (siteId: string, siteData: any) => void;
  onAnalysisClick?: (analysisType: string, data: any) => void;
}

export const InteractiveNetworkTopology: React.FC<InteractiveNetworkTopologyProps> = ({
  cellSites,
  onSiteClick,
  onAnalysisClick
}) => {
  const [selectedView, setSelectedView] = useState('physical');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedModel, setSelectedModel] = useState('churn');
  const [selectedDistrict, setSelectedDistrict] = useState('all');

  const filteredSites = cellSites.filter(site => {
    if (selectedDistrict !== 'all') return site.district === selectedDistrict;
    if (selectedRegion !== 'all') return site.region === selectedRegion;
    return true;
  });

  const getModelDisplayName = (model: string) => {
    const modelNames = {
      'churn': 'Customer Churn Risk',
      'propensity': 'Service Propensity',
      'arpu': 'Revenue (ARPU)',
      'apra': 'Usage Pattern Analysis'
    };
    return modelNames[model as keyof typeof modelNames] || model;
  };

  const getSiteTypeStats = () => {
    const stats = filteredSites.reduce((acc, site) => {
      acc[site.type] = (acc[site.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      macro: stats.macro || 0,
      micro: stats.micro || 0,
      small: stats.small || 0,
      femto: stats.femto || 0,
      total: filteredSites.length
    };
  };

  const getStatusStats = () => {
    const stats = filteredSites.reduce((acc, site) => {
      acc[site.status] = (acc[site.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      active: stats.active || 0,
      inactive: stats.inactive || 0,
      maintenance: stats.maintenance || 0
    };
  };

  const getCongestionStats = () => {
    const highCongestion = filteredSites.filter(site => site.congestion > 0.8).length;
    const mediumCongestion = filteredSites.filter(site => site.congestion > 0.5 && site.congestion <= 0.8).length;
    const lowCongestion = filteredSites.filter(site => site.congestion <= 0.5).length;
    
    return { high: highCongestion, medium: mediumCongestion, low: lowCongestion };
  };

  const handleSiteCardClick = (site: any) => {
    onSiteClick?.(site.id, site);
  };

  const handleQuickAnalysis = (type: string) => {
    const data = {
      sites: filteredSites,
      region: selectedRegion,
      district: selectedDistrict,
      model: selectedModel
    };
    onAnalysisClick?.(type, data);
  };

  const siteTypeStats = getSiteTypeStats();
  const statusStats = getStatusStats();
  const congestionStats = getCongestionStats();

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card className="p-4 bg-beam-dark-accent/50 border-gray-700 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-sm text-gray-300 mb-2 block">View Type</label>
            <Select value={selectedView} onValueChange={setSelectedView}>
              <SelectTrigger className="bg-beam-dark-accent/50 border-gray-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-beam-dark border-gray-700">
                <SelectItem value="physical">Physical Network</SelectItem>
                <SelectItem value="district">District View</SelectItem>
                <SelectItem value="state">State View</SelectItem>
                <SelectItem value="capacity">Capacity Heatmap</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm text-gray-300 mb-2 block">Business Model</label>
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="bg-beam-dark-accent/50 border-gray-700">
                <SelectValue />
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
            <div>
              <label className="text-sm text-gray-300 mb-2 block">District</label>
              <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                <SelectTrigger className="bg-beam-dark-accent/50 border-gray-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-beam-dark border-gray-700">
                  <SelectItem value="all">All Districts</SelectItem>
                  <SelectItem value="Central Jakarta">Central Jakarta</SelectItem>
                  <SelectItem value="South Jakarta">South Jakarta</SelectItem>
                  <SelectItem value="North Jakarta">North Jakarta</SelectItem>
                  <SelectItem value="East Jakarta">East Jakarta</SelectItem>
                  <SelectItem value="West Jakarta">West Jakarta</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {selectedView === 'state' && (
            <div>
              <label className="text-sm text-gray-300 mb-2 block">State</label>
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger className="bg-beam-dark-accent/50 border-gray-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-beam-dark border-gray-700">
                  <SelectItem value="all">All Regions</SelectItem>
                  <SelectItem value="Jakarta">Jakarta</SelectItem>
                  <SelectItem value="West Java">West Java</SelectItem>
                  <SelectItem value="Central Java">Central Java</SelectItem>
                  <SelectItem value="East Java">East Java</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex items-end">
            <Button 
              onClick={() => handleQuickAnalysis('network-performance')}
              className="w-full bg-ptt-blue hover:bg-blue-700"
            >
              <Eye className="mr-2 h-4 w-4" />
              Analyze View
            </Button>
          </div>
        </div>
      </Card>

      {/* Statistics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-beam-dark-accent/50 border-gray-700 cursor-pointer hover:border-ptt-blue/50 transition-colors"
              onClick={() => handleQuickAnalysis('site-types')}>
          <div className="flex items-center gap-3">
            <Network className="h-8 w-8 text-ptt-blue" />
            <div>
              <div className="text-sm text-gray-400">Total Sites</div>
              <div className="text-2xl font-bold text-white">{siteTypeStats.total}</div>
              <div className="text-xs text-gray-500">
                {siteTypeStats.macro} Macro • {siteTypeStats.micro} Micro • {siteTypeStats.small} Small
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-beam-dark-accent/50 border-gray-700 cursor-pointer hover:border-green-500/50 transition-colors"
              onClick={() => handleQuickAnalysis('site-status')}>
          <div className="flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <div>
              <div className="text-sm text-gray-400">Active Sites</div>
              <div className="text-2xl font-bold text-white">{statusStats.active}</div>
              <div className="text-xs text-gray-500">
                {statusStats.maintenance} in maintenance
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-beam-dark-accent/50 border-gray-700 cursor-pointer hover:border-yellow-500/50 transition-colors"
              onClick={() => handleQuickAnalysis('congestion-analysis')}>
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-yellow-500" />
            <div>
              <div className="text-sm text-gray-400">High Congestion</div>
              <div className="text-2xl font-bold text-white">{congestionStats.high}</div>
              <div className="text-xs text-gray-500">
                {congestionStats.medium} medium risk
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-beam-dark-accent/50 border-gray-700 cursor-pointer hover:border-ptt-blue/50 transition-colors"
              onClick={() => handleQuickAnalysis('revenue-analysis')}>
          <div className="flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-ptt-blue" />
            <div>
              <div className="text-sm text-gray-400">Avg Performance</div>
              <div className="text-2xl font-bold text-white">
                {Math.round(filteredSites.reduce((acc, site) => acc + site.performanceScore, 0) / filteredSites.length)}%
              </div>
              <div className="text-xs text-gray-500">
                {getModelDisplayName(selectedModel)}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Cell Site Cards for quick access */}
      <Card className="p-4 bg-beam-dark-accent/50 border-gray-700 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-white">Quick Site Access</h3>
          <Badge variant="outline" className="text-xs">
            {filteredSites.length} sites in view
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-48 overflow-y-auto">
          {filteredSites.slice(0, 6).map((site) => (
            <div 
              key={site.id}
              onClick={() => handleSiteCardClick(site)}
              className="bg-beam-dark-accent/30 p-3 rounded-lg border border-gray-700/50 hover:border-ptt-blue/50 cursor-pointer transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-white">{site.id}</div>
                <Badge className={`text-xs ${
                  site.status === 'active' ? 'bg-green-500/20 text-green-400' :
                  site.status === 'maintenance' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {site.status}
                </Badge>
              </div>
              <div className="text-xs text-gray-400 mb-1">{site.name}</div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">{site.type.toUpperCase()}</span>
                <span className={`font-medium ${
                  site.congestion > 0.8 ? 'text-red-400' :
                  site.congestion > 0.5 ? 'text-yellow-400' :
                  'text-green-400'
                }`}>
                  {Math.round(site.congestion * 100)}%
                </span>
              </div>
            </div>
          ))}
        </div>
        
        {filteredSites.length > 6 && (
          <div className="mt-3 text-center">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleQuickAnalysis('all-sites')}
              className="border-gray-600 text-white hover:bg-gray-700"
            >
              View All {filteredSites.length} Sites
            </Button>
          </div>
        )}
      </Card>

      {/* Visualization */}
      <Card className="p-6 bg-beam-dark-accent/50 border-gray-700 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-white">Network Visualization</h3>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {getModelDisplayName(selectedModel)}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {selectedView === 'physical' ? 'Physical View' : 
               selectedView === 'district' ? `District: ${selectedDistrict}` :
               selectedView === 'state' ? `State: ${selectedRegion}` :
               'Capacity Heatmap'}
            </Badge>
          </div>
        </div>
        
        <div className="h-[500px]">
          {selectedView === 'capacity' ? (
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
        </div>
      </Card>
    </div>
  );
};