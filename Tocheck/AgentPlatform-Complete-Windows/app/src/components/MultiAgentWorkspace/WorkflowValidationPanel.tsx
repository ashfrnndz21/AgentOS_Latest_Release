import React from 'react';
import { AlertCircle, CheckCircle, Clock, TrendingUp, Database, GitBranch } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface WorkflowValidationPanelProps {
  metrics: {
    complianceScore: number;
    riskLevel: string;
    auditReadiness: number;
    performanceScore: number;
    validationErrors: string[];
  };
  nodeCount: number;
  connectionCount: number;
  onClose: () => void;
}

export const WorkflowValidationPanel: React.FC<WorkflowValidationPanelProps> = ({
  metrics,
  nodeCount,
  connectionCount,
  onClose,
}) => {
  const hasErrors = metrics.validationErrors.length > 0;
  const overallScore = Math.round((metrics.complianceScore + metrics.auditReadiness + metrics.performanceScore) / 3);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getRiskColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'low': return 'text-green-400 bg-green-400/20';
      case 'medium': return 'text-yellow-400 bg-yellow-400/20';
      case 'high': return 'text-red-400 bg-red-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <Card className="bg-beam-dark-accent border-gray-700 p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white font-sans">Workflow Validation</h2>
            <p className="text-sm text-gray-400 font-sans">Multi-Agent Orchestration Analysis</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </Button>
        </div>

        {/* Overall Status */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            {hasErrors ? (
              <>
                <AlertCircle className="h-6 w-6 text-red-400" />
                <span className="text-lg font-semibold text-red-400 font-sans">Validation Failed</span>
              </>
            ) : (
              <>
                <CheckCircle className="h-6 w-6 text-green-400" />
                <span className="text-lg font-semibold text-green-400 font-sans">Workflow Valid</span>
              </>
            )}
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-beam-dark rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Database className="h-4 w-4 text-beam-blue" />
                <span className="text-xs text-gray-400 font-sans">Nodes</span>
              </div>
              <span className="text-lg font-bold text-white font-mono">{nodeCount}</span>
            </div>
            
            <div className="bg-beam-dark rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <GitBranch className="h-4 w-4 text-beam-blue" />
                <span className="text-xs text-gray-400 font-sans">Connections</span>
              </div>
              <span className="text-lg font-bold text-white font-mono">{connectionCount}</span>
            </div>
            
            <div className="bg-beam-dark rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-beam-blue" />
                <span className="text-xs text-gray-400 font-sans">Score</span>
              </div>
              <span className={`text-lg font-bold font-mono ${getScoreColor(overallScore)}`}>
                {overallScore}%
              </span>
            </div>
          </div>
        </div>

        {/* Validation Errors */}
        {hasErrors && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-red-400 mb-3 font-sans">Validation Errors</h3>
            <div className="space-y-2">
              {metrics.validationErrors.map((error, index) => (
                <div key={index} className="bg-red-900/30 border border-red-600 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-red-200 font-sans">{error}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Metrics */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white font-sans">Workflow Metrics</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-beam-dark rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-300 font-sans">Compliance Score</span>
                <span className={`text-lg font-bold font-mono ${getScoreColor(metrics.complianceScore)}`}>
                  {metrics.complianceScore}%
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    metrics.complianceScore >= 90 ? 'bg-green-400' :
                    metrics.complianceScore >= 70 ? 'bg-yellow-400' : 'bg-red-400'
                  }`}
                  style={{ width: `${metrics.complianceScore}%` }}
                />
              </div>
            </div>

            <div className="bg-beam-dark rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-300 font-sans">Risk Level</span>
                <Badge className={`${getRiskColor(metrics.riskLevel)} border-0 font-mono`}>
                  {metrics.riskLevel}
                </Badge>
              </div>
              <div className="text-xs text-gray-400 font-sans">
                Based on workflow complexity and validation
              </div>
            </div>

            <div className="bg-beam-dark rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-300 font-sans">Audit Readiness</span>
                <span className={`text-lg font-bold font-mono ${getScoreColor(metrics.auditReadiness)}`}>
                  {metrics.auditReadiness}%
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    metrics.auditReadiness >= 90 ? 'bg-green-400' :
                    metrics.auditReadiness >= 70 ? 'bg-yellow-400' : 'bg-red-400'
                  }`}
                  style={{ width: `${metrics.auditReadiness}%` }}
                />
              </div>
            </div>

            <div className="bg-beam-dark rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-300 font-sans">Performance Score</span>
                <span className={`text-lg font-bold font-mono ${getScoreColor(metrics.performanceScore)}`}>
                  {metrics.performanceScore}%
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    metrics.performanceScore >= 90 ? 'bg-green-400' :
                    metrics.performanceScore >= 70 ? 'bg-yellow-400' : 'bg-red-400'
                  }`}
                  style={{ width: `${metrics.performanceScore}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Orchestration Patterns Detected */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-white mb-3 font-sans">Orchestration Patterns</h3>
          <div className="grid grid-cols-2 gap-2">
            <Badge variant="outline" className="justify-center p-2 font-sans">
              <Database className="h-3 w-3 mr-1" />
              Data Flow
            </Badge>
            <Badge variant="outline" className="justify-center p-2 font-sans">
              <GitBranch className="h-3 w-3 mr-1" />
              Control Flow
            </Badge>
            <Badge variant="outline" className="justify-center p-2 font-sans">
              <Clock className="h-3 w-3 mr-1" />
              Sequential
            </Badge>
            <Badge variant="outline" className="justify-center p-2 font-sans">
              <TrendingUp className="h-3 w-3 mr-1" />
              Conditional
            </Badge>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-gray-600 text-gray-300 hover:bg-beam-dark font-sans"
          >
            Close
          </Button>
          {!hasErrors && (
            <Button
              className="bg-beam-blue hover:bg-beam-blue/90 font-sans"
              onClick={onClose}
            >
              Ready to Execute
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};