import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Play, 
  Brain, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Activity,
  Zap,
  Target,
  ArrowRight,
  Loader2,
  BarChart3,
  Settings
} from 'lucide-react';

interface ContextualAnalysisResult {
  success: boolean;
  timestamp: string;
  query: string;
  step_1_contextual_reasoning: {
    user_intent: string;
    context_clues: string[];
    complexity_level: string;
    urgency: string;
    dependencies: string[];
    success_criteria: string;
    potential_challenges: string[];
    reasoning_confidence: number;
  };
  step_2_domain_analysis: {
    primary_domain: string;
    secondary_domains: string[];
    cross_domain: boolean;
    technical_level: string;
    domain_specific_terms: string[];
    required_expertise: string[];
    domain_confidence: number;
  };
  step_3_task_classification: {
    task_type: string;
    execution_complexity: string;
    coordination_requirements: string;
    timing_constraints: string;
    requires_multiple_agents: boolean;
    estimated_agent_count: number;
    reasoning: string;
    confidence: number;
  };
  step_4_sequence_definition: {
    execution_steps: Array<{
      step_number: number;
      step_name: string;
      description: string;
      required_inputs: string[];
      expected_outputs: string[];
      dependencies: string[];
      can_parallelize: boolean;
      estimated_duration: string;
      complexity: string;
      required_expertise: string[];
    }>;
    overall_sequence_type: string;
    critical_path: string[];
    parallel_opportunities: string[];
    total_estimated_duration: string;
    success_metrics: string[];
  };
  orchestration_summary: {
    complexity_level: string;
    primary_domain: string;
    task_type: string;
    estimated_steps: number;
    requires_multiple_agents: boolean;
  };
}

export const ContextualQueryAnalyzer: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ContextualAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyzeQuery = async () => {
    if (!query.trim()) return;

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('http://localhost:5016/api/contextual-analyzer/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: query.trim() }),
      });

      const data = await response.json();
      
      if (data.success) {
        setResult(data);
      } else {
        setError(data.error || 'Analysis failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getComplexityColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'simple': return 'bg-green-500';
      case 'moderate': return 'bg-yellow-500';
      case 'complex': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getTaskTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'direct': return 'bg-blue-500';
      case 'sequential': return 'bg-purple-500';
      case 'parallel': return 'bg-orange-500';
      case 'hybrid': return 'bg-pink-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Query Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-400" />
            Contextual Query Analyzer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter your query (e.g., 'Help me debug a Python script')"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && analyzeQuery()}
                disabled={isAnalyzing}
                className="flex-1"
              />
              <Button
                onClick={analyzeQuery}
                disabled={!query.trim() || isAnalyzing}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Analyze
                  </>
                )}
              </Button>
            </div>
            
            {error && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {result && (
        <div className="space-y-6">
          {/* Orchestration Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-green-400" />
                Orchestration Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">
                    {result.orchestration_summary.estimated_steps}
                  </div>
                  <div className="text-sm text-gray-400">Steps</div>
                </div>
                <div className="text-center">
                  <Badge className={`${getComplexityColor(result.orchestration_summary.complexity_level)} text-white`}>
                    {result.orchestration_summary.complexity_level}
                  </Badge>
                  <div className="text-sm text-gray-400 mt-1">Complexity</div>
                </div>
                <div className="text-center">
                  <Badge className={`${getTaskTypeColor(result.orchestration_summary.task_type)} text-white`}>
                    {result.orchestration_summary.task_type}
                  </Badge>
                  <div className="text-sm text-gray-400 mt-1">Task Type</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">
                    {result.orchestration_summary.requires_multiple_agents ? 'Yes' : 'No'}
                  </div>
                  <div className="text-sm text-gray-400">Multi-Agent</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 1: Contextual Reasoning */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-blue-400" />
                Step 1: Contextual Reasoning
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-white mb-2">User Intent</h4>
                  <p className="text-gray-300">{result.step_1_contextual_reasoning.user_intent}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-white mb-2">Context Clues</h4>
                  <div className="space-y-1">
                    {result.step_1_contextual_reasoning.context_clues.map((clue, index) => (
                      <div key={index} className="text-sm text-gray-300 flex items-start gap-2">
                        <span className="text-blue-400">•</span>
                        <span>{clue}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-white mb-2">Dependencies</h4>
                    <div className="space-y-1">
                      {result.step_1_contextual_reasoning.dependencies.map((dep, index) => (
                        <div key={index} className="text-sm text-gray-300 flex items-start gap-2">
                          <span className="text-yellow-400">•</span>
                          <span>{dep}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-white mb-2">Potential Challenges</h4>
                    <div className="space-y-1">
                      {result.step_1_contextual_reasoning.potential_challenges.map((challenge, index) => (
                        <div key={index} className="text-sm text-gray-300 flex items-start gap-2">
                          <span className="text-red-400">•</span>
                          <span>{challenge}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 2: Domain Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-400" />
                Step 2: Domain Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-white mb-2">Primary Domain</h4>
                    <Badge className="bg-purple-500 text-white">
                      {result.step_2_domain_analysis.primary_domain}
                    </Badge>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-white mb-2">Technical Level</h4>
                    <Badge className="bg-blue-500 text-white">
                      {result.step_2_domain_analysis.technical_level}
                    </Badge>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-white mb-2">Required Expertise</h4>
                  <div className="flex flex-wrap gap-2">
                    {result.step_2_domain_analysis.required_expertise.map((expertise, index) => (
                      <Badge key={index} variant="outline" className="text-gray-300">
                        {expertise}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 3: Task Classification */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-orange-400" />
                Step 3: Task Classification
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-white mb-2">Task Type</h4>
                    <Badge className={`${getTaskTypeColor(result.step_3_task_classification.task_type)} text-white`}>
                      {result.step_3_task_classification.task_type}
                    </Badge>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-white mb-2">Execution Complexity</h4>
                    <Badge className={`${getComplexityColor(result.step_3_task_classification.execution_complexity)} text-white`}>
                      {result.step_3_task_classification.execution_complexity}
                    </Badge>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-white mb-2">Reasoning</h4>
                  <p className="text-gray-300 text-sm">{result.step_3_task_classification.reasoning}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 4: Sequence Definition */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowRight className="h-5 w-5 text-green-400" />
                Step 4: Execution Sequence
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-white mb-2">Total Duration</h4>
                    <Badge className="bg-green-500 text-white">
                      {result.step_4_sequence_definition.total_estimated_duration}
                    </Badge>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-white mb-2">Sequence Type</h4>
                    <Badge className="bg-blue-500 text-white">
                      {result.step_4_sequence_definition.overall_sequence_type}
                    </Badge>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-white mb-2">Execution Steps</h4>
                  <div className="space-y-3">
                    {result.step_4_sequence_definition.execution_steps.map((step, index) => (
                      <div key={index} className="border border-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-semibold text-white">
                            Step {step.step_number}: {step.step_name}
                          </h5>
                          <div className="flex gap-2">
                            <Badge className={`${getComplexityColor(step.complexity)} text-white`}>
                              {step.complexity}
                            </Badge>
                            <Badge variant="outline" className="text-gray-300">
                              {step.estimated_duration}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-gray-300 text-sm mb-2">{step.description}</p>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <span className="text-gray-400">Inputs: </span>
                            <span className="text-gray-300">{step.required_inputs.join(', ')}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Outputs: </span>
                            <span className="text-gray-300">{step.expected_outputs.join(', ')}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};



