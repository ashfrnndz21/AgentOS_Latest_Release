import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, ChevronDown } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const QuickActionsMinimal: React.FC = () => {
  const [createAgentOpen, setCreateAgentOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:opacity-90 text-white px-5 py-2.5 rounded-lg flex items-center gap-2">
            <span>Quick Actions</span>
            <ChevronDown size={16} />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent className="bg-gray-800 border-gray-700 text-white">
          <DropdownMenuItem onClick={() => setCreateAgentOpen(true)}>
            <PlusCircle size={16} className="mr-2" />
            Create Agent
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => window.open('/ollama-agents', '_self')}>
            <PlusCircle size={16} className="mr-2" />
            Ollama Agents
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {createAgentOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Create Agent</h3>
            <p className="text-gray-300 mb-4">Agent creation dialog coming soon...</p>
            <Button onClick={() => setCreateAgentOpen(false)}>Close</Button>
          </div>
        </div>
      )}
    </>
  );
};