import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  Users, 
  Shield, 
  Globe, 
  Zap, 
  Brain,
  ArrowRight,
  Clock,
  CheckCircle
} from 'lucide-react';

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  industry: 'banking' | 'telco' | 'healthcare';
  category: string;
  agents: {
    name: string;
    framework: 'generic' | 'strands' | 'agentcore';
    role: string;
  }[];
  estimatedTime: string;
  complexity: 'low' | 'medium' | 'high';
  icon: React.ComponentType<any>;
  benefits: string[];
  prerequisites: string[];
}

interface WorkflowTemplateSelectorProps {
  industry: 'banking' | 'telco' | 'healthcare';
  onTemplateSelect: (template: WorkflowTemplate) => void;
  selectedTemplate?: string;
}

const workflowTemplates: WorkflowTemplate[] = [
  // Banking Templates
  {
    id: 'wealth-management-suite',
    name: 'AI Wealth Management Suite',
    description: 'Complete wealth management workflow with 6 specialized agents for portfolio analysis, risk assessment, and client advisory.',
    industry: 'banking',
    category: 'Wealth Management',
    agents: [
      { name: 'Portfolio Manager', framework: 'agentcore', role: 'Portfolio optimization and rebalancing' },
      { name: 'Risk Assessor', framework: 'strands', role: 'Advanced risk analysis and modeling' },
      { name: 'Market Analyst', framework: 'generic', role: 'Market research and trend analysis' },
      { name: 'Client Advisor', framework: 'generic', role: 'Client communication and recommendations' },
      { name: 'Compliance Officer', framework: 'agentcore', role: 'Regulatory compliance monitoring' },
      { name: 'Research Analyst', framework: 'strands', role: 'Investment research and due diligence' }
    ],
    estimatedTime: '2-3 hours',
    complexity: 'high',
    icon: TrendingUp,
    benefits: [
      'Automated portfolio optimization',
      'Real-time risk monitoring',
      'Personalized client recommendations',
      'Regulatory compliance automation'
    ],
    prerequisites: [
      'AWS Bedrock credentials for Agent Core and Strands agents',
      'OpenAI API key for Generic agents',
      'Market data API access',
      'Client portfolio database'
    ]
  },
  {
    id: 'customer-insights-engine',
    name: 'Customer Insights Engine',
    description: 'Multi-agent system for comprehensive customer analysis, segmentation, and personalized banking experiences.',
    industry: 'banking',
    category: 'Customer Analytics',
    agents: [
      { name: 'Behavior Analyst', framework: 'strands', role: 'Customer behavior pattern analysis' },
      { name: 'Segmentation Engine', framework: 'agentcore', role: 'Dynamic customer segmentation' },
      { name: 'Personalization Agent', framework: 'generic', role: 'Personalized product recommendations' },
      { name: 'Churn Predictor', framework: 'strands', role: 'Customer retention analysis' }
    ],
    estimatedTime: '1-2 hours',
    complexity: 'medium',
    icon: Users,
    benefits: [
      'Advanced customer segmentation',
      'Predictive churn analysis',
      'Personalized product recommendations',
      'Real-time behavior insights'
    ],
    prerequisites: [
      'Customer transaction data',
      'AWS Bedrock credentials',
      'OpenAI API key',
      'Customer demographics database'
    ]
  },
  {
    id: 'fraud-detection-system',
    name: 'AI Fraud Detection System',
    description: 'Real-time fraud detection and prevention using advanced AI agents for transaction monitoring and risk assessment.',
    industry: 'banking',
    category: 'Risk Management',
    agents: [
      { name: 'Transaction Monitor', framework: 'agentcore', role: 'Real-time transaction analysis' },
      { name: 'Pattern Detector', framework: 'strands', role: 'Fraud pattern recognition' },
      { name: 'Risk Scorer', framework: 'strands', role: 'Dynamic risk scoring' },
      { name: 'Alert Manager', framework: 'generic', role: 'Alert generation and routing' }
    ],
    estimatedTime: '2-4 hours',
    complexity: 'high',
    icon: Shield,
    benefits: [
      'Real-time fraud detection',
      'Reduced false positives',
      'Automated risk scoring',
      'Intelligent alert management'
    ],
    prerequisites: [
      'Transaction data stream',
      'AWS Bedrock credentials',
      'Historical fraud data',
      'Alert management system'
    ]
  },

  // Telco Templates
  {
    id: 'network-optimization-suite',
    name: 'Network Optimization Suite',
    description: 'Comprehensive network management with specialized agents for monitoring, optimization, and predictive maintenance.',
    industry: 'telco',
    category: 'Network Management',
    agents: [
      { name: 'Network Monitor', framework: 'agentcore', role: 'Real-time network monitoring' },
      { name: 'Performance Optimizer', framework: 'strands', role: 'Network performance optimization' },
      { name: 'Fault Detector', framework: 'strands', role: 'Predictive fault detection' },
      { name: 'Capacity Planner', framework: 'generic', role: 'Network capacity planning' },
      { name: 'Security Guardian', framework: 'agentcore', role: 'Network security monitoring' }
    ],
    estimatedTime: '3-4 hours',
    complexity: 'high',
    icon: Globe,
    benefits: [
      'Proactive network optimization',
      'Predictive maintenance',
      'Automated fault detection',
      'Intelligent capacity planning'
    ],
    prerequisites: [
      'Network monitoring data',
      'AWS Bedrock credentials',
      'OpenAI API key',
      'Network topology information'
    ]
  },
  {
    id: 'customer-experience-platform',
    name: 'Customer Experience Platform',
    description: 'AI-powered customer experience optimization with journey analytics and personalized service delivery.',
    industry: 'telco',
    category: 'Customer Experience',
    agents: [
      { name: 'Journey Analyzer', framework: 'strands', role: 'Customer journey analysis' },
      { name: 'Experience Optimizer', framework: 'agentcore', role: 'Experience optimization' },
      { name: 'Support Assistant', framework: 'generic', role: 'Intelligent customer support' },
      { name: 'Satisfaction Predictor', framework: 'strands', role: 'Customer satisfaction prediction' }
    ],
    estimatedTime: '2-3 hours',
    complexity: 'medium',
    icon: Users,
    benefits: [
      'Enhanced customer journeys',
      'Predictive satisfaction scoring',
      'Automated support optimization',
      'Personalized service delivery'
    ],
    prerequisites: [
      'Customer interaction data',
      'Journey mapping tools',
      'AWS Bedrock credentials',
      'Support ticket system'
    ]
  },
  {
    id: 'predictive-analytics-engine',
    name: 'Predictive Analytics Engine',
    description: 'Advanced predictive analytics for network planning, customer behavior, and business intelligence.',
    industry: 'telco',
    category: 'Analytics',
    agents: [
      { name: 'Demand Forecaster', framework: 'strands', role: 'Network demand forecasting' },
      { name: 'Behavior Predictor', framework: 'strands', role: 'Customer behavior prediction' },
      { name: 'Trend Analyzer', framework: 'generic', role: 'Market trend analysis' },
      { name: 'Business Intelligence', framework: 'agentcore', role: 'BI reporting and insights' }
    ],
    estimatedTime: '2-3 hours',
    complexity: 'medium',
    icon: Brain,
    benefits: [
      'Accurate demand forecasting',
      'Predictive customer insights',
      'Market trend identification',
      'Automated BI reporting'
    ],
    prerequisites: [
      'Historical usage data',
      'Customer behavior data',
      'AWS Bedrock credentials',
      'BI platform integration'
    ]
  }
];

