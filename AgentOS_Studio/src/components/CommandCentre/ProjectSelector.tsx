
import React from 'react';
import { ChevronDown, Briefcase, Users, TrendingUp, CreditCard, PiggyBank, Building2 } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

// Updated interface to match the actual data structure from getProjectData()
interface ProjectSelectorProps {
  selectedProject: string;
  projectData: Record<string, any>; // Changed from ProjectData to any
  setSelectedProject: (project: string) => void;
}

// Project display names mapping for Air Liquide industrial
const projectDisplayNames = {
  'hydrogen-production': 'Hydrogen Production',
  'industrial-forecasting': 'Financial Forecasting & Scenario Analysis',
  'process-engineering': 'Process Engineering',
  'default': 'Air Separation Units'
};

// Project icons mapping for Air Liquide industrial
const projectIcons: Record<string, React.ReactNode> = {
  'hydrogen-production': <Users size={16} className="text-beam-blue" />,
  'industrial-forecasting': <Building2 size={16} className="text-purple-500" />,
  'process-engineering': <TrendingUp size={16} className="text-green-500" />,
  'default': <CreditCard size={16} className="text-gray-500" />
};

export const ProjectSelector: React.FC<ProjectSelectorProps> = ({ 
  selectedProject, 
  projectData, 
  setSelectedProject 
}) => {
  // Get project name from mapping or use project id as fallback
  const getProjectName = (projectId: string): string => {
    return projectDisplayNames[projectId as keyof typeof projectDisplayNames] || projectId;
  };

  // Get project icon from mapping or use default icon as fallback
  const getProjectIcon = (projectId: string): React.ReactNode => {
    return projectIcons[projectId] || projectIcons['default'];
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="bg-beam-dark-accent/80 hover:bg-beam-dark-accent border border-gray-700 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 shadow-lg transition-all duration-200">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-beam-blue/20 flex items-center justify-center">
            {getProjectIcon(selectedProject)}
          </div>
          <span className="font-medium">{getProjectName(selectedProject)}</span>
        </div>
        <ChevronDown size={16} />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-beam-dark-accent/95 border-gray-700 backdrop-blur-md text-white shadow-xl rounded-lg p-1 w-56">
        {Object.keys(projectData).filter(key => key !== 'default').map(projKey => (
          <DropdownMenuItem 
            key={projKey}
            className="hover:bg-beam-blue/20 cursor-pointer flex items-center gap-3 py-2.5 px-3 rounded-md"
            onClick={() => setSelectedProject(projKey)}
          >
            <div className="w-6 h-6 rounded-full bg-beam-blue/20 flex items-center justify-center">
              {getProjectIcon(projKey)}
            </div>
            <span className="font-medium">{getProjectName(projKey)}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
