import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Network, 
  BarChart2, 
  Code, 
  Search, 
  Users, 
  GitBranch,
  Play,
  Settings,
  Plane,
  Hotel,
  MapPin,
  Crown,
  Workflow,
  Database,
  MessageSquare,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface LangGraphTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  complexity: 'Simple' | 'Intermediate' | 'Advanced';
  agentCount: number;
  useCase: string;
  features: string[];
}

const templates: LangGraphTemplate[] = [
  {
    id: 'supervisor-travel',
    name: 'Travel Planning Assistant',
    description: 'Supervisor agent coordinates destination, flight, and hotel agents (AWS Blog Pattern)',
    icon: Search,
    complexity: 'Intermediate',
    agentCount: 4,
    useCase: 'Travel & Booking',
    features: ['Destination Recommendation', 'Flight Search', 'Hotel Booking', 'Itinerary Planning']
  },
  {
    id: 'data-analysis',
    name: 'Data Analysis Pipeline',
    description: 'Planner agent coordinates with code executor for data analysis tasks',
    icon: BarChart2,
    complexity: 'Intermediate',
    agentCount: 2,
    useCase: 'Data Science & Analytics',
    features: ['Data Processing', 'Code Generation', 'Visualization', 'Report Generation']
  },
  {
    id: 'code-generation',
    name: 'Code Generation Team',
    description: 'Architect, developer, and reviewer agents collaborate on code projects',
    icon: Code,
    complexity: 'Advanced',
    agentCount: 3,
    useCase: 'Software Development',
    features: ['Code Planning', 'Implementation', 'Code Review', 'Testing']
  },
  {
    id: 'customer-support',
    name: 'Customer Support Hub',
    description: 'Router directs queries to specialized support agents',
    icon: Users,
    complexity: 'Simple',
    agentCount: 3,
    useCase: 'Customer Service',
    features: ['Query Routing', 'Specialized Responses', 'Escalation', 'Follow-up']
  }
];

interface CreateLangGraphWorkflowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templateId?: string;
}

