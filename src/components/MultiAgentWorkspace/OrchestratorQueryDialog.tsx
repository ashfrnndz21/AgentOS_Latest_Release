import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Brain, Send, CheckCircle, AlertCircle, Loader2, Network, Clock, Target } from 'lucide-react';
import { Node } from 'reactflow';

interface OrchestratorQueryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orchestratorNode: Node | null;
  connectedAgents: Node[];
  onExecute: (query: string) => Promise<any>;
}

export const OrchestratorQueryDialog: React.FC<OrchestratorQueryDialogProps> = ({
  open,
  onOpenChange,
  orchestratorNode,
  connectedAgents,
  onExecute
}) => {
  const [query, setQuery] = useState('');
  const [executing, setExecuting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleExecute = async () => {
    if (!query.trim()) return;
    
    setExecuting(true);
    setError(null);
    setResult(null);

    try {
      console.log('🚀 Executing query:', query);
      const response = await onExecute(query);
      console.log('✅ Got response:', response);
      setResult(response);
      
      // Clear query after successful execution
      setTimeout(() => {
        setQuery('');
      }, 1000);
    } catch (err) {
      console.error('❌ Query execution failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to execute query';
      setError(`Execution failed: ${errorMessage}`);
    } finally {
      setExecuting(false);
    }
  };

  const handleClose = () => {
    setQuery('');
    setResult(null);
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-gray-900 border-purple-500/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Brain className="h-6 w-6 text-purple-400" />
            Main System Orchestrator
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Query the orchestrator to route tasks to connected agents via A2A communication
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Status Info - Dynamic from backend */}
          <div className="p-3 bg-purple-900/20 border border-purple-500/30 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-300">Orchestrator</span>
              <Badge variant="outline" className="text-xs border-green-500/30 text-green-400">
                <CheckCircle className="h-3 w-3 mr-1" />
                Ready
              </Badge>
            </div>
            <div className="text-xs text-gray-400">
              Connected to Chat Orchestrator API on port 5005
            </div>
          </div>

          {/* Connected Agents */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Network className="h-4 w-4 text-blue-400" />
              <span className="text-sm font-medium text-gray-300">
                Connected Agents ({connectedAgents.length})
              </span>
            </div>
            
            {connectedAgents.length === 0 ? (
              <div className="p-3 bg-yellow-900/20 border border-yellow-500/30 rounded text-sm text-yellow-300">
                <AlertCircle className="h-4 w-4 inline mr-2" />
                No agents connected. Connect agents to the orchestrator to route queries.
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {connectedAgents.map(agent => (
                  <Badge 
                    key={agent.id} 
                    variant="outline" 
                    className="text-xs border-green-500/30 text-green-400 px-2 py-1"
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {agent.data.name}
                    {agent.data.dedicatedBackend && (
                      <span className="ml-1 text-gray-500">• Port {agent.data.dedicatedBackend.port}</span>
                    )}
                  </Badge>
                ))}
              </div>
            )}
            
            {connectedAgents.length > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                Your query will be analyzed and routed to the most appropriate agent based on capabilities
              </p>
            )}
          </div>

          {/* Query Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Enter Your Query</label>
            <Textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="E.g., Analyze the customer database, Calculate the fraud risk score, Review compliance requirements..."
              className="min-h-[120px] bg-gray-800 border-gray-600 text-white placeholder-gray-500"
              disabled={executing || connectedAgents.length === 0}
            />
          </div>

          {/* Execute Button */}
          <Button
            onClick={handleExecute}
            disabled={executing || !query.trim() || connectedAgents.length === 0}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          >
            {executing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Executing via A2A...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Execute Query
              </>
            )}
          </Button>

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-red-900/20 border border-red-500/30 rounded text-sm text-red-300">
              <AlertCircle className="h-4 w-4 inline mr-2" />
              {error}
            </div>
          )}

          {/* Results Display */}
          {result && (
            <div className="space-y-4 mt-4">
              {/* Header: Execution Complete */}
              <div className="p-4 bg-gray-800/50 border border-green-500/30 rounded-lg">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-white flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  Execution Complete
                </h4>
                <Badge variant="outline" className="text-xs border-green-500/30 text-green-400">
                  <Clock className="h-3 w-3 mr-1" />
                    {result.execution_insights?.total_execution_time 
                      ? `${result.execution_insights.total_execution_time.toFixed(2)}s` 
                      : result.execution_time 
                        ? `${result.execution_time.toFixed(2)}s` 
                        : 'N/A'}
                </Badge>
                </div>
              </div>

              {/* 1. Query Analysis & Intelligence Summary (Consolidated) */}
              {(result.analysis || result.intelligent_summary) && (
                <div className="p-4 bg-gray-800/50 border border-blue-500/30 rounded-lg">
                  <h5 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                    <Brain className="h-4 w-4 text-blue-400" />
                    Query Analysis
                  </h5>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-gray-400">Type:</span>
                      <Badge variant="outline" className="ml-2 text-xs border-blue-500/30 text-blue-400">
                        {result.analysis?.query_type || result.intelligent_summary?.query_type || result.type || 'unknown'}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-gray-400">Pattern:</span>
                      <Badge variant="outline" className="ml-2 text-xs border-purple-500/30 text-purple-400">
                        {result.analysis?.agentic_workflow_pattern || result.intelligent_summary?.pattern || 'unknown'}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-gray-400">Strategy:</span>
                      <Badge variant="outline" className="ml-2 text-xs border-purple-500/30 text-purple-400">
                        {result.analysis?.orchestration_strategy || result.execution_insights?.strategy_used || 'sequential'}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-gray-400">Complexity:</span>
                      <Badge variant="outline" className="ml-2 text-xs border-orange-500/30 text-orange-400">
                        {result.analysis?.complexity_level || result.intelligent_summary?.complexity || 'simple'}
                  </Badge>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. Agent Selection */}
              {(result.agent_selection || result.selected_agents) && (
                <div className="p-4 bg-gray-800/50 border border-orange-500/30 rounded-lg">
                  <h5 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                    <Target className="h-4 w-4 text-orange-400" />
                    Agent Selection
                  </h5>
                  
                  {/* Agents Used */}
                  {(result.agent_selection?.selected_agents || result.selected_agents) && (
                    <div className="mb-3">
                      <span className="text-gray-400 text-xs">
                        Agents Used ({(result.agent_selection?.selected_agents || result.selected_agents).length}):
                      </span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {(result.agent_selection?.selected_agents || result.selected_agents).map((agent: any, idx: number) => (
                          <Badge key={idx} variant="secondary" className="text-white bg-green-600/20 border-green-500/30">
                            ✓ {agent.name || agent.agent_name}
                            {agent.match_score && (
                              <span className="ml-1 text-xs text-gray-400">
                                {Math.round(agent.match_score * 100)}%
                              </span>
                            )}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Agent Scores */}
                  {result.agent_selection?.agent_scores && result.agent_selection.agent_scores.length > 0 && (
                    <div className="mb-3">
                      <span className="text-gray-400 text-xs">Selection Scores:</span>
                      <div className="space-y-1 mt-2">
                          {result.agent_selection.agent_scores.map((score: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between text-xs p-2 bg-gray-800/30 rounded">
                              <span className="text-white">{score.agent_name}</span>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs border-green-500/30 text-green-400">
                                  {Math.round((score.relevance_score || 0) * 100)}%
                                </Badge>
                              <span className="text-gray-500 text-xs">{score.reasoning}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                  {/* Multi-Agent Analysis */}
                  {result.agent_selection?.multi_agent_analysis && (
                    <div className="text-xs">
                      <span className="text-gray-400">Multi-Agent Coordination:</span>
                      <div className="mt-1 p-2 bg-orange-900/20 rounded">
                        <div className="text-orange-300">
                          {result.agent_selection.multi_agent_analysis.requires_multiple_agents ? 
                            '✓ Multiple agents required' : '• Single agent sufficient'}
                        </div>
                        <div className="text-gray-400 mt-1">
                          Strategy: {result.agent_selection.multi_agent_analysis.coordination_strategy}
                        </div>
                        </div>
                      </div>
                    )}
                </div>
              )}

              {/* 3. Individual Agent Outputs - Show full outputs FIRST when multiple agents used */}
              {result.individual_results && Object.keys(result.individual_results).length > 1 && (
                <div className="space-y-3">
                  <h5 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <Network className="h-4 w-4 text-purple-400" />
                    Individual Agent Outputs
                  </h5>
                  {Object.entries(result.individual_results)
                    .sort(([, a], [, b]) => (a.agent_order || 0) - (b.agent_order || 0))
                    .map(([agentId, agentResult]: [string, any], idx: number) => (
                    <div key={idx} className="p-4 bg-gray-800/50 border border-purple-500/30 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs border-purple-500/30 text-purple-400">
                            Agent {agentResult.agent_order || (idx + 1)}
                          </Badge>
                          <span className="text-sm font-semibold text-white">{agentResult.agent_name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs border-green-500/30 text-green-400">
                            {agentResult.success ? '✓ Success' : '✗ Failed'}
                          </Badge>
                          <span className="text-xs text-gray-400">{agentResult.execution_time?.toFixed(2)}s</span>
                          {agentResult.confidence && (
                            <Badge variant="outline" className="text-xs border-blue-500/30 text-blue-400">
                              {Math.round(agentResult.confidence * 100)}%
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="p-3 bg-gray-900/50 rounded text-sm text-gray-200 whitespace-pre-wrap leading-relaxed">
                        {agentResult.response}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 4. Final Combined Response - Synthesized result (Most Prominent) */}
              {(result.combined_content || result.final_response || result.orchestration_result?.final_response) && (
                <div className="p-4 bg-gradient-to-br from-green-900/30 to-blue-900/30 border-2 border-green-500/50 rounded-lg shadow-lg">
                  <h5 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    {result.individual_results && Object.keys(result.individual_results).length > 1 
                      ? '🎯 Final Synthesized Response' 
                      : 'Agent Response'}
                  </h5>
                  <div className="text-sm text-gray-100 whitespace-pre-wrap leading-relaxed">
                    {result.combined_content || result.final_response || result.orchestration_result?.final_response}
                  </div>
                  {result.individual_results && Object.keys(result.individual_results).length > 1 && (
                    <p className="text-xs text-blue-300 mt-3 italic flex items-center gap-1">
                      ↑ Combined from {Object.keys(result.individual_results).length} agent outputs shown above
                    </p>
                  )}
                </div>
              )}

              {/* 5. Execution Insights */}
              {result.execution_insights && (
                <div className="p-4 bg-gray-800/50 border border-blue-500/30 rounded-lg">
                  <h5 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-400" />
                    Execution Insights
                  </h5>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-gray-400">Total Time:</span>
                      <span className="text-white ml-2 font-medium">{result.execution_insights.total_execution_time?.toFixed(2)}s</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Success Rate:</span>
                      <span className="text-green-400 ml-2 font-medium">{result.execution_insights.success_rate?.toFixed(0)}%</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Agents Used:</span>
                      <span className="text-white ml-2 font-medium">{result.execution_insights.agents_used}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Strategy:</span>
                      <Badge variant="outline" className="ml-2 text-xs border-purple-500/30 text-purple-400">
                        {result.execution_insights.strategy_used}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}

              {/* Intelligence Summary - Merged into Query Analysis above, removed duplicate */}

              {/* 6. Technical Details (Collapsible) - Metadata + Structured Content */}
              {(result.metadata || result.structured_content) && (
                <details className="p-3 bg-gray-800/30 border border-gray-600 rounded-lg">
                  <summary className="text-sm font-medium text-gray-300 cursor-pointer hover:text-gray-200 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-gray-400" />
                    Technical Details
                  </summary>
                  <div className="mt-3 space-y-3">
                    {result.metadata && (
                      <div className="p-2 bg-gray-900/50 rounded">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-gray-400">Model:</span>
                            <span className="text-white ml-2">{result.metadata.orchestrator_model}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Session:</span>
                            <span className="text-white ml-2 text-xs font-mono">{result.metadata.session_id?.slice(0, 8)}...</span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-gray-400">Timestamp:</span>
                            <span className="text-white ml-2">{new Date(result.metadata.timestamp).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    )}
                    {result.structured_content && (
                      <div className="p-2 bg-gray-900/50 rounded">
                        <pre className="text-gray-400 whitespace-pre-wrap overflow-x-auto text-xs max-h-60 overflow-y-auto">
                          {JSON.stringify(result.structured_content, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}

              {/* OLD/LEGACY SECTIONS - Kept for backward compatibility but hidden when new structure exists */}
              {!result.combined_content && !result.individual_results && result.orchestration_result?.orchestration_results && 
               Object.keys(result.orchestration_result.orchestration_results).length > 1 && (
                <div className="mt-3 space-y-2">
                  <h5 className="text-sm font-medium text-gray-300 mb-2">Individual Agent Responses:</h5>
                  {Object.entries(result.orchestration_result.orchestration_results).map(([agentName, agentResult]: [string, any], idx: number) => (
                    <div key={idx} className="p-3 bg-gray-800/50 rounded border border-gray-600">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs border-blue-500/30 text-blue-400">
                          Agent {idx + 1}
                        </Badge>
                        <span className="text-sm font-medium text-white">{agentName}</span>
                      </div>
                      <p className="text-xs text-gray-300 whitespace-pre-wrap">
                        {agentResult.response || agentResult.result || JSON.stringify(agentResult, null, 2)}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Final Response - Only show if new combined_content doesn't exist */}
              {!result.combined_content && result.orchestration_result?.final_response && (
                <div className="mt-3">
                  <h5 className="text-sm font-medium text-gray-300 mb-2">
                    {result.selected_agents && result.selected_agents.length > 1 ? 'Synthesized Response:' : 'Final Response:'}
                  </h5>
                  <div className="p-3 bg-gradient-to-br from-green-900/30 to-blue-900/30 rounded border border-green-500/30 text-sm text-gray-200 whitespace-pre-wrap">
                    {result.orchestration_result.final_response}
                  </div>
                  {result.selected_agents && result.selected_agents.length > 1 && (
                    <p className="text-xs text-gray-500 mt-1 italic">
                      Aggregated from {result.selected_agents.length} agent perspectives
                    </p>
                  )}
                </div>
              )}
              
              {/* Fallback to agent_response */}
              {!result.orchestration_result?.final_response && result.agent_response && (
                <div className="mt-3">
                  <h5 className="text-sm font-medium text-gray-300 mb-2">Agent Response:</h5>
                  <div className="p-3 bg-gray-900/50 rounded border border-gray-700 text-sm text-gray-200 whitespace-pre-wrap">
                    {result.agent_response}
                  </div>
                </div>
              )}

              {/* Reflection Analysis - NEW BACKEND IMPROVEMENT */}
              {result.orchestration_result?.reflection_analysis && (
                <div className="mt-3">
                  <h5 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <Brain className="h-4 w-4 text-purple-400" />
                    Quality Analysis
                  </h5>
                  <div className="p-3 bg-purple-900/20 border border-purple-500/30 rounded">
                    <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                      <div>
                        <span className="text-gray-400">Completeness:</span>
                        <span className="text-white ml-1">
                          {Math.round((result.orchestration_result.reflection_analysis.completeness_score || 0) * 100)}%
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Agents:</span>
                        <span className="text-white ml-1">
                          {result.orchestration_result.reflection_analysis.completed_agents || 0}/
                          {result.orchestration_result.reflection_analysis.total_agents || 0}
                        </span>
                      </div>
                    </div>
                    
                    {result.orchestration_result.reflection_analysis.recommendations && 
                     result.orchestration_result.reflection_analysis.recommendations.length > 0 && (
                      <div className="mt-2">
                        <span className="text-gray-400 text-xs">Recommendations:</span>
                        <ul className="text-xs text-yellow-300 mt-1">
                          {result.orchestration_result.reflection_analysis.recommendations.map((rec: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-1">
                              <span className="text-yellow-400">•</span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Consolidated Agent Outputs - NEW BACKEND IMPROVEMENT */}
              {result.orchestration_result?.consolidated_agent_outputs && (
                <div className="mt-3">
                  <h5 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <Network className="h-4 w-4 text-blue-400" />
                    Consolidated Outputs
                  </h5>
                  <div className="space-y-2">
                    {Object.entries(result.orchestration_result.consolidated_agent_outputs).map(([category, items]: [string, any], idx: number) => (
                      <div key={idx} className="p-2 bg-gray-800/30 rounded border border-gray-600">
                        <div className="text-xs font-medium text-blue-400 mb-1 capitalize">
                          {category.replace('_', ' ')} ({Array.isArray(items) ? items.length : 'N/A'})
                        </div>
                        {Array.isArray(items) && items.map((item: any, itemIdx: number) => (
                          <div key={itemIdx} className="text-xs text-gray-300 mt-1">
                            <span className="text-gray-500">{item.agent}:</span> {item.content?.substring(0, 100)}...
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* These duplicate sections have been moved to the top in better order - removing from here */}

              {/* Orchestration Details */}
              {result.orchestration_result?.workflow_steps && result.orchestration_result.workflow_steps.length > 0 && (
                <div className="mt-3">
                  <h5 className="text-sm font-medium text-gray-300 mb-2">Workflow Steps:</h5>
                  <div className="space-y-1">
                    {result.orchestration_result.workflow_steps.map((step: any, idx: number) => (
                      <div key={idx} className="flex items-start gap-2 text-xs p-2 bg-gray-800/30 rounded">
                        <Badge variant="outline" className="text-xs">
                          {idx + 1}
                        </Badge>
                        <div className="flex-1">
                          <div className="text-blue-400 font-medium">{step.agent_name || step.agent}</div>
                          <div className="text-gray-400">{step.action || step.task}</div>
                          {step.result && (
                            <div className="text-gray-500 text-xs mt-1">→ {step.result.substring(0, 100)}...</div>
                          )}
                        </div>
                        {step.execution_time && (
                          <Badge variant="secondary" className="text-xs">
                            {step.execution_time.toFixed(2)}s
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Execution Trace (Fallback) */}
              {!result.orchestration_result?.workflow_steps && result.workflow_trace && result.workflow_trace.length > 0 && (
                <div className="mt-3">
                  <h5 className="text-sm font-medium text-gray-300 mb-2">Execution Trace:</h5>
                  <div className="space-y-1">
                    {result.workflow_trace.map((step: any, idx: number) => (
                      <div key={idx} className="flex items-start gap-2 text-xs">
                        <Badge variant="outline" className="text-xs mt-0.5">
                          {step.step}
                        </Badge>
                        <div className="flex-1">
                          <span className="text-purple-400">{step.agent}</span>
                          <span className="text-gray-500"> → </span>
                          <span className="text-gray-300">{step.action}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Query Analysis Info */}
              {result.analysis && (
                <details className="mt-3">
                  <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-300">
                    View Query Analysis Details
                  </summary>
                  <div className="mt-2 p-2 bg-gray-800/30 rounded text-xs text-gray-400">
                    {result.analysis.complexity && (
                      <div>Complexity: <span className="text-white">{result.analysis.complexity}</span></div>
                    )}
                    {result.analysis.detected_capabilities && (
                      <div>Detected Capabilities: <span className="text-white">{result.analysis.detected_capabilities.join(', ')}</span></div>
                    )}
                    {result.analysis.suggested_agents && (
                      <div>Suggested Agents: <span className="text-white">{result.analysis.suggested_agents.join(', ')}</span></div>
                    )}
                  </div>
                </details>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 mt-4 pt-3 border-t border-gray-700">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setResult(null);
                    setQuery('');
                  }}
                  className="flex-1"
                >
                  Send Another Query
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClose}
                  className="flex-1"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};