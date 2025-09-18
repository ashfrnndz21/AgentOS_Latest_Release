
import React, { useState, useCallback } from 'react';
import { 
  PlusCircle, 
  BarChart2, 
  ChevronDown, 
  Map, 
  Cloud, 
  Brain, 
  Network,
  Code,
  Search,
  Copy,
  Workflow,
  GitBranch,
  Plane
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { CreateAgentDialog } from './CreateAgentDialog';
import { SimpleStepTest } from './CreateAgent/SimpleStepTest';
import { CreateStrandsWorkflowDialog } from './CreateStrandsWorkflow/CreateStrandsWorkflowDialog';
import { CreateMultiAgentWorkflowDialog } from './CreateMultiAgentWorkflow/CreateMultiAgentWorkflowDialog';
import { CreateLangGraphWorkflowDialog } from './CreateLangGraphWorkflow/CreateLangGraphWorkflowDialog';
import { DynamicLangGraphWorkflow } from './CreateLangGraphWorkflow/DynamicLangGraphWorkflow';

export const QuickActions: React.FC = () => {
  // State for dialogs
  const [createAgentOpen, setCreateAgentOpen] = useState(false);
  const [createStrandsWorkflowOpen, setCreateStrandsWorkflowOpen] = useState(false);
  const [createMultiAgentWorkflowOpen, setCreateMultiAgentWorkflowOpen] = useState(false);
  const [createLangGraphWorkflowOpen, setCreateLangGraphWorkflowOpen] = useState(false);
  const [dynamicLangGraphWorkflowOpen, setDynamicLangGraphWorkflowOpen] = useState(false);
  
  // Handle dialog opens
  const handleCreateAgent = useCallback(() => {
    console.log('Opening Create Agent dialog');
    setCreateAgentOpen(true);
  }, []);
  
  const handleCreateStrandsWorkflow = useCallback(() => {
    setCreateStrandsWorkflowOpen(true);
  }, []);
  
  const handleCreateMultiAgentWorkflow = useCallback(() => {
    setCreateMultiAgentWorkflowOpen(true);
  }, []);

  const handleCreateLangGraphWorkflow = useCallback(() => {
    setDynamicLangGraphWorkflowOpen(true);
  }, []);

  const handleCreateStaticLangGraphWorkflow = useCallback(() => {
    setCreateLangGraphWorkflowOpen(true);
  }, []);

  // Template handlers with specific template IDs
  const handleDataAnalysisTemplate = useCallback(() => {
    setCreateLangGraphWorkflowOpen(true);
  }, []);

  const handleCodeGenerationTemplate = useCallback(() => {
    setCreateLangGraphWorkflowOpen(true);
  }, []);

  const handleResearchTemplate = useCallback(() => {
    setCreateLangGraphWorkflowOpen(true);
  }, []);

  const handleTravelAssistantTemplate = useCallback(() => {
    setCreateLangGraphWorkflowOpen(true);
  }, []);

  return (
    <>
      {/* Dropdown Menu for Quick Actions */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            className="bg-gradient-to-r from-beam-blue to-blue-600 hover:opacity-90 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 shadow-lg transition-all duration-200"
          >
            <span>Quick Actions</span>
            <ChevronDown size={16} />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent 
          align="end"
          className="bg-beam-dark-accent/95 border-gray-700 backdrop-blur-md text-white shadow-xl p-1 min-w-[280px] z-50"
        >
          {/* Single Agent Section */}
          <DropdownMenuLabel className="text-xs text-gray-400 px-3 py-1">
            Single Agent
          </DropdownMenuLabel>
          
          <DropdownMenuItem 
            className="flex items-center gap-2 py-2.5 px-3 focus:bg-beam-blue/20 rounded-md cursor-pointer"
            onClick={handleCreateAgent}
          >
            <PlusCircle size={16} className="text-green-400" />
            <span>Create New Agent</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            className="flex items-center gap-2 py-2.5 px-3 focus:bg-beam-blue/20 rounded-md cursor-pointer"
            onClick={() => {
              // TODO: Implement clone functionality
              console.log('Clone agent functionality coming soon');
            }}
          >
            <Copy size={16} className="text-blue-400" />
            <span>Clone Existing Agent</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator className="bg-gray-700 my-2" />

          {/* Multi-Agent Workflows Section */}
          <DropdownMenuLabel className="text-xs text-gray-400 px-3 py-1">
            Multi-Agent Workflows
          </DropdownMenuLabel>
          
          <DropdownMenuItem 
            className="flex items-center gap-2 py-2.5 px-3 focus:bg-beam-blue/20 rounded-md cursor-pointer"
            onClick={handleCreateLangGraphWorkflow}
          >
            <Network size={16} className="text-cyan-400" />
            <span>Dynamic LangGraph Builder</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            className="flex items-center gap-2 py-2.5 px-3 focus:bg-beam-blue/20 rounded-md cursor-pointer"
            onClick={handleCreateStaticLangGraphWorkflow}
          >
            <Workflow size={16} className="text-purple-400" />
            <span>Template-Based LangGraph</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            className="flex items-center gap-2 py-2.5 px-3 focus:bg-beam-blue/20 rounded-md cursor-pointer"
            onClick={handleCreateStrandsWorkflow}
          >
            <Brain size={16} className="text-purple-400" />
            <span>Strands Workflow</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            className="flex items-center gap-2 py-2.5 px-3 focus:bg-beam-blue/20 rounded-md cursor-pointer"
            onClick={handleCreateMultiAgentWorkflow}
          >
            <Map size={16} className="text-orange-400" />
            <span>Custom Multi-Agent</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator className="bg-gray-700 my-2" />

          {/* Templates Section */}
          <DropdownMenuLabel className="text-xs text-gray-400 px-3 py-1">
            Quick Templates
          </DropdownMenuLabel>
          
          <DropdownMenuItem 
            className="flex items-center gap-2 py-2.5 px-3 focus:bg-beam-blue/20 rounded-md cursor-pointer"
            onClick={handleDataAnalysisTemplate}
          >
            <BarChart2 size={16} className="text-emerald-400" />
            <span>Data Analysis Pipeline</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            className="flex items-center gap-2 py-2.5 px-3 focus:bg-beam-blue/20 rounded-md cursor-pointer"
            onClick={handleCodeGenerationTemplate}
          >
            <Code size={16} className="text-yellow-400" />
            <span>Code Generation Team</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            className="flex items-center gap-2 py-2.5 px-3 focus:bg-beam-blue/20 rounded-md cursor-pointer"
            onClick={handleResearchTemplate}
          >
            <Search size={16} className="text-indigo-400" />
            <span>Research Assistant</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            className="flex items-center gap-2 py-2.5 px-3 focus:bg-beam-blue/20 rounded-md cursor-pointer"
            onClick={handleTravelAssistantTemplate}
          >
            <Plane size={16} className="text-blue-400" />
            <span>Travel Assistant (AWS Pattern)</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator className="bg-gray-700 my-2" />

          {/* Management Section */}
          <DropdownMenuLabel className="text-xs text-gray-400 px-3 py-1">
            Management
          </DropdownMenuLabel>
          
          <DropdownMenuItem 
            className="flex items-center gap-2 py-2.5 px-3 focus:bg-beam-blue/20 rounded-md cursor-pointer"
            onClick={() => window.open('/agent-control', '_blank')}
          >
            <Cloud size={16} className="text-cyan-400" />
            <span>Agent Control Panel</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            className="flex items-center gap-2 py-2.5 px-3 focus:bg-beam-blue/20 rounded-md cursor-pointer"
            onClick={() => {
              // Refresh the monitoring tab
              const event = new CustomEvent('refreshAgents');
              window.dispatchEvent(event);
            }}
          >
            <GitBranch size={16} className="text-green-400" />
            <span>Refresh Monitoring</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Agent Creation Dialog */}
      <CreateAgentDialog 
        open={createAgentOpen} 
        onOpenChange={(open) => {
          console.log('Create Agent dialog state change:', open);
          setCreateAgentOpen(open);
        }}
      />

      {/* Strands Workflow Creation Dialog */}
      <CreateStrandsWorkflowDialog 
        open={createStrandsWorkflowOpen} 
        onOpenChange={setCreateStrandsWorkflowOpen}
      />

      {/* Multi-Agent Workflow Dialog */}
      <CreateMultiAgentWorkflowDialog 
        open={createMultiAgentWorkflowOpen} 
        onOpenChange={setCreateMultiAgentWorkflowOpen}
      />

      {/* Dynamic LangGraph Workflow Dialog */}
      <DynamicLangGraphWorkflow 
        open={dynamicLangGraphWorkflowOpen} 
        onOpenChange={setDynamicLangGraphWorkflowOpen}
      />

      {/* Static LangGraph Workflow Dialog */}
      <CreateLangGraphWorkflowDialog 
        open={createLangGraphWorkflowOpen} 
        onOpenChange={setCreateLangGraphWorkflowOpen}
      />
    </>
  );
};