export const CreateLangGraphWorkflowDialog: React.FC<CreateLangGraphWorkflowDialogProps> = ({
  open,
  onOpenChange,
  templateId
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(templateId || null);
  const [step, setStep] = useState<'template' | 'configure' | 'deploy'>('template');

  const handleTemplateSelect = (template: LangGraphTemplate) => {
    setSelectedTemplate(template.id);
    setStep('configure');
  };

  const handleBack = () => {
    if (step === 'configure') {
      setStep('template');
    } else if (step === 'deploy') {
      setStep('configure');
    }
  };

  const handleNext = () => {
    if (step === 'template' && selectedTemplate) {
      setStep('configure');
    } else if (step === 'configure') {
      setStep('deploy');
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'Simple': return 'bg-green-500/20 text-green-400';
      case 'Intermediate': return 'bg-yellow-500/20 text-yellow-400';
      case 'Advanced': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-beam-dark-accent border-gray-700 text-white sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Network className="text-cyan-400" size={20} />
            Create LangGraph Workflow
          </DialogTitle>
        </DialogHeader>

        {step === 'template' && (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-gray-300">
                Choose a multi-agent workflow template based on AWS LangGraph patterns
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map((template) => {
                const IconComponent = template.icon;
                return (
                  <div
                    key={template.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                      selectedTemplate === template.id
                        ? 'border-beam-blue bg-beam-blue/10'
                        : 'border-gray-600 hover:border-gray-500 hover:bg-gray-800/50'
                    }`}
                    onClick={() => setSelectedTemplate(template.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-gray-700 rounded-lg">
                        <IconComponent size={20} className="text-cyan-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{template.name}</h3>
                          <Badge className={getComplexityColor(template.complexity)}>
                            {template.complexity}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-300 mb-3">
                          {template.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
                          <span className="flex items-center gap-1">
                            <Users size={12} />
                            {template.agentCount} Agents
                          </span>
                          <span>{template.useCase}</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {template.features.slice(0, 3).map((feature) => (
                            <Badge
                              key={feature}
                              variant="outline"
                              className="text-xs border-gray-600 text-gray-300"
                            >
                              {feature}
                            </Badge>
                          ))}
                          {template.features.length > 3 && (
                            <Badge
                              variant="outline"
                              className="text-xs border-gray-600 text-gray-300"
                            >
                              +{template.features.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="border-gray-600 text-white hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button
                onClick={handleNext}
                disabled={!selectedTemplate}
                className="bg-beam-blue hover:bg-beam-blue/80"
              >
                Configure Workflow
              </Button>
            </div>
          </div>
        )}

        {step === 'configure' && (
          <div className="space-y-6">
            {selectedTemplate && (() => {
              const template = templates.find(t => t.id === selectedTemplate);
              if (!template) return null;

              return (
                <>
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">{template.name} Configuration</h3>
                    <p className="text-gray-300">
                      Configure the supervisor agent pattern and specialized agents
                    </p>
                  </div>

                  {/* Supervisor Agent Pattern Visualization */}
                  <div className="bg-gray-800/50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Crown size={16} className="text-yellow-400" />
                      Supervisor Agent Pattern (AWS LangGraph)
                    </h4>
                    
                    {template.id === 'supervisor-travel' && (
                      <div className="space-y-4">
                        <div className="text-center">
                          <div className="inline-flex items-center gap-2 bg-yellow-500/20 text-yellow-400 px-3 py-2 rounded-lg">
                            <Crown size={16} />
                            <span className="font-medium">Supervisor Agent</span>
                          </div>
                        </div>
                        
                        <div className="flex justify-center">
                          <div className="w-px h-8 bg-gray-600"></div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4">
                          <div className="text-center">
                            <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-400 px-3 py-2 rounded-lg">
                              <MapPin size={14} />
                              <span className="text-sm">Destination Agent</span>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">Recommends destinations</p>
                          </div>
                          <div className="text-center">
                            <div className="inline-flex items-center gap-2 bg-green-500/20 text-green-400 px-3 py-2 rounded-lg">
                              <Plane size={14} />
                              <span className="text-sm">Flight Agent</span>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">Searches flights</p>
                          </div>
                          <div className="text-center">
                            <div className="inline-flex items-center gap-2 bg-purple-500/20 text-purple-400 px-3 py-2 rounded-lg">
                              <Hotel size={14} />
                              <span className="text-sm">Hotel Agent</span>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">Finds accommodations</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {template.id === 'data-analysis' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center">
                            <div className="inline-flex items-center gap-2 bg-yellow-500/20 text-yellow-400 px-3 py-2 rounded-lg">
                              <Crown size={14} />
                              <span className="text-sm">Planner Agent</span>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">Plans analysis workflow</p>
                          </div>
                          <div className="text-center">
                            <div className="inline-flex items-center gap-2 bg-green-500/20 text-green-400 px-3 py-2 rounded-lg">
                              <Code size={14} />
                              <span className="text-sm">Code Executor</span>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">Executes data processing</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* State Management Configuration */}
                  <div className="bg-gray-800/50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Database size={16} className="text-cyan-400" />
                      State Management & Memory
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="flex items-center gap-2">
                          <input type="checkbox" defaultChecked className="rounded" />
                          <span className="text-sm">Shared Context State</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" defaultChecked className="rounded" />
                          <span className="text-sm">Agent Communication Log</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" defaultChecked className="rounded" />
                          <span className="text-sm">Checkpoint Memory</span>
                        </label>
                      </div>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2">
                          <input type="checkbox" defaultChecked className="rounded" />
                          <span className="text-sm">Thread Management</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" className="rounded" />
                          <span className="text-sm">Persistent Storage</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" className="rounded" />
                          <span className="text-sm">Human-in-the-Loop</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Communication Patterns */}
                  <div className="bg-gray-800/50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <MessageSquare size={16} className="text-green-400" />
                      Communication Patterns
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <input type="radio" name="communication" value="sequential" defaultChecked />
                        <div>
                          <span className="text-sm font-medium">Sequential Processing</span>
                          <p className="text-xs text-gray-400">Agents work one after another</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <input type="radio" name="communication" value="parallel" />
                        <div>
                          <span className="text-sm font-medium">Parallel Processing</span>
                          <p className="text-xs text-gray-400">Multiple agents work simultaneously</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <input type="radio" name="communication" value="conditional" />
                        <div>
                          <span className="text-sm font-medium">Conditional Routing</span>
                          <p className="text-xs text-gray-400">Dynamic agent selection based on context</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* AWS Bedrock Integration */}
                  <div className="bg-gray-800/50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Network size={16} className="text-orange-400" />
                      AWS Bedrock Integration
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Foundation Model</label>
                        <select className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm">
                          <option>Claude 3.5 Sonnet</option>
                          <option>Claude 3 Haiku</option>
                          <option>Llama 3.1 70B</option>
                          <option>Titan Text Premier</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Region</label>
                        <select className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm">
                          <option>us-west-2</option>
                          <option>us-east-1</option>
                          <option>eu-west-1</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={handleBack}
                className="border-gray-600 text-white hover:bg-gray-700"
              >
                Back to Templates
              </Button>
              <Button
                onClick={handleNext}
                className="bg-beam-blue hover:bg-beam-blue/80"
              >
                Deploy Workflow
              </Button>
            </div>
          </div>
        )}

        {step === 'deploy' && (
          <div className="space-y-6">
            {selectedTemplate && (() => {
              const template = templates.find(t => t.id === selectedTemplate);
              if (!template) return null;

              return (
                <>
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">Deploy {template.name}</h3>
                    <p className="text-gray-300">
                      Ready to deploy your LangGraph multi-agent workflow to AWS Bedrock
                    </p>
                  </div>

                  {/* Deployment Configuration */}
                  <div className="bg-gray-800/50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Play size={16} className="text-green-400" />
                      Deployment Configuration
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Workflow Name</label>
                        <input 
                          type="text" 
                          defaultValue={`${template.name.replace(/\s+/g, '-').toLowerCase()}-workflow`}
                          className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Environment</label>
                        <select className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm">
                          <option>Development</option>
                          <option>Staging</option>
                          <option>Production</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* LangGraph Studio Integration */}
                  <div className="bg-gray-800/50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Workflow size={16} className="text-purple-400" />
                      LangGraph Studio Features
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle size={14} className="text-green-400" />
                          <span className="text-sm">Graph Visualization</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle size={14} className="text-green-400" />
                          <span className="text-sm">Real-time Monitoring</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle size={14} className="text-green-400" />
                          <span className="text-sm">Thread Management</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle size={14} className="text-green-400" />
                          <span className="text-sm">State Inspection</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle size={14} className="text-green-400" />
                          <span className="text-sm">Debug Capabilities</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle size={14} className="text-green-400" />
                          <span className="text-sm">Hot Reloading</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* AWS Integration Status */}
                  <div className="bg-gray-800/50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Network size={16} className="text-orange-400" />
                      AWS Bedrock Integration Status
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Foundation Model Access</span>
                        <div className="flex items-center gap-2">
                          <CheckCircle size={14} className="text-green-400" />
                          <span className="text-xs text-green-400">Ready</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">IAM Permissions</span>
                        <div className="flex items-center gap-2">
                          <CheckCircle size={14} className="text-green-400" />
                          <span className="text-xs text-green-400">Configured</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">LangGraph Runtime</span>
                        <div className="flex items-center gap-2">
                          <AlertCircle size={14} className="text-yellow-400" />
                          <span className="text-xs text-yellow-400">Local Development</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Deployment Commands */}
                  <div className="bg-gray-900/50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Code size={16} className="text-cyan-400" />
                      Deployment Commands
                    </h4>
                    <div className="space-y-2 text-sm font-mono">
                      <div className="bg-black/30 p-2 rounded">
                        <span className="text-gray-400"># Start LangGraph development server</span><br/>
                        <span className="text-green-400">langgraph dev</span>
                      </div>
                      <div className="bg-black/30 p-2 rounded">
                        <span className="text-gray-400"># Deploy to AWS Bedrock (when ready)</span><br/>
                        <span className="text-green-400">langgraph deploy --platform bedrock</span>
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={handleBack}
                className="border-gray-600 text-white hover:bg-gray-700"
              >
                Back to Configuration
              </Button>
              <Button
                onClick={() => {
                  // Create the workflow configuration
                  const template = templates.find(t => t.id === selectedTemplate);
                  console.log('Deploying LangGraph workflow:', template);
                  onOpenChange(false);
                }}
                className="bg-green-600 hover:bg-green-700"
              >
                Deploy Workflow
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};