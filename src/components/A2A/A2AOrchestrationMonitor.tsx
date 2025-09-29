import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Loader2, 
  Send, 
  Bot, 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  ArrowRight,
  Activity,
  Zap,
  Eye,
  EyeOff
} from 'lucide-react';

interface OrchestrationStep {
  step_type: string;
  timestamp: string;
  elapsed_seconds: number;
  details: any;
}

interface OrchestrationResult {
  success: boolean;
  response: string;
  session_id: string;
  timestamp: string;
  workflow_summary: {
    agents_used: string[];
    execution_strategy: string;
    total_execution_time: number;
    stages_completed: number;
    total_stages: number;
  };
  complete_data_flow: {
    original_query: string;
    session_id: string;
    stages: {
      stage_1_analysis?: any;
      stage_2_discovery?: any;
      stage_3_execution?: any;
      stage_4_agent_analysis?: any;
      stage_5_agent_matching?: any;
      stage_6_orchestration_plan?: any;
      stage_7_message_flow?: any;
      stage_8_final_synthesis?: any;
    };
    data_exchanges: Array<{
      agent_id: string;
      data_length: number;
      data_sent: string;
      direction: string;
      from: string;
      handoff_number: number;
      step: number;
      timestamp: string;
      to: string;
    }>;
    final_synthesis: any;
    handoffs: Array<{
      handoff_number: number;
      from_agent: string;
      to_agent: string;
      task: string;
      status: string;
      execution_time: number;
      data_exchanged: string;
    }>;
    orchestrator_processing: any[];
  };
}

