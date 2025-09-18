import React from 'react';
import { UserCheck, Search, FileText, Calendar, Users, TrendingUp } from 'lucide-react';

const recruitmentAgents = [
  {
    id: 'talent-sourcing',
    name: 'Talent Sourcing Agent',
    type: 'Talent Discovery',
    status: 'Active',
    description: 'Discovers and identifies top talent across multiple channels and platforms',
    model: 'Claude 3.5 Sonnet + Talent Intelligence',
    capabilities: ['Multi-channel Sourcing', 'Candidate Profiling', 'Skills Assessment', 'Market Intelligence'],
    icon: Search,
    color: 'text-blue-400'
  },
  {
    id: 'resume-screening',
    name: 'Resume Screening Agent',
    type: 'AI-Powered Screening',
    status: 'Screening',
    description: 'Analyzes resumes and profiles using advanced NLP and matching algorithms',
    model: 'Claude 3 Opus + NLP Models',
    capabilities: ['Resume Analysis', 'Skills Matching', 'Experience Evaluation', 'Cultural Fit Assessment'],
    icon: FileText,
    color: 'text-green-400'
  },
  {
    id: 'interview-coordinator',
    name: 'Interview Coordinator',
    type: 'Process Automation',
    status: 'Coordinating',
    description: 'Manages interview scheduling, coordination, and candidate communication',
    model: 'Amazon Titan + Scheduling Engine',
    capabilities: ['Interview Scheduling', 'Candidate Communication', 'Panel Coordination', 'Feedback Collection'],
    icon: Calendar,
    color: 'text-purple-400'
  },
  {
    id: 'onboarding-assistant',
    name: 'Onboarding Assistant',
    type: 'Employee Integration',
    status: 'Assisting',
    description: 'Guides new employees through comprehensive onboarding processes',
    model: 'Llama 3.1 70B + Process Models',
    capabilities: ['Onboarding Workflows', 'Document Management', 'Training Coordination', 'Progress Tracking'],
    icon: Users,
    color: 'text-cyan-400'
  },
  {
    id: 'career-development',
    name: 'Career Development Agent',
    type: 'Growth & Development',
    status: 'Developing',
    description: 'Creates personalized career development paths and growth opportunities',
    model: 'Mixtral 8x7B + Career Models',
    capabilities: ['Career Path Planning', 'Skill Gap Analysis', 'Learning Recommendations', 'Performance Tracking'],
    icon: TrendingUp,
    color: 'text-emerald-400'
  }
];

export const IndustrialRecruitmentAgentPalette = () => {
  const activeAgents = recruitmentAgents.filter(agent => 
    ['Active', 'Screening', 'Coordinating', 'Assisting', 'Developing'].includes(agent.status)
  );

  return (
    <div className="w-80 bg-slate-800/90 backdrop-blur-lg border-r border-indigo-400/20 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-indigo-400/20">
        <div className="flex items-center gap-2 mb-2">
          <UserCheck className="h-5 w-5 text-indigo-400" />
          <h2 className="text-lg font-semibold text-white">Talent Agents</h2>
        </div>
        <p className="text-sm text-gray-400">Recruitment & Career Development AI</p>
      </div>

      {/* Agent List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {recruitmentAgents.map((agent) => {
          const IconComponent = agent.icon;
          return (
            <div
              key={agent.id}
              className="bg-slate-700/50 border border-slate-600/50 rounded-lg p-3 hover:border-indigo-400/30 transition-all cursor-pointer group"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-slate-800 flex-shrink-0">
                  <IconComponent className={`h-4 w-4 ${agent.color}`} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-white truncate">
                      {agent.name}
                    </h3>
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      agent.status === 'Active' ? 'bg-green-400' :
                      agent.status === 'Screening' ? 'bg-blue-400' :
                      agent.status === 'Coordinating' ? 'bg-purple-400' :
                      agent.status === 'Assisting' ? 'bg-cyan-400' :
                      agent.status === 'Developing' ? 'bg-emerald-400' :
                      'bg-gray-400'
                    }`} />
                  </div>
                  
                  <p className="text-xs text-gray-400 mb-2">{agent.type}</p>
                  <p className="text-xs text-gray-300 mb-2 line-clamp-2">{agent.description}</p>
                  
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Model:</span>
                    <span className="text-indigo-300 font-mono">{agent.model.split(' + ')[0]}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs mt-1">
                    <span className="text-gray-400">Capabilities:</span>
                    <span className="text-gray-300">+{agent.capabilities.length}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Stats */}
      <div className="p-4 border-t border-indigo-400/20 bg-slate-900/50">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-indigo-400">{activeAgents.length}</div>
            <div className="text-xs text-gray-400">Active Agents</div>
          </div>
          <div>
            <div className="text-lg font-bold text-green-400">96%</div>
            <div className="text-xs text-gray-400">Success Rate</div>
          </div>
        </div>
      </div>
    </div>
  );
};