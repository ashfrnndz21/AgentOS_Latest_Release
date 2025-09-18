
import React, { useState, useCallback } from 'react';
import { PlusCircle, Shield, BarChart2, ChevronDown, Map, Zap, Cloud, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { CreateAgentDialog } from './CreateAgentDialog';
import { CreateStrandsWorkflowDialog } from './CreateStrandsWorkflow/CreateStrandsWorkflowDialog';
import { CreateMultiAgentWorkflowDialog } from './CreateMultiAgentWorkflow/CreateMultiAgentWorkflowDialog';

export const QuickActions: React.FC = () => {
  // State for dialogs
  const [createAgentOpen, setCreateAgentOpen] = useState(false);
  const [createStrandsWorkflowOpen, setCreateStrandsWorkflowOpen] = useState(false);
  const [createMultiAgentWorkflowOpen, setCreateMultiAgentWorkflowOpen] = useState(false);
  
  // Handle dialog opens
  const handleCreateAgent = useCallback(() => {
    setCreateAgentOpen(true);
  }, []);
  
  const handleCreateStrandsWorkflow = useCallback(() => {
    setCreateStrandsWorkflowOpen(true);
  }, []);
  
  const handleCreateMultiAgentWorkflow = useCallback(() => {
    setCreateMultiAgentWorkflowOpen(true);
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
          className="bg-beam-dark-accent/95 border-gray-700 backdrop-blur-md text-white shadow-xl p-1 min-w-[220px] z-50"
        >
          <DropdownMenuItem 
            className="flex items-center gap-2 py-2.5 px-3 focus:bg-beam-blue/20 rounded-md cursor-pointer"
            onClick={handleCreateAgent}
          >
            <PlusCircle size={16} className="text-green-400" />
            <span>Create New Agent</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            className="flex items-center gap-2 py-2.5 px-3 focus:bg-beam-blue/20 rounded-md cursor-pointer"
            onClick={handleCreateStrandsWorkflow}
          >
            <Brain size={16} className="text-purple-400" />
            <span>Create Strands Workflow</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            className="flex items-center gap-2 py-2.5 px-3 focus:bg-beam-blue/20 rounded-md cursor-pointer"
            onClick={handleCreateMultiAgentWorkflow}
          >
            <Map size={16} className="text-orange-400" />
            <span>Multi-Agent Workflow</span>
          </DropdownMenuItem>
          
          <div className="h-px bg-gray-700 my-1 mx-2" />
          
          <DropdownMenuItem 
            className="flex items-center gap-2 py-2.5 px-3 focus:bg-beam-blue/20 rounded-md cursor-pointer"
            onClick={() => window.open('/backend-validation', '_blank')}
          >
            <Shield size={16} className="text-blue-400" />
            <span>Backend Validation</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            className="flex items-center gap-2 py-2.5 px-3 focus:bg-beam-blue/20 rounded-md cursor-pointer"
            onClick={() => {
              // Refresh the monitoring tab
              const event = new CustomEvent('refreshAgents');
              window.dispatchEvent(event);
            }}
          >
            <BarChart2 size={16} className="text-green-400" />
            <span>Refresh Monitoring</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Agent Creation Dialog */}
      <CreateAgentDialog 
        open={createAgentOpen} 
        onOpenChange={setCreateAgentOpen}
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
    </>
  );
};
