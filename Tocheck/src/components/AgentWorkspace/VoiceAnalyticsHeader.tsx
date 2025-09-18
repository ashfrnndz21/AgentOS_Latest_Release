
import React from 'react';
import { Bot, Cpu, BarChart4 } from 'lucide-react';

interface VoiceAnalyticsHeaderProps {
  agentCount: number;
  toolsCount: number;
  databasesCount: number;
}

export const VoiceAnalyticsHeader: React.FC<VoiceAnalyticsHeaderProps> = ({
  agentCount,
  toolsCount,
  databasesCount
}) => {
  return (
    <div className="px-6 pt-6 pb-3">
      <div className="glass-panel backdrop-blur-md bg-beam-dark-accent/30 border border-gray-700/50 rounded-xl p-6 shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span className="text-green-400 text-sm">Active</span>
            </div>
            <h1 className="text-3xl font-bold text-white mt-1 mb-2">Voice Analytics Assistant</h1>
            <p className="text-gray-300">Chat with AI agents to analyze voice conversations and extract insights from your audio data</p>
          </div>
          
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-3 px-4 py-2 bg-beam-dark-accent/50 rounded-lg border border-gray-700/50">
              <Bot size={20} className="text-purple-400" />
              <div className="flex flex-col">
                <span className="text-sm text-gray-300">Active Agents</span>
                <span className="text-lg font-semibold text-white">{agentCount}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3 px-4 py-2 bg-beam-dark-accent/50 rounded-lg border border-gray-700/50">
              <Cpu size={20} className="text-blue-400" />
              <div className="flex flex-col">
                <span className="text-sm text-gray-300">Voice Tools</span>
                <span className="text-lg font-semibold text-white">{toolsCount}</span>
              </div>
            </div>
            
            <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-beam-dark-accent/50 rounded-lg border border-gray-700/50">
              <BarChart4 size={20} className="text-amber-400" />
              <div className="flex flex-col">
                <span className="text-sm text-gray-300">Data Sources</span>
                <span className="text-lg font-semibold text-white">{databasesCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
