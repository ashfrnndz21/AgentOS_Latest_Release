import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Bot, TrendingUp, Users, Workflow, ArrowRight, Star, Radio, Sparkles, Factory, Truck, DollarSign, UserCheck, FlaskConical, Shield } from 'lucide-react';
import { useIndustry } from '@/contexts/IndustryContext';

interface ProjectSelectorProps {
  onSelectProject: (projectType: string) => void;
}

export const MultiAgentProjectSelector: React.FC<ProjectSelectorProps> = ({ onSelectProject }) => {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const { currentIndustry } = useIndustry();

  // Cross-industry template (visible to all)
  const crossIndustryProjects = [
    {
      id: 'strands-workflow',
      title: 'Strands Intelligence Workspace',
      description: 'Advanced multi-agent workflows powered by Strands intelligence patterns and Ollama models. Features dependency resolution, context management, and intelligent task orchestration.',
      icon: Sparkles,
      color: 'text-purple-400',
      bgColor: 'bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-slate-800/50',
      borderColor: 'border-purple-400/30',
      status: 'featured',
      agents: 'Dynamic',
      connections: 'Smart',
      features: ['Strands Reasoning Patterns', 'Local Ollama Integration', 'Smart Tools', 'Auto-Orchestration'],
      preview: '/placeholder-strands.jpg',
      category: 'cross-industry'
    }
  ];

  // Telco industry templates
  const telcoProjects = [
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
      preview: '/placeholder-cvm.jpg',
      category: 'telco'
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
      preview: '/placeholder-network.jpg',
      category: 'telco'
    }
  ];

  // Banking industry templates
  const bankingProjects = [
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
      preview: '/placeholder-wealth.jpg',
      category: 'banking'
    }
  ];

  // Industrial Technology templates
  const industrialProjects = [
    {
      id: 'industrial-procurement',
      title: 'Hydrogen Supply Chain Optimization',
      description: 'Autonomous hydrogen supply chain management with supplier research, RFP generation, contract negotiation, and delivery optimization for clean energy solutions.',
      icon: Truck,
      color: 'text-orange-400',
      bgColor: 'bg-orange-900/20',
      borderColor: 'border-orange-400/30',
      status: 'featured',
      agents: 7,
      connections: 14,
      features: ['Hydrogen Suppliers', 'Clean Energy RFPs', 'Contract Optimization', 'Supply Monitoring'],
      preview: '/placeholder-procurement.jpg',
      category: 'industrial'
    },
    {
      id: 'industrial-forecasting',
      title: 'Industrial Gas Market Intelligence',
      description: 'Real-time market forecasting for industrial gases with demand prediction, pricing analysis, and competitive intelligence for oxygen, nitrogen, and hydrogen markets.',
      icon: DollarSign,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-900/20',
      borderColor: 'border-yellow-400/30',
      status: 'featured',
      agents: 6,
      connections: 12,
      features: ['Gas Demand Forecasting', 'Market Analysis', 'Price Optimization', 'Competitive Intelligence'],
      preview: '/placeholder-forecasting.jpg',
      category: 'industrial'
    },
    {
      id: 'industrial-recruitment',
      title: 'Engineering Talent Acquisition',
      description: 'Specialized talent acquisition for chemical engineers, process engineers, and industrial gas specialists with technical screening and career development.',
      icon: UserCheck,
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-900/20',
      borderColor: 'border-indigo-400/30',
      status: 'featured',
      agents: 5,
      connections: 10,
      features: ['Engineering Talent', 'Technical Screening', 'Skills Assessment', 'Career Pathways'],
      preview: '/placeholder-recruitment.jpg',
      category: 'industrial'
    },
    {
      id: 'industrial-rd',
      title: 'Gas Separation Technology R&D',
      description: 'Accelerated development of gas separation and purification technologies with molecular simulation, catalyst optimization, and process innovation for industrial applications.',
      icon: FlaskConical,
      color: 'text-pink-400',
      bgColor: 'bg-pink-900/20',
      borderColor: 'border-pink-400/30',
      status: 'featured',
      agents: 6,
      connections: 11,
      features: ['Molecular Simulation', 'Catalyst Development', 'Process Optimization', 'Technology Scaling'],
      preview: '/placeholder-rd.jpg',
      category: 'industrial'
    },
    {
      id: 'industrial-safety',
      title: 'Industrial Plant Safety & Maintenance',
      description: 'Comprehensive safety monitoring for gas production facilities with predictive maintenance, leak detection, and emergency response for high-pressure industrial operations.',
      icon: Shield,
      color: 'text-red-400',
      bgColor: 'bg-red-900/20',
      borderColor: 'border-red-400/30',
      status: 'featured',
      agents: 8,
      connections: 16,
      features: ['Gas Leak Detection', 'Equipment Monitoring', 'Safety Protocols', 'Emergency Response'],
      preview: '/placeholder-safety.jpg',
      category: 'industrial'
    }
  ];

  // Combine all projects for search/selection
  const allProjects = [...crossIndustryProjects, ...telcoProjects, ...bankingProjects, ...industrialProjects];

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
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-red-400 bg-clip-text text-transparent">
            {currentIndustry.displayName}
          </h1>
          <p className="text-slate-300 text-lg">
            {currentIndustry.id === 'industrial' 
              ? 'Choose an industrial gas workflow template or create a new multi-agent solution'
              : currentIndustry.id === 'banking'
              ? 'Choose a banking workflow template or create a new financial multi-agent solution'
              : currentIndustry.id === 'telco'
              ? 'Choose a telecommunications workflow template or create a new network multi-agent solution'
              : `Choose a ${currentIndustry.name} workflow template or create a new multi-agent solution`
            }
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
                  <h3 className="text-xl font-semibold text-white mb-1">
                    Create New {currentIndustry.id === 'industrial' ? 'Industrial' : 
                               currentIndustry.id === 'banking' ? 'Banking' : 
                               currentIndustry.id === 'telco' ? 'Telco' : 
                               currentIndustry.name.charAt(0).toUpperCase() + currentIndustry.name.slice(1)} Workflow
                  </h3>
                  <p className="text-slate-400">
                    Start with a blank canvas and build your custom {
                      currentIndustry.id === 'industrial' ? 'industrial gas solution' :
                      currentIndustry.id === 'banking' ? 'financial services solution' :
                      currentIndustry.id === 'telco' ? 'telecommunications solution' :
                      `${currentIndustry.name} solution`
                    }
                  </p>
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
          
          {/* Cross-Industry Templates */}
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-4 text-slate-300">General & Cross-Industry</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {crossIndustryProjects.map((project) => {
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
                            project.status === 'featured' ? 'bg-purple-900/20 text-purple-300 border-purple-700/30' :
                            project.status === 'completed' ? 'bg-green-900/20 text-green-300 border-green-700/30' :
                            'bg-blue-900/20 text-blue-300 border-blue-700/30'
                          }`}>
                            {project.status === 'featured' ? '🧠 AI Powered' : 
                             project.status === 'completed' ? 'Ready' : 'Template'}
                          </Badge>
                          {(project.status === 'completed' || project.status === 'featured') && (
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

          {/* Telco Industry Templates */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Radio className="h-6 w-6 text-blue-400" />
              <h3 className="text-lg font-medium text-slate-300">Telecommunications</h3>
              <Badge className="bg-blue-900/20 text-blue-300 border-blue-700/30">
                📡 Telco
              </Badge>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {telcoProjects.map((project) => {
                const IconComponent = project.icon;
                const isSelected = selectedProject === project.id;
                
                return (
                  <Card 
                    key={project.id}
                    className={`cursor-pointer transition-all duration-200 bg-slate-800/40 backdrop-blur-lg border-2 hover:border-blue-400/50 ${
                      isSelected ? 'border-blue-400 shadow-lg shadow-blue-400/20' : 'border-slate-600/30'
                    }`}
                    onClick={() => handleSelectProject(project.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className={`p-3 rounded-lg ${project.bgColor} border ${project.borderColor}`}>
                          <IconComponent className={`h-6 w-6 ${project.color}`} />
                        </div>
                        <div className="flex flex-col gap-1">
                          <Badge className="bg-blue-900/20 text-blue-300 border-blue-700/30">
                            📡 Telco
                          </Badge>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                            <span className="text-xs text-yellow-400">Featured</span>
                          </div>
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

          {/* Banking Industry Templates */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="h-6 w-6 text-purple-400" />
              <h3 className="text-lg font-medium text-slate-300">Banking & Finance</h3>
              <Badge className="bg-purple-900/20 text-purple-300 border-purple-700/30">
                🏦 Banking
              </Badge>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {bankingProjects.map((project) => {
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
                          <Badge className="bg-purple-900/20 text-purple-300 border-purple-700/30">
                            🏦 Banking
                          </Badge>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                            <span className="text-xs text-yellow-400">Featured</span>
                          </div>
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

          {/* Industry-Specific Solutions */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Factory className="h-6 w-6 text-blue-400" />
              <h3 className="text-lg font-medium text-slate-300">
                {currentIndustry.id === 'industrial' ? 'Industrial Gas Solutions' :
                 currentIndustry.id === 'banking' ? 'Financial Services Solutions' :
                 currentIndustry.id === 'telco' ? 'Telecommunications Solutions' :
                 `${currentIndustry.name.charAt(0).toUpperCase() + currentIndustry.name.slice(1)} Solutions`}
              </h3>
              <Badge className="bg-blue-900/20 text-blue-300 border-blue-700/30">
                {currentIndustry.id === 'industrial' ? '🧪 Air Liquide' :
                 currentIndustry.id === 'banking' ? '🏦 Banking' :
                 currentIndustry.id === 'telco' ? '📡 Telco' :
                 `🏢 ${currentIndustry.displayName}`}
              </Badge>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {industrialProjects.map((project) => {
                const IconComponent = project.icon;
                const isSelected = selectedProject === project.id;
                
                return (
                  <Card 
                    key={project.id}
                    className={`cursor-pointer transition-all duration-200 bg-slate-800/40 backdrop-blur-lg border-2 hover:border-orange-400/50 ${
                      isSelected ? 'border-orange-400 shadow-lg shadow-orange-400/20' : 'border-slate-600/30'
                    }`}
                    onClick={() => handleSelectProject(project.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className={`p-3 rounded-lg ${project.bgColor} border ${project.borderColor}`}>
                          <IconComponent className={`h-6 w-6 ${project.color}`} />
                        </div>
                        <div className="flex flex-col gap-1">
                          <Badge className="bg-orange-900/20 text-orange-300 border-orange-700/30">
                            🏭 Industrial
                          </Badge>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                            <span className="text-xs text-yellow-400">Featured</span>
                          </div>
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
        </div>

        {/* Action Buttons */}
        {selectedProject && selectedProject !== 'new' && (
          <div className="flex justify-center">
            <Button 
              onClick={handleOpenProject}
              size="lg"
              className="bg-purple-600 hover:bg-purple-700 text-white px-8"
            >
              Open {allProjects.find(p => p.id === selectedProject)?.title}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};