import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  RefreshCw,
  X,
  Target,
  Activity,
  Database,
  Server,
  Code,
  Shield,
  Layers,
  Users,
  ArrowRight,
  Play,
  Loader2
} from 'lucide-react';

interface OrchestrationStep {
  step: number;
  agent_name: string;
  agent_id: string;
  a2a_status: string;
  execution_time: number;
  result: string;
  error?: string;
}

interface OrchestrationResult {
  success: boolean;
  session_id: string;
  orchestration_summary: {
    execution_strategy: string;
    stages_completed: number;
    total_stages: number;
    processing_time: number;
  };
  execution_details: {
    success: boolean;
    execution_time: number;
    agent_response_length: number;
  };
  raw_agent_response: {
    orchestration_type: string;
    agents_coordinated: number;
    success: boolean;
    execution_time: number;
    coordination_results: {
      handover_steps: OrchestrationStep[];
      successful_steps: number;
      a2a_framework: boolean;
      strands_integration: boolean;
    };
  };
  final_response: string;
  error?: string;
}

export const WorkingA2AOrchestration: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isOrchestrating, setIsOrchestrating] = useState(false);
  const [result, setResult] = useState<OrchestrationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<string>('');

  const handleOrchestrate = async () => {
    if (!query.trim()) return;

    setIsOrchestrating(true);
    setError(null);
    setResult(null);
    setCurrentStep('Initializing A2A orchestration...');

    try {
      // Use our working enhanced orchestration API
      const response = await fetch('http://localhost:5014/api/enhanced-orchestration/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query.trim(),
          contextual_analysis: {
            success: true,
            user_intent: "Multi-agent collaboration request",
            domain_analysis: {
              primary_domain: "Multi-Agent",
              technical_level: "intermediate"
            },
            orchestration_pattern: "sequential"
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data);
        setCurrentStep('Orchestration completed successfully!');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Orchestration failed');
        setCurrentStep('Orchestration failed');
      }
    } catch (err) {
      setError('Error connecting to orchestration service');
      setCurrentStep('Connection error');
      console.error('Orchestration error:', err);
    } finally {
      setIsOrchestrating(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <X className="h-4 w-4 text-red-500" />;
      default: return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-500 bg-green-50 border-green-200';
      case 'failed': return 'text-red-500 bg-red-50 border-red-200';
      default: return 'text-blue-500 bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Query Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Working A2A Multi-Agent Orchestration
          </CardTitle>
          <CardDescription>
            Test the integrated A2A orchestration with your configured agents
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Enter your query (e.g., 'I want to learn how to write a poem about Python programming and then create Python code to generate that poem')"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="min-h-[100px]"
          />
          <Button 
            onClick={handleOrchestrate} 
            disabled={isOrchestrating || !query.trim()}
            className="w-full"
          >
            {isOrchestrating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Orchestrating...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Start A2A Orchestration
              </>
            )}
          </Button>
          
          {currentStep && (
            <div className="text-sm text-muted-foreground">
              <Activity className="inline h-4 w-4 mr-2" />
              {currentStep}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Orchestration Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="summary" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="steps">Steps</TabsTrigger>
                <TabsTrigger value="response">Response</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
              </TabsList>
              
              <TabsContent value="summary" className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {result.orchestration_summary?.stages_completed || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Stages Completed</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {result.raw_agent_response?.agents_coordinated || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Agents Coordinated</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {result.execution_details?.execution_time?.toFixed(2) || 0}s
                    </div>
                    <div className="text-sm text-muted-foreground">Execution Time</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {result.raw_agent_response?.coordination_results?.successful_steps || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Successful Steps</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={result.success ? "default" : "destructive"}>
                      {result.success ? "Success" : "Failed"}
                    </Badge>
                    <Badge variant="outline">
                      {result.raw_agent_response?.orchestration_type || "Unknown"}
                    </Badge>
                    <Badge variant="outline">
                      Session: {result.session_id}
                    </Badge>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="steps" className="space-y-4">
                {result.raw_agent_response?.coordination_results?.handover_steps?.map((step, index) => (
                  <Card key={index} className={`border-l-4 ${
                    step.a2a_status === 'success' ? 'border-l-green-500' : 'border-l-red-500'
                  }`}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                          {getStatusIcon(step.a2a_status)}
                          Step {step.step}: {step.agent_name}
                        </CardTitle>
                        <Badge variant="outline" className={getStatusColor(step.a2a_status)}>
                          {step.a2a_status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="text-sm text-muted-foreground">
                        Agent ID: {step.agent_id}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Execution Time: {step.execution_time?.toFixed(2)}s
                      </div>
                      {step.result && (
                        <div className="mt-2 p-3 bg-muted rounded-md">
                          <div className="text-sm font-medium mb-1">Response:</div>
                          <div className="text-sm whitespace-pre-wrap max-h-32 overflow-y-auto">
                            {step.result.substring(0, 500)}
                            {step.result.length > 500 && "..."}
                          </div>
                        </div>
                      )}
                      {step.error && (
                        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                          <div className="text-sm font-medium text-red-700 mb-1">Error:</div>
                          <div className="text-sm text-red-600">{step.error}</div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
              
              <TabsContent value="response" className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-sm font-medium mb-2">Final Response:</div>
                  <div className="text-sm whitespace-pre-wrap max-h-96 overflow-y-auto">
                    {result.final_response}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="details" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Orchestration Summary</h4>
                    <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                      {JSON.stringify(result.orchestration_summary, null, 2)}
                    </pre>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Execution Details</h4>
                    <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                      {JSON.stringify(result.execution_details, null, 2)}
                    </pre>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Raw Agent Response</h4>
                    <pre className="text-xs bg-muted p-3 rounded overflow-x-auto max-h-64 overflow-y-auto">
                      {JSON.stringify(result.raw_agent_response, null, 2)}
                    </pre>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700 flex items-center gap-2">
              <X className="h-5 w-5" />
              Orchestration Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
