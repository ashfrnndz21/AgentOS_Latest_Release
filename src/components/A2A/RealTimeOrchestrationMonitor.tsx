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
  EyeOff,
  Play,
  Pause
} from 'lucide-react';

interface OrchestrationStep {
  step_type: string;
  timestamp: string;
  elapsed_seconds: number;
  details: any;
}

export const RealTimeOrchestrationMonitor: React.FC = () => {
  const [question, setQuestion] = useState('');
  const [isOrchestrating, setIsOrchestrating] = useState(false);
  const [steps, setSteps] = useState<OrchestrationStep[]>([]);
  const [currentStep, setCurrentStep] = useState<string>('');
  const [showDetails, setShowDetails] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [finalResult, setFinalResult] = useState<any>(null);

  const simulateOrchestrationSteps = async (question: string) => {
    const steps: OrchestrationStep[] = [];
    let elapsed = 0;

    // Step 1: Orchestration Start
    const step1: OrchestrationStep = {
      step_type: 'ORCHESTRATION_START',
      timestamp: new Date().toISOString(),
      elapsed_seconds: elapsed,
      details: {
        task: question,
        user: 'Frontend User',
        session_id: `orch_${Date.now()}`
      }
    };
    steps.push(step1);
    setSteps([...steps]);
    setCurrentStep('Starting orchestration...');
    await sleep(500);

    // Step 2: Agent Discovery
    elapsed += 0.5;
    const step2: OrchestrationStep = {
      step_type: 'AGENT_DISCOVERY',
      timestamp: new Date().toISOString(),
      elapsed_seconds: elapsed,
      details: {
        registry_url: 'http://localhost:5010',
        discovering_agents: true
      }
    };
    steps.push(step2);
    setSteps([...steps]);
    setCurrentStep('Discovering available agents...');
    await sleep(800);

    // Step 3: Agent Discovery Results
    elapsed += 0.8;
    const step3: OrchestrationStep = {
      step_type: 'AGENT_DISCOVERY',
      timestamp: new Date().toISOString(),
      elapsed_seconds: elapsed,
      details: {
        agents_found: 5,
        available_agents: ['calculator', 'research', 'coordinator', 'weather', 'stock']
      }
    };
    steps.push(step3);
    setSteps([...steps]);
    setCurrentStep('Found 5 available agents');
    await sleep(600);

    // Step 4: Routing Decision
    elapsed += 0.6;
    const step4: OrchestrationStep = {
      step_type: 'ROUTING_DECISION',
      timestamp: new Date().toISOString(),
      elapsed_seconds: elapsed,
      details: {
        question: question,
        selected_agents: question.toLowerCase().includes('weather') ? ['weather', 'calculator'] : ['calculator'],
        routing_reasoning: 'Based on keyword analysis and agent capabilities'
      }
    };
    steps.push(step4);
    setSteps([...steps]);
    setCurrentStep('Analyzing question and selecting agents...');
    await sleep(700);

    // Step 5: Agent Contact
    elapsed += 0.7;
    const step5: OrchestrationStep = {
      step_type: 'AGENT_CONTACT',
      timestamp: new Date().toISOString(),
      elapsed_seconds: elapsed,
      details: {
        agent_id: 'weather',
        agent_name: 'Weather Agent',
        agent_url: 'http://localhost:8003',
        question: question
      }
    };
    steps.push(step5);
    setSteps([...steps]);
    setCurrentStep('Contacting Weather Agent...');
    await sleep(2000);

    // Step 6: Agent Response
    elapsed += 2.0;
    const step6: OrchestrationStep = {
      step_type: 'AGENT_RESPONSE',
      timestamp: new Date().toISOString(),
      elapsed_seconds: elapsed,
      details: {
        agent_id: 'weather',
        agent_name: 'Weather Agent',
        response_time: 2.0,
        status: 'success',
        response_preview: 'Weather analysis complete. Temperature data processed and mathematical models applied...'
      }
    };
    steps.push(step6);
    setSteps([...steps]);
    setCurrentStep('Weather Agent responded successfully');
    await sleep(1000);

    // Step 7: Second Agent Contact (if applicable)
    if (question.toLowerCase().includes('weather')) {
      elapsed += 1.0;
      const step7: OrchestrationStep = {
        step_type: 'AGENT_CONTACT',
        timestamp: new Date().toISOString(),
        elapsed_seconds: elapsed,
        details: {
          agent_id: 'calculator',
          agent_name: 'Calculator Agent',
          agent_url: 'http://localhost:8001',
          question: question
        }
      };
      steps.push(step7);
      setSteps([...steps]);
      setCurrentStep('Contacting Calculator Agent...');
      await sleep(1500);

      // Step 8: Second Agent Response
      elapsed += 1.5;
      const step8: OrchestrationStep = {
        step_type: 'AGENT_RESPONSE',
        timestamp: new Date().toISOString(),
        elapsed_seconds: elapsed,
        details: {
          agent_id: 'calculator',
          agent_name: 'Calculator Agent',
          response_time: 1.5,
          status: 'success',
          response_preview: 'Mathematical calculations completed. Temperature conversions and statistical analysis done...'
        }
      };
      steps.push(step8);
      setSteps([...steps]);
      setCurrentStep('Calculator Agent responded successfully');
      await sleep(800);
    }

    // Step 9: Coordination
    elapsed += 0.8;
    const step9: OrchestrationStep = {
      step_type: 'COORDINATION',
      timestamp: new Date().toISOString(),
      elapsed_seconds: elapsed,
      details: {
        agents_contacted: question.toLowerCase().includes('weather') ? 2 : 1,
        successful_responses: question.toLowerCase().includes('weather') ? 2 : 1,
        coordination_strategy: 'Parallel agent execution with response aggregation'
      }
    };
    steps.push(step9);
    setSteps([...steps]);
    setCurrentStep('Coordinating agent responses...');
    await sleep(1000);

    // Step 10: Orchestration Complete
    elapsed += 1.0;
    const step10: OrchestrationStep = {
      step_type: 'ORCHESTRATION_COMPLETE',
      timestamp: new Date().toISOString(),
      elapsed_seconds: elapsed,
      details: {
        final_response_length: 1500,
        total_agents_used: question.toLowerCase().includes('weather') ? 2 : 1,
        orchestration_successful: true
      }
    };
    steps.push(step10);
    setSteps([...steps]);
    setCurrentStep('Orchestration completed successfully!');

    // Set final result
    setFinalResult({
      question,
      user: 'Frontend User',
      timestamp: new Date().toISOString(),
      session_id: `orch_${Date.now()}`,
      agents_contacted: question.toLowerCase().includes('weather') ? 2 : 1,
      successful_responses: question.toLowerCase().includes('weather') ? 2 : 1,
      coordination_strategy: 'Parallel agent execution with response aggregation',
      final_response: generateMockResponse(question),
      total_agents_used: question.toLowerCase().includes('weather') ? 2 : 1,
      orchestration_successful: true,
      orchestration_log: {
        steps,
        summary: {
          agents_contacted: question.toLowerCase().includes('weather') ? 2 : 1,
          coordination_events: 1,
          final_result: 'SUCCESS',
          routing_decisions: 1
        },
        total_steps: steps.length,
        total_time_seconds: elapsed
      }
    });
  };

  const generateMockResponse = (question: string): string => {
    if (question.toLowerCase().includes('weather')) {
      return `**Weather Analysis & Mathematical Modeling**

Based on your question about weather representation, here's a comprehensive analysis:

**Temperature Modeling:**
- Linear temperature function: T(t) = T₀ + A·sin(2πt/24)
- Where T₀ is base temperature, A is amplitude, t is time in hours

**Atmospheric Pressure:**
- Barometric pressure: P(h) = P₀ · e^(-h/H)
- Where P₀ is sea level pressure, h is altitude, H is scale height

**Mathematical Weather Patterns:**
1. **Temperature Distribution**: Gaussian distribution with seasonal variations
2. **Precipitation Models**: Poisson process for rainfall events
3. **Wind Patterns**: Vector field analysis using partial differential equations

**Statistical Analysis:**
- Mean temperature: 22°C ± 5°C
- Standard deviation: 3.2°C
- Correlation coefficient with humidity: 0.73

This mathematical framework provides a robust foundation for weather prediction and analysis.`;
    } else {
      return `**Mathematical Analysis Complete**

I've processed your question using advanced mathematical modeling techniques:

**Key Calculations:**
- Applied statistical analysis methods
- Implemented numerical optimization algorithms
- Generated comprehensive mathematical models

**Results:**
- Analysis completed successfully
- Mathematical models validated
- Statistical significance confirmed

The mathematical representation provides a solid foundation for further analysis and decision-making.`;
    }
  };

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const handleOrchestrate = async () => {
    if (!question.trim()) return;

    setIsOrchestrating(true);
    setSteps([]);
    setFinalResult(null);
    setCurrentStep('Initializing...');

    try {
      await simulateOrchestrationSteps(question);
    } catch (error) {
      console.error('Orchestration error:', error);
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
            Real-Time A2A Orchestration Monitor
          </CardTitle>
          <CardDescription>
            Watch agents coordinate in real-time with live step-by-step processing simulation
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
                  <Play className="mr-2 h-4 w-4" />
                  Start Live Orchestration
                </>
              )}
            </Button>
            
            {finalResult && (
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

      {/* Live Processing Steps */}
      {steps.length > 0 && showDetails && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="text-blue-400" size={20} />
              Live Processing Steps
              <Badge variant="outline" className="ml-auto">
                {steps.length} steps in {steps[steps.length - 1]?.elapsed_seconds.toFixed(2)}s
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {steps.map((step, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-l-4 ${getStepColor(step.step_type)}`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      {getStepIcon(step.step_type)}
                      <div className="font-medium text-white">
                        {formatStepType(step.step_type)}
                      </div>
                      <div className="text-xs text-gray-400 ml-auto">
                        +{step.elapsed_seconds.toFixed(2)}s
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-300 ml-7">
                      {step.step_type === 'ORCHESTRATION_START' && (
                        <div>
                          <div><strong>Task:</strong> {step.details.task}</div>
                          <div><strong>User:</strong> {step.details.user}</div>
                          <div><strong>Session:</strong> {step.details.session_id}</div>
                        </div>
                      )}
                      
                      {step.step_type === 'AGENT_DISCOVERY' && (
                        <div>
                          <div><strong>Registry URL:</strong> {step.details.registry_url}</div>
                          <div><strong>Discovering:</strong> {step.details.discovering_agents ? 'Yes' : 'No'}</div>
                          {step.details.agents_found && (
                            <div><strong>Agents Found:</strong> {step.details.agents_found}</div>
                          )}
                          {step.details.available_agents && (
                            <div><strong>Available:</strong> {step.details.available_agents.join(', ')}</div>
                          )}
                        </div>
                      )}
                      
                      {step.step_type === 'ROUTING_DECISION' && (
                        <div>
                          <div><strong>Question:</strong> {step.details.question}</div>
                          <div><strong>Selected Agents:</strong> {step.details.selected_agents?.join(', ')}</div>
                          <div><strong>Reasoning:</strong> {step.details.routing_reasoning}</div>
                        </div>
                      )}
                      
                      {step.step_type === 'AGENT_CONTACT' && (
                        <div>
                          <div><strong>Agent:</strong> {step.details.agent_name} ({step.details.agent_id})</div>
                          <div><strong>URL:</strong> {step.details.agent_url}</div>
                          <div><strong>Question:</strong> {step.details.question}</div>
                        </div>
                      )}
                      
                      {step.step_type === 'AGENT_RESPONSE' && (
                        <div>
                          <div><strong>Agent:</strong> {step.details.agent_name}</div>
                          <div><strong>Response Time:</strong> {step.details.response_time?.toFixed(2)}s</div>
                          <div><strong>Status:</strong> 
                            <Badge variant={step.details.status === 'success' ? 'default' : 'destructive'} className="ml-2">
                              {step.details.status}
                            </Badge>
                          </div>
                          {step.details.response_preview && (
                            <div className="mt-2 p-2 bg-gray-700 rounded text-xs">
                              <strong>Preview:</strong> {step.details.response_preview}
                            </div>
                          )}
                        </div>
                      )}
                      
                      {step.step_type === 'COORDINATION' && (
                        <div>
                          <div><strong>Agents Contacted:</strong> {step.details.agents_contacted}</div>
                          <div><strong>Successful Responses:</strong> {step.details.successful_responses}</div>
                          <div><strong>Strategy:</strong> {step.details.coordination_strategy}</div>
                        </div>
                      )}
                      
                      {step.step_type === 'ORCHESTRATION_COMPLETE' && (
                        <div>
                          <div><strong>Final Response Length:</strong> {step.details.final_response_length} characters</div>
                          <div><strong>Total Agents Used:</strong> {step.details.total_agents_used}</div>
                          <div><strong>Success:</strong> {step.details.orchestration_successful ? 'Yes' : 'No'}</div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Final Response */}
      {finalResult && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="text-green-400" size={20} />
              Final Response
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-700 p-4 rounded text-sm text-gray-200 whitespace-pre-wrap">
              {finalResult.final_response}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};







