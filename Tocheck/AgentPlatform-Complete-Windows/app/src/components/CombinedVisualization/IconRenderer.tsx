
import React from 'react';
import { GitMerge, Network, Play, GitBranch, Wrench, Cpu, AlertTriangle, MessageSquare, Database, Info, Code, BarChart, FileText, ChartPie, ArrowUpRight } from 'lucide-react';

interface IconRendererProps {
  iconName: string;
  onClick?: () => void;
}

export const IconRenderer: React.FC<IconRendererProps> = ({ iconName, onClick }) => {
  // Icon rendering map with expanded set of icons to match reference design
  const IconComponents: Record<string, React.ReactNode> = {
    Play: <Play size={16} />,
    GitBranch: <GitBranch size={16} />,
    Wrench: <Wrench size={16} />,
    Cpu: <Cpu size={16} />,
    AlertTriangle: <AlertTriangle size={16} />,
    MessageSquare: <MessageSquare size={16} />,
    Database: <Database size={16} />,
    Info: <Info size={16} />,
    GitMerge: <GitMerge size={16} />,
    Network: <Network size={16} />,
    Code: <Code size={16} />,
    BarChart: <BarChart size={16} />,
    FileText: <FileText size={16} />,
    ChartPie: <ChartPie size={16} />,
    ArrowUpRight: <ArrowUpRight size={16} />
  };
  
  const handleClick = (e: React.MouseEvent) => {
    // Always stop propagation of click events to prevent them from reaching parent elements
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (onClick) onClick();
  };

  // Simple span wrapper with proper event handling
  return (
    <span 
      className="inline-flex cursor-pointer" 
      onClick={handleClick}
      onMouseDown={(e) => e.stopPropagation()}
      onMouseUp={(e) => e.stopPropagation()}
    >
      {IconComponents[iconName] || <Info size={16} />}
    </span>
  );
};
