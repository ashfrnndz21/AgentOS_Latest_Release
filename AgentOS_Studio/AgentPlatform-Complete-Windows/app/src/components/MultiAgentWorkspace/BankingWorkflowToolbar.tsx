import React from 'react';
import { Play, Square, RotateCcw, Share2, Download, Upload, Shield, TrendingUp, FileCheck, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

interface BankingWorkflowToolbarProps {
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
  };
  onShowCompliance: () => void;
  onShowRiskAssessment: () => void;
}

export const BankingWorkflowToolbar: React.FC<BankingWorkflowToolbarProps> = ({
  isRunning,
  onRun,
  onStop,
  onExport,
  nodeCount,
  connectionCount,
  metrics,
  onShowCompliance,
  onShowRiskAssessment,
}) => {
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Low': return 'text-green-400 bg-green-900/30 border-green-600';
      case 'Medium': return 'text-yellow-400 bg-yellow-900/30 border-yellow-600';
      case 'High': return 'text-red-400 bg-red-900/30 border-red-600';
      default: return 'text-gray-400 bg-gray-900/30 border-gray-600';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="absolute top-1 left-1 z-10 bg-slate-800/40 backdrop-blur-sm border border-slate-600/30 rounded-lg p-1.5 shadow-lg min-w-[500px]">
      <div className="flex items-center justify-between">
        {/* Execution Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            {!isRunning ? (
              <Button 
                onClick={onRun} 
                size="sm" 
                className="h-7 px-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md text-xs"
                disabled={nodeCount === 0}
              >
                <Play className="h-3 w-3 mr-1" />
                Run
              </Button>
            ) : (
              <Button onClick={onStop} size="sm" className="h-7 px-2" variant="destructive">
                <Square className="h-3 w-3 mr-1" />
                Stop
              </Button>
            )}
            
            <Button size="sm" variant="outline" className="h-7 px-2 border-slate-600/30 text-slate-300 hover:bg-slate-700/50 bg-slate-800/40 shadow-sm text-xs">
              <RotateCcw className="h-3 w-3 mr-1" />
              Reset
            </Button>
          </div>

          <Separator orientation="vertical" className="h-5 bg-slate-600/30" />

          {/* Banking Controls */}
          <div className="flex items-center gap-1.5">
            <Button 
              onClick={onShowCompliance}
              size="sm" 
              variant="outline" 
              className="h-7 px-2 border-slate-600/30 text-slate-300 hover:bg-slate-700/50 bg-slate-800/40 shadow-sm text-xs"
            >
              <Shield className="h-3 w-3 mr-1" />
              Compliance
            </Button>
            
            <Button 
              onClick={onShowRiskAssessment}
              size="sm" 
              variant="outline" 
              className="h-7 px-2 border-slate-600/30 text-slate-300 hover:bg-slate-700/50 bg-slate-800/40 shadow-sm text-xs"
            >
              <TrendingUp className="h-3 w-3 mr-1" />
              Risk
            </Button>

            <Button 
              onClick={onExport}
              size="sm" 
              variant="outline" 
              className="h-7 px-2 border-slate-600/30 text-slate-300 hover:bg-slate-700/50 bg-slate-800/40 shadow-sm text-xs"
            >
              <Download className="h-3 w-3 mr-1" />
              Export
            </Button>
          </div>
        </div>

        {/* Banking Metrics */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-[10px]">
            <div className="flex items-center gap-1">
              <FileCheck className="h-2.5 w-2.5 text-emerald-400" />
              <span className="text-slate-300">Compliance:</span>
              <span className={getScoreColor(metrics.complianceScore)}>{metrics.complianceScore}%</span>
            </div>
            
            <div className="flex items-center gap-1">
              <TrendingUp className="h-2.5 w-2.5 text-amber-400" />
              <span className="text-slate-300">Risk:</span>
              <Badge className={`${getRiskColor(metrics.riskLevel)} text-[9px] px-1 py-0`}>
                {metrics.riskLevel}
              </Badge>
            </div>
            
            <div className="flex items-center gap-1">
              <BarChart3 className="h-2.5 w-2.5 text-cyan-400" />
              <span className="text-slate-300">Audit:</span>
              <span className={getScoreColor(metrics.auditReadiness)}>{metrics.auditReadiness}%</span>
            </div>
          </div>

          <Separator orientation="vertical" className="h-5 bg-slate-600/30" />

          {/* Workflow Stats */}
          <div className="flex items-center gap-2 text-[10px] text-slate-300">
            <span>{nodeCount} Agents</span>
            <span>{connectionCount} Connections</span>
            {isRunning && (
              <span className="flex items-center gap-1 text-emerald-400">
                <div className="w-1 h-1 bg-emerald-400 rounded-full animate-pulse" />
                Running
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};