export const WorkflowTemplateSelector: React.FC<WorkflowTemplateSelectorProps> = ({
  industry,
  onTemplateSelect,
  selectedTemplate
}) => {
  const industryTemplates = workflowTemplates.filter(template => template.industry === industry);
  
  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'low': return 'green';
      case 'medium': return 'yellow';
      case 'high': return 'red';
      default: return 'gray';
    }
  };

  const getFrameworkColor = (framework: string) => {
    switch (framework) {
      case 'generic': return 'purple';
      case 'strands': return 'green';
      case 'agentcore': return 'blue';
      default: return 'gray';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">
          {industry.charAt(0).toUpperCase() + industry.slice(1)} Workflow Templates
        </h3>
        <p className="text-sm text-gray-400">
          Choose from pre-built workflow templates optimized for your industry
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {industryTemplates.map((template) => {
          const IconComponent = template.icon;
          const isSelected = selectedTemplate === template.id;
          const complexityColor = getComplexityColor(template.complexity);
          
          return (
            <Card
              key={template.id}
              className={`cursor-pointer transition-all duration-200 ${
                isSelected
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-gray-600 hover:border-gray-500 bg-beam-dark-accent'
              }`}
              onClick={() => onTemplateSelect(template)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <IconComponent className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <CardTitle className="text-white text-base">{template.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="border-gray-600 text-gray-300 text-xs">
                          {template.category}
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className={`border-${complexityColor}-500 text-${complexityColor}-400 text-xs`}
                        >
                          {template.complexity} complexity
                        </Badge>
                      </div>
                    </div>
                  </div>
                  {isSelected && (
                    <CheckCircle className="h-5 w-5 text-blue-400" />
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-300">{template.description}</p>
                
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{template.estimatedTime}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span>{template.agents.length} agents</span>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-xs font-medium text-gray-300 mb-2">Agents Included:</h4>
                  <div className="space-y-1">
                    {template.agents.slice(0, 3).map((agent, index) => {
                      const frameworkColor = getFrameworkColor(agent.framework);
                      return (
                        <div key={index} className="flex items-center gap-2 text-xs">
                          <Badge 
                            className={`bg-${frameworkColor}-600 text-white`}
                            style={{ fontSize: '10px', padding: '2px 6px' }}
                          >
                            {agent.framework}
                          </Badge>
                          <span className="text-gray-300">{agent.name}</span>
                        </div>
                      );
                    })}
                    {template.agents.length > 3 && (
                      <div className="text-xs text-gray-400">
                        +{template.agents.length - 3} more agents
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-xs font-medium text-gray-300 mb-2">Key Benefits:</h4>
                  <ul className="space-y-1">
                    {template.benefits.slice(0, 2).map((benefit, index) => (
                      <li key={index} className="text-xs text-gray-400 flex items-center gap-1">
                        <CheckCircle className="h-3 w-3 text-green-400" />
                        {benefit}
                      </li>
                    ))}
                    {template.benefits.length > 2 && (
                      <li className="text-xs text-gray-400">
                        +{template.benefits.length - 2} more benefits
                      </li>
                    )}
                  </ul>
                </div>
                
                {isSelected && (
                  <div className="pt-2 border-t border-gray-700">
                    <Button 
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle template deployment
                        console.log('Deploying template:', template.id);
                      }}
                    >
                      Deploy Workflow
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {industryTemplates.length === 0 && (
        <div className="text-center py-12">
          <Zap className="h-12 w-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No workflow templates available for {industry}</p>
          <p className="text-sm text-gray-500 mt-2">
            Templates are being developed for this industry
          </p>
        </div>
      )}
    </div>
  );
};