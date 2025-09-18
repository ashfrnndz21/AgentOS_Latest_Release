
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, BrainCircuit, AlertCircle, CheckCircle2, BarChart4, Shield, Info, Target, Wrench, Database, Route } from 'lucide-react';
import { ConversationMessage } from './conversation/types';
import { ReasoningOutput } from '@/components/AgentWorkspace/types';

interface NodeDetailsProps {
  selectedNode: string | null;
  decisionNodes: any[];
  lineageNodes: any[];
  selectedNodeMessages: ConversationMessage[];
  reasoningOutput?: ReasoningOutput;
}

export const NodeDetails: React.FC<NodeDetailsProps> = ({
  selectedNode,
  decisionNodes,
  lineageNodes,
  selectedNodeMessages,
  reasoningOutput
}) => {
  if (!selectedNode) return null;
  
  const node = decisionNodes.find(n => n.id === selectedNode) || lineageNodes.find(n => n.id === selectedNode);
  
  if (!node) return null;
  
  console.log("Node details rendering for:", selectedNode);
  console.log("Reasoning output in NodeDetails:", reasoningOutput);
  
  // Check if this node has guardrail activations
  const hasGuardrails = selectedNodeMessages.some(m => m.type === 'guardrail');
  const guardrailMessages = selectedNodeMessages.filter(m => m.type === 'guardrail');
  
  // Get the unique guardrail types that were triggered
  const triggeredGuardrailTypes = [...new Set(guardrailMessages.map(m => m.guardrailType))];
  
  return (
    <Card className="bg-beam-dark/70 border border-gray-700/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-md font-medium text-white">Selected Node Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-blue-900/20 rounded-lg border border-blue-700/30">
          <h3 className="text-md font-medium text-blue-300 mb-1">
            Node: {node.label}
          </h3>
          <p className="text-sm text-gray-300">
            {node.content}
          </p>
          
          {node.toolDetails && (
            <div className="mt-3 pt-3 border-t border-blue-700/30 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <h4 className="text-xs font-medium text-blue-300 mb-1">Tool Execution</h4>
                <p className="text-xs text-gray-300">
                  {node.toolDetails.executionTime && (
                    <span className="block">Execution Time: {node.toolDetails.executionTime}</span>
                  )}
                </p>
              </div>
              
              {node.toolDetails.databases && (
                <div>
                  <h4 className="text-xs font-medium text-blue-300 mb-1">Databases Accessed</h4>
                  <div className="flex flex-wrap gap-1">
                    {node.toolDetails.databases.map((db: string, idx: number) => (
                      <Badge key={idx} className="bg-blue-900/30 text-blue-300 border-blue-700/30 text-[10px]">
                        {db}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Conversation indicator */}
          {selectedNodeMessages.length > 0 && (
            <div className="mt-3 pt-3 border-t border-blue-700/30">
              <div className="flex items-center text-xs">
                <MessageSquare size={12} className="text-blue-300 mr-1" />
                <span className="text-blue-300">
                  {selectedNodeMessages.length} conversation messages
                </span>
                {hasGuardrails && (
                  <Badge className="ml-2 text-[10px] bg-amber-900/30 text-amber-300 border-amber-600/30">
                    Guardrail activated
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Feature Insight Section */}
        {hasGuardrails && (
          <div className="p-3 bg-indigo-900/20 rounded-lg border border-indigo-700/30">
            <div className="flex items-center gap-2 mb-2">
              <Info size={16} className="text-indigo-400" />
              <h3 className="text-md font-medium text-indigo-300">Feature Insight</h3>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-gray-300">
                This node triggered {guardrailMessages.length} guardrail {guardrailMessages.length === 1 ? 'activation' : 'activations'}.
              </p>
              
              <div className="flex flex-wrap gap-2 mt-2">
                {triggeredGuardrailTypes.map((type, index) => (
                  <div key={index} className="flex items-center">
                    <Badge className="bg-indigo-900/30 text-indigo-300 border-indigo-700/30">
                      {type === 'pii' 
                        ? 'PII Protection' 
                        : type === 'content'
                          ? 'Content Filter'
                          : 'Security Check'}
                    </Badge>
                    {index < triggeredGuardrailTypes.length - 1 && <span className="text-gray-500 mx-1">+</span>}
                  </div>
                ))}
              </div>
              
              <div className="mt-2 text-xs text-gray-400">
                <p>Guardrails help ensure AI outputs meet safety and compliance requirements.</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Guardrails Section */}
        {hasGuardrails && (
          <div className="p-3 bg-amber-900/20 rounded-lg border border-amber-700/30">
            <div className="flex items-center gap-2 mb-2">
              <Shield size={16} className="text-amber-400" />
              <h3 className="text-md font-medium text-amber-300">Guardrails Applied</h3>
            </div>
            
            <div className="space-y-3">
              {guardrailMessages.map((message, index) => (
                <div key={index} className="bg-amber-950/30 p-2 rounded border border-amber-800/30">
                  <div className="flex items-center justify-between mb-1">
                    <Badge className="text-[10px] bg-amber-900/30 text-amber-300 border-amber-600/30">
                      {message.guardrailType === 'pii' 
                        ? 'PII Protection' 
                        : message.guardrailType === 'content'
                          ? 'Content Filter'
                          : 'Security Check'}
                    </Badge>
                    <span className="text-[10px] text-gray-400">{message.timestamp}</span>
                  </div>
                  <p className="text-sm text-gray-300">{message.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Agent Reasoning Section */}
        {reasoningOutput && (
          <div className="p-3 bg-purple-900/20 rounded-lg border border-purple-700/30">
            <div className="flex items-center gap-2 mb-2">
              <BrainCircuit size={16} className="text-purple-400" />
              <h3 className="text-md font-medium text-purple-300">Agent Reasoning</h3>
              
              <Badge className="ml-auto bg-purple-900/30 text-purple-300 border-purple-700/30">
                {Math.round(reasoningOutput.confidence * 100)}% confidence
              </Badge>
            </div>
            
            <div className="space-y-3 mt-2">
              {reasoningOutput.objective && (
                <div>
                  <h4 className="text-xs font-medium text-blue-300 mb-1 flex items-center">
                    <Target size={12} className="mr-1" /> Objective
                  </h4>
                  <p className="text-sm text-gray-300 bg-blue-950/30 p-2 rounded border border-blue-800/30">
                    {reasoningOutput.objective}
                  </p>
                </div>
              )}
              
              <div>
                <h4 className="text-xs font-medium text-purple-300 mb-1 flex items-center">
                  <AlertCircle size={12} className="mr-1" /> Thought Process
                </h4>
                <p className="text-sm text-gray-300 bg-purple-950/30 p-2 rounded border border-purple-800/30">
                  "{reasoningOutput.thought}"
                </p>
              </div>
              
              <div>
                <h4 className="text-xs font-medium text-purple-300 mb-1 flex items-center">
                  <BarChart4 size={12} className="mr-1" /> Reasoning Steps
                </h4>
                <ul className="text-sm text-gray-300 space-y-1">
                  {reasoningOutput.reasoning.map((step, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-purple-400 mr-2">•</span>
                      <span className="flex-1">
                        {typeof step === 'string' ? step : step.step}
                      </span>
                      {typeof step !== 'string' && step.confidence !== undefined && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          {Math.round(step.confidence * 100)}%
                        </Badge>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
              
              {reasoningOutput.tools && reasoningOutput.tools.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-blue-300 mb-1 flex items-center">
                    <Wrench size={12} className="mr-1" /> Tools Used
                  </h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    {reasoningOutput.tools.map((tool, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-blue-400 mr-2">•</span>
                        <span>{tool}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {reasoningOutput.databases && reasoningOutput.databases.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-green-300 mb-1 flex items-center">
                    <Database size={12} className="mr-1" /> Databases Accessed
                  </h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    {reasoningOutput.databases.map((db, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-green-400 mr-2">•</span>
                        <span>{db}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {reasoningOutput.implementation && reasoningOutput.implementation.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-indigo-300 mb-1 flex items-center">
                    <Route size={12} className="mr-1" /> Implementation Plan
                  </h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    {reasoningOutput.implementation.map((step, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-indigo-400 mr-2">{index + 1}.</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div>
                <h4 className="text-xs font-medium text-amber-300 mb-1 flex items-center">
                  <AlertCircle size={12} className="mr-1" /> Constraints Applied
                </h4>
                <ul className="text-sm text-gray-300 space-y-1">
                  {reasoningOutput.constraints.map((constraint, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-amber-400 mr-2">•</span>
                      <span>{constraint}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="text-xs font-medium text-green-300 mb-1 flex items-center">
                  <CheckCircle2 size={12} className="mr-1" /> Verification
                </h4>
                <p className="text-sm text-gray-300 bg-green-950/30 p-2 rounded border border-green-800/30">
                  {reasoningOutput.verification}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
