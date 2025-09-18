import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Bot, 
  Database, 
  Server, 
  Zap, 
  FileText, 
  Settings,
  Brain,
  Network,
  Activity,
  ArrowRight,
  Play,
  Pause
} from 'lucide-react';

interface FlowNode {
  id: string;
  name: string;
  type: 'input' | 'process' | 'output' | 'integration';
  position: { x: number; y: number };
  connections: string[];
  status: 'active' | 'processing' | 'idle';
  icon: any;
  color: string;
  description: string;
}

interface FlowData {
  id: string;
  from: string;
  to: string;
  data: string;
  timestamp: Date;
  status: 'success' | 'processing' | 'error';
}

export const InteractiveAgentFlowDiagram: React.FC<{ isSimulating: boolean }> = ({ isSimulating }) => {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [flowData, setFlowData] = useState<FlowData[]>([]);
  const svgRef = useRef<SVGSVGElement>(null);

  const nodes: FlowNode[] = [
    {
      id: 'input',
      name: 'User Input',
      type: 'input',
      position: { x: 50, y: 150 },
      connections: ['agent'],
      status: 'active',
      icon: FileText,
      color: '#3b82f6',
      description: 'User requests and commands'
    },
    {
      id: 'agent',
      name: 'AI Agent',
      type: 'process',
      position: { x: 200, y: 150 },
      connections: ['processor', 'memory'],
      status: isSimulating ? 'processing' : 'idle',
      icon: Bot,
      color: '#10b981',
      description: 'Core AI processing unit'
    },
    {
      id: 'processor',
      name: 'Task Processor',
      type: 'process',
      position: { x: 350, y: 100 },
      connections: ['output'],
      status: 'active',
      icon: Brain,
      color: '#8b5cf6',
      description: 'Processes and executes tasks'
    },
    {
      id: 'memory',
      name: 'Memory Store',
      type: 'integration',
      position: { x: 350, y: 200 },
      connections: ['output'],
      status: 'active',
      icon: Database,
      color: '#f59e0b',
      description: 'Stores context and history'
    },
    {
      id: 'output',
      name: 'Response',
      type: 'output',
      position: { x: 500, y: 150 },
      connections: [],
      status: 'active',
      icon: ArrowRight,
      color: '#ef4444',
      description: 'Generated responses and actions'
    }
  ];

  useEffect(() => {
    if (isSimulating) {
      const interval = setInterval(() => {
        const newFlow: FlowData = {
          id: Math.random().toString(36).substr(2, 9),
          from: nodes[Math.floor(Math.random() * nodes.length)].id,
          to: nodes[Math.floor(Math.random() * nodes.length)].id,
          data: `Data packet ${Date.now()}`,
          timestamp: new Date(),
          status: 'processing'
        };
        
        setFlowData(prev => [...prev.slice(-10), newFlow]);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isSimulating]);

  const getNodeIcon = (node: FlowNode) => {
    const IconComponent = node.icon;
    return <IconComponent className="w-6 h-6" style={{ color: node.color }} />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'idle': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="w-5 h-5" />
            Interactive Agent Flow Diagram
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative bg-gray-50 rounded-lg p-6 min-h-[400px]">
            {/* Flow Diagram */}
            <svg
              ref={svgRef}
              className="absolute inset-0 w-full h-full"
              style={{ zIndex: 1 }}
            >
              {/* Connection Lines */}
              {nodes.map(node => 
                node.connections.map(connectionId => {
                  const targetNode = nodes.find(n => n.id === connectionId);
                  if (!targetNode) return null;
                  
                  return (
                    <line
                      key={`${node.id}-${connectionId}`}
                      x1={node.position.x + 40}
                      y1={node.position.y + 20}
                      x2={targetNode.position.x}
                      y2={targetNode.position.y + 20}
                      stroke="#6b7280"
                      strokeWidth="2"
                      strokeDasharray={isSimulating ? "5,5" : "none"}
                    />
                  );
                })
              )}
            </svg>

            {/* Nodes */}
            {nodes.map(node => (
              <div
                key={node.id}
                className={`absolute bg-white border-2 rounded-lg p-3 cursor-pointer transition-all duration-200 ${
                  selectedNode === node.id ? 'border-blue-500 shadow-lg' : 'border-gray-300 hover:border-gray-400'
                }`}
                style={{
                  left: node.position.x,
                  top: node.position.y,
                  zIndex: 2,
                  minWidth: '80px'
                }}
                onClick={() => setSelectedNode(selectedNode === node.id ? null : node.id)}
              >
                <div className="flex flex-col items-center gap-2">
                  {getNodeIcon(node)}
                  <span className="text-xs font-medium text-center">{node.name}</span>
                  <Badge className={getStatusColor(node.status)}>
                    {node.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          {/* Node Details */}
          {selectedNode && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              {(() => {
                const node = nodes.find(n => n.id === selectedNode);
                if (!node) return null;
                
                return (
                  <div>
                    <h4 className="font-semibold text-blue-900">{node.name}</h4>
                    <p className="text-blue-700 text-sm mt-1">{node.description}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline">Type: {node.type}</Badge>
                      <Badge className={getStatusColor(node.status)}>
                        {node.status}
                      </Badge>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Flow Data */}
          {isSimulating && flowData.length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold mb-2">Live Data Flow</h4>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {flowData.slice(-5).map(flow => (
                  <div key={flow.id} className="text-xs bg-gray-100 p-2 rounded">
                    <span className="font-medium">{flow.from}</span> → 
                    <span className="font-medium"> {flow.to}</span>
                    <span className="text-gray-600 ml-2">
                      {flow.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};