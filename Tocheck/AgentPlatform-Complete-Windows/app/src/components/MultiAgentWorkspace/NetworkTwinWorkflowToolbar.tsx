import React from 'react';
import { Play, Square, Download, Radio, Activity, Shield, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface NetworkTwinWorkflowToolbarProps {
  isRunning: boolean;
  onRun: () => void;
  onStop: () => void;
  onExport: () => void;
  nodeCount: number;
  connectionCount: number;
  metrics: {
    networkHealth: number;
    coverageLevel: string;
    performanceScore: number;
    faultCount: number;
    energySavings: string;
    sitesMonitored: number;
    maintenanceScheduled: number;
  };
  onShowCompliance: () => void;
  onShowRiskAssessment: () => void;
}

export const NetworkTwinWorkflowToolbar = ({ 
  isRunning, 
  onRun, 
  onStop, 
  onExport,
  nodeCount,
  connectionCount,
  metrics,
  onShowCompliance,
  onShowRiskAssessment
}: NetworkTwinWorkflowToolbarProps) => {
  return (
    <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap gap-4">
      {/* Workflow Controls */}
      <Card className="bg-slate-800/40 backdrop-blur-lg border-blue-400/20 p-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Radio className="h-4 w-4 text-blue-400" />
            <span className="text-sm font-medium text-white">Network Twin Workflow</span>
          </div>
          
          <div className="h-4 w-px bg-blue-400/20" />
          
          <div className="flex items-center gap-2">
            {!isRunning ? (
              <Button 
                onClick={onRun} 
                size="sm" 
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Play className="h-3 w-3 mr-1" />
                Run
              </Button>
            ) : (
              <Button 
                onClick={onStop} 
                size="sm" 
                variant="destructive"
              >
                <Square className="h-3 w-3 mr-1" />
                Stop
              </Button>
            )}
            
            <Button 
              onClick={onExport} 
              size="sm" 
              variant="outline"
              className="border-slate-600 text-slate-300 hover:text-white"
            >
              <Download className="h-3 w-3 mr-1" />
              Export
            </Button>
          </div>

          <div className="h-4 w-px bg-blue-400/20" />

          <div className="text-xs text-slate-400">
            {nodeCount} agents • {connectionCount} connections
          </div>
        </div>
      </Card>

      {/* Network Health Metrics */}
      <Card className="bg-slate-800/40 backdrop-blur-lg border-blue-400/20 p-3 flex-1 min-w-0">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-green-400" />
              <div>
                <div className="text-xs text-slate-400">Network Health</div>
                <div className="text-sm font-semibold text-green-400">{metrics.networkHealth}%</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Radio className="h-4 w-4 text-blue-400" />
              <div>
                <div className="text-xs text-slate-400">Coverage</div>
                <div className="text-sm font-semibold text-blue-400">{metrics.coverageLevel}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-400" />
              <div>
                <div className="text-xs text-slate-400">Active Faults</div>
                <div className="text-sm font-semibold text-yellow-400">{metrics.faultCount}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-purple-400" />
              <div>
                <div className="text-xs text-slate-400">Energy Savings</div>
                <div className="text-sm font-semibold text-purple-400">{metrics.energySavings}</div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge 
              className={`${
                isRunning 
                  ? 'bg-green-900/20 text-green-300 border-green-700/30' 
                  : 'bg-slate-900/20 text-slate-300 border-slate-700/30'
              }`}
            >
              {isRunning ? 'Running' : 'Idle'}
            </Badge>
            
            <Button 
              onClick={onShowCompliance}
              size="sm" 
              variant="outline"
              className="border-slate-600 text-slate-300 hover:text-white text-xs"
            >
              Compliance
            </Button>
            
            <Button 
              onClick={onShowRiskAssessment}
              size="sm" 
              variant="outline"
              className="border-slate-600 text-slate-300 hover:text-white text-xs"
            >
              Risk Assessment
            </Button>
          </div>
        </div>
      </Card>

      {/* Quick Stats */}
      <Card className="bg-slate-800/40 backdrop-blur-lg border-blue-400/20 p-3">
        <div className="flex items-center gap-4 text-xs">
          <div className="text-slate-400">
            Sites: <span className="text-white font-semibold">{metrics.sitesMonitored}</span>
          </div>
          <div className="text-slate-400">
            Performance: <span className="text-cyan-400 font-semibold">{metrics.performanceScore}%</span>
          </div>
          <div className="text-slate-400">
            Maintenance: <span className="text-amber-400 font-semibold">{metrics.maintenanceScheduled}</span>
          </div>
        </div>
      </Card>
    </div>
  );
};