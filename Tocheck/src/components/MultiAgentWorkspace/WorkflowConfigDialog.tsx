import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  ArrowRight, 
  Users, 
  Eye, 
  GitBranch, 
  Database, 
  Shield,
  Code,
  Plus,
  Trash2,
  Edit
} from 'lucide-react';

interface WorkflowConfigDialogProps {
  isOpen: boolean;
  onClose: () => void;
  nodeType: string;
  nodeData: any;
  onSave: (config: any) => void;
}

// LangGraph-based workflow configuration patterns
const HANDOFF_PATTERNS = {
  'expertise-based': {
    name: 'Expertise-Based Handoff',
    description: 'Route based on agent domain expertise and capabilities',
    code: `def get_next_agent(state) -> str:
    task_domain = analyze_task_domain(state["messages"][-1])
    best_agent = find_expert_agent(task_domain)
    return best_agent.id if best_agent.confidence > 0.8 else "human"`
  },
  'workload-balanced': {
    name: 'Workload-Balanced Handoff',
    description: 'Distribute tasks based on current agent workload',
    code: `def get_next_agent(state) -> str:
    available_agents = get_available_agents()
    least_loaded = min(available_agents, key=lambda a: a.current_load)
    return least_loaded.id if least_loaded.current_load < MAX_LOAD else "human"`
  },
  'confidence-threshold': {
    name: 'Confidence-Based Handoff',
    description: 'Hand off when agent confidence drops below threshold',
    code: `def get_next_agent(state) -> str:
    current_confidence = state.get("confidence", 0.0)
    if current_confidence < CONFIDENCE_THRESHOLD:
        return find_specialist_agent(state["task_type"])
    return "continue"`
  }
};

const DECISION_PATTERNS = {
  'condition-based': {
    name: 'Condition-Based Routing',
    description: 'Route based on specific conditions in the state',
    code: `def decision_node(state) -> Command[Literal["agent_a", "agent_b", "human"]]:
    if state["error_count"] > MAX_ERRORS:
        return Command(goto="human")
    elif state["task_complexity"] > COMPLEXITY_THRESHOLD:
        return Command(goto="agent_b")  # Specialist agent
    else:
        return Command(goto="agent_a")  # General agent`
  },
  'multi-criteria': {
    name: 'Multi-Criteria Decision',
    description: 'Weighted decision based on multiple factors',
    code: `def decision_node(state) -> Command:
    score_a = calculate_agent_score("agent_a", state)
    score_b = calculate_agent_score("agent_b", state)
    
    if max(score_a, score_b) < MIN_CONFIDENCE:
        return Command(goto="human")
    
    return Command(goto="agent_a" if score_a > score_b else "agent_b")`
  }
};

const AGGREGATION_PATTERNS = {
  'consensus': {
    name: 'Consensus Aggregation',
    description: 'Require agreement from multiple agents',
    code: `def aggregator_node(state) -> Command:
    responses = state["agent_responses"]
    consensus = calculate_consensus(responses)
    
    if consensus.confidence > CONSENSUS_THRESHOLD:
        return Command(
            update={"final_response": consensus.response},
            goto="human"
        )
    else:
        return Command(goto="escalation_agent")`
  },
  'weighted-average': {
    name: 'Weighted Average',
    description: 'Weight responses based on agent expertise',
    code: `def aggregator_node(state) -> Command:
    responses = state["agent_responses"]
    weights = [get_agent_weight(r.agent_id) for r in responses]
    
    final_response = weighted_average(responses, weights)
    return Command(
        update={"final_response": final_response},
        goto="human"
    )`
  }
};

