
import React from 'react';
import { Bot, Wrench, Database, Shield, X, Globe, Clock, Tag, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

interface ProjectInfo {
  id: string;
  name: string;
  description: string;
  department: string;
  agents: Array<{ name: string; role: string }>;
  tools: string[];
  databases: string[];
  created: string;
}

interface PropertiesPanelProps {
  selectedProjectId: string | null;
  projectInfo: ProjectInfo | null;
  onClose: () => void;
}

export const PropertiesPanel = ({ 
  selectedProjectId, 
  projectInfo, 
  onClose 
}: PropertiesPanelProps) => {
  return (
    <div className="w-80 h-full border-l border-gray-700/50 bg-beam-dark-accent/30 flex flex-col">
      <div className="p-3 flex items-center justify-between border-b border-gray-700/50">
        <h3 className="text-white font-medium flex items-center">
          <Tag size={14} className="mr-2 text-beam-blue" />
          Project Information
        </h3>
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-beam-dark-accent/70 hover:text-beam-blue" onClick={onClose}>
          <X size={18} />
        </Button>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        {!selectedProjectId ? (
          <div className="text-gray-400 text-sm flex flex-col items-center justify-center h-full">
            <AlertTriangle size={40} className="text-gray-600 mb-3" />
            <p>No project selected. Select a project to view its details.</p>
          </div>
        ) : !projectInfo ? (
          <div className="text-gray-400 text-sm flex flex-col items-center justify-center h-full">
            <AlertTriangle size={40} className="text-gray-600 mb-3" />
            <p>Project information not available.</p>
          </div>
        ) : (
          <>
            <div className="mb-6 bg-beam-dark-accent/40 p-4 rounded-lg border border-gray-700/30">
              <h2 className="text-lg font-semibold text-white mb-2 flex items-center">
                <CheckCircle size={16} className="mr-2 text-green-500" />
                {projectInfo.name}
              </h2>
              <p className="text-gray-400 text-sm">{projectInfo.description}</p>
              <div className="mt-3 flex items-center text-xs text-gray-500">
                <Clock size={12} className="mr-1" />
                Created: {projectInfo.created}
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex items-center gap-2 text-beam-blue mb-2">
                <Globe size={16} />
                <span className="text-white text-sm font-medium">Department</span>
              </div>
              <Badge variant="outline" className="ml-6 bg-beam-dark-accent/40 border-gray-700/30 text-white">
                {projectInfo.department}
              </Badge>
            </div>
            
            <Separator className="my-4 bg-gray-700/50" />
            
            <div className="mb-5">
              <div className="flex items-center gap-2 text-beam-blue mb-3">
                <Bot size={16} />
                <span className="text-white text-sm font-medium">Agents ({projectInfo.agents.length})</span>
              </div>
              <div className="ml-6 space-y-2">
                {projectInfo.agents.map((agent, index) => (
                  <div key={index} className="bg-beam-dark-accent/40 border border-gray-700/30 p-3 rounded-md hover:border-beam-blue/30 hover:bg-beam-dark-accent/60 transition-colors group">
                    <p className="text-white text-sm font-medium group-hover:text-beam-blue-light transition-colors">{agent.name}</p>
                    <p className="text-gray-400 text-xs">{agent.role}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <Separator className="my-4 bg-gray-700/50" />
            
            <div className="mb-4">
              <div className="flex items-center gap-2 text-purple-400 mb-3">
                <Wrench size={16} />
                <span className="text-white text-sm font-medium">Tools ({projectInfo.tools.length})</span>
              </div>
              <div className="ml-6 grid grid-cols-2 gap-2">
                {projectInfo.tools.map((tool, index) => (
                  <Badge 
                    key={index} 
                    variant="outline" 
                    className="justify-start bg-purple-900/20 text-purple-300 border-purple-700/30 hover:bg-purple-900/30"
                  >
                    {tool}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex items-center gap-2 text-green-400 mb-3">
                <Database size={16} />
                <span className="text-white text-sm font-medium">Databases ({projectInfo.databases.length})</span>
              </div>
              <div className="ml-6 grid grid-cols-2 gap-2">
                {projectInfo.databases.map((db, index) => (
                  <Badge 
                    key={index} 
                    variant="outline" 
                    className="justify-start bg-green-900/20 text-green-300 border-green-700/30 hover:bg-green-900/30"
                  >
                    {db}
                  </Badge>
                ))}
              </div>
            </div>
            
            <Separator className="my-4 bg-gray-700/50" />
            
            <div>
              <div className="flex items-center gap-2 text-amber-400 mb-3">
                <Shield size={16} />
                <span className="text-white text-sm font-medium">Guardrails</span>
              </div>
              <div className="ml-6 space-y-2">
                <div className="flex items-center gap-2 bg-amber-900/20 border border-amber-700/30 rounded-md p-2">
                  <CheckCircle size={14} className="text-green-500" />
                  <span className="text-amber-300 text-sm">PII Protection</span>
                </div>
                <div className="flex items-center gap-2 bg-amber-900/20 border border-amber-700/30 rounded-md p-2">
                  <CheckCircle size={14} className="text-green-500" />
                  <span className="text-amber-300 text-sm">Content Filtering</span>
                </div>
              </div>
            </div>
          </>
        )}
      </ScrollArea>
    </div>
  );
};
