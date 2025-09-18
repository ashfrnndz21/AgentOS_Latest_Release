import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  UserCheck, 
  Users, 
  GraduationCap, 
  TrendingUp, 
  MessageSquare, 
  Award,
  Bot,
  Database,
  Shield,
  Brain,
  Settings,
  Wrench,
  Search,
  FileText,
  Target
} from 'lucide-react';

interface RecruitmentAgentPaletteProps {
  onAddAgent: (agentType: string) => void;
  onAddUtility: (nodeType: string) => void;
}

const recruitmentAgents = [
  {
    id: 'talent-sourcing-specialist',
    name: 'Talent Sourcing Specialist',
    description: 'Identifies and sources top talent from multiple channels',
    icon: Search,
    category: 'Sourcing',
    color: 'text-blue-400',
    bgColor: 'bg-blue-900/20',
    borderColor: 'border-blue-400/30'
  },
  {
    id: 'ai-screening-specialist',
    name: 'AI Screening Specialist',
    description: 'Automated resume screening and candidate evaluation',
    icon: UserCheck,
    category: 'Screening',
    color: 'text-green-400',
    bgColor: 'bg-green-900/20',
    borderColor: 'border-green-400/30'
  },
  {
    id: 'interview-coordination-specialist',
    name: 'Interview Coordination Specialist',
    description: 'Manages interview scheduling and coordination',
    icon: MessageSquare,
    category: 'Coordination',
    color: 'text-purple-400',
    bgColor: 'bg-purple-900/20',
    borderColor: 'border-purple-400/30'
  },
  {
    id: 'onboarding-specialist',
    name: 'Onboarding Specialist',
    description: 'Streamlines new employee onboarding process',
    icon: GraduationCap,
    category: 'Onboarding',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-900/20',
    borderColor: 'border-yellow-400/30'
  },
  {
    id: 'career-development-specialist',
    name: 'Career Development Specialist',
    description: 'Manages career paths and employee development',
    icon: TrendingUp,
    category: 'Development',
    color: 'text-orange-400',
    bgColor: 'bg-orange-900/20',
    borderColor: 'border-orange-400/30'
  },
  {
    id: 'performance-tracking-specialist',
    name: 'Performance Tracking Specialist',
    description: 'Monitors and analyzes employee performance metrics',
    icon: Award,
    category: 'Performance',
    color: 'text-red-400',
    bgColor: 'bg-red-900/20',
    borderColor: 'border-red-400/30'
  }
];

const orchestrationAgents = [
  {
    id: 'talent-orchestrator',
    name: 'Talent Management Orchestrator',
    description: 'Central agent coordinating all talent management processes',
    icon: Bot,
    category: 'Orchestration',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-900/20',
    borderColor: 'border-cyan-400/30'
  }
];

const hrNodes = [
  {
    id: 'candidate-database',
    name: 'Candidate Database',
    description: 'Manages candidate profiles and application data',
    icon: Users,
    category: 'Database',
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-900/20',
    borderColor: 'border-indigo-400/30'
  },
  {
    id: 'skills-matcher',
    name: 'Skills Matching Engine',
    description: 'Matches candidate skills with job requirements',
    icon: Target,
    category: 'Matching',
    color: 'text-pink-400',
    bgColor: 'bg-pink-900/20',
    borderColor: 'border-pink-400/30'
  },
  {
    id: 'document-processor',
    name: 'Document Processor',
    description: 'Processes resumes, applications, and HR documents',
    icon: FileText,
    category: 'Processing',
    color: 'text-teal-400',
    bgColor: 'bg-teal-900/20',
    borderColor: 'border-teal-400/30'
  }
];

const utilityNodes = [
  {
    id: 'memory',
    name: 'HR Memory Core',
    description: 'Employee data and talent intelligence storage',
    icon: Database,
    color: 'text-indigo-400'
  },
  {
    id: 'guardrail',
    name: 'Compliance Guard',
    description: 'HR compliance and privacy protection',
    icon: Shield,
    color: 'text-emerald-400'
  },
  {
    id: 'decision',
    name: 'Decision Node',
    description: 'Workflow decision and routing point',
    icon: Brain,
    color: 'text-pink-400'
  }
];