export const A2AOrchestrationMonitor: React.FC = () => {
  const [question, setQuestion] = useState('');
  const [isOrchestrating, setIsOrchestrating] = useState(false);
  const [result, setResult] = useState<OrchestrationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(true);
  const [currentStep, setCurrentStep] = useState<string>('');

  const handleOrchestrate = async () => {
    if (!question.trim()) return;

    setIsOrchestrating(true);
    setError(null);
    setResult(null);
    setCurrentStep('Initializing orchestration...');

    try {
      console.log('Starting orchestration request to:', 'http://localhost:5015/api/modern-orchestration/query');
      console.log('Query:', question);
      
      const response = await fetch('http://localhost:5015/api/modern-orchestration/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: question
        })
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        const data = await response.json();
        console.log('Orchestration successful:', data);
        setResult(data);
        setCurrentStep('Orchestration completed!');
      } else {
        const errorText = await response.text();
        console.error('Orchestration failed:', response.status, errorText);
        setError(`Failed to orchestrate agents (${response.status}): ${errorText.substring(0, 100)}`);
        setCurrentStep('Orchestration failed');
      }
    } catch (err) {
      console.error('Network/connection error:', err);
      setError(`Error connecting to orchestration service: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setCurrentStep('Connection error');
    } finally {
      setIsOrchestrating(false);
    }
  };

  const getStepIcon = (stepType: string) => {
    switch (stepType) {
      case 'ORCHESTRATION_START':
        return <Zap className="h-4 w-4 text-blue-400" />;
      case 'AGENT_DISCOVERY':
        return <Users className="h-4 w-4 text-green-400" />;
      case 'ROUTING_DECISION':
        return <Activity className="h-4 w-4 text-purple-400" />;
      case 'AGENT_CONTACT':
        return <Send className="h-4 w-4 text-orange-400" />;
      case 'AGENT_RESPONSE':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'AGENT_ERROR':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'COORDINATION':
        return <Users className="h-4 w-4 text-cyan-400" />;
      case 'ORCHESTRATION_COMPLETE':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStepColor = (stepType: string) => {
    switch (stepType) {
      case 'ORCHESTRATION_START':
        return 'border-blue-500 bg-blue-500/10';
      case 'AGENT_DISCOVERY':
        return 'border-green-500 bg-green-500/10';
      case 'ROUTING_DECISION':
        return 'border-purple-500 bg-purple-500/10';
      case 'AGENT_CONTACT':
        return 'border-orange-500 bg-orange-500/10';
      case 'AGENT_RESPONSE':
        return 'border-green-600 bg-green-600/10';
      case 'AGENT_ERROR':
        return 'border-red-500 bg-red-500/10';
      case 'COORDINATION':
        return 'border-cyan-500 bg-cyan-500/10';
      case 'ORCHESTRATION_COMPLETE':
        return 'border-green-700 bg-green-700/10';
      default:
        return 'border-gray-500 bg-gray-500/10';
    }
  };

  const formatStepType = (stepType: string) => {
    return stepType.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="text-purple-400" size={20} />
            Live A2A Orchestration Monitor
          </CardTitle>
          <CardDescription>
            Watch agents coordinate in real-time with detailed step-by-step processing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">
              Ask a question that requires multiple agents:
            </label>
            <textarea
              placeholder="e.g., What's the weather like today and can you help me calculate the temperature in Celsius?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400"
              rows={3}
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={handleOrchestrate}
              disabled={isOrchestrating || !question.trim()}
              className="flex-1"
            >
              {isOrchestrating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {currentStep}
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Start Live Orchestration
                </>
              )}
            </Button>
            
            {result && (
              <Button
                variant="outline"
                onClick={() => setShowDetails(!showDetails)}
                className="border-gray-600"
              >
                {showDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="bg-red-900/20 border-red-500">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-400" />
              <p className="text-red-400">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {result && (
        <div className="space-y-4">
          {/* Summary Card */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="text-green-400" size={20} />
                8-Stage Orchestration Summary
              </CardTitle>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-1">
                  <Clock size={16} />
                  Session: {result.session_id}
                </div>
                <Badge variant={result.success ? "default" : "destructive"}>
                  {result.success ? "Success" : "Failed"}
                </Badge>
                <Badge variant="outline" className="border-purple-400 text-purple-400">
                  8-Stage Workflow
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="bg-gray-700 p-3 rounded">
                  <div className="text-gray-400">Agents Used</div>
                  <div className="text-white font-semibold">{result.workflow_summary.agents_used?.length || 0}</div>
                </div>
                <div className="bg-gray-700 p-3 rounded">
                  <div className="text-gray-400">Stages</div>
                  <div className="text-white font-semibold">{result.workflow_summary.stages_completed}/{result.workflow_summary.total_stages}</div>
                </div>
                <div className="bg-gray-700 p-3 rounded">
                  <div className="text-gray-400">Execution Time</div>
                  <div className="text-white font-semibold">{result.workflow_summary.total_execution_time.toFixed(2)}s</div>
                </div>
                <div className="bg-gray-700 p-3 rounded">
                  <div className="text-gray-400">Strategy</div>
                  <div className="text-white font-semibold text-xs">{result.workflow_summary.execution_strategy}</div>
                </div>
              </div>
              
              {/* 8-Stage Progress Visualization */}
              <div className="mt-6">
                <div className="text-sm text-gray-400 mb-3">8-Stage Workflow Progress</div>
                <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((stage) => {
                    const stageData = result.complete_data_flow.stages[`stage_${stage}_${stage === 1 ? 'analysis' : stage === 2 ? 'discovery' : stage === 3 ? 'execution' : stage === 4 ? 'agent_analysis' : stage === 5 ? 'agent_matching' : stage === 6 ? 'orchestration_plan' : stage === 7 ? 'message_flow' : 'final_synthesis'}`];
                    const isCompleted = stageData && stageData.output;
                    const stageNames = ['Analysis', 'Discovery', 'Execution', 'Agent Analysis', 'Agent Matching', 'Orchestration', 'Message Flow', 'Synthesis'];
                    
                    return (
                      <div key={stage} className="text-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          isCompleted ? 'bg-green-500 text-white' : 'bg-gray-600 text-gray-300'
                        }`}>
                          {stage}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">{stageNames[stage - 1]}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 8-Stage Detailed Information */}
          {showDetails && result.complete_data_flow.stages && (
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="text-purple-400" size={20} />
                  8-Stage Workflow Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {/* Stage 1: Analysis */}
                    {result.complete_data_flow.stages.stage_1_analysis && (
                      <div className="p-4 rounded-lg border-l-4 border-blue-500 bg-blue-500/10">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold text-white">1</div>
                          <div className="font-medium text-white">Stage 1: Analysis</div>
                        </div>
                        <div className="text-sm text-gray-300">
                          <div><strong>Complexity:</strong> {result.complete_data_flow.stages.stage_1_analysis.output?.complexity || 'N/A'}</div>
                          <div><strong>Domain:</strong> {result.complete_data_flow.stages.stage_1_analysis.output?.domain || 'N/A'}</div>
                          <div><strong>Strategy:</strong> {result.complete_data_flow.stages.stage_1_analysis.output?.execution_strategy || 'N/A'}</div>
                          <div><strong>Confidence:</strong> {result.complete_data_flow.stages.stage_1_analysis.output?.confidence || 'N/A'}</div>
                        </div>
                      </div>
                    )}

                    {/* Stage 2: Discovery */}
                    {result.complete_data_flow.stages.stage_2_discovery && (
                      <div className="p-4 rounded-lg border-l-4 border-green-500 bg-green-500/10">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-xs font-bold text-white">2</div>
                          <div className="font-medium text-white">Stage 2: Discovery</div>
                        </div>
                        <div className="text-sm text-gray-300">
                          <div><strong>Agents Found:</strong> {result.complete_data_flow.stages.stage_2_discovery.output?.length || 0}</div>
                          {result.complete_data_flow.stages.stage_2_discovery.output?.map((agent: any, index: number) => (
                            <div key={index} className="ml-4">
                              • {agent.agent_name} ({agent.agent_id})
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Stage 3: Execution */}
                    {result.complete_data_flow.stages.stage_3_execution && (
                      <div className="p-4 rounded-lg border-l-4 border-orange-500 bg-orange-500/10">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-xs font-bold text-white">3</div>
                          <div className="font-medium text-white">Stage 3: Execution</div>
                        </div>
                        <div className="text-sm text-gray-300">
                          <div><strong>Strategy:</strong> {result.complete_data_flow.stages.stage_3_execution.output?.strategy || 'N/A'}</div>
                          <div><strong>Agent Sequence:</strong> {result.complete_data_flow.stages.stage_3_execution.output?.agent_sequence?.join(' → ') || 'N/A'}</div>
                          <div><strong>Protocol:</strong> {result.complete_data_flow.stages.stage_3_execution.output?.handover_protocol || 'N/A'}</div>
                        </div>
                      </div>
                    )}

                    {/* Stage 4: Agent Analysis */}
                    {result.complete_data_flow.stages.stage_4_agent_analysis && (
                      <div className="p-4 rounded-lg border-l-4 border-purple-500 bg-purple-500/10">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-xs font-bold text-white">4</div>
                          <div className="font-medium text-white">Stage 4: Agent Analysis</div>
                        </div>
                        <div className="text-sm text-gray-300">
                          {Object.entries(result.complete_data_flow.stages.stage_4_agent_analysis.output || {}).map(([agentId, agentInfo]: [string, any]) => (
                            <div key={agentId} className="ml-4 mb-2">
                              <div><strong>{agentId}:</strong></div>
                              <div className="ml-4">• Task: {agentInfo.task_assignment}</div>
                              <div className="ml-4">• Expected: {agentInfo.expected_output}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Stage 5: Agent Matching */}
                    {result.complete_data_flow.stages.stage_5_agent_matching && (
                      <div className="p-4 rounded-lg border-l-4 border-cyan-500 bg-cyan-500/10">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center text-xs font-bold text-white">5</div>
                          <div className="font-medium text-white">Stage 5: Agent Matching</div>
                        </div>
                        <div className="text-sm text-gray-300">
                          <div><strong>Execution Order:</strong> {result.complete_data_flow.stages.stage_5_agent_matching.output?.execution_order?.join(' → ') || 'N/A'}</div>
                          {result.complete_data_flow.stages.stage_5_agent_matching.output?.matched_agents?.map((agent: any, index: number) => (
                            <div key={index} className="ml-4">
                              • {agent.agent_name}: {agent.task} (Confidence: {agent.confidence})
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Stage 6: Orchestration Plan */}
                    {result.complete_data_flow.stages.stage_6_orchestration_plan && (
                      <div className="p-4 rounded-lg border-l-4 border-pink-500 bg-pink-500/10">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 rounded-full bg-pink-500 flex items-center justify-center text-xs font-bold text-white">6</div>
                          <div className="font-medium text-white">Stage 6: Orchestration Plan</div>
                        </div>
                        <div className="text-sm text-gray-300">
                          {result.complete_data_flow.stages.stage_6_orchestration_plan.output?.orchestration_plan && (
                            <div>
                              <div><strong>Plan Phases:</strong></div>
                              {Object.entries(result.complete_data_flow.stages.stage_6_orchestration_plan.output.orchestration_plan).map(([phase, description]: [string, any]) => (
                                <div key={phase} className="ml-4">• {phase}: {description}</div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Stage 7: Message Flow */}
                    {result.complete_data_flow.stages.stage_7_message_flow && (
                      <div className="p-4 rounded-lg border-l-4 border-yellow-500 bg-yellow-500/10">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center text-xs font-bold text-white">7</div>
                          <div className="font-medium text-white">Stage 7: Message Flow</div>
                        </div>
                        <div className="text-sm text-gray-300">
                          <div><strong>Communication:</strong> {result.complete_data_flow.stages.stage_7_message_flow.output?.success ? 'Enabled' : 'Disabled'}</div>
                          <div><strong>Messages:</strong> {result.complete_data_flow.stages.stage_7_message_flow.output?.message_flow?.length || 0} exchanges</div>
                        </div>
                      </div>
                    )}

                    {/* Stage 8: Final Synthesis */}
                    {result.complete_data_flow.stages.stage_8_final_synthesis && (
                      <div className="p-4 rounded-lg border-l-4 border-red-500 bg-red-500/10">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-xs font-bold text-white">8</div>
                          <div className="font-medium text-white">Stage 8: Final Synthesis</div>
                        </div>
                        <div className="text-sm text-gray-300">
                          <div><strong>Status:</strong> {result.complete_data_flow.stages.stage_8_final_synthesis.output?.success ? 'Completed' : 'Pending'}</div>
                          <div><strong>Notes:</strong> {result.complete_data_flow.stages.stage_8_final_synthesis.output?.final_synthesis?.processing_notes || 'N/A'}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {/* A2A Data Exchanges */}
          {showDetails && result.complete_data_flow.data_exchanges && (
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="text-blue-400" size={20} />
                  A2A Data Exchanges
                  <Badge variant="outline" className="ml-auto">
                    {result.complete_data_flow.data_exchanges.length} exchanges
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {result.complete_data_flow.data_exchanges.map((exchange, index) => (
                      <div
                        key={index}
                        className="p-4 rounded-lg border-l-4 border-blue-500 bg-blue-500/10"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <ArrowRight className="h-4 w-4 text-blue-400" />
                          <div className="font-medium text-white">
                            Handoff #{exchange.handoff_number}: {exchange.from} → {exchange.to}
                          </div>
                          <div className="text-xs text-gray-400 ml-auto">
                            Step {exchange.step}
                          </div>
                        </div>
                        
                        <div className="text-sm text-gray-300 ml-7">
                          <div><strong>Direction:</strong> {exchange.direction}</div>
                          <div><strong>Agent ID:</strong> {exchange.agent_id}</div>
                          <div><strong>Data Length:</strong> {exchange.data_length} chars</div>
                          <div><strong>Data Sent:</strong> {exchange.data_sent.substring(0, 100)}...</div>
                          <div><strong>Timestamp:</strong> {new Date(exchange.timestamp).toLocaleTimeString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {/* Final Response */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="text-green-400" size={20} />
                Final Response
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-700 p-4 rounded text-sm text-gray-200 whitespace-pre-wrap">
                {result.response}
              </div>
            </CardContent>
          </Card>

          {/* A2A Handoffs */}
          {result.complete_data_flow.handoffs && result.complete_data_flow.handoffs.length > 0 && (
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="text-cyan-400" size={20} />
                  A2A Agent Handoffs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {result.complete_data_flow.handoffs.map((handoff, index) => (
                    <div key={index} className="bg-gray-700 p-4 rounded">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-white">
                          Handoff #{handoff.handoff_number}: {handoff.from_agent} → {handoff.to_agent}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <span>{handoff.execution_time.toFixed(2)}s</span>
                          <Badge variant={handoff.status === 'completed' ? 'default' : 'destructive'}>
                            {handoff.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-sm text-gray-300">
                        <div><strong>Task:</strong> {handoff.task}</div>
                        <div><strong>Data:</strong> {handoff.data_exchanged}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};







