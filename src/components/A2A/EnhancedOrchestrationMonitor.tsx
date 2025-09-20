import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Play, 
  Bot, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Brain,
  Activity,
  Zap,
  Target,
  Sparkles,
  ArrowRight,
  Loader2
} from 'lucide-react';

interface EnhancedOrchestrationResult {
  success: boolean;
  session_id: string;
  stage_1_query_analysis?: {
    user_intent: string;
    domain: string;
    complexity: string;
    required_expertise: string;
    context_reasoning: string;
  };
  stage_2_agent_analysis?: {
    agent_evaluations: Array<{
      agent_id: string;
      agent_name: string;
      primary_expertise: string;
      capabilities_assessment: string;
      tools_analysis: string;
      system_prompt_analysis: string;
      suitability_score: number;
    }>;
  };
  stage_3_contextual_matching?: {
    selected_agent_id: string;
    matching_reasoning: string;
    confidence: number;
    alternative_agents: string[];
    match_quality: string;
    execution_strategy: string;
  };
  selected_agent?: {
    id: string;
    name: string;
    description: string;
  };
  execution_time?: number;
  final_response?: string;
  raw_agent_response?: any;
  error?: string;
}

interface SessionInfo {
  session_id: string;
  created_at: string;
  query: string;
  status: string;
  stages_completed: number;
  duration: number;
}

interface HealthInfo {
  status: string;
  memory_usage: string;
  active_sessions: number;
  orchestrator_model: string;
  timestamp: string;
}

