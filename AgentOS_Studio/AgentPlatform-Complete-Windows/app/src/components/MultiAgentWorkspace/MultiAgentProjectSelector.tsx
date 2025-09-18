import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Bot, TrendingUp, Users, Workflow, ArrowRight, Star, Radio } from 'lucide-react';

interface ProjectSelectorProps {
  onSelectProject: (projectType: string) => void;
}

export const MultiAgentProjectSelector: React.FC<ProjectSelectorProps> = ({ onSelectProject }) => {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  const projects = [
    {
      id: 'cvm-management',
      title: 'Telco CVM Management Centre',
      description: 'Complete Customer Value Management workflow with 6 specialized AI agents for customer segmentation, campaign optimization, and revenue growth.',
      icon: Users,
      color: 'text-green-400',
      bgColor: 'bg-green-900/20',
      borderColor: 'border-green-400/30',
      status: 'completed',
      agents: 6,
      connections: 12,
      features: ['Customer Segmentation', 'Campaign Management', 'Churn Prediction', 'Revenue Optimization'],
      preview: '/placeholder-cvm.jpg'
    },
    {
      id: 'wealth-management',
      title: 'AI Wealth Management Centre',
      description: 'Complete wealth management workflow with 6 specialized AI agents for market research, risk analysis, and investment optimization.',
      icon: TrendingUp,
      color: 'text-purple-400',
      bgColor: 'bg-purple-900/20',
      borderColor: 'border-purple-400/30',
      status: 'completed',
      agents: 6,
      connections: 11,
      features: ['Real-time Market Research', 'Risk Monitoring', 'Portfolio Optimization', 'Compliance Checks'],
      preview: '/placeholder-wealth.jpg'
    },
    {
      id: 'network-twin',
      title: 'Network Twin Digital Centre',
      description: 'Complete network digital twin workflow with 8 specialized AI agents for RAN optimization, predictive maintenance, and coverage analysis.',
      icon: Radio,
      color: 'text-blue-400',
      bgColor: 'bg-blue-900/20',
      borderColor: 'border-blue-400/30',
      status: 'completed',
      agents: 8,
      connections: 12,
      features: ['RAN Intelligence', 'Predictive Maintenance', 'Coverage Optimization', 'Energy Efficiency'],
      preview: '/placeholder-network.jpg'
    },
    {
      id: 'customer-service',
      title: 'Customer Service Hub',
      description: 'Multi-agent customer service workflow with sentiment analysis, ticket routing, and automated responses.',
      icon: Users,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-900/20',
      borderColor: 'border-cyan-400/30',
      status: 'template',
      agents: 4,
      connections: 8,
      features: ['Sentiment Analysis', 'Ticket Routing', 'Knowledge Base', 'Escalation Management'],
      preview: '/placeholder-service.jpg'
    },
    {
      id: 'content-creation',
      title: 'Content Creation Pipeline',
      description: 'Automated content generation workflow with research agents, writers, editors, and quality assurance.',
      icon: Bot,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-900/20',
      borderColor: 'border-emerald-400/30',
      status: 'template',
      agents: 5,
      connections: 9,
      features: ['Research & Analysis', 'Content Generation', 'Quality Review', 'SEO Optimization'],
      preview: '/placeholder-content.jpg'
    }
  ];

  const handleSelectProject = (projectId: string) => {
    setSelectedProject(projectId);
  };

  const handleOpenProject = () => {
    if (selectedProject) {
      onSelectProject(selectedProject);
    }
  };

  const handleCreateNew = () => {
    onSelectProject('new-workflow');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-blue-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Multi-Agent Workspace
          </h1>
          <p className="text-slate-300 text-lg">
            Choose a project template or create a new multi-agent workflow from scratch
          </p>
        </div>

        {/* Create New Workflow Card */}
        <Card 
          className={`mb-8 cursor-pointer transition-all duration-200 bg-slate-800/40 backdrop-blur-lg border-2 hover:border-cyan-400/50 ${
            selectedProject === 'new' ? 'border-cyan-400 shadow-lg shadow-cyan-400/20' : 'border-slate-600/30'
          }`}
          onClick={() => handleSelectProject('new')}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-cyan-900/20 rounded-xl border border-cyan-400/30">
                  <Plus className="h-8 w-8 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-1">Create New Workflow</h3>
                  <p className="text-slate-400">Start with a blank canvas and build your custom multi-agent orchestration</p>
                </div>
              </div>
              <Button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleCreateNew();
                }}
                className="bg-cyan-600 hover:bg-cyan-700 text-white"
              >
                Create New
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Project Templates */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <Workflow className="h-6 w-6 text-purple-400" />
            Project Templates
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {projects.map((project) => {
              const IconComponent = project.icon;
              const isSelected = selectedProject === project.id;
              
              return (
                <Card 
                  key={project.id}
                  className={`cursor-pointer transition-all duration-200 bg-slate-800/40 backdrop-blur-lg border-2 hover:border-purple-400/50 ${
                    isSelected ? 'border-purple-400 shadow-lg shadow-purple-400/20' : 'border-slate-600/30'
                  }`}
                  onClick={() => handleSelectProject(project.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className={`p-3 rounded-lg ${project.bgColor} border ${project.borderColor}`}>
                        <IconComponent className={`h-6 w-6 ${project.color}`} />
                      </div>
                      <div className="flex flex-col gap-1">
                        <Badge className={`${
                          project.status === 'completed' ? 'bg-green-900/20 text-green-300 border-green-700/30' :
                          'bg-blue-900/20 text-blue-300 border-blue-700/30'
                        }`}>
                          {project.status === 'completed' ? 'Ready' : 'Template'}
                        </Badge>
                        {project.status === 'completed' && (
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                            <span className="text-xs text-yellow-400">Featured</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <CardTitle className="text-lg text-white mt-3">{project.title}</CardTitle>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <p className="text-slate-400 text-sm">{project.description}</p>
                    
                    <div className="flex gap-4 text-xs text-slate-500">
                      <span>{project.agents} Agents</span>
                      <span>•</span>
                      <span>{project.connections} Connections</span>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-slate-300">Key Features:</p>
                      <div className="flex flex-wrap gap-1">
                        {project.features.slice(0, 2).map((feature, index) => (
                          <Badge key={index} variant="outline" className="text-xs py-0 px-2 border-slate-600 text-slate-400">
                            {feature}
                          </Badge>
                        ))}
                        {project.features.length > 2 && (
                          <Badge variant="outline" className="text-xs py-0 px-2 border-slate-600 text-slate-400">
                            +{project.features.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        {selectedProject && selectedProject !== 'new' && (
          <div className="flex justify-center">
            <Button 
              onClick={handleOpenProject}
              size="lg"
              className="bg-purple-600 hover:bg-purple-700 text-white px-8"
            >
              Open {projects.find(p => p.id === selectedProject)?.title}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};