export const RecruitmentAgentPalette: React.FC<RecruitmentAgentPaletteProps> = ({
  onAddAgent,
  onAddUtility
}) => {
  const [activeTab, setActiveTab] = useState('agents');

  const handleDragStart = (event: React.DragEvent, agentId: string, type: 'agent' | 'utility') => {
    event.dataTransfer.setData('application/json', JSON.stringify({
      type: type,
      agentType: agentId
    }));
  };

  return (
    <div className="w-80 bg-slate-800/40 backdrop-blur-lg border-r border-orange-400/20 flex flex-col text-white overflow-hidden">
      <div className="p-4 border-b border-orange-400/20">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Users className="h-5 w-5 text-orange-400" />
          Recruitment Agents
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Talent Management & HR Specialists
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-slate-700/30 m-2">
            <TabsTrigger value="agents" className="text-xs">Agents</TabsTrigger>
            <TabsTrigger value="orchestration" className="text-xs">Control</TabsTrigger>
            <TabsTrigger value="hr" className="text-xs">HR Tools</TabsTrigger>
            <TabsTrigger value="utilities" className="text-xs">Utils</TabsTrigger>
          </TabsList>

          <TabsContent value="agents" className="space-y-2 p-2 mt-0">
            <div className="text-xs font-medium text-slate-400 mb-2 px-2">TALENT SPECIALISTS</div>
            {recruitmentAgents.map((agent) => {
              const IconComponent = agent.icon;
              return (
                <Card
                  key={agent.id}
                  className={`${agent.bgColor} ${agent.borderColor} border cursor-pointer hover:bg-opacity-80 transition-all duration-200 hover:scale-105`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, agent.id, 'agent')}
                  onClick={() => onAddAgent(agent.id)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg bg-slate-700/30`}>
                        <IconComponent className={`h-4 w-4 ${agent.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-white leading-tight">
                          {agent.name}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1 leading-tight">
                          {agent.description}
                        </p>
                        <Badge variant="outline" className={`mt-2 text-xs ${agent.color} ${agent.borderColor}`}>
                          {agent.category}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="orchestration" className="space-y-2 p-2 mt-0">
            <div className="text-xs font-medium text-slate-400 mb-2 px-2">ORCHESTRATION</div>
            {orchestrationAgents.map((agent) => {
              const IconComponent = agent.icon;
              return (
                <Card
                  key={agent.id}
                  className={`${agent.bgColor} ${agent.borderColor} border cursor-pointer hover:bg-opacity-80 transition-all duration-200 hover:scale-105`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, agent.id, 'agent')}
                  onClick={() => onAddAgent(agent.id)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg bg-slate-700/30`}>
                        <IconComponent className={`h-4 w-4 ${agent.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-white leading-tight">
                          {agent.name}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1 leading-tight">
                          {agent.description}
                        </p>
                        <Badge variant="outline" className={`mt-2 text-xs ${agent.color} ${agent.borderColor}`}>
                          {agent.category}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="hr" className="space-y-2 p-2 mt-0">
            <div className="text-xs font-medium text-slate-400 mb-2 px-2">HR TOOLS</div>
            {hrNodes.map((agent) => {
              const IconComponent = agent.icon;
              return (
                <Card
                  key={agent.id}
                  className={`${agent.bgColor} ${agent.borderColor} border cursor-pointer hover:bg-opacity-80 transition-all duration-200 hover:scale-105`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, agent.id, 'agent')}
                  onClick={() => onAddAgent(agent.id)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg bg-slate-700/30`}>
                        <IconComponent className={`h-4 w-4 ${agent.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-white leading-tight">
                          {agent.name}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1 leading-tight">
                          {agent.description}
                        </p>
                        <Badge variant="outline" className={`mt-2 text-xs ${agent.color} ${agent.borderColor}`}>
                          {agent.category}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="utilities" className="space-y-2 p-2 mt-0">
            <div className="text-xs font-medium text-slate-400 mb-2 px-2">INFRASTRUCTURE</div>
            {utilityNodes.map((utility) => {
              const IconComponent = utility.icon;
              return (
                <Card
                  key={utility.id}
                  className="bg-slate-700/20 border-slate-600/30 border cursor-pointer hover:bg-slate-700/30 transition-all duration-200 hover:scale-105"
                  draggable
                  onDragStart={(e) => handleDragStart(e, utility.id, 'utility')}
                  onClick={() => onAddUtility(utility.id)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-slate-700/30">
                        <IconComponent className={`h-4 w-4 ${utility.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-white leading-tight">
                          {utility.name}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1 leading-tight">
                          {utility.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>
        </Tabs>
      </div>

      <div className="p-4 border-t border-orange-400/20">
        <div className="text-xs text-slate-400 mb-2">QUICK ACTIONS</div>
        <div className="grid grid-cols-2 gap-2">
          <Button
            size="sm"
            variant="outline"
            className="text-xs border-orange-400/30 text-orange-400 hover:bg-orange-400/10"
            onClick={() => onAddAgent('talent-sourcing-specialist')}
          >
            <Search className="h-3 w-3 mr-1" />
            Source
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-xs border-orange-400/30 text-orange-400 hover:bg-orange-400/10"
            onClick={() => onAddAgent('ai-screening-specialist')}
          >
            <UserCheck className="h-3 w-3 mr-1" />
            Screen
          </Button>
        </div>
      </div>
    </div>
  );
};