import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Network, 
  Brain, 
  Code, 
  Search, 
  Users, 
  Play,
  Settings,
  Crown,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Lightbulb,
  Target,
  Zap,
  Eye,
  TestTube,
  Rocket
} from 'lucide-react';

interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  status: 'pending' | 'active' | 'completed' | 'error';
}

interface ProblemAnalysis {
  complexity: 'simple' | 'intermediate' | 'complex';
  recommendedPattern: 'single' | 'supervisor' | 'sequential' | 'parallel';
  agentCount: number;
  suggestedTools: string[];
  reasoning: string;
}

interface AgentConfig {
  id: string;
  name: string;
  role: string;
  tools: string[];
  model: string;
  status: 'configured' | 'tested' | 'connected';
}

interface DynamicLangGraphWorkflowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DynamicLangGraphWorkflow: React.FC<DynamicLangGraphWorkflowProps> = ({
  open,
  onOpenChange
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [problemDescription, setProblemDescription] = useState('');
  const [analysis, setAnalysis] = useState<ProblemAnalysis | null>(null);
  const [agents, setAgents] = useState<AgentConfig[]>([]);
  const [currentAgentIndex, setCurrentAgentIndex] = useState(0);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const steps: WorkflowStep[] = [
    {
      id: 'problem',
      title: 'Define Problem',
      description: 'Describe what you want to accomplish',
      icon: Target,
      status: currentStep === 0 ? 'active' : currentStep > 0 ? 'completed' : 'pending'
    },
    {
      id: 'analyze',
      title: 'AI Analysis',
      description: 'Get architecture recommendations',
      icon: Brain,
      status: currentStep === 1 ? 'active' : currentStep > 1 ? 'completed' : 'pending'
    },
    {
      id: 'build',
      title: 'Build Agents',
      description: 'Create agents step by step',
      icon: Users,
      status: currentStep === 2 ? 'active' : currentStep > 2 ? 'completed' : 'pending'
    },
    {
      id: 'test',
      title: 'Test Workflow',
      description: 'Validate your multi-agent system',
      icon: TestTube,
      status: currentStep === 3 ? 'active' : currentStep > 3 ? 'completed' : 'pending'
    },
    {
      id: 'deploy',
      title: 'Deploy',
      description: 'Launch to production',
      icon: Rocket,
      status: currentStep === 4 ? 'active' : currentStep > 4 ? 'completed' : 'pending'
    }
  ];

  const analyzeProblem = async () => {
    if (!problemDescription.trim()) return;
    
    setIsAnalyzing(true);
    
    // Simulate AI analysis (in real implementation, this would call an AI service)
    setTimeout(() => {
      const mockAnalysis: ProblemAnalysis = {
        complexity: problemDescription.length > 100 ? 'complex' : 'intermediate',
        recommendedPattern: problemDescription.toLowerCase().includes('travel') ? 'supervisor' : 'sequential',
        agentCount: problemDescription.toLowerCase().includes('travel') ? 4 : 2,
        suggestedTools: problemDescription.toLowerCase().includes('travel') 
          ? ['destination-api', 'flight-api', 'hotel-api'] 
          : ['web-search', 'data-processor'],
        reasoning: `Based on your description, I recommend a ${problemDescription.toLowerCase().includes('travel') ? 'supervisor' : 'sequential'} pattern with specialized agents for different tasks.`
      };
      
      setAnalysis(mockAnalysis);
      setIsAnalyzing(false);
      setCurrentStep(1);
    }, 2000);
  };

  const acceptAnalysis = () => {
    if (!analysis) return;
    
    // Initialize agents based on analysis
    const initialAgents: AgentConfig[] = [];
    
    if (analysis.recommendedPattern === 'supervisor') {
      initialAgents.push({
        id: 'supervisor',
        name: 'Supervisor Agent',
        role: 'Coordinates other agents and manages workflow',
        tools: ['workflow-manager'],
        model: 'Claude 3.5 Sonnet',
        status: 'configured'
      });
      
      if (problemDescription.toLowerCase().includes('travel')) {
        initialAgents.push(
          {
            id: 'destination',
            name: 'Destination Agent',
            role: 'Recommends travel destinations',
            tools: ['destination-api', 'user-preferences'],
            model: 'Claude 3.5 Sonnet',
            status: 'configured'
          },
          {
            id: 'flight',
            name: 'Flight Agent',
            role: 'Searches for flights',
            tools: ['flight-api', 'price-comparison'],
            model: 'Claude 3 Haiku',
            status: 'configured'
          },
          {
            id: 'hotel',
            name: 'Hotel Agent',
            role: 'Finds accommodations',
            tools: ['hotel-api', 'booking-system'],
            model: 'Claude 3 Haiku',
            status: 'configured'
          }
        );
      }
    }
    
    setAgents(initialAgents);
    setCurrentStep(2);
  };

  const testAgent = (agentId: string) => {
    setAgents(agents.map(agent => 
      agent.id === agentId 
        ? { ...agent, status: 'tested' }
        : agent
    ));
    
    // Add test result
    setTestResults([...testResults, {
      agentId,
      status: 'success',
      message: `${agents.find(a => a.id === agentId)?.name} tested successfully`
    }]);
  };

  const connectAgents = () => {
    setAgents(agents.map(agent => ({ ...agent, status: 'connected' })));
    setCurrentStep(3);
  };

  const runWorkflowTest = () => {
    // Simulate workflow test
    setTimeout(() => {
      setTestResults([...testResults, {
        agentId: 'workflow',
        status: 'success',
        message: 'End-to-end workflow test completed successfully'
      }]);
      setCurrentStep(4);
    }, 1500);
  };

  const getStepIcon = (step: WorkflowStep) => {
    const IconComponent = step.icon;
    const getColor = () => {
      switch (step.status) {
        case 'completed': return 'text-green-400';
        case 'active': return 'text-blue-400';
        case 'error': return 'text-red-400';
        default: return 'text-gray-400';
      }
    };
    
    return <IconComponent size={20} className={getColor()} />;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-beam-dark-accent border-gray-700 text-white sm:max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Network className="text-cyan-400" size={20} />
            Dynamic LangGraph Workflow Builder
          </DialogTitle>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-6 px-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                step.status === 'active' ? 'bg-blue-500/20 border border-blue-500/30' :
                step.status === 'completed' ? 'bg-green-500/20 border border-green-500/30' :
                'bg-gray-700/50'
              }`}>
                {getStepIcon(step)}
                <div className="hidden sm:block">
                  <div className="text-sm font-medium">{step.title}</div>
                  <div className="text-xs text-gray-400">{step.description}</div>
                </div>
              </div>
              {index < steps.length - 1 && (
                <ArrowRight size={16} className="mx-2 text-gray-600" />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="space-y-6">
          {/* Step 1: Problem Definition */}
          {currentStep === 0 && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">What do you want to accomplish?</h3>
                <p className="text-gray-300">
                  Describe your use case and I'll recommend the best LangGraph architecture
                </p>
              </div>
              
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <textarea
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm min-h-[120px] resize-none"
                  placeholder="Example: I want to create a travel planning assistant that can recommend destinations, find flights, and book hotels based on user preferences and budget..."
                  value={problemDescription}
                  onChange={(e) => setProblemDescription(e.target.value)}
                />
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg">
                <div className="flex items-start gap-2">
                  <Lightbulb size={16} className="text-blue-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-400">Pro Tips</h4>
                    <ul className="text-sm text-gray-300 mt-1 space-y-1">
                      <li>• Be specific about inputs and expected outputs</li>
                      <li>• Mention any external APIs or data sources needed</li>
                      <li>• Describe the complexity and scale requirements</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={analyzeProblem}
                  disabled={!problemDescription.trim() || isAnalyzing}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Brain size={16} className="mr-2" />
                      Analyze with AI
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: AI Analysis Results */}
          {currentStep === 1 && analysis && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">AI Architecture Recommendation</h3>
                <p className="text-gray-300">
                  Based on your requirements, here's the recommended approach
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Crown size={16} className="text-yellow-400" />
                    Recommended Pattern
                  </h4>
                  <div className="space-y-2">
                    <Badge className="bg-yellow-500/20 text-yellow-400">
                      {analysis.recommendedPattern.charAt(0).toUpperCase() + analysis.recommendedPattern.slice(1)} Pattern
                    </Badge>
                    <p className="text-sm text-gray-300">{analysis.reasoning}</p>
                  </div>
                </div>

                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Users size={16} className="text-blue-400" />
                    Agent Configuration
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Agent Count</span>
                      <Badge variant="outline">{analysis.agentCount} agents</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Complexity</span>
                      <Badge className={
                        analysis.complexity === 'simple' ? 'bg-green-500/20 text-green-400' :
                        analysis.complexity === 'intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }>
                        {analysis.complexity}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Zap size={16} className="text-green-400" />
                  Suggested Tools & APIs
                </h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.suggestedTools.map((tool) => (
                    <Badge key={tool} variant="outline" className="border-green-600 text-green-400">
                      {tool}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(0)}
                  className="border-gray-600 text-white hover:bg-gray-700"
                >
                  <ArrowLeft size={16} className="mr-2" />
                  Modify Problem
                </Button>
                <Button
                  onClick={acceptAnalysis}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Accept & Build Agents
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Build Agents */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Build Your Agents</h3>
                <p className="text-gray-300">
                  Configure and test each agent individually
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Agent List */}
                <div className="space-y-4">
                  {agents.map((agent, index) => (
                    <div key={agent.id} className="bg-gray-800/50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {agent.id === 'supervisor' ? (
                            <Crown size={16} className="text-yellow-400" />
                          ) : (
                            <Users size={16} className="text-blue-400" />
                          )}
                          <h4 className="font-semibold">{agent.name}</h4>
                        </div>
                        <Badge className={
                          agent.status === 'connected' ? 'bg-green-500/20 text-green-400' :
                          agent.status === 'tested' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-gray-500/20 text-gray-400'
                        }>
                          {agent.status}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-300 mb-3">{agent.role}</p>
                      
                      <div className="space-y-2">
                        <div>
                          <span className="text-xs text-gray-400">Model:</span>
                          <span className="text-sm ml-2">{agent.model}</span>
                        </div>
                        <div>
                          <span className="text-xs text-gray-400">Tools:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {agent.tools.map((tool) => (
                              <Badge key={tool} variant="outline" className="text-xs">
                                {tool}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => testAgent(agent.id)}
                          disabled={agent.status !== 'configured'}
                          className="border-blue-600 text-blue-400 hover:bg-blue-600/20"
                        >
                          <TestTube size={14} className="mr-1" />
                          Test Agent
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Test Results */}
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Eye size={16} className="text-green-400" />
                    Test Results
                  </h4>
                  
                  {testResults.length === 0 ? (
                    <p className="text-gray-400 text-sm">No tests run yet. Test individual agents to see results.</p>
                  ) : (
                    <div className="space-y-2">
                      {testResults.map((result, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-gray-700/50 rounded">
                          <CheckCircle size={14} className="text-green-400" />
                          <span className="text-sm">{result.message}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                  className="border-gray-600 text-white hover:bg-gray-700"
                >
                  <ArrowLeft size={16} className="mr-2" />
                  Back to Analysis
                </Button>
                <Button
                  onClick={connectAgents}
                  disabled={!agents.every(agent => agent.status === 'tested')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Connect Agents
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Test Workflow */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Test Complete Workflow</h3>
                <p className="text-gray-300">
                  Run end-to-end tests to validate your multi-agent system
                </p>
              </div>

              <div className="bg-gray-800/50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3">Workflow Test</h4>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Enter test input (e.g., 'Plan a trip to Japan for March 15, 2025')"
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
                  />
                  <Button
                    onClick={runWorkflowTest}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Play size={16} className="mr-2" />
                    Run Workflow Test
                  </Button>
                </div>
              </div>

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(2)}
                  className="border-gray-600 text-white hover:bg-gray-700"
                >
                  <ArrowLeft size={16} className="mr-2" />
                  Back to Agents
                </Button>
                <Button
                  onClick={() => setCurrentStep(4)}
                  disabled={!testResults.some(r => r.agentId === 'workflow')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Deploy Workflow
                  <Rocket size={16} className="ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 5: Deploy */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Deploy Your Workflow</h3>
                <p className="text-gray-300">
                  Ready to deploy your LangGraph multi-agent workflow
                </p>
              </div>

              <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle size={16} className="text-green-400" />
                  <span className="font-medium text-green-400">Workflow Ready for Deployment</span>
                </div>
                <p className="text-sm text-gray-300">
                  Your multi-agent workflow has been tested and is ready for production deployment.
                </p>
              </div>

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(3)}
                  className="border-gray-600 text-white hover:bg-gray-700"
                >
                  <ArrowLeft size={16} className="mr-2" />
                  Back to Testing
                </Button>
                <Button
                  onClick={() => onOpenChange(false)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Rocket size={16} className="mr-2" />
                  Deploy to Production
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};