import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

export const AgentOSLogicalFlow: React.FC = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">🔄 Agent OS Logical Flow</h1>
        <p className="text-muted-foreground">
          Visualize and monitor the logical flow of your agent operating system
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>System Architecture</CardTitle>
            <CardDescription>Core system components and their relationships</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>Agent Orchestrator</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Workflow Engine</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span>Communication Layer</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Flow Metrics</CardTitle>
            <CardDescription>Real-time system performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Active Agents:</span>
                <span className="font-semibold">12</span>
              </div>
              <div className="flex justify-between">
                <span>Workflows Running:</span>
                <span className="font-semibold">5</span>
              </div>
              <div className="flex justify-between">
                <span>System Load:</span>
                <span className="font-semibold text-green-600">23%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};