export const WorkflowConfigDialog: React.FC<WorkflowConfigDialogProps> = ({
  isOpen,
  onClose,
  nodeType,
  nodeData,
  onSave
}) => {
  const [config, setConfig] = useState(nodeData?.config || {});
  const [selectedPattern, setSelectedPattern] = useState('');
  const [customCode, setCustomCode] = useState('');

  const getPatterns = () => {
    switch (nodeType) {
      case 'handoff':
        return HANDOFF_PATTERNS;
      case 'decision':
        return DECISION_PATTERNS;
      case 'aggregator':
        return AGGREGATION_PATTERNS;
      default:
        return {};
    }
  };

  const patterns = getPatterns();

  const handlePatternSelect = (patternKey: string) => {
    setSelectedPattern(patternKey);
    setCustomCode(patterns[patternKey]?.code || '');
    setConfig({
      ...config,
      pattern: patternKey,
      code: patterns[patternKey]?.code || ''
    });
  };

  const handleSave = () => {
    onSave({
      ...config,
      pattern: selectedPattern,
      code: customCode
    });
    onClose();
  };

  const renderHandoffConfig = () => (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-gray-300 mb-2 block">
          Handoff Strategy
        </label>
        <select 
          className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
          value={config.strategy || 'automatic'}
          onChange={(e) => setConfig({...config, strategy: e.target.value})}
        >
          <option value="automatic">Automatic</option>
          <option value="manual">Manual</option>
          <option value="hybrid">Hybrid</option>
        </select>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-300 mb-2 block">
          Confidence Threshold
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={config.confidenceThreshold || 0.8}
          onChange={(e) => setConfig({...config, confidenceThreshold: parseFloat(e.target.value)})}
          className="w-full"
        />
        <div className="text-xs text-gray-400 mt-1">
          Current: {(config.confidenceThreshold || 0.8) * 100}%
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-300 mb-2 block">
          Context Preservation
        </label>
        <select 
          className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
          value={config.contextPreservation || 'full'}
          onChange={(e) => setConfig({...config, contextPreservation: e.target.value})}
        >
          <option value="full">Full Context</option>
          <option value="summary">Summary Only</option>
          <option value="minimal">Minimal</option>
        </select>
      </div>
    </div>
  );

  const renderDecisionConfig = () => (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-gray-300 mb-2 block">
          Evaluation Mode
        </label>
        <select 
          className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
          value={config.evaluationMode || 'weighted'}
          onChange={(e) => setConfig({...config, evaluationMode: e.target.value})}
        >
          <option value="all">All Conditions Must Pass</option>
          <option value="any">Any Condition Passes</option>
          <option value="weighted">Weighted Scoring</option>
        </select>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-300 mb-2 block">
          Decision Conditions
        </label>
        <div className="space-y-2">
          {(config.conditions || []).map((condition: any, index: number) => (
            <div key={index} className="flex items-center gap-2 p-2 bg-gray-800 rounded">
              <input
                type="text"
                placeholder="Condition"
                value={condition.field || ''}
                onChange={(e) => {
                  const newConditions = [...(config.conditions || [])];
                  newConditions[index] = {...condition, field: e.target.value};
                  setConfig({...config, conditions: newConditions});
                }}
                className="flex-1 p-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
              />
              <select
                value={condition.operator || 'equals'}
                onChange={(e) => {
                  const newConditions = [...(config.conditions || [])];
                  newConditions[index] = {...condition, operator: e.target.value};
                  setConfig({...config, conditions: newConditions});
                }}
                className="p-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
              >
                <option value="equals">=</option>
                <option value="greater">></option>
                <option value="less">&lt;</option>
                <option value="contains">contains</option>
              </select>
              <input
                type="text"
                placeholder="Value"
                value={condition.value || ''}
                onChange={(e) => {
                  const newConditions = [...(config.conditions || [])];
                  newConditions[index] = {...condition, value: e.target.value};
                  setConfig({...config, conditions: newConditions});
                }}
                className="w-20 p-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const newConditions = (config.conditions || []).filter((_: any, i: number) => i !== index);
                  setConfig({...config, conditions: newConditions});
                }}
                className="h-6 w-6 p-0 text-red-400 hover:text-red-300"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const newConditions = [...(config.conditions || []), {field: '', operator: 'equals', value: ''}];
              setConfig({...config, conditions: newConditions});
            }}
            className="w-full"
          >
            <Plus className="h-3 w-3 mr-1" />
            Add Condition
          </Button>
        </div>
      </div>
    </div>
  );

  const renderAggregatorConfig = () => (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-gray-300 mb-2 block">
          Aggregation Method
        </label>
        <select 
          className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
          value={config.method || 'consensus'}
          onChange={(e) => setConfig({...config, method: e.target.value})}
        >
          <option value="consensus">Consensus</option>
          <option value="weighted-average">Weighted Average</option>
          <option value="majority-vote">Majority Vote</option>
          <option value="expert-override">Expert Override</option>
        </select>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-300 mb-2 block">
          Minimum Responses Required
        </label>
        <input
          type="number"
          min="1"
          max="10"
          value={config.minimumResponses || 2}
          onChange={(e) => setConfig({...config, minimumResponses: parseInt(e.target.value)})}
          className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-300 mb-2 block">
          Conflict Resolution
        </label>
        <select 
          className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
          value={config.conflictResolution || 'escalate'}
          onChange={(e) => setConfig({...config, conflictResolution: e.target.value})}
        >
          <option value="escalate">Escalate to Human</option>
          <option value="default">Use Default Response</option>
          <option value="human-review">Request Human Review</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="confidenceWeighting"
          checked={config.confidenceWeighting || false}
          onChange={(e) => setConfig({...config, confidenceWeighting: e.target.checked})}
          className="rounded"
        />
        <label htmlFor="confidenceWeighting" className="text-sm text-gray-300">
          Use confidence weighting
        </label>
      </div>
    </div>
  );

  const renderConfig = () => {
    switch (nodeType) {
      case 'handoff':
        return renderHandoffConfig();
      case 'decision':
        return renderDecisionConfig();
      case 'aggregator':
        return renderAggregatorConfig();
      default:
        return <div className="text-gray-400">No configuration available for this node type.</div>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-beam-dark border-gray-700 max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-400" />
            Configure {nodeType.charAt(0).toUpperCase() + nodeType.slice(1)} Node
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="config" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-beam-dark">
            <TabsTrigger value="config">Configuration</TabsTrigger>
            <TabsTrigger value="patterns">Patterns</TabsTrigger>
            <TabsTrigger value="code">Custom Code</TabsTrigger>
          </TabsList>

          <TabsContent value="config" className="space-y-4 mt-4">
            {renderConfig()}
          </TabsContent>

          <TabsContent value="patterns" className="space-y-4 mt-4">
            <div className="text-sm text-gray-400 mb-4">
              Choose from pre-built LangGraph patterns for {nodeType} nodes:
            </div>
            
            <div className="grid gap-3">
              {Object.entries(patterns).map(([key, pattern]) => (
                <Card
                  key={key}
                  className={`p-3 cursor-pointer transition-colors ${
                    selectedPattern === key 
                      ? 'bg-blue-500/20 border-blue-500' 
                      : 'bg-gray-800 border-gray-600 hover:border-gray-500'
                  }`}
                  onClick={() => handlePatternSelect(key)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-white mb-1">
                        {pattern.name}
                      </h3>
                      <p className="text-xs text-gray-400">
                        {pattern.description}
                      </p>
                    </div>
                    {selectedPattern === key && (
                      <Badge className="bg-blue-500 text-white">Selected</Badge>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="code" className="space-y-4 mt-4">
            <div className="text-sm text-gray-400 mb-4">
              Customize the node behavior with Python code (LangGraph format):
            </div>
            
            <div className="space-y-4">
              <textarea
                value={customCode}
                onChange={(e) => setCustomCode(e.target.value)}
                placeholder="Enter your custom Python code here..."
                className="w-full h-64 p-3 bg-gray-900 border border-gray-600 rounded text-white font-mono text-sm"
              />
              
              <div className="text-xs text-gray-500">
                <strong>Available variables:</strong> state, Command, Literal
                <br />
                <strong>Return format:</strong> Command[Literal["agent_name", "human"]]
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-700">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
            Save Configuration
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};