import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  FlaskConical, 
  Atom, 
  BookOpen, 
  FileText, 
  TrendingUp, 
  Lightbulb,
  Microscope,
  Cpu,
  Database,
  Search,
  Target,
  Zap,
  Beaker,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const RDDiscovery = () => {
  const [activeResearch, setActiveResearch] = useState('catalyst-optimization');
  const [isRunningSimulation, setIsRunningSimulation] = useState(false);

  const runSimulation = (researchArea: string) => {
    setActiveResearch(researchArea);
    setIsRunningSimulation(true);
    setTimeout(() => setIsRunningSimulation(false), 4000);
  };

  const researchProjects = {
    'catalyst-optimization': {
      name: 'Hydrogen Production Catalyst Optimization',
      description: 'Advanced catalyst design for improved hydrogen electrolysis efficiency',
      progress: 78,
      timeline: '18 months',
      budget: '€2.3M',
      team: 'Materials Science Division',
      expectedImpact: '25% efficiency improvement',
      status: 'Active'
    },
    'membrane-technology': {
      name: 'Next-Gen Membrane Technology',
      description: 'Revolutionary membrane materials for gas separation processes',
      progress: 45,
      timeline: '24 months',
      budget: '€3.1M',
      team: 'Chemical Engineering Lab',
      expectedImpact: '40% cost reduction',
      status: 'Active'
    },
    'carbon-capture': {
      name: 'Advanced Carbon Capture Materials',
      description: 'Novel sorbent materials for industrial CO2 capture',
      progress: 62,
      timeline: '15 months',
      budget: '€1.8M',
      team: 'Environmental Technology Group',
      expectedImpact: '90% capture efficiency',
      status: 'Active'
    }
  };

  const literatureInsights = [
    {
      title: 'Breakthrough in Perovskite Catalysts for Water Splitting',
      journal: 'Nature Energy',
      date: '2024-03-15',
      relevance: 'High',
      impact: 'Could improve electrolysis efficiency by 30%',
      keyFindings: 'Novel perovskite structure shows exceptional stability and activity',
      citations: 127,
      recommendation: 'Investigate for hydrogen production applications'
    },
    {
      title: 'Machine Learning Accelerated Catalyst Discovery',
      journal: 'Science',
      date: '2024-03-10',
      relevance: 'High',
      impact: 'Reduces catalyst development time by 70%',
      keyFindings: 'AI models predict catalyst performance with 95% accuracy',
      citations: 89,
      recommendation: 'Implement ML pipeline for catalyst screening'
    },
    {
      title: 'Advanced MOF Materials for Gas Separation',
      journal: 'Chemical Reviews',
      date: '2024-03-08',
      relevance: 'Medium',
      impact: 'Enhanced selectivity for industrial gas purification',
      keyFindings: 'Tunable pore structures enable precise gas separation',
      citations: 156,
      recommendation: 'Evaluate for oxygen/nitrogen separation processes'
    }
  ];

  const patentAnalysis = [
    {
      title: 'Electrochemical Hydrogen Production System',
      applicant: 'Toyota Motor Corp',
      publicationDate: '2024-02-28',
      status: 'Published',
      relevance: 'High',
      technicalArea: 'Electrolysis',
      keyInnovation: 'Novel electrode configuration reduces energy consumption',
      competitiveImpact: 'Potential threat to current technology',
      recommendation: 'File continuation patent for improved design'
    },
    {
      title: 'Advanced Gas Separation Membrane',
      applicant: 'BASF SE',
      publicationDate: '2024-02-25',
      status: 'Granted',
      relevance: 'Medium',
      technicalArea: 'Membrane Technology',
      keyInnovation: 'Composite membrane with enhanced permeability',
      competitiveImpact: 'Complementary to Air Liquide portfolio',
      recommendation: 'Explore licensing opportunities'
    },
    {
      title: 'Carbon Capture Sorbent Material',
      applicant: 'Shell Global Solutions',
      publicationDate: '2024-02-20',
      status: 'Pending',
      relevance: 'High',
      technicalArea: 'Carbon Capture',
      keyInnovation: 'Regenerable sorbent with high CO2 capacity',
      competitiveImpact: 'Direct competition with Air Liquide research',
      recommendation: 'Accelerate internal development program'
    }
  ];

  const digitalTwinSimulations = [
    {
      name: 'Catalyst Performance Modeling',
      description: 'Molecular dynamics simulation of catalyst active sites',
      status: 'Running',
      progress: 85,
      estimatedCompletion: '2 hours',
      computeResources: 'HPC Cluster (256 cores)',
      expectedResults: 'Optimal catalyst composition and structure'
    },
    {
      name: 'Membrane Permeability Analysis',
      description: 'Multi-scale modeling of gas transport through membranes',
      status: 'Queued',
      progress: 0,
      estimatedCompletion: '6 hours',
      computeResources: 'GPU Cluster (8x A100)',
      expectedResults: 'Permeability coefficients and selectivity ratios'
    },
    {
      name: 'Process Optimization Study',
      description: 'System-level optimization of hydrogen production process',
      status: 'Completed',
      progress: 100,
      estimatedCompletion: 'Completed',
      computeResources: 'Cloud Computing (AWS)',
      expectedResults: 'Optimal operating conditions identified'
    }
  ];

  const agentActivities = [
    {
      name: 'Literature Mining Agent',
      status: 'Active',
      lastAction: 'Analyzed 1,247 research papers on catalyst materials',
      discoveries: 23,
      accuracy: 94,
      processingRate: '150 papers/hour'
    },
    {
      name: 'Patent Research Agent',
      status: 'Active',
      lastAction: 'Identified 15 relevant patents in hydrogen technology',
      discoveries: 8,
      accuracy: 91,
      processingRate: '200 patents/hour'
    },
    {
      name: 'Digital Twin Simulator',
      status: 'Running',
      lastAction: 'Completed molecular dynamics simulation of catalyst',
      discoveries: 5,
      accuracy: 97,
      processingRate: '12 simulations/day'
    },
    {
      name: 'Innovation Tracker',
      status: 'Monitoring',
      lastAction: 'Tracked 45 emerging technologies in clean energy',
      discoveries: 12,
      accuracy: 89,
      processingRate: '24/7 monitoring'
    }
  ];

  const getRelevanceColor = (relevance: string) => {
    switch (relevance) {
      case 'High': return 'border-red-500/30 text-red-400 bg-red-500/10';
      case 'Medium': return 'border-yellow-500/30 text-yellow-400 bg-yellow-500/10';
      case 'Low': return 'border-blue-500/30 text-blue-400 bg-blue-500/10';
      default: return 'border-gray-500/30 text-gray-400 bg-gray-500/10';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Running': return 'text-green-400';
      case 'Completed': return 'text-blue-400';
      case 'Queued': return 'text-yellow-400';
      case 'Active': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="flex-1 h-screen overflow-y-auto bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="p-6 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                R&D Materials Discovery & Innovation
              </h1>
              <p className="text-gray-300">
                Accelerated materials discovery with AI-powered research analysis and digital twin simulation
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                <FlaskConical className="w-4 h-4 mr-1" />
                3 Active Projects
              </Badge>
              <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
                <Cpu className="w-4 h-4 mr-1" />
                Digital Twins Running
              </Badge>
            </div>
          </div>
          
          {/* Research Overview */}
          <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-orange-400" />
                Active Research Portfolio
              </CardTitle>
              <CardDescription className="text-gray-300">
                Air Liquide Materials Science & Innovation Division
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-6">
                {Object.entries(researchProjects).map(([key, project]) => (
                  <div
                    key={key}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      activeResearch === key
                        ? 'border-orange-500 bg-orange-500/10'
                        : 'border-gray-600 bg-gray-700/30 hover:border-gray-500'
                    }`}
                    onClick={() => setActiveResearch(key)}
                  >
                    <h4 className="font-semibold text-white mb-2">{project.name}</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Progress:</span>
                        <span className="text-green-400">{project.progress}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Timeline:</span>
                        <span className="text-white">{project.timeline}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Budget:</span>
                        <span className="text-blue-400">{project.budget}</span>
                      </div>
                    </div>
                    <Progress value={project.progress} className="mt-3" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="literature" className="w-full">
          <TabsList className="grid grid-cols-4 mb-6 bg-gray-800/50 border border-gray-700/50 rounded-xl p-1">
            <TabsTrigger value="literature" className="rounded-lg">
              Literature Mining
            </TabsTrigger>
            <TabsTrigger value="patents" className="rounded-lg">
              Patent Analysis
            </TabsTrigger>
            <TabsTrigger value="simulation" className="rounded-lg">
              Digital Twins
            </TabsTrigger>
            <TabsTrigger value="agents" className="rounded-lg">
              AI Agents
            </TabsTrigger>
          </TabsList>

          {/* Literature Mining Tab */}
          <TabsContent value="literature" className="space-y-6">
            <div className="space-y-4">
              {literatureInsights.map((paper, index) => (
                <Card key={index} className="bg-gray-800/50 border-gray-700/50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-white mb-1">{paper.title}</h4>
                        <div className="flex items-center gap-4 text-sm text-gray-400 mb-2">
                          <span className="flex items-center gap-1">
                            <BookOpen className="w-3 h-3" />
                            {paper.journal}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {paper.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            {paper.citations} citations
                          </span>
                        </div>
                      </div>
                      <Badge variant="outline" className={getRelevanceColor(paper.relevance)}>
                        {paper.relevance} Relevance
                      </Badge>
                    </div>
                    
                    <p className="text-gray-300 mb-3">{paper.keyFindings}</p>
                    
                    <div className="p-3 bg-gray-700/50 rounded-lg mb-3">
                      <div className="text-sm">
                        <div className="text-orange-400 font-medium mb-1">Potential Impact:</div>
                        <div className="text-gray-300">{paper.impact}</div>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                      <div className="text-sm">
                        <div className="text-blue-400 font-medium mb-1">AI Recommendation:</div>
                        <div className="text-gray-300">{paper.recommendation}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Patent Analysis Tab */}
          <TabsContent value="patents" className="space-y-6">
            <div className="space-y-4">
              {patentAnalysis.map((patent, index) => (
                <Card key={index} className="bg-gray-800/50 border-gray-700/50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-white mb-1">{patent.title}</h4>
                        <div className="flex items-center gap-4 text-sm text-gray-400 mb-2">
                          <span>{patent.applicant}</span>
                          <span>{patent.publicationDate}</span>
                          <Badge variant="outline" className="text-xs">
                            {patent.status}
                          </Badge>
                        </div>
                      </div>
                      <Badge variant="outline" className={getRelevanceColor(patent.relevance)}>
                        {patent.relevance}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <span className="text-gray-400 text-sm">Technical Area:</span>
                        <div className="text-white">{patent.technicalArea}</div>
                      </div>
                      <div>
                        <span className="text-gray-400 text-sm">Competitive Impact:</span>
                        <div className="text-white">{patent.competitiveImpact}</div>
                      </div>
                    </div>
                    
                    <p className="text-gray-300 mb-3">{patent.keyInnovation}</p>
                    
                    <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                      <div className="text-sm">
                        <div className="text-purple-400 font-medium mb-1">Strategic Recommendation:</div>
                        <div className="text-gray-300">{patent.recommendation}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Digital Twin Simulation Tab */}
          <TabsContent value="simulation" className="space-y-6">
            <div className="space-y-4">
              {digitalTwinSimulations.map((simulation, index) => (
                <Card key={index} className="bg-gray-800/50 border-gray-700/50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-white flex items-center gap-2">
                          <Cpu className="w-4 h-4 text-blue-400" />
                          {simulation.name}
                        </h4>
                        <p className="text-gray-300 mt-1">{simulation.description}</p>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`${
                          simulation.status === 'Running' 
                            ? 'border-green-500/30 text-green-400' 
                            : simulation.status === 'Completed'
                            ? 'border-blue-500/30 text-blue-400'
                            : 'border-yellow-500/30 text-yellow-400'
                        }`}
                      >
                        {simulation.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <span className="text-gray-400 text-sm">Compute Resources:</span>
                        <div className="text-white">{simulation.computeResources}</div>
                      </div>
                      <div>
                        <span className="text-gray-400 text-sm">Est. Completion:</span>
                        <div className="text-white">{simulation.estimatedCompletion}</div>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-gray-400 text-sm">Progress:</span>
                        <span className="text-white text-sm">{simulation.progress}%</span>
                      </div>
                      <Progress value={simulation.progress} className="w-full" />
                    </div>
                    
                    <div className="p-3 bg-gray-700/50 rounded-lg">
                      <div className="text-sm">
                        <div className="text-green-400 font-medium mb-1">Expected Results:</div>
                        <div className="text-gray-300">{simulation.expectedResults}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* AI Agents Tab */}
          <TabsContent value="agents" className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              {agentActivities.map((agent, index) => (
                <Card key={index} className="bg-gray-800/50 border-gray-700/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-white flex items-center gap-2">
                        {agent.name === 'Literature Mining Agent' && <Search className="w-4 h-4" />}
                        {agent.name === 'Patent Research Agent' && <FileText className="w-4 h-4" />}
                        {agent.name === 'Digital Twin Simulator' && <Cpu className="w-4 h-4" />}
                        {agent.name === 'Innovation Tracker' && <Lightbulb className="w-4 h-4" />}
                        {agent.name}
                      </h4>
                      <Badge 
                        variant="outline" 
                        className={`${getStatusColor(agent.status) === 'text-green-400' 
                          ? 'border-green-500/30 text-green-400' 
                          : 'border-blue-500/30 text-blue-400'
                        }`}
                      >
                        {agent.status}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-300 mb-3">{agent.lastAction}</p>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-gray-400 text-xs">Discoveries:</span>
                        <div className="text-orange-400 font-medium">{agent.discoveries}</div>
                      </div>
                      <div>
                        <span className="text-gray-400 text-xs">Accuracy:</span>
                        <div className="text-green-400 font-medium">{agent.accuracy}%</div>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-400 text-xs">Processing Rate:</span>
                        <div className="text-blue-400 font-medium">{agent.processingRate}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default RDDiscovery;