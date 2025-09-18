
import React from 'react';
import { Bot } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Link } from 'react-router-dom';

interface ProjectSelectionProps {
  projectsData: Record<string, any>;
  projectNames: Record<string, string>;
  handleProjectSelect: (id: string) => void;
}

export const ProjectSelection: React.FC<ProjectSelectionProps> = ({
  projectsData,
  projectNames,
  handleProjectSelect
}) => {
  return (
    <div className="w-full h-full bg-beam-dark flex flex-col">
      <div className="p-4 border-b border-gray-700/50 bg-beam-dark-accent/30">
        <h2 className="text-xl font-medium text-white">Select a Project to Start Chatting</h2>
        <p className="text-sm text-gray-400">Choose a project to interact with the Agentic Assistant</p>
      </div>
      
      <ScrollArea className="flex-1 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(projectsData).map(([id, project]) => (
            <Link 
              key={id}
              to={`/agent-workspace?projectId=${id}`}
              className="bg-beam-dark-accent/30 border border-gray-700/50 rounded-lg p-5 cursor-pointer hover:bg-beam-dark-accent/50 transition-colors hover:border-beam-blue/50"
            >
              <h3 className="text-white font-medium text-lg mb-2">
                {projectNames[id as keyof typeof projectNames] || id}
              </h3>
              <p className="text-gray-400 text-sm mb-3">
                {project.department || 'General'} Department
              </p>
              <div className="flex items-center gap-2 text-gray-400 text-xs mt-4">
                <Bot size={14} className="text-beam-blue" />
                <span>{project.agents?.length || 0} Agents Available</span>
              </div>
            </Link>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
