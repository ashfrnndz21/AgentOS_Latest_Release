import React from 'react';
import { Play, Square, Download, Shield, AlertTriangle, DollarSign, TrendingUp, BarChart3, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface IndustrialForecastingWorkflowToolbarProps {
  isRunning: boolean;
  onRun: () => void;
  onStop: () => void;
  onExport: () => void;
  nodeCount: number;
  connectionCount: number;
  metrics: {
    complianceScore: number;
    riskLevel: string;
    auditReadiness: number;
    performanceScore: number;
    revenueImpact: string;
    customersAnalyzed: number;
    campaignsOptimized: number;
  };
  onShowCompliance: () => void;
  onShowRiskAssessment: () => void;
}

export const IndustrialForecastingWorkflowToolbar: React.FC<IndustrialForecastingWorkflowToolbarProps> = ({
  isRunning,
  onRun,
  onStop,
  onExport,
  nodeCount,
  connectionCount,
  metrics,
  onShowCompliance,
  onShowRiskAssessment
}) => {
  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel.toLowerCase()) {
      case 'low': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'high': return 'text-red-400 bg-red-500/20 border-red-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  return (
    <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between bg-slate-800/90 backdrop-blur-lg border border-yellow-400/20 rounded-xl px-3 py-2 shadow-lg">
      {/* Left Section - Title & Status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-yellow-400" />
          <div>
            <h2 className="text-sm font-semibold text-white">Financial Forecasting</h2>
            <p className="text-xs text-gray-400">Scenario Analysis & Risk Modeling</p>
          </div>
        </div>
        
        <div className="h-8 w-px bg-gray-600" />
        
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
            <span className="text-gray-300">{isRunning ? 'Forecasting' : 'Ready'}</span>
          </div>
          <span className="text-gray-400">Agents: <span className="text-white font-medium">{nodeCount}</span></span>
          <span className="text-gray-400">Models: <span className="text-white font-medium">{connectionCount}</span></span>
        </div>
      </div>

      {/* Center Section - Key Metrics */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <TrendingUp className="h-3 w-3 text-green-400" />
          <span className="text-xs text-gray-400">Accuracy:</span>
          <span className="text-xs font-semibold text-green-400">94.2%</span>
        </div>
        
        <div className="flex items-center gap-1">
          <BarChart3 className="h-3 w-3 text-blue-400" />
          <span className="text-xs text-gray-400">Scenarios:</span>
          <span className="text-xs font-semibold text-blue-400">12</span>
        </div>
        
        <div className="flex items-center gap-1">
          <AlertTriangle className="h-3 w-3 text-yellow-400" />
          <span className="text-xs text-gray-400">Risk:</span>
          <Badge className={`text-xs border px-1 py-0 ${getRiskColor(metrics.riskLevel)}`}>
            {metrics.riskLevel}
          </Badge>
        </div>
        
        <div className="flex items-center gap-1">
          <Target className="h-3 w-3 text-purple-400" />
          <span className="text-xs text-gray-400">Confidence:</span>
          <span className="text-xs font-semibold text-purple-400">89.7%</span>
        </div>
        
        <div className="flex items-center gap-1">
          <DollarSign className="h-3 w-3 text-emerald-400" />
          <span className="text-xs text-gray-400">Impact:</span>
          <span className="text-xs font-semibold text-emerald-400">{metrics.revenueImpact}</span>
        </div>
      </div>

      {/* Right Section - Actions */}
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={onShowCompliance}
          className="h-7 px-2 text-xs border-green-400/30 text-green-300 hover:bg-green-500/10"
        >
          <Shield className="h-3 w-3 mr-1" />
          Compliance
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onShowRiskAssessment}
          className="h-7 px-2 text-xs border-yellow-400/30 text-yellow-300 hover:bg-yellow-500/10"
        >
          <AlertTriangle className="h-3 w-3 mr-1" />
          Risk
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onExport}
          className="h-7 px-2 text-xs border-gray-400/30 text-gray-300 hover:bg-gray-500/10"
        >
          <Download className="h-3 w-3" />
        </Button>
        
        <div className="h-5 w-px bg-gray-600 mx-1" />
        
        {isRunning ? (
          <Button
            variant="outline"
            size="sm"
            onClick={onStop}
            className="h-7 px-3 text-xs border-red-400/30 text-red-300 hover:bg-red-500/10"
          >
            <Square className="h-3 w-3 mr-1" />
            Stop
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={onRun}
            className="h-7 px-3 text-xs bg-yellow-500 hover:bg-yellow-600 text-white"
          >
            <Play className="h-3 w-3 mr-1" />
            Run Forecast
          </Button>
        )}
      </div>
    </div>
  );
};