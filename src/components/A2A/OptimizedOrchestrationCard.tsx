import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  MessageSquare, 
  BarChart3,
  Clock,
  Zap,
  Cpu,
  Settings,
  Sparkles,
  Info,
  Network,
  CheckCircle,
  Search,
  Workflow,
  RefreshCw,
  X,
  Settings as Gear,
  Target,
  Activity,
  Users,
  ArrowRight,
  ArrowDown,
  Play,
  Pause,
  Square
} from 'lucide-react';

interface OptimizedOrchestrationCardProps {
  orchestrationResult: any;
  onExecuteOrchestration: (query: string) => void;
}

export const OptimizedOrchestrationCard: React.FC<OptimizedOrchestrationCardProps> = ({
  orchestrationResult,
  onExecuteOrchestration
}) => {
  const [activeSection, setActiveSection] = useState<string>('overview');
  const [expandedStages, setExpandedStages] = useState<Set<number>>(new Set());

  const toggleStageExpansion = (stageNumber: number) => {
    const newExpanded = new Set(expandedStages);
    if (newExpanded.has(stageNumber)) {
      newExpanded.delete(stageNumber);
    } else {
      newExpanded.add(stageNumber);
    }
    setExpandedStages(newExpanded);
  };

  const renderQueryIntake = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">1</div>
        <h3 className="text-lg font-semibold text-blue-400">Query Intake</h3>
      </div>
      
      {orchestrationResult?.query_intake && (
        <div className="bg-gray-800 rounded-lg p-4 space-y-4">
          <div>
            <h4 className="font-medium text-white mb-2 flex items-center gap-2">
              <Search className="h-4 w-4" />
              Parsed Input
            </h4>
            <div className="text-sm text-gray-300 bg-gray-700 p-3 rounded">
              <div className="mb-2"><strong>Raw Query:</strong> {orchestrationResult.query_intake.parsed_input.raw_query}</div>
              <div className="mb-2"><strong>Query Type:</strong> {orchestrationResult.query_intake.parsed_input.query_type}</div>
              <div className="mb-2"><strong>Query Length:</strong> {orchestrationResult.query_intake.parsed_input.query_length} characters</div>
              <div className="mb-2"><strong>Word Count:</strong> {orchestrationResult.query_intake.parsed_input.query_words} words</div>
              <div className="mb-2"><strong>Has Numbers:</strong> {orchestrationResult.query_intake.parsed_input.has_numbers ? 'Yes' : 'No'}</div>
              <div className="mb-2"><strong>Has Math Operators:</strong> {orchestrationResult.query_intake.parsed_input.has_math_operators ? 'Yes' : 'No'}</div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-white mb-2 flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Orchestration Context
            </h4>
            <div className="text-sm text-gray-300 bg-gray-700 p-3 rounded">
              <div className="mb-2"><strong>Session ID:</strong> {orchestrationResult.query_intake.orchestration_context.session_id}</div>
              <div className="mb-2"><strong>Orchestration Type:</strong> {orchestrationResult.query_intake.orchestration_context.orchestration_type}</div>
              <div className="mb-2"><strong>Context Initialized:</strong> {orchestrationResult.query_intake.orchestration_context.context_initialized ? 'Yes' : 'No'}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderStageExecution = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">2</div>
        <h3 className="text-lg font-semibold text-purple-400">Stage Execution (Sequential)</h3>
      </div>
      
      {orchestrationResult?.stage_execution?.stages && (
        <div className="space-y-4">
          {Object.entries(orchestrationResult.stage_execution.stages).map(([stageKey, stage]: [string, any], index) => {
            const stageNumber = index + 1;
            const isExpanded = expandedStages.has(stageNumber);
            
            return (
              <div key={stageKey} className="bg-gray-800 rounded-lg p-4">
                <div 
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleStageExpansion(stageNumber)}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {stageNumber}
                    </div>
                    <h4 className="font-medium text-white">
                      {stageKey.replace('stage_', '').replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="bg-green-600">
                      {stage.status}
                    </Badge>
                    {isExpanded ? <ArrowDown className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                  </div>
                </div>
                
                {isExpanded && (
                  <div className="mt-4 space-y-3">
                    <div className="p-3 bg-purple-900/20 rounded border border-purple-500/30">
                      <div className="text-xs text-purple-300 font-medium mb-1">LLM Reasoning:</div>
                      <div className="text-xs text-purple-200 whitespace-pre-wrap">{stage.llm_reasoning}</div>
                    </div>
                    
                    <div className="text-sm text-gray-300">
                      <div className="mb-2"><strong>Output:</strong></div>
                      <div className="bg-gray-700 p-3 rounded">
                        <pre className="text-xs text-gray-200 whitespace-pre-wrap">
                          {JSON.stringify(stage.output, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderAgentExecution = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold">3</div>
        <h3 className="text-lg font-semibold text-orange-400">Agent Execution (Based on Strategy)</h3>
      </div>
      
      {orchestrationResult?.agent_execution && (
        <div className="space-y-4">
          {/* Handover Steps */}
          <div>
            <h4 className="font-medium text-white mb-3 flex items-center gap-2">
              <Network className="h-4 w-4" />
              Sequential Handover Steps
            </h4>
            <div className="space-y-3">
              {orchestrationResult.agent_execution.handover_steps?.map((step: any, index: number) => (
                <div key={index} className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-6 h-6 bg-orange-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {step.step}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-orange-400 font-medium">{step.from_agent}</span>
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                      <span className="text-orange-400 font-medium">{step.to_agent}</span>
                    </div>
                    <Badge variant={step.status === 'success' ? 'default' : 'destructive'} className="ml-auto">
                      {step.status}
                    </Badge>
                  </div>
                  
                  <div className="text-sm text-gray-300 space-y-2">
                    <div><strong>Context Passed:</strong> {step.context_passed}</div>
                    <div><strong>Expected Output:</strong> {step.expected_output}</div>
                    {step.actual_output && <div><strong>Actual Output:</strong> {step.actual_output}</div>}
                    <div><strong>Execution Time:</strong> {step.execution_time}s</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Agent Outputs */}
          <div>
            <h4 className="font-medium text-white mb-3 flex items-center gap-2">
              <Cpu className="h-4 w-4" />
              Agent Outputs
            </h4>
            <div className="space-y-3">
              {orchestrationResult.agent_execution.agent_outputs?.map((output: any, index: number) => (
                <div key={index} className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Cpu className="h-4 w-4 text-green-400" />
                    <span className="font-medium text-green-400">{output.agent_name}</span>
                    <Badge variant="default" className="bg-green-600 ml-auto">
                      Completed
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs text-blue-300 font-medium mb-1">Thinking Process:</div>
                      <div className="text-xs text-blue-200 bg-blue-900/20 p-2 rounded border border-blue-500/30 whitespace-pre-wrap">
                        {output.thinking_process}
                      </div>
                    </div>
                    
                    {output.tool_executions?.length > 0 && (
                      <div>
                        <div className="text-xs text-green-300 font-medium mb-1">Tool Executions:</div>
                        {output.tool_executions.map((tool: any, toolIndex: number) => (
                          <div key={toolIndex} className="text-xs text-green-200 bg-green-900/20 p-2 rounded border border-green-500/30 mb-2">
                            <div><strong>Tool:</strong> {tool.tool_name}</div>
                            <div><strong>Input:</strong> {tool.input}</div>
                            <div><strong>Output:</strong> {tool.output}</div>
                            <div><strong>Status:</strong> {tool.status}</div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div>
                      <div className="text-xs text-white font-medium mb-1">Final Response:</div>
                      <div className="text-sm text-gray-200 bg-gray-700 p-3 rounded whitespace-pre-wrap">
                        {output.final_response}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderSynthesis = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">4</div>
        <h3 className="text-lg font-semibold text-green-400">Synthesis</h3>
      </div>
      
      {orchestrationResult?.synthesis && (
        <div className="bg-gray-800 rounded-lg p-4 space-y-4">
          <div>
            <h4 className="font-medium text-white mb-2 flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Orchestrator Reasoning
            </h4>
            <div className="text-sm text-gray-300 bg-gray-700 p-3 rounded">
              <div className="p-2 bg-green-900/20 rounded border border-green-500/30">
                <div className="text-xs text-green-300 font-medium mb-1">LLM Synthesis Reasoning:</div>
                <div className="text-xs text-green-200 whitespace-pre-wrap">{orchestrationResult.synthesis.orchestrator_reasoning}</div>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-white mb-2 flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Combined Response
            </h4>
            <div className="text-sm text-gray-300 bg-gray-700 p-3 rounded">
              <div className="whitespace-pre-wrap">{orchestrationResult.synthesis.combined_response}</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-white mb-2">Synthesis Logic</h4>
              <div className="text-sm text-gray-300 bg-gray-700 p-3 rounded">
                {orchestrationResult.synthesis.synthesis_logic}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-white mb-2">Quality Assessment</h4>
              <div className="text-sm text-gray-300 bg-gray-700 p-3 rounded">
                <Badge variant="default" className="bg-green-600">
                  {orchestrationResult.synthesis.quality_assessment}
                </Badge>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-white mb-2">Confidence Score</h4>
            <div className="text-sm text-gray-300 bg-gray-700 p-3 rounded">
              <div className="flex items-center gap-2">
                <div className="w-full bg-gray-600 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${orchestrationResult.synthesis.confidence_score * 100}%` }}
                  ></div>
                </div>
                <span className="text-green-400 font-bold">
                  {(orchestrationResult.synthesis.confidence_score * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Execution Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-3 bg-gray-800 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {orchestrationResult?.execution_summary?.agents_coordinated || 0}
          </div>
          <div className="text-sm text-gray-400">Agents Coordinated</div>
        </div>
        <div className="text-center p-3 bg-gray-800 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">
            {orchestrationResult?.execution_summary?.stages_completed || 0}
          </div>
          <div className="text-sm text-gray-400">Stages Completed</div>
        </div>
        <div className="text-center p-3 bg-gray-800 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">
            {orchestrationResult?.processing_time?.toFixed(2) || 0}s
          </div>
          <div className="text-sm text-gray-400">Processing Time</div>
        </div>
        <div className="text-center p-3 bg-gray-800 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">
            {(orchestrationResult?.execution_summary?.confidence_score * 100)?.toFixed(0) || 0}%
          </div>
          <div className="text-sm text-gray-400">Confidence Score</div>
        </div>
      </div>

      {/* Workflow Status */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-white mb-4">Workflow Status</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <span className="text-white">1. Query Intake</span>
            <Badge variant="default" className="bg-green-600 ml-auto">Completed</Badge>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <span className="text-white">2. Stage Execution (6 stages)</span>
            <Badge variant="default" className="bg-green-600 ml-auto">Completed</Badge>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <span className="text-white">3. Agent Execution</span>
            <Badge variant="default" className="bg-green-600 ml-auto">Completed</Badge>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <span className="text-white">4. Synthesis</span>
            <Badge variant="default" className="bg-green-600 ml-auto">Completed</Badge>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Card className="w-full bg-gray-900 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-400" />
          Optimized Agent Orchestration
        </CardTitle>
        <CardDescription className="text-gray-400">
          Standardized workflow pattern: Query Intake → Stage Execution → Agent Execution → Synthesis
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {orchestrationResult ? (
          <div className="space-y-6">
            {/* Navigation Tabs */}
            <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'query-intake', label: 'Query Intake', icon: Search },
                { id: 'stage-execution', label: 'Stage Execution', icon: Workflow },
                { id: 'agent-execution', label: 'Agent Execution', icon: Network },
                { id: 'synthesis', label: 'Synthesis', icon: Brain }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveSection(id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeSection === id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>

            {/* Content based on active section */}
            {activeSection === 'overview' && renderOverview()}
            {activeSection === 'query-intake' && renderQueryIntake()}
            {activeSection === 'stage-execution' && renderStageExecution()}
            {activeSection === 'agent-execution' && renderAgentExecution()}
            {activeSection === 'synthesis' && renderSynthesis()}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-4">
              <Sparkles className="h-12 w-12 mx-auto mb-4" />
              <p>No orchestration data available</p>
              <p className="text-sm">Execute a query to see the optimized workflow</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
