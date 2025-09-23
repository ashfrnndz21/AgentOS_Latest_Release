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
  orchestrator_reasoning?: string;
  streamlined_analysis?: any;
  agent_registry_analysis?: {
    success: boolean;
    total_agents_analyzed: number;
    agent_analysis: Array<{
      agent_name: string;
      association_score: number;
      contextual_relevance: string;
      role_analysis: string;
    }>;
    analysis_summary: string;
  };
  agent_selection?: {
    success: boolean;
    total_agents_selected: number;
    execution_strategy: string;
    overall_reasoning: string;
    selected_agents: Array<{
      agent_name: string;
      execution_order: number;
      confidence_score: number;
      selection_reasoning: string;
      task_assignment: string;
    }>;
  };
  a2a_execution?: {
    success: boolean;
    execution_strategy: string;
    total_agents_executed: number;
    execution_results: Array<{
      agent_name: string;
      execution_order: number;
      success: boolean;
      execution_time: number;
      task_assignment: string;
      handoff_message_sent: string;
      a2a_handoff_status: string;
      agent_response: string;
      agent_actual_response: string;
    }>;
    accumulated_output: string;
    final_response: string;
  };
  execution_details?: {
    success: boolean;
    steps_completed: number;
    execution_time: number;
    step_1: string;
    step_2: string;
    step_3: string;
    step_4: string;
  };
  error?: string;
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
  const [error, setError] = useState<string | null>(null);
  const [processingStage, setProcessingStage] = useState<string>('');

  const fetchHealthInfo = async () => {
    try {
      const response = await fetch('http://localhost:5015/api/simple-orchestration/health');
      const data = await response.json();
      setHealthInfo(data);
    } catch (error) {
      console.error('Failed to fetch health info:', error);
    }
  };


  const processQuery = async () => {
    if (!query.trim()) return;

    setIsProcessing(true);
    setError(null);
    setResult(null);
    setProcessingStage('');

    try {
      // Enhanced 4-step orchestration process
      const stages = [
        'Step 1: Orchestrator Reasoning',
        'Step 2: Agent Registry Analysis',
        'Step 3: Agent Selection & Sequencing',
        'Step 4: A2A Execution & Response Synthesis'
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

      const response = await fetch('http://localhost:5015/api/simple-orchestration/query', {
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

      // Refresh health info
      await fetchHealthInfo();

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Network error');
      setProcessingStage('');
    } finally {
      setIsProcessing(false);
    }
  };


  useEffect(() => {
    fetchHealthInfo();
    
    const interval = setInterval(() => {
      fetchHealthInfo();
    }, 5000);

    return () => clearInterval(interval);
  }, []);


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

      {/* Enhanced 4-Step Orchestration Results */}
      {result && (
        <div className="space-y-6">
          {/* Step 1: Orchestrator Reasoning */}
          {result.orchestrator_reasoning && (
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Brain className="h-5 w-5 text-blue-400" />
                  Step 1: Orchestrator Reasoning
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <p className="text-white text-sm">
                    {result.orchestrator_reasoning}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Agent Registry Analysis */}
          {result.agent_registry_analysis && (
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-400" />
                  Step 2: Agent Registry Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-gray-700 p-3 rounded-lg">
                    <p className="text-white text-sm">
                      {result.agent_registry_analysis.analysis_summary}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {result.agent_registry_analysis.agent_analysis.map((agent, index) => (
                      <div key={index} className="bg-gray-600 p-3 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-white font-medium">{agent.agent_name}</h4>
                          <Badge className="bg-purple-600">Score: {(agent.association_score * 100).toFixed(0)}%</Badge>
                        </div>
                        <p className="text-gray-300 text-xs mb-1">{agent.role_analysis}</p>
                        <p className="text-gray-400 text-xs">{agent.contextual_relevance}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Agent Selection */}
          {result.agent_selection && (
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="h-5 w-5 text-green-400" />
                  Step 3: Agent Selection & Sequencing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-gray-700 p-3 rounded-lg">
                    <p className="text-white text-sm">
                      {result.agent_selection.overall_reasoning}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {result.agent_selection.selected_agents.map((agent, index) => (
                      <div key={index} className="bg-gray-600 p-3 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-white font-medium">{agent.agent_name}</h4>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-green-600">Order: {agent.execution_order}</Badge>
                            <Badge className="bg-blue-600">Confidence: {(agent.confidence_score * 100).toFixed(0)}%</Badge>
                          </div>
                        </div>
                        <p className="text-gray-300 text-xs mb-1">{agent.selection_reasoning}</p>
                        <p className="text-gray-400 text-xs">{agent.task_assignment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: A2A Execution */}
          {result.a2a_execution && (
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Activity className="h-5 w-5 text-orange-400" />
                  Step 4: A2A Execution & Response Synthesis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Strategy:</span>
                      <Badge className="bg-orange-600">{result.a2a_execution.execution_strategy}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Agents Executed:</span>
                      <Badge className="bg-blue-600">{result.a2a_execution.total_agents_executed}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Success:</span>
                      <Badge className={result.a2a_execution.success ? "bg-green-600" : "bg-red-600"}>
                        {result.a2a_execution.success ? "Yes" : "No"}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {result.a2a_execution.execution_results.map((execution, index) => (
                      <div key={index} className="bg-gray-700 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-white font-medium">{execution.agent_name}</h4>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-purple-600">Order: {execution.execution_order}</Badge>
                            <Badge className={execution.success ? "bg-green-600" : "bg-red-600"}>
                              {execution.success ? "Success" : "Failed"}
                            </Badge>
                            <Badge className="bg-blue-600">{execution.execution_time.toFixed(2)}s</Badge>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div>
                            <label className="text-gray-400">Task Assignment:</label>
                            <p className="text-white bg-gray-600 p-2 rounded mt-1">{execution.task_assignment}</p>
                          </div>
                          <div>
                            <label className="text-gray-400">A2A Status:</label>
                            <Badge variant="outline" className="mt-1">{execution.a2a_handoff_status}</Badge>
                          </div>
                          <div>
                            <label className="text-gray-400">Agent Response:</label>
                            <p className="text-white bg-gray-600 p-2 rounded mt-1">{execution.agent_response}</p>
                          </div>
                          {execution.agent_actual_response && execution.agent_actual_response !== "No actual response from agent" && (
                            <div>
                              <label className="text-gray-400">Actual Response:</label>
                              <p className="text-white bg-gray-600 p-2 rounded mt-1">{execution.agent_actual_response}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {result.a2a_execution.final_response && (
                    <div className="mt-4">
                      <label className="text-sm text-gray-400">Final Synthesized Response</label>
                      <div className="bg-gray-700 p-4 rounded-lg mt-2">
                        <p className="text-white text-sm">{result.a2a_execution.final_response}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}


        </div>
      )}
    </div>
  );
};