export const EnhancedOrchestrationMonitor: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<EnhancedOrchestrationResult | null>(null);
  const [healthInfo, setHealthInfo] = useState<HealthInfo | null>(null);
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [processingStage, setProcessingStage] = useState<string>('');

  const fetchHealthInfo = async () => {
    try {
      const response = await fetch('http://localhost:5014/api/enhanced-orchestration/health');
      const data = await response.json();
      setHealthInfo(data);
    } catch (error) {
      console.error('Failed to fetch health info:', error);
    }
  };

  const fetchSessions = async () => {
    try {
      const response = await fetch('http://localhost:5014/api/enhanced-orchestration/sessions');
      const data = await response.json();
      setSessions(data.sessions || []);
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    }
  };

  const processQuery = async () => {
    if (!query.trim()) return;

    setIsProcessing(true);
    setError(null);
    setResult(null);
    setProcessingStage('');

    try {
      // Enhanced 5-stage orchestration process
      const stages = [
        'Stage 1: Agent Discovery & Registry Access',
        'Stage 2: LLM Query Analysis & Agent Evaluation',
        'Stage 3: Contextual Agent Matching',
        'Stage 4: Agent Execution & Response Generation',
        'Stage 5: Response Synthesis & Memory Cleanup'
      ];

      let stageIndex = 0;
      const stageInterval = setInterval(() => {
        if (stageIndex < stages.length) {
          setProcessingStage(stages[stageIndex]);
          stageIndex++;
        } else {
          clearInterval(stageInterval);
        }
      }, 1000);

      const response = await fetch('http://localhost:5014/api/enhanced-orchestration/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: query.trim() }),
      });

      clearInterval(stageInterval);
      setProcessingStage('');

      const data = await response.json();
      setResult(data);
      
      if (!data.success) {
        setError(data.error || 'Unknown error occurred');
      }

      // Refresh health and sessions info
      await fetchHealthInfo();
      await fetchSessions();

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Network error');
      setProcessingStage('');
    } finally {
      setIsProcessing(false);
    }
  };

  const cleanupSession = async (sessionId: string) => {
    try {
      await fetch(`http://localhost:5014/api/enhanced-orchestration/sessions/${sessionId}`, {
        method: 'DELETE',
      });
      await fetchSessions();
    } catch (error) {
      console.error('Failed to cleanup session:', error);
    }
  };

  useEffect(() => {
    fetchHealthInfo();
    fetchSessions();
    
    const interval = setInterval(() => {
      fetchHealthInfo();
      fetchSessions();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-400" />;
      case 'active':
        return <Activity className="h-4 w-4 text-blue-400" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-600';
      case 'failed':
        return 'bg-red-600';
      case 'active':
        return 'bg-blue-600';
      default:
        return 'bg-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-400" />
            Enhanced LLM Orchestration
          </h2>
          <p className="text-gray-400 mt-1">
            Intelligent query analysis, agent selection, and response synthesis
          </p>
        </div>
        
        {/* Health Status */}
        {healthInfo && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-purple-400" />
              <span className="text-sm text-gray-300">
                Memory: {healthInfo.memory_usage}
              </span>
            </div>
            <Badge variant="outline" className="border-purple-400 text-purple-400">
              {healthInfo.active_sessions} sessions
            </Badge>
            <Badge variant="outline" className="border-blue-400 text-blue-400">
              {healthInfo.orchestrator_model}
            </Badge>
          </div>
        )}
      </div>

      {/* Query Input */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Play className="h-5 w-5 text-purple-400" />
            Intelligent Query Processing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter your query (e.g., 'I have a headache and feel dizzy - what should I do?')"
              className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
              onKeyPress={(e) => e.key === 'Enter' && processQuery()}
            />
            <Button
              onClick={processQuery}
              disabled={isProcessing || !query.trim()}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Analyze & Execute
                </>
              )}
            </Button>
          </div>
          
          {/* Processing Stage */}
          {processingStage && (
            <div className="flex items-center gap-2 text-blue-400">
              <Activity className="h-4 w-4 animate-pulse" />
              <span className="text-sm">{processingStage}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert className="bg-red-900/20 border-red-500/30">
          <XCircle className="h-4 w-4" />
          <AlertDescription className="text-red-200">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Enhanced 5-Stage Orchestration Results */}
      {result && (
        <div className="space-y-6">
          {/* Stage 1: Query Analysis */}
          {result.stage_1_query_analysis && (
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Brain className="h-5 w-5 text-blue-400" />
                  Stage 1: Query Context Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-400">User Intent</label>
                    <p className="text-white text-sm bg-gray-700 p-2 rounded mt-1">
                      {result.stage_1_query_analysis.user_intent}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Domain</label>
                    <Badge className="bg-blue-600 mt-1">{result.stage_1_query_analysis.domain}</Badge>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Complexity</label>
                    <Badge className="bg-green-600 mt-1">{result.stage_1_query_analysis.complexity}</Badge>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Required Expertise</label>
                    <p className="text-white text-sm bg-gray-700 p-2 rounded mt-1">
                      {result.stage_1_query_analysis.required_expertise}
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="text-sm text-gray-400">Context Reasoning</label>
                  <p className="text-white text-sm bg-gray-700 p-3 rounded mt-1">
                    {result.stage_1_query_analysis.context_reasoning}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stage 2: Agent Analysis */}
          {result.stage_2_agent_analysis && (
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-400" />
                  Stage 2: Agent Capability Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {result.stage_2_agent_analysis.agent_evaluations.map((agent, index) => (
                    <div key={agent.agent_id} className="bg-gray-700 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-white font-medium">{agent.agent_name}</h4>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-purple-600">Score: {(agent.suitability_score * 100).toFixed(0)}%</Badge>
                          <Badge variant="outline">{agent.primary_expertise}</Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div>
                          <label className="text-gray-400">Capabilities Assessment</label>
                          <p className="text-white bg-gray-600 p-2 rounded mt-1">
                            {agent.capabilities_assessment}
                          </p>
                        </div>
                        <div>
                          <label className="text-gray-400">Tools Analysis</label>
                          <p className="text-white bg-gray-600 p-2 rounded mt-1">
                            {agent.tools_analysis}
                          </p>
                        </div>
                        <div className="md:col-span-2">
                          <label className="text-gray-400">System Prompt Analysis</label>
                          <p className="text-white bg-gray-600 p-2 rounded mt-1">
                            {agent.system_prompt_analysis}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stage 3: Contextual Matching */}
          {result.stage_3_contextual_matching && (
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="h-5 w-5 text-green-400" />
                  Stage 3: Contextual Agent Matching
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Selected Agent:</span>
                    <Badge className="bg-green-600">{result.selected_agent?.name}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Confidence:</span>
                    <Badge className="bg-blue-600">{(result.stage_3_contextual_matching.confidence * 100).toFixed(1)}%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Match Quality:</span>
                    <Badge className="bg-purple-600">{result.stage_3_contextual_matching.match_quality}</Badge>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-400">Matching Reasoning</label>
                    <p className="text-white text-sm bg-gray-700 p-3 rounded mt-1">
                      {result.stage_3_contextual_matching.matching_reasoning}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm text-gray-400">Execution Strategy</label>
                      <Badge variant="outline" className="mt-1">{result.stage_3_contextual_matching.execution_strategy}</Badge>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Alternative Agents</label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {result.stage_3_contextual_matching.alternative_agents.map((agentId, index) => {
                          const altAgent = result.stage_2_agent_analysis?.agent_evaluations.find(a => a.agent_id === agentId);
                          return (
                            <Badge key={agentId} variant="outline" className="text-xs">
                              {altAgent?.agent_name || `Agent ${index + 1}`}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stage 4: Agent Execution Results */}
          {result.success && result.selected_agent && (
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Activity className="h-5 w-5 text-orange-400" />
                  Stage 4: Agent Execution & Response Generation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Executed Agent:</span>
                    <Badge className="bg-orange-600">{result.selected_agent.name}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Execution Time:</span>
                    <Badge className="bg-blue-600">{result.execution_time?.toFixed(2)}s</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Session ID:</span>
                    <p className="text-white font-mono text-xs">{result.session_id}</p>
                  </div>
                </div>
                
                {result.raw_agent_response && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-400">Agent Response Details</label>
                      <div className="bg-gray-700 p-3 rounded-lg mt-1 text-sm">
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          <span className="text-gray-400">Model Used:</span>
                          <span className="text-white">{result.raw_agent_response.model_used}</span>
                          <span className="text-gray-400">Execution ID:</span>
                          <span className="text-white font-mono text-xs">{result.raw_agent_response.execution_id}</span>
                          <span className="text-gray-400">SDK Powered:</span>
                          <span className="text-white">{result.raw_agent_response.sdk_powered ? 'Yes' : 'No'}</span>
                          <span className="text-gray-400">Tools Used:</span>
                          <span className="text-white">{result.raw_agent_response.tools_used?.length || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Stage 5: Response Synthesis & Final Result */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                {result.success ? (
                  <CheckCircle className="h-5 w-5 text-green-400" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-400" />
                )}
                Stage 5: Response Synthesis & Memory Cleanup
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400">Total Processing Time</label>
                  <Badge className="bg-green-600 mt-1">{result.execution_time?.toFixed(2)}s</Badge>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Memory Management</label>
                  <Badge variant="outline" className="mt-1">Automatic Cleanup</Badge>
                </div>
              </div>

              {result.success && result.final_response && (
                <div>
                  <label className="text-sm text-gray-400">Final Synthesized Response</label>
                  <div className="bg-gray-700 p-4 rounded-lg mt-1 border border-green-500/30">
                    <p className="text-white whitespace-pre-wrap">
                      {result.final_response}
                    </p>
                  </div>
                </div>
              )}

              {!result.success && result.error && (
                <div>
                  <label className="text-sm text-gray-400">Error Details</label>
                  <div className="bg-red-900/20 p-4 rounded-lg mt-1 border border-red-500/30">
                    <p className="text-red-200">{result.error}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Active Sessions */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="h-5 w-5 text-purple-400" />
            Active Sessions ({sessions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <p className="text-gray-400 text-center py-4">No active sessions</p>
          ) : (
            <div className="space-y-2">
              {sessions.map((session) => (
                <div
                  key={session.session_id}
                  className="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(session.status)}
                    <div>
                      <p className="text-white text-sm font-mono">
                        {session.session_id.substring(0, 8)}...
                      </p>
                      <p className="text-gray-400 text-xs">
                        {session.query} • {session.duration.toFixed(1)}s ago
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(session.status)}>
                      {session.status}
                    </Badge>
                    <Badge variant="outline">
                      {session.stages_completed} stages
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => cleanupSession(session.session_id)}
                      className="text-xs"
                    >
                      Cleanup
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
