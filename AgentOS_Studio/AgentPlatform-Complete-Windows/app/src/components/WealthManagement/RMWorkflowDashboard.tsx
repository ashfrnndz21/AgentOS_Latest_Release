
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, CheckCircle, Clock, AlertTriangle, Phone, Calendar, MessageSquare, TrendingUp, DollarSign, Target, Award } from 'lucide-react';

export const RMWorkflowDashboard = () => {
  const [selectedClient, setSelectedClient] = useState('john-doe');

  const clientPortfolio = {
    'john-doe': {
      name: 'John Doe',
      portfolioValue: 1200000,
      riskProfile: 'Moderate',
      lastReview: '2024-12-01',
      nextReview: '2024-12-15',
      performance: '+9.2%',
      status: 'active',
      alerts: 2,
      tasks: 3,
      opportunities: ['Tax Loss Harvesting', 'ESG Rebalancing', 'Alternative Investments']
    },
    'sarah-smith': {
      name: 'Sarah Smith',
      portfolioValue: 850000,
      riskProfile: 'Conservative',
      lastReview: '2024-11-28',
      nextReview: '2024-12-20',
      performance: '+6.7%',
      status: 'review_needed',
      alerts: 1,
      tasks: 5,
      opportunities: ['Fixed Income Optimization', 'Dividend Growth Strategy']
    },
    'mike-johnson': {
      name: 'Mike Johnson',
      portfolioValue: 2100000,
      riskProfile: 'Aggressive',
      lastReview: '2024-12-05',
      nextReview: '2024-12-25',
      performance: '+12.8%',
      status: 'active',
      alerts: 0,
      tasks: 1,
      opportunities: ['Growth Stock Allocation', 'International Exposure', 'Crypto Integration']
    }
  };

  const workflowSteps = [
    {
      id: 'research',
      title: 'Market Research',
      status: 'completed',
      description: 'AI agents analyze current market conditions',
      timestamp: '09:00 AM',
      insights: ['Tech sector showing strong momentum', 'Fed policy remains accommodative', 'Emerging markets opportunity identified']
    },
    {
      id: 'analysis',
      title: 'Portfolio Analysis',
      status: 'in_progress',
      description: 'Deep dive into client portfolio performance',
      timestamp: '09:30 AM',
      insights: ['Overweight in growth stocks', 'Underweight in international', 'ESG allocation below target']
    },
    {
      id: 'recommendations',
      title: 'Generate Recommendations',
      status: 'pending',
      description: 'AI-powered investment suggestions',
      timestamp: '10:00 AM',
      insights: []
    },
    {
      id: 'client_prep',
      title: 'Client Meeting Prep',
      status: 'pending',
      description: 'Prepare personalized presentation',
      timestamp: '10:30 AM',
      insights: []
    }
  ];

  const upcomingTasks = [
    {
      id: 1,
      client: 'John Doe',
      task: 'Portfolio Review Meeting',
      priority: 'high',
      dueDate: '2024-12-15',
      type: 'meeting',
      duration: '1 hour',
      preparation: 'Review Q4 performance, discuss 2025 strategy'
    },
    {
      id: 2,
      client: 'Sarah Smith',
      task: 'Risk Assessment Update',
      priority: 'medium',
      dueDate: '2024-12-18',
      type: 'analysis',
      duration: '30 mins',
      preparation: 'Complete risk questionnaire review'
    },
    {
      id: 3,
      client: 'Mike Johnson',
      task: 'Tax Planning Call',
      priority: 'high',
      dueDate: '2024-12-20',
      type: 'call',
      duration: '45 mins',
      preparation: 'Prepare tax loss harvesting recommendations'
    },
    {
      id: 4,
      client: 'Emily Chen',
      task: 'Onboarding Session',
      priority: 'medium',
      dueDate: '2024-12-22',
      type: 'onboarding',
      duration: '2 hours',
      preparation: 'Complete KYC and investment preference analysis'
    }
  ];

  const clientMetrics = [
    { label: 'Total AUM', value: '$12.8M', change: '+8.2%', icon: DollarSign },
    { label: 'Active Clients', value: '47', change: '+3', icon: Users },
    { label: 'Avg Portfolio Performance', value: '+8.9%', change: '+1.2%', icon: TrendingUp },
    { label: 'Client Satisfaction', value: '94%', change: '+2%', icon: Award }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-900/20 text-green-300 border-green-700/30';
      case 'in_progress': return 'bg-blue-900/20 text-blue-300 border-blue-700/30';
      case 'pending': return 'bg-gray-900/20 text-gray-300 border-gray-700/30';
      default: return 'bg-gray-900/20 text-gray-300 border-gray-700/30';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-900/20 text-red-300 border-red-700/30';
      case 'medium': return 'bg-amber-900/20 text-amber-300 border-amber-700/30';
      case 'low': return 'bg-green-900/20 text-green-300 border-green-700/30';
      default: return 'bg-gray-900/20 text-gray-300 border-gray-700/30';
    }
  };

  const currentClient = clientPortfolio[selectedClient];

  return (
    <div className="space-y-6">
      {/* RM Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {clientMetrics.map((metric, index) => {
          const IconComponent = metric.icon;
          return (
            <Card key={index} className="bg-beam-dark-accent/70 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">{metric.label}</p>
                    <p className="text-2xl font-bold text-white">{metric.value}</p>
                    <p className="text-sm text-green-400">{metric.change}</p>
                  </div>
                  <IconComponent className="h-8 w-8 text-true-red" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Workflow Progress */}
        <Card className="lg:col-span-2 bg-beam-dark-accent/70 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Target className="mr-2 h-5 w-5 text-true-red" />
              Today's Workflow Progress
            </CardTitle>
            <p className="text-sm text-gray-400">AI-driven research and analysis pipeline</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {workflowSteps.map((step, index) => (
              <div key={step.id} className="relative">
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full ${
                      step.status === 'completed' ? 'bg-green-500' :
                      step.status === 'in_progress' ? 'bg-blue-500 animate-pulse' :
                      'bg-gray-500'
                    }`} />
                    {index < workflowSteps.length - 1 && (
                      <div className="w-px h-16 bg-gray-700 mt-2" />
                    )}
                  </div>
                  
                  <div className="flex-1 pb-8">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-white">{step.title}</h4>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(step.status)}>
                          {step.status.replace('_', ' ')}
                        </Badge>
                        <span className="text-xs text-gray-400">{step.timestamp}</span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-400 mb-3">{step.description}</p>
                    
                    {step.insights.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Key Insights:</p>
                        {step.insights.map((insight, idx) => (
                          <div key={idx} className="text-xs text-blue-400 flex items-start">
                            <div className="w-1 h-1 bg-blue-400 rounded-full mt-2 mr-2 flex-shrink-0" />
                            {insight}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Client Quick Actions */}
        <Card className="bg-beam-dark-accent/70 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Users className="mr-2 h-5 w-5 text-true-red" />
              Client Focus
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {Object.entries(clientPortfolio).map(([key, client]) => (
                <Button
                  key={key}
                  variant={selectedClient === key ? "default" : "ghost"}
                  className={`w-full justify-start ${
                    selectedClient === key ? "bg-true-red hover:bg-true-red/80" : "hover:bg-gray-700/50"
                  }`}
                  onClick={() => setSelectedClient(key)}
                >
                  <div className="flex items-center justify-between w-full">
                    <span>{client.name}</span>
                    {client.alerts > 0 && (
                      <Badge className="bg-red-900/20 text-red-300 border-red-700/30">
                        {client.alerts}
                      </Badge>
                    )}
                  </div>
                </Button>
              ))}
            </div>

            {currentClient && (
              <div className="p-4 rounded-lg bg-beam-dark-accent/30 border border-gray-700/50">
                <h4 className="font-medium text-white mb-3">{currentClient.name}</h4>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Portfolio Value</span>
                    <span className="text-sm font-medium text-white">
                      ${currentClient.portfolioValue.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Performance YTD</span>
                    <span className="text-sm font-medium text-green-400">
                      {currentClient.performance}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Risk Profile</span>
                    <Badge variant="outline" className="text-xs">
                      {currentClient.riskProfile}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Next Review</span>
                    <span className="text-sm text-amber-400">
                      {currentClient.nextReview}
                    </span>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
                    <Phone className="mr-2 h-4 w-4" />
                    Schedule Call
                  </Button>
                  <Button size="sm" variant="outline" className="w-full border-gray-600">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Send Message
                  </Button>
                </div>

                {currentClient.opportunities.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Opportunities:</p>
                    <div className="space-y-1">
                      {currentClient.opportunities.map((opp, idx) => (
                        <div key={idx} className="text-xs text-green-400 flex items-start">
                          <TrendingUp className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                          {opp}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Tasks */}
      <Card className="bg-beam-dark-accent/70 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Calendar className="mr-2 h-5 w-5 text-true-red" />
            Upcoming Tasks & Meetings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {upcomingTasks.map((task) => (
              <div key={task.id} className="p-4 rounded-lg bg-beam-dark-accent/30 border border-gray-700/50 hover:border-true-red/30 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-white">{task.task}</h4>
                    <p className="text-sm text-gray-400">{task.client}</p>
                  </div>
                  <Badge className={getPriorityColor(task.priority)}>
                    {task.priority}
                  </Badge>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Calendar className="h-4 w-4" />
                    {task.dueDate} • {task.duration}
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-400">
                    {task.type === 'meeting' && <Users className="h-4 w-4" />}
                    {task.type === 'call' && <Phone className="h-4 w-4" />}
                    {task.type === 'analysis' && <TrendingUp className="h-4 w-4" />}
                    {task.type === 'onboarding' && <CheckCircle className="h-4 w-4" />}
                    {task.type.charAt(0).toUpperCase() + task.type.slice(1)}
                  </div>
                  
                  <p className="text-xs text-gray-500 mt-2">{task.preparation}</p>
                </div>
                
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1 border-gray-600 text-gray-300">
                    Prepare
                  </Button>
                  <Button size="sm" className="flex-1 bg-true-red hover:bg-true-red/80">
                    Start
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
