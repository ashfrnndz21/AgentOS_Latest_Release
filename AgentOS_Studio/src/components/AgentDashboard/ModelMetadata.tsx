
import React from 'react';
import { Database, Info, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Agent } from './types';

interface ModelMetadataProps {
  agents: Agent[];
}

export const ModelMetadata: React.FC<ModelMetadataProps> = ({ agents }) => {
  // Filter agents that have model information
  const agentsWithModels = agents.filter(agent => agent.model && agent.modelMetadata);

  return (
    <Card className="bg-beam-dark-accent/70 border-gray-700">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Settings size={18} className="text-beam-blue" />
          <CardTitle className="text-xl text-white">Agent Model Metadata</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-white/5">
                <TableHead className="text-white">Agent</TableHead>
                <TableHead className="text-white">Model</TableHead>
                <TableHead className="text-white">Provider</TableHead>
                <TableHead className="text-white">Size</TableHead>
                <TableHead className="text-white">Context Length</TableHead>
                <TableHead className="text-white">Cost</TableHead>
                <TableHead className="text-white">Capabilities</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agentsWithModels.map((agent) => (
                <TableRow key={agent.id} className="hover:bg-white/5 border-white/10">
                  <TableCell className="font-medium text-white">{agent.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-beam-blue/30 text-beam-blue-light">
                        {agent.model}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {agent.modelMetadata?.provider || "OpenAI"}
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {agent.modelMetadata?.size || "175B parameters"}
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {agent.modelMetadata?.contextLength || "8K tokens"}
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {agent.modelMetadata?.costPerToken || "$0.002/1K tokens"}
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {agent.modelMetadata?.capabilities ? (
                      <div className="flex flex-wrap gap-1">
                        {agent.modelMetadata.capabilities.map((capability, index) => (
                          <Badge key={index} variant="outline" className="text-xs bg-gray-800/50 border-gray-700 text-gray-300">
                            {capability}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      "N/A"
                    )}
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
