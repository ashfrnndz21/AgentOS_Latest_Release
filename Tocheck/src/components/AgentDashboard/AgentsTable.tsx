
import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Agent } from './types';

interface AgentsTableProps {
  agents: Agent[];
  selectedAgent: Agent;
  setSelectedAgent: (agent: Agent) => void;
}

export const AgentsTable: React.FC<AgentsTableProps> = ({ 
  agents, 
  selectedAgent,
  setSelectedAgent 
}) => {
  return (
    <Card className="bg-beam-dark-accent/70 border-gray-700">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl text-white">Deployed Agents</CardTitle>
        <CardDescription className="text-gray-400">Select an agent to view details</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-white/5">
                <TableHead className="text-white">Name</TableHead>
                <TableHead className="text-white">Status</TableHead>
                <TableHead className="text-white">Model</TableHead>
                <TableHead className="text-white">Owner</TableHead>
                <TableHead className="text-white">Last Active</TableHead>
                <TableHead className="text-white">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agents.map((agent) => (
                <TableRow 
                  key={agent.id} 
                  className={`hover:bg-white/5 border-white/10 cursor-pointer ${selectedAgent.id === agent.id ? 'bg-beam-blue/10' : ''}`}
                  onClick={() => setSelectedAgent(agent)}
                >
                  <TableCell className="font-medium text-white">{agent.name}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      agent.status === 'Active' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {agent.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-gray-300">{agent.model}</TableCell>
                  <TableCell className="text-gray-300">{agent.owner}</TableCell>
                  <TableCell className="text-gray-300">{agent.lastActive}</TableCell>
                  <TableCell>
                    <button className="text-beam-blue hover:text-beam-blue-light flex items-center gap-1">
                      Details
                      <ArrowRight size={14} />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
