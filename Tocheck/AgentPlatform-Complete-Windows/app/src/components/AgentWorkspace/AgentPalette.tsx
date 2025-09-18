
import React from 'react';
import { Bot, Database, MessageSquare, Webhook, FileText, Workflow, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

export const AgentPalette = () => {
  return (
    <div className="w-64 border-r border-gray-700/50 bg-beam-dark flex flex-col">
      <div className="p-3 border-b border-gray-700/50">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search components..."
            className="pl-8 bg-beam-dark-accent/80 border-gray-700 text-white placeholder-gray-500"
          />
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-3">
          <h3 className="text-xs font-semibold uppercase text-gray-500 mb-2">Components</h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-2">Agents</h4>
              <div className="space-y-1">
                <div className="flex items-center gap-2 px-2 py-1.5 rounded cursor-not-allowed opacity-50 text-gray-300">
                  <Bot size={16} className="text-beam-blue" />
                  <span className="text-sm">LLM Agent</span>
                </div>
                <div className="flex items-center gap-2 px-2 py-1.5 rounded cursor-not-allowed opacity-50 text-gray-300">
                  <Database size={16} className="text-beam-blue" />
                  <span className="text-sm">Data Agent</span>
                </div>
                <div className="flex items-center gap-2 px-2 py-1.5 rounded cursor-not-allowed opacity-50 text-gray-300">
                  <MessageSquare size={16} className="text-beam-blue" />
                  <span className="text-sm">Customer Agent</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-2">Connectors</h4>
              <div className="space-y-1">
                <div className="flex items-center gap-2 px-2 py-1.5 rounded cursor-not-allowed opacity-50 text-gray-300">
                  <Webhook size={16} className="text-beam-blue" />
                  <span className="text-sm">API Connector</span>
                </div>
                <div className="flex items-center gap-2 px-2 py-1.5 rounded cursor-not-allowed opacity-50 text-gray-300">
                  <Database size={16} className="text-beam-blue" />
                  <span className="text-sm">Database</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-2">Tools</h4>
              <div className="space-y-1">
                <div className="flex items-center gap-2 px-2 py-1.5 rounded cursor-not-allowed opacity-50 text-gray-300">
                  <FileText size={16} className="text-beam-blue" />
                  <span className="text-sm">Document Analyzer</span>
                </div>
                <div className="flex items-center gap-2 px-2 py-1.5 rounded cursor-not-allowed opacity-50 text-gray-300">
                  <Workflow size={16} className="text-beam-blue" />
                  <span className="text-sm">Decision Tree</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
      
      <div className="p-3 border-t border-gray-700/50 text-center">
        <p className="text-xs text-gray-500">Drag and drop disabled in this preview</p>
      </div>
    </div>
  );
};
