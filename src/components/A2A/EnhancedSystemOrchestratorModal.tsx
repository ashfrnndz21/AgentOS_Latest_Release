import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Brain, RefreshCw, CheckCircle, Sparkles, XCircle, Clock, Users, Zap, Eye, BarChart3 } from 'lucide-react';
import { unifiedOrchestrationService, OrchestrationResponse } from '@/lib/services/UnifiedOrchestrationService';

interface SystemOrchestratorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SystemOrchestratorModal: React.FC<SystemOrchestratorModalProps> = ({
  open,
  onOpenChange
}) => {
  const [query, setQuery] = useState('');
  const [isOrchestrating, setIsOrchestrating] = useState(false);
  const [orchestrationResult, setOrchestrationResult] = useState<OrchestrationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'query' | 'analysis' | 'workflow' | 'status'>('query');

  const handleOrchestrationQuery = async () => {
    if (!query.trim()) return;

    setIsOrchestrating(true);
    setError(null);
    setOrchestrationResult(null);

    try {
      const result = await unifiedOrchestrationService.orchestrate({
        query: query.trim(),
        options: {
          enable_observability: true
        }
      });

      setOrchestrationResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Orchestration failed');
      console.error('Orchestration error:', err);
    } finally {
      setIsOrchestrating(false);
    }
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 1) return `${(seconds * 1000).toFixed(0)}ms`;
    return `${seconds.toFixed(2)}s`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Brain className="h-6 w-6 text-purple-400" />
            System Orchestrator - A2A Multi-Agent Query
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Query Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">
              Enter your query for multi-agent orchestration:
            </label>
            <Textarea
              placeholder="Enter your query (e.g., 'How does RAN affect churn and what are the PRB utilization thresholds?')"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="min-h-[100px] bg-gray-800 border-gray-600 text-white"
            />
          </div>

          {/* Execute Button */}
          <Button 
            onClick={handleOrchestrationQuery} 
            disabled={isOrchestrating || !query.trim()}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {isOrchestrating ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Orchestrating...
              </>
            ) : (
              <>
                <Brain className="mr-2 h-4 w-4" />
                Execute A2A Orchestration
              </>
            )}
          </Button>

          {/* Error Display */}
          {error && (
            <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
              <div className="flex items-center gap-2 text-red-400">
                <XCircle className="h-4 w-4" />
                <strong>Error:</strong> {error}
              </div>
            </div>
          )}

          {/* Tab Navigation */}
          {orchestrationResult && (
            <div className="border-t border-gray-700 pt-4">
              <div className="flex space-x-1 mb-4">
                <button
                  onClick={() => setActiveTab('query')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'query' 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <Brain className="h-4 w-4 inline mr-1" />
                  Query
                </button>
                <button
                  onClick={() => setActiveTab('analysis')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'analysis' 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <BarChart3 className="h-4 w-4 inline mr-1" />
                  Analysis
                </button>
                <button
                  onClick={() => setActiveTab('workflow')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'workflow' 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <Zap className="h-4 w-4 inline mr-1" />
                  Workflow
                </button>
                <button
                  onClick={() => setActiveTab('status')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'status' 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <Eye className="h-4 w-4 inline mr-1" />
                  Status
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === 'query' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-green-400 mb-4">
                    <CheckCircle className="h-5 w-5" />
                    <h3 className="text-lg font-semibold">Clean Response Output</h3>
                  </div>
                  
                  <div className="p-4 bg-gray-800 border border-gray-600 rounded-lg">
                    <pre className="whitespace-pre-wrap text-white text-sm leading-relaxed">
                      {orchestrationResult.response}
                    </pre>
                  </div>
                </div>
              )}

              {activeTab === 'analysis' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-blue-400 mb-4">
                    <BarChart3 className="h-5 w-5" />
                    <h3 className="text-lg font-semibold">6-Stage LLM Analysis</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-800 rounded-lg">
                      <div className="text-sm text-gray-400 mb-2">Domain</div>
                      <div className="text-white font-medium">
                        {orchestrationResult.workflow_summary.domain || 'telecommunications/network performance'}
                      </div>
                    </div>
                    <div className="p-4 bg-gray-800 rounded-lg">
                      <div className="text-sm text-gray-400 mb-2">Complexity</div>
                      <div className="text-white font-medium">
                        {orchestrationResult.workflow_summary.complexity || 'moderate'}
                      </div>
                    </div>
                    <div className="p-4 bg-gray-800 rounded-lg">
                      <div className="text-sm text-gray-400 mb-2">Strategy</div>
                      <div className="text-white font-medium">
                        {orchestrationResult.workflow_summary.execution_strategy}
                      </div>
                    </div>
                    <div className="p-4 bg-gray-800 rounded-lg">
                      <div className="text-sm text-gray-400 mb-2">Agents Selected</div>
                      <div className="text-white font-medium">
                        {orchestrationResult.workflow_summary.agents_used.length}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'workflow' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-purple-400 mb-4">
                    <Zap className="h-5 w-5" />
                    <h3 className="text-lg font-semibold">A2A Handoff Workflow</h3>
                  </div>
                  
                  <div className="space-y-3">
                    {orchestrationResult.workflow_summary.agents_used.map((agent, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                        <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="text-white font-medium">{agent}</div>
                          <div className="text-sm text-gray-400">
                            Handoff {index * 2 + 1}: Orchestrator → {agent}
                          </div>
                          <div className="text-sm text-gray-400">
                            Handoff {index * 2 + 2}: {agent} → Orchestrator
                          </div>
                        </div>
                        <div className="text-green-400">
                          <CheckCircle className="h-5 w-5" />
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
                    <div className="flex items-center gap-2 text-green-200">
                      <Sparkles className="h-4 w-4" />
                      <strong>Clean Output Applied:</strong> Frontend-style filtering enabled
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'status' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-cyan-400 mb-4">
                    <Eye className="h-5 w-5" />
                    <h3 className="text-lg font-semibold">Execution Status</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-gray-800 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {orchestrationResult.workflow_summary.agents_used.length}
                      </div>
                      <div className="text-sm text-gray-400">Agents Used</div>
                    </div>
                    <div className="text-center p-3 bg-gray-800 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {formatDuration(orchestrationResult.workflow_summary.processing_time)}
                      </div>
                      <div className="text-sm text-gray-400">Execution Time</div>
                    </div>
                    <div className="text-center p-3 bg-gray-800 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        {orchestrationResult.response.length}
                      </div>
                      <div className="text-sm text-gray-400">Response Length</div>
                    </div>
                    <div className="text-center p-3 bg-gray-800 rounded-lg">
                      <div className="text-2xl font-bold text-cyan-600">
                        {orchestrationResult.workflow_summary.stages_completed}/{orchestrationResult.workflow_summary.total_stages}
                      </div>
                      <div className="text-sm text-gray-400">Stages Completed</div>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-gray-800 rounded-lg">
                    <div className="text-sm text-gray-400 mb-2">Session ID</div>
                    <div className="font-mono text-xs text-gray-300">{orchestrationResult.session_id}</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
