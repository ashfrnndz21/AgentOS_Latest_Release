import React, { useState } from 'react';
import { Bot, Wrench, Database, Shield, ChevronDown, ChevronUp, Globe, Map, Building } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export interface ProjectInfo {
  id: string;
  name: string;
  description: string;
  agentCount: number;
  tools: string[];
  databases: string[];
  globalGuardrails: string[];
  localGuardrails: string[];
  color: string;
  department: string;
}

interface ProjectTilesProps {
  projects: ProjectInfo[];
  onSelectProject: (projectId: string) => void;
}

export const ProjectTiles: React.FC<ProjectTilesProps> = ({ projects, onSelectProject }) => {
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const [expandedDepartments, setExpandedDepartments] = useState<Record<string, boolean>>({
    'Network': false,
    'Consumer Business': false,
    'Sales & Service': false,
    'CX': false,
    'HR': false,
    'General': false
  });
  
  const toggleCardExpansion = (projectId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setExpandedCards(prev => ({
      ...prev,
      [projectId]: !prev[projectId]
    }));
  };

  const toggleDepartmentExpansion = (department: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setExpandedDepartments(prev => ({
      ...prev,
      [department]: !prev[department]
    }));
  };

  const handleProjectSelect = (projectId: string) => {
    onSelectProject(projectId);
  };

  const projectsByDepartment = projects.reduce<Record<string, ProjectInfo[]>>((acc, project) => {
    const department = project.department || 'General';
    if (!acc[department]) {
      acc[department] = [];
    }
    acc[department].push(project);
    return acc;
  }, {});

  const departmentOrder = [
    'Network', 
    'Consumer Business', 
    'Sales & Service', 
    'CX', 
    'HR', 
    'General'
  ];

  const sortedDepartments = Object.keys(projectsByDepartment).sort(
    (a, b) => departmentOrder.indexOf(a) - departmentOrder.indexOf(b)
  );

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-white">Projects</h2>
      
      {sortedDepartments.map(department => (
        <div key={department} className="space-y-3">
          <div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={(e) => toggleDepartmentExpansion(department, e)}
          >
            <Building className="text-beam-blue" size={18} />
            <h3 className="text-lg font-medium text-white">{department}</h3>
            {expandedDepartments[department] ? 
              <ChevronUp size={16} className="text-gray-400" /> : 
              <ChevronDown size={16} className="text-gray-400" />
            }
          </div>
          
          {expandedDepartments[department] && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {projectsByDepartment[department].map((project) => (
                <Card 
                  key={project.id}
                  className={`bg-beam-dark-accent/30 hover:bg-beam-dark-accent/50 backdrop-blur-md border-t-4 ${project.color} shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden flex flex-col h-auto`}
                  onClick={() => handleProjectSelect(project.id)}
                >
                  <CardContent className="p-3 flex flex-col flex-grow">
                    <h3 className="text-base font-semibold text-white mb-1 truncate">{project.name}</h3>
                    <p className="text-gray-300 text-xs mb-2 line-clamp-1">{project.description}</p>
                    
                    <div className="flex flex-wrap gap-2 pt-1 mt-auto">
                      <div className="flex flex-col">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div
                                className="flex items-center gap-1.5 cursor-pointer"
                                onClick={(e) => toggleCardExpansion(`${project.id}-agents`, e)}
                              >
                                <div className="p-1 rounded-md bg-blue-500/20 border border-blue-500/30">
                                  <Bot size={12} className="text-blue-400" />
                                </div>
                                <div>
                                  <div className="text-xs text-gray-300">Agents</div>
                                  <div className="text-white text-xs font-medium flex items-center">
                                    {project.agentCount}
                                    {expandedCards[`${project.id}-agents`] ? 
                                      <ChevronUp size={12} className="ml-0.5" /> : 
                                      <ChevronDown size={12} className="ml-0.5" />
                                    }
                                  </div>
                                </div>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>View agent details</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        
                        {expandedCards[`${project.id}-agents`] && (
                          <div className="mt-1 ml-5 pl-1 border-l-2 border-blue-500/30">
                            <div className="text-xs text-blue-300">
                              {project.agentCount} active agents
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center gap-1.5 cursor-pointer">
                              <div className="p-1 rounded-md bg-purple-500/20 border border-purple-500/30">
                                <Wrench size={12} className="text-purple-400" />
                              </div>
                              <div>
                                <div className="text-xs text-gray-300">Tools</div>
                                <div className="text-white text-xs font-medium flex items-center">
                                  {project.tools?.length || 0}
                                  <ChevronDown size={12} className="ml-0.5" />
                                </div>
                              </div>
                            </div>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-beam-dark border border-gray-700 text-white min-w-[180px] z-50">
                            {(project.tools || []).map((tool, index) => (
                              <DropdownMenuItem 
                                key={`${project.id}-tool-${index}`}
                                className="text-gray-200 hover:text-white hover:bg-beam-dark-accent/70 cursor-pointer"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Wrench size={14} className="mr-2 text-purple-400" />
                                {tool}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      
                      <div className="flex flex-col">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center gap-1.5 cursor-pointer">
                              <div className="p-1 rounded-md bg-green-500/20 border border-green-500/30">
                                <Database size={12} className="text-green-400" />
                              </div>
                              <div>
                                <div className="text-xs text-gray-300">DBs</div>
                                <div className="text-white text-xs font-medium flex items-center">
                                  {project.databases?.length || 0}
                                  <ChevronDown size={12} className="ml-0.5" />
                                </div>
                              </div>
                            </div>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-beam-dark border border-gray-700 text-white min-w-[180px] z-50">
                            {(project.databases || []).map((db, index) => (
                              <DropdownMenuItem 
                                key={`${project.id}-db-${index}`}
                                className="text-gray-200 hover:text-white hover:bg-beam-dark-accent/70 cursor-pointer"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Database size={14} className="mr-2 text-green-400" />
                                {db}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      
                      <div className="flex flex-col">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center gap-1.5 cursor-pointer">
                              <div className="p-1 rounded-md bg-amber-500/20 border border-amber-500/30">
                                <Shield size={12} className="text-amber-400" />
                              </div>
                              <div>
                                <div className="text-xs text-gray-300">Guards</div>
                                <div className="text-white text-xs font-medium flex items-center">
                                  {(project.globalGuardrails?.length || 0) + (project.localGuardrails?.length || 0)}
                                  <ChevronDown size={12} className="ml-0.5" />
                                </div>
                              </div>
                            </div>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-beam-dark border border-gray-700 text-white min-w-[180px] z-50">
                            {project.globalGuardrails && project.globalGuardrails.length > 0 && (
                              <>
                                <div className="px-2 py-1 text-xs font-medium text-gray-400 border-b border-gray-700 flex items-center">
                                  <Globe size={10} className="mr-1 text-purple-400" />
                                  Global Guardrails
                                </div>
                                {project.globalGuardrails.map((guardrail, index) => (
                                  <DropdownMenuItem 
                                    key={`${project.id}-global-guardrail-${index}`}
                                    className="text-gray-200 hover:text-white hover:bg-beam-dark-accent/70 cursor-pointer"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Shield size={12} className="mr-1.5 text-purple-400" />
                                    {guardrail}
                                  </DropdownMenuItem>
                                ))}
                              </>
                            )}
                            
                            {project.localGuardrails && project.localGuardrails.length > 0 && (
                              <>
                                <div className="px-2 py-1 text-xs font-medium text-gray-400 border-b border-gray-700 flex items-center">
                                  <Map size={10} className="mr-1 text-indigo-400" />
                                  Local Guardrails
                                </div>
                                {project.localGuardrails.map((guardrail, index) => (
                                  <DropdownMenuItem 
                                    key={`${project.id}-local-guardrail-${index}`}
                                    className="text-gray-200 hover:text-white hover:bg-beam-dark-accent/70 cursor-pointer"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Shield size={12} className="mr-1.5 text-indigo-400" />
                                    {guardrail}
                                  </DropdownMenuItem>
                                ))}
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
