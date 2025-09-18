import React, { useState, useCallback } from 'react';
import { 
  PlusCircle, 
  ChevronDown
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

// Import components one by one to test
import { CreateAgentDialog } from './CreateAgentDialog';

export const QuickActionsDebug: React.FC = () => {
  const [createAgentOpen, setCreateAgentOpen] = useState(false);
  
  const handleCreateAgent = useCallback(() => {
    console.log('Opening Create Agent dialog');
    setCreateAgentOpen(true);
  }, []);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2">
            <span>Quick Actions (Debug)</span>
            <ChevronDown size={16} />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent className="bg-gray-800 border-gray-700 text-white min-w-[200px]">
          <DropdownMenuLabel className="text-xs text-gray-400 px-3 py-1">
            Debug Menu
          </DropdownMenuLabel>
          
          <DropdownMenuItem 
            className="flex items-center gap-2 py-2 px-3 cursor-pointer hover:bg-gray-700"
            onClick={handleCreateAgent}
          >
            <PlusCircle size={16} className="text-green-400" />
            <span>Create Agent (Test)</span>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator className="bg-gray-700" />
          
          <DropdownMenuItem 
            className="flex items-center gap-2 py-2 px-3 cursor-pointer hover:bg-gray-700"
            onClick={() => window.open('/ollama-agents', '_self')}
          >
            <PlusCircle size={16} className="text-blue-400" />
            <span>Go to Ollama Agents</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Test CreateAgentDialog */}
      <CreateAgentDialog 
        open={createAgentOpen} 
        onOpenChange={setCreateAgentOpen}
      />
    </>
  